import { View, div, svg, image } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { agents, terminals, panes, spaces, focused, theme, run, setAgentOrder,
  props, shared, setShared, layout, placement, nextCommand } from "herdr";

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
        cx.notify();
      }
    });
  }

  setCollapsed(collapsed) {
    setShared("board.collapsed", collapsed);
    run(collapsed ? "layout.hide" : "layout.show", { id: "board" });
  }

  syncDock(collapsed) {
    const find = node => node?.id === "board" ? node : (node?.children ?? []).map(find).find(Boolean);
    const board = find(layout());
    if (!board) return;
    if (Boolean(board.hidden) === collapsed) this.pendingHidden = undefined;
    else if (this.pendingHidden !== collapsed) {
      // Hidden copies remain alive. Request once, not on every subsequent render.
      this.pendingHidden = collapsed;
      run(collapsed ? "layout.hide" : "layout.show", { id: "board" });
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
    const drawer = props()?.drawer === true;
    const collapsed = shared("board.collapsed") === true;
    if (!drawer) this.syncDock(collapsed);
    if (drawer && !collapsed) return div();
    const mirrored = drawer && placement()?.edge === "right";
    const t = theme();
    const now = Date.now();
    const list = agents();
    this.track(list, now);
    const elapsed = a => now - this.changed[a.address].at;
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
    if (drawer === collapsed) setAgentOrder([...attention, ...working, ...recent, ...today, ...sleepingCurrent, ...(this.sleepingFolded ? [] : sleeping)].map(a => a.address));

    const text = (value, color = t.muted) => div().min_w(0).truncate().text_color(color).child(value);
    const railWidth = 48;
    const heading = (label, color, count, railCount = count) => h_flex().flex_none()
      .when(!drawer, el => el.px(14).pt(12).pb(8).gap(6))
      .when(drawer, el => el.h(36).border_t(1).border_color(t.border))
      .items_center().text_size(11).font_semibold()
      .child(div().flex_1().min_w(0).when(drawer, el => el.px(12)).child(text(label.toUpperCase(), color)))
      .when(!drawer, el => el.child(text(String(count), t.dim)))
      .when(drawer, el => el.child(div().w(railWidth).h_full().flex_none().bg(t.chrome)
        .border_l(1).border_color(t.border).flex().items_center().justify_center()
        .text_size(10).text_color(color).child(String(railCount))));
    const focus = a => run("pane.focus", { pane: a.pane });
    const railCell = a => {
      const p = a.program;
      const programIcon = p?.icon
        ? p.tint ? svg(p.icon).size(18).text_color(t.foreground) : image(p.icon).w(18).h(18)
        : svg("mods/workspace-chrome/terminal.svg").size(18).text_color(t.muted);
      const badge = div().absolute().right(0).bottom(0).size(13).rounded(7).bg(t.chrome)
        .flex().items_center().justify_center()
        .when(a.status === "blocked", el => el.bg(t.blocked).text_color(t.background)
          .text_size(10).font_semibold().child("!"))
        .when(a.status !== "blocked", el => el.child(statusIcon(a.status, t)));
      return div().id(`rail-${a.address}`).w(railWidth).flex_none().bg(t.chrome)
        .border_l(1).border_b(1).border_color(t.border).flex().items_center().justify_center()
        .tooltip(name(a)).cursor_pointer().hover(el => el.bg(t.hover))
        .on_mouse_down("left", (_e, cx) => cx.stop_propagation())
        .on_click((_e, cx) => { cx.stop_propagation(); focus(a); })
        .child(div().size(34).relative().rounded(8).flex().items_center().justify_center()
          .opacity(isCurrent(a) || a.status !== "idle" ? 1 : elapsed(a) >= 86400000 ? 0.3 : 0.5)
          .when(isCurrent(a), el => el.bg(t.selected).border(1).border_color(t.accent))
          .child(programIcon).child(badge));
    };
    const withRail = (a, content) => !drawer ? content : h_flex().flex_none().min_h(72).items_stretch()
      .when(!mirrored, el => el.flex_row_reverse())
      .child(div().flex_1().min_w(0).overflow_hidden().child(content))
      .child(railCell(a));
    const card = a => v_flex().id(`card-${a.address}`).mx(drawer ? 0 : 10).mb(drawer ? 0 : 8).px(12).py(10).gap(4)
      .flex_none().bg(isCurrent(a) ? t.selected : t.background).border(isCurrent(a) ? 2 : 1)
      .border_color(isCurrent(a) ? t.accent : t.border).rounded(9)
      .cursor_pointer().hover(el => el.bg(t.hover)).on_click(() => focus(a));
    const here = () => svg("mods/workspace-chrome/monitor.svg").size(13).flex_none()
      .text_color(t.accent).tooltip("You are here");
    const markers = a => h_flex().flex_none().gap(4).items_center()
      .child(statusIcon(a.status, t)).when(isCurrent(a), el => el.child(here()));
    const title = (a, trailing) => h_flex().gap(8).items_center()
      .when(!drawer, el => el.child(markers(a)))
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
          if (pane) run("pane.focus", { pane: pane.pane });
          else run("terminal.peek", { terminal: k.address });
        })
        .child(statusIcon(state === "error" ? "blocked" : state || "idle", t))
        .child(text(k.name || k.template || k.program?.name || k.address, t.muted));
    };
    const idleRow = (a, dimmer) => withRail(a, h_flex().id(`idle-${a.address}`).mx(drawer ? 0 : 6).px(8).py(5).gap(8).items_center().rounded(7)
      .opacity(dimmer && !isCurrent(a) ? 0.7 : 1).cursor_pointer().hover(el => el.bg(t.hover)).on_click(() => focus(a))
      .when(isCurrent(a), el => el.bg(t.selected).border(1).border_color(t.accent))
      .when(!drawer, el => el.child(markers(a)))
      .child(div().flex_1().min_w(0).truncate().text_color(isCurrent(a) ? t.foreground : t.muted)
        .when(isCurrent(a), el => el.font_semibold()).child(name(a)))
      .child(div().flex_none().text_size(11).text_color(t.dim).child(age(elapsed(a)))));
    const bucket = label => h_flex().flex_none().child(div().flex_1().px(14).pt(8).pb(3).text_size(11).text_color(t.dim).child(label))
      .when(drawer, el => el.child(div().w(railWidth).flex_none().bg(t.chrome)));

    return v_flex().when(drawer, el => el.w(360).h(640))
      .when(!drawer, el => el.size_full()).min_h(0).text_size(12.5)
      .child(h_flex().flex_none().when(!drawer, el => el.px(8)).py(6).items_center()
        .child(div().flex_1().px(drawer ? 12 : 0).text_color(t.muted).font_semibold().child("Agents"))
        .child(div().id("board-toggle").w(drawer ? railWidth : 28).h(28).flex_none().rounded(5).cursor_pointer()
          .tooltip(drawer ? "Pin panel" : "Collapse").hover(el => el.bg(t.hover))
          .on_mouse_down("left", (_e, cx) => cx.stop_propagation())
          .on_click((_e, cx) => { cx.stop_propagation(); this.setCollapsed(!collapsed); })
          .flex().items_center().justify_center()
          .child(svg(`mods/workspace-chrome/${drawer ? "chevron-left" : "chevron-right"}.svg`).size(16).text_color(t.accent))))
      .child(v_flex().id("activity-scroll").flex_1().min_h(0).pb(10).overflow_y_scrollbar()
        .when(list.length === 0, el => el.child(bucket("No agents yet")))
        .child(heading("Needs you", attention.some(a => a.status === "blocked") ? t.blocked : t.done, attention.length))
        .children(attention.map(a => withRail(a, card(a)
          .child(title(a, div().id(`view-${a.address}`).flex_none().px(8).py(3).rounded(5).bg(t.raised)
            .text_size(11).text_color(t[a.status]).on_mouse_down("left", (_e, cx) => cx.stop_propagation())
            .on_click((_e, cx) => { cx.stop_propagation(); focus(a); }).child("Open ↵")))
          .child(text(`${a.space_name} · ${a.status === "blocked" ? "Blocked" : "Done · unreviewed"} · ${age(elapsed(a))}`)))))
        .child(heading("Working", t.working, `${working.length} · ${working.reduce((n, a) => n + children(a).length, 0)} sub-agents`, working.length))
        .children(working.map(a => {
          const branch = paneList.find(p => p.pane === a.pane)?.branch || spaceList.find(s => s.id === a.space)?.branch;
          const kids = children(a);
          return withRail(a, card(a).child(title(a, div().flex_none().text_size(11).text_color(t.dim).child(age(elapsed(a)))))
            .child(text([a.space_name, branch].filter(Boolean).join(" · ")))
            .when(kids.length > 0, el => el.child(h_flex().pt(4).gap(5).flex_wrap().children(kids.map(subChip)))));
        }))
        .child(heading("Idle", t.idle, idle.length))
        .when(recent.length > 0, el => el.child(bucket("Last hour")).children(recent.map(a => idleRow(a, false))))
        .when(today.length > 0, el => el.child(bucket("Today")).children(today.map(a => idleRow(a, true))))
        .children(sleepingCurrent.map(a => idleRow(a, false)))
        .when(sleeping.length > 0 && drawer, el => el
          .child(heading("Sleeping · over 1 day", t.idle, sleeping.length))
          .children(sleeping.map(a => idleRow(a, true))))
        .when(sleeping.length > 0 && !drawer, el => el
          .child(h_flex().id("sleeping-toggle").px(14).pt(8).pb(4).items_center().justify_between().text_size(11)
            .text_color(t.dim).cursor_pointer().on_click((_e, cx) => { this.sleepingFolded = !this.sleepingFolded; cx.notify(); })
            .child("Sleeping · over 1 day").child(`${sleeping.length} ${this.sleepingFolded ? "▸" : "▾"}`))
          .when(!this.sleepingFolded, el => el.child(h_flex().px(14).gap(5).flex_wrap().children(sleeping.map(a =>
            div().id(`sleep-${a.address}`).px(7).py(3).max_w(300).truncate().rounded(99).bg(t.raised).opacity(0.55)
              .text_size(11).text_color(t.muted).cursor_pointer().hover(el => el.bg(t.hover))
              .on_click(() => focus(a)).child(`${name(a)} · ${age(elapsed(a))}`)))))));
  }
}
