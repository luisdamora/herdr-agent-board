import { View, div, svg, image } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { agents, terminals, panes, spaces, focused, theme, run, setAgentOrder,
  props, shared, setShared, layout, openOverlay, closeOverlay, nextCommand } from "herdr";

function age(ms) {
  const minutes = Math.floor(Math.max(0, ms) / 60000);
  if (minutes < 1) return "<1m";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`;
}

// Prefer a meaningful tab/title, not a shell path or an automatic tab number.
function name(a) {
  const title = (a.title ?? "").replace(/^[^\p{L}\p{N}~/]+/u, "").replace(/^\S{1,3}\s+[-–·]\s+/u, "").trim();
  const telling = title && !/^[~/]|^[A-Za-z]:\\/.test(title) && !title.includes("@")
    && title !== a.program?.name && title.toLowerCase() !== a.program?.key;
  if (a.tab_name && !/^\d+$/.test(a.tab_name) && a.tab_name !== a.program?.name) return a.tab_name;
  return telling ? title : a.space_name || a.program?.name || a.address;
}

function statusIcon(status, t) {
  if (status === "working") return svg("mods/workspace-chrome/spinner.svg").size(12).flex_none().text_color(t.working).spin(900);
  return div().size(8).flex_none().rounded(8)
    .when(status === "idle", el => el.border(1.5).border_color(t.idle))
    .when(status !== "idle", el => el.bg(t[status] ?? t.dim));
}

export default class ActivityBoard extends View {
  init(_props, cx) {
    try { this.changed = JSON.parse(localStorage.getItem("changed") ?? "{}"); }
    catch { this.changed = {}; }
    if (!this.changed || typeof this.changed !== "object" || Array.isArray(this.changed)) this.changed = {};
    this.sleepingFolded = false;
    cx.timer.every(30000, cx => cx.notify());
    cx.spawn(async cx => {
      for (;;) {
        const command = await nextCommand();
        if (command === "collapse") this.setCollapsed(true);
        if (command === "expand") this.setCollapsed(false);
        if (command === "peek" && !props()?.overlay) this.peek();
        if (command === "unpeek") this.dismiss();
        cx.notify();
      }
    });
  }

  boardNode() {
    const find = node => node?.id === "board" ? node : (node?.children ?? []).map(find).find(Boolean);
    return find(layout());
  }

  dismiss() {
    const id = shared("board.peek");
    setShared("board.peek", null);
    setShared("board.overlayHovered", false);
    if (id) closeOverlay(id);
  }

  setCollapsed(collapsed) {
    if (collapsed && shared("board.collapsed") !== true) {
      const width = this.boardNode()?.size?.px;
      setShared("board.expandedWidth", width >= 280 ? width : 360);
    }
    this.dismiss();
    setShared("board.collapsed", collapsed);
    run("layout.show", { id: "board" });
    run("layout.resize", { id: "board", px: collapsed ? 52 : shared("board.expandedWidth") || 360 });
  }

  syncDock(collapsed) {
    const board = this.boardNode();
    if (!board) return;
    const px = collapsed ? 52 : shared("board.expandedWidth") || 360;
    // Preserve user resizing while pinned; only repair a stale collapsed width.
    const needsResize = collapsed ? board.size?.px !== 52 : board.size?.px < 280;
    const request = `${Boolean(board.hidden)}:${needsResize}:${px}`;
    if (!board.hidden && !needsResize) this.pendingDock = undefined;
    else if (this.pendingDock !== request) {
      this.pendingDock = request;
      if (board.hidden) run("layout.show", { id: "board" });
      if (needsResize) run("layout.resize", { id: "board", px });
    }
  }

  railCardBounds() {
    // Resolve the board's position from the live layout, including user-resized
    // siblings. Size comes from the rail's layout callback, not a guessed height.
    const walk = (node, rect) => {
      if (node.id === "board") return { ...rect, height: this.railHeight + 2 * (node.border?.width || 0) };
      const children = (node.children || []).filter(child => !child.hidden);
      const border = node.border?.width || 0;
      const padding = node.padding || 0;
      const py = Array.isArray(padding) ? padding[0] : padding;
      const px = Array.isArray(padding) ? padding[1] : padding;
      const inner = { x: rect.x + px + border, y: rect.y + py + border,
        width: rect.width - 2 * (px + border), height: rect.height - 2 * (py + border) };
      const horizontal = node.type === "row";
      const axis = horizontal ? "width" : "height";
      const gap = (node.gap || 0) + (node.divider?.width || 0);
      const fixed = children.reduce((n, child) => n + (child.size?.px || 0), 0);
      const weight = children.reduce((n, child) => n + (child.size?.px == null ? child.size?.weight || 1 : 0), 0);
      const available = inner[axis] - fixed - gap * Math.max(0, children.length - 1);
      let offset = 0;
      for (const child of children) {
        const size = child.size?.px ?? available * (child.size?.weight || 1) / weight;
        const bounds = { ...inner, [axis]: size,
          [horizontal ? "x" : "y"]: inner[horizontal ? "x" : "y"] + offset };
        const found = walk(child, bounds);
        if (found) return found;
        offset += size + gap;
      }
      return null;
    };
    const viewport = window.viewport_size();
    return walk(layout(), { x: 0, y: 0, ...viewport });
  }

  peek() {
    if (shared("board.collapsed") !== true || shared("board.peek") || !this.railHeight) return;
    const bounds = this.railBounds || this.railCardBounds();
    if (!bounds) return;
    const id = openOverlay({ mod: "tablero-agentes", props: { peekBoard: true },
      kind: "window", frame: "none", at: { x: bounds.x + bounds.width - 360, y: bounds.y },
      width: 360, height: bounds.height });
    setShared("board.peek", id);
  }

  hover(overlay, hovered, cx) {
    setShared(overlay ? "board.overlayHovered" : "board.railHovered", hovered);
    if (hovered) {
      if (!overlay && this.railBounds) this.peek();
      return;
    }
    // A one-shot dismissal grace, not an animation/redraw timer.
    cx.timer.after(180, () => {
      if (!shared("board.railHovered") && !shared("board.overlayHovered")) this.dismiss();
    });
  }

  close() {
    if (props()?.peekBoard) {
      setShared("board.peek", null);
      setShared("board.overlayHovered", false);
    } else {
      setShared("board.railHovered", false);
      this.dismiss();
    }
  }

  track(list, now) {
    let dirty = false;
    for (const a of list) {
      // Viewing a done agent is not new activity; preserve its age when it becomes idle.
      const state = a.status === "done" ? "idle" : a.status;
      if (this.changed[a.address]?.s === state && Number.isFinite(this.changed[a.address]?.at)) continue;
      this.changed[a.address] = { s: state, at: now };
      dirty = true;
    }
    const present = new Set(list.map(a => a.address));
    for (const [address, change] of Object.entries(this.changed)) {
      if (!present.has(address) && now - change.at > 30 * 86400000) {
        delete this.changed[address];
        dirty = true;
      }
    }
    if (dirty) localStorage.setItem("changed", JSON.stringify(this.changed));
  }

  render() {
    const overlay = props()?.peekBoard === true;
    const collapsed = shared("board.collapsed") === true;
    if (!overlay) this.syncDock(collapsed);
    const t = theme();
    const now = Date.now();
    const list = agents();
    if (overlay) this.changed = shared("board.changed") || {};
    else {
      this.track(list, now);
      const snapshot = JSON.stringify(this.changed);
      if (snapshot !== this.publishedAges) {
        this.publishedAges = snapshot;
        setShared("board.changed", this.changed);
      }
    }
    const elapsed = a => now - (this.changed[a.address]?.at ?? now);
    // The agent you are in: its pane has focus, or the window shows its terminal.
    const f = focused();
    const isCurrent = a => a.focused || (f?.pane && f.pane === a.pane) || (f?.terminal && f.terminal === a.address);
    const attention = list.filter(a => a.status === "blocked" || a.status === "done");
    const working = list.filter(a => a.status === "working");
    const idle = list.filter(a => a.status === "idle").sort((a, b) => elapsed(a) - elapsed(b));
    const recent = idle.filter(a => elapsed(a) < 3600000);
    const today = idle.filter(a => elapsed(a) >= 3600000 && elapsed(a) < 86400000);
    const sleepingAll = idle.filter(a => elapsed(a) >= 86400000);
    const sleepingCurrent = sleepingAll.filter(isCurrent);
    const sleeping = sleepingAll.filter(a => !isCurrent(a));
    const all = terminals();
    const paneList = panes();
    const spaceList = spaces();
    const children = a => all.filter(k => k.parent === a.address && k.state === "live");
    if (!overlay) setAgentOrder([...attention, ...working, ...recent, ...today, ...sleepingCurrent, ...(this.sleepingFolded ? [] : sleeping)].map(a => a.address));

    const text = (value, color = t.muted) => div().min_w(0).truncate().text_color(color).child(value);
    const heading = (label, color, count) => h_flex().flex_none().px(14).pt(12).pb(8).gap(6)
      .items_center().text_size(11).font_semibold()
      .child(div().flex_1().min_w(0).child(text(label.toUpperCase(), color)))
      .child(text(String(count), t.dim));
    const focus = a => {
      if (overlay) this.dismiss();
      run("pane.focus", { pane: a.pane });
    };
    const railCell = a => {
      const p = a.program;
      const programIcon = p?.icon
        ? p.tint ? svg(p.icon).size(16).text_color(t.foreground) : image(p.icon).w(16).h(16)
        : svg("mods/workspace-chrome/terminal.svg").size(16).text_color(t.muted);
      const badge = div().absolute().right(-3).bottom(-3).size(8).rounded(4).bg(t.surface)
        .flex().items_center().justify_center()
        .when(a.status === "blocked", el => el.bg(t.blocked).text_color(t.background)
          .text_size(8).font_semibold().child("!"))
        .when(a.status !== "blocked", el => el.child(statusIcon(a.status, t).size(8)));
      return div().id(`rail-${a.address}`).w_full().h(36).flex_none().rounded(8)
        .opacity(isCurrent(a) || a.status !== "idle" ? 1 : elapsed(a) >= 86400000 ? 0.35 : 0.55)
        .when(isCurrent(a), el => el.bg(t.selected).border(1).border_color(t.accent))
        .flex().items_center().justify_center()
        .tooltip(name(a)).cursor_pointer().hover(el => el.bg(t.hover))
        .on_mouse_down("left", (_e, cx) => cx.stop_propagation())
        .on_click((_e, cx) => { cx.stop_propagation(); focus(a); })
        .child(div().size(16).relative().flex().items_center().justify_center()
          .child(programIcon).child(badge));
    };
    const card = a => v_flex().id(`card-${a.address}`).mx(10).mb(8).px(12).py(10).gap(4)
      .flex_none().bg(isCurrent(a) ? t.selected : t.background).border(isCurrent(a) ? 2 : 1)
      .border_color(isCurrent(a) ? t.accent : t.border).rounded(9)
      .cursor_pointer().hover(el => el.bg(t.hover)).on_click(() => focus(a));
    const here = () => svg("mods/workspace-chrome/monitor.svg").size(13).flex_none()
      .text_color(t.accent).tooltip("You are here");
    const markers = a => h_flex().flex_none().gap(4).items_center()
      .child(statusIcon(a.status, t)).when(isCurrent(a), el => el.child(here()));
    const title = (a, trailing) => h_flex().gap(8).items_center()
      .child(markers(a))
      .child(div().flex_1().min_w(0).truncate().font_semibold().text_color(t.foreground).child(name(a)))
      .child(trailing);
    const subChip = k => {
      const pane = paneList.find(p => p.terminal === k.address);
      const state = list.find(a => a.address === k.address)?.status ?? k.status;
      return h_flex().id(`sub-${k.address}`).px(7).py(3).gap(5).rounded(99).bg(t.raised).max_w(280)
        .items_center().text_size(11).cursor_pointer().hover(el => el.bg(t.hover))
        .on_mouse_down("left", (_e, cx) => cx.stop_propagation())
        .on_click((_e, cx) => {
          cx.stop_propagation();
          if (overlay) this.dismiss();
          if (pane) run("pane.focus", { pane: pane.pane });
          else run("terminal.peek", { terminal: k.address });
        })
        .child(statusIcon(state === "error" ? "blocked" : state || "idle", t))
        .child(text(k.name || k.template || k.program?.name || k.address, t.muted));
    };
    const idleRow = (a, dimmer) => h_flex().id(`idle-${a.address}`).mx(6).px(8).py(5).gap(8).items_center().rounded(7)
      .opacity(dimmer && !isCurrent(a) ? 0.7 : 1).cursor_pointer().hover(el => el.bg(t.hover)).on_click(() => focus(a))
      .when(isCurrent(a), el => el.bg(t.selected).border(1).border_color(t.accent))
      .child(markers(a))
      .child(div().flex_1().min_w(0).truncate().text_color(isCurrent(a) ? t.foreground : t.muted)
        .when(isCurrent(a), el => el.font_semibold()).child(name(a)))
      .child(div().flex_none().text_size(11).text_color(t.dim).child(age(elapsed(a))));
    const bucket = label => h_flex().flex_none().child(div().flex_1().px(14).pt(8).pb(3).text_size(11).text_color(t.dim).child(label));

    if (collapsed && !overlay) {
      const groups = [attention, working, recent, today, [...sleepingCurrent, ...sleeping]].filter(group => group.length);
      return v_flex().id("board-rail").size_full().min_h(0).bg(t.surface)
        .on_size_change((size) => { this.railHeight = size.height; })
        .on_mouse_move(event => {
          const border = this.boardNode()?.border?.width || 0;
          this.railBounds = { x: event.bounds.x - border, y: event.bounds.y - border,
            width: event.bounds.width + 2 * border, height: event.bounds.height + 2 * border };
          if (shared("board.railHovered")) this.peek();
        })
        .on_hover((hovered, cx) => this.hover(false, hovered, cx))
        .child(div().id("rail-pin").w_full().h(40).flex_none().flex().items_center().justify_center()
          .cursor_pointer().tooltip("Pin panel").hover(el => el.bg(t.hover))
          .on_click(() => this.setCollapsed(false))
          .child(svg("mods/workspace-chrome/chevron-left.svg").size(16).text_color(t.accent)))
        .child(v_flex().id("rail-scroll").flex_1().min_h(0).overflow_y_scrollbar().gap(4)
          .children(groups.map((group, index) => v_flex().flex_none().gap(4)
            .when(index > 0, el => el.child(div().h(12).w_full().flex().items_center().justify_center()
              .child(div().w(16).h(1).bg(t.border))))
            .when(group === attention, el => el.child(div().text_size(10).text_color(attention.some(a => a.status === "blocked") ? t.blocked : t.done)
              .flex().justify_center().child(div().px(4).rounded(4).bg(t.raised).child(String(attention.length)))))
            .children(group.map(railCell)))));
    }

    return v_flex().id(overlay ? "board-overlay" : "board-pinned").size_full()
      .when(overlay, el => el.bg(t.surface).border(1).border_color(t.border).rounded(10)
        .on_hover((hovered, cx) => this.hover(true, hovered, cx))
        .on_mouse_down("left", (_event, cx) => cx.stop_propagation()))
      .min_h(0).text_size(12.5)
      .child(h_flex().flex_none().px(8).py(6).items_center()
        .child(div().flex_1().text_color(t.muted).font_semibold().child("Agents"))
        .child(div().id("board-toggle").w(28).h(28).flex_none().rounded(5).cursor_pointer()
          .tooltip(overlay ? "Pin panel" : "Collapse").hover(el => el.bg(t.hover))
          .on_mouse_down("left", (_e, cx) => cx.stop_propagation())
          .on_click((_e, cx) => { cx.stop_propagation(); this.setCollapsed(overlay ? false : !collapsed); })
          .flex().items_center().justify_center()
          .child(svg(`mods/workspace-chrome/${overlay ? "chevron-left" : "chevron-right"}.svg`).size(16).text_color(t.accent))))
      .child(v_flex().id("activity-scroll").flex_1().min_h(0).pb(10).overflow_y_scrollbar()
        .when(list.length === 0, el => el.child(bucket("No agents yet")))
        .child(heading("Needs you", attention.some(a => a.status === "blocked") ? t.blocked : t.done, attention.length))
        .children(attention.map(a => card(a)
          .child(title(a, div().id(`view-${a.address}`).flex_none().px(8).py(3).rounded(5).bg(t.raised)
            .text_size(11).text_color(t[a.status]).on_mouse_down("left", (_e, cx) => cx.stop_propagation())
            .on_click((_e, cx) => { cx.stop_propagation(); focus(a); }).child("Open ↵")))
          .child(text(`${a.space_name} · ${a.status === "blocked" ? "Blocked" : "Done · unreviewed"} · ${age(elapsed(a))}`))))
        .child(heading("Working", t.working, `${working.length} · ${working.reduce((n, a) => n + children(a).length, 0)} sub-agents`))
        .children(working.map(a => {
          const branch = paneList.find(p => p.pane === a.pane)?.branch || spaceList.find(s => s.id === a.space)?.branch;
          const kids = children(a);
          return card(a).child(title(a, div().flex_none().text_size(11).text_color(t.dim).child(age(elapsed(a)))))
            .child(text([a.space_name, branch].filter(Boolean).join(" · ")))
            .when(kids.length > 0, el => el.child(h_flex().pt(4).gap(5).flex_wrap().children(kids.map(subChip))));
        }))
        .child(heading("Idle", t.idle, idle.length))
        .when(recent.length > 0, el => el.child(bucket("Last hour")).children(recent.map(a => idleRow(a, false))))
        .when(today.length > 0, el => el.child(bucket("Today")).children(today.map(a => idleRow(a, true))))
        .children(sleepingCurrent.map(a => idleRow(a, false)))
        .when(sleeping.length > 0, el => el
          .child(h_flex().id("sleeping-toggle").px(14).pt(8).pb(4).items_center().justify_between().text_size(11)
            .text_color(t.dim).cursor_pointer().on_click((_e, cx) => { this.sleepingFolded = !this.sleepingFolded; cx.notify(); })
            .child("Sleeping · over 1 day").child(`${sleeping.length} ${this.sleepingFolded ? "▸" : "▾"}`))
          .when(!this.sleepingFolded, el => el.child(h_flex().px(14).gap(5).flex_wrap().children(sleeping.map(a =>
            div().id(`sleep-${a.address}`).px(7).py(3).max_w(300).truncate().rounded(99).bg(t.raised).opacity(0.55)
              .text_size(11).text_color(t.muted).cursor_pointer().hover(el => el.bg(t.hover))
              .on_click(() => focus(a)).child(`${name(a)} · ${age(elapsed(a))}`)))))));
  }
}
