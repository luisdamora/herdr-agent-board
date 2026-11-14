import { View, div, svg } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { agents, terminals, panes, spaces, theme, run, setAgentOrder } from "herdr";

function age(ms) {
  const minutes = Math.floor(Math.max(0, ms) / 60000);
  if (minutes < 1) return "<1m";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`;
}

// Prefer a meaningful tab/title, not a shell path or an automatic tab number.
function name(a) {
  const title = (a.title ?? "").replace(/^[^\p{L}\p{N}~/]+/u, "").trim();
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
    const t = theme();
    const now = Date.now();
    const list = agents();
    this.track(list, now);
    const elapsed = a => now - this.changed[a.address].at;
    const attention = list.filter(a => a.status === "blocked" || a.status === "done");
    const working = list.filter(a => a.status === "working");
    const idle = list.filter(a => a.status === "idle").sort((a, b) => elapsed(a) - elapsed(b));
    const recent = idle.filter(a => elapsed(a) < 3600000);
    const today = idle.filter(a => elapsed(a) >= 3600000 && elapsed(a) < 86400000);
    const sleeping = idle.filter(a => elapsed(a) >= 86400000);
    const all = terminals();
    const paneList = panes();
    const spaceList = spaces();
    const children = a => all.filter(k => k.parent === a.address && k.state === "live");
    setAgentOrder([...attention, ...working, ...recent, ...today, ...(this.sleepingFolded ? [] : sleeping)].map(a => a.address));

    const text = (value, color = t.muted) => div().min_w(0).truncate().text_color(color).child(value);
    const heading = (label, color, count) => h_flex().px(14).pt(12).pb(8).gap(6).items_center().justify_between()
      .text_size(11).font_semibold().child(text(label.toUpperCase(), color)).child(text(String(count), t.dim));
    const focus = a => run("pane.focus", { pane: a.pane });
    const card = a => v_flex().id(`card-${a.address}`).mx(10).mb(8).px(12).py(10).gap(4)
      .flex_none().bg(t.background).border(1).border_color(a.focused ? t.accent : t.border).rounded(9)
      .cursor_pointer().hover(el => el.bg(t.hover)).on_click(() => focus(a));
    const title = a => h_flex().gap(8).items_center().child(statusIcon(a.status, t))
      .child(div().flex_1().min_w(0).truncate().font_semibold().text_color(t.foreground).child(name(a)));
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
    const idleRow = (a, dimmer) => h_flex().id(`idle-${a.address}`).px(14).py(5).gap(8).items_center()
      .opacity(dimmer ? 0.7 : 1).cursor_pointer().hover(el => el.bg(t.hover)).on_click(() => focus(a))
      .child(statusIcon("idle", t)).child(div().flex_1().min_w(0).truncate().text_color(t.muted).child(name(a)))
      .child(div().flex_none().text_size(11).text_color(t.dim).child(age(elapsed(a))));
    const bucket = label => div().px(14).pt(8).pb(3).text_size(11).text_color(t.dim).child(label);

    return v_flex().size_full().min_h(0).text_size(12.5)
      .child(v_flex().id("activity-scroll").flex_1().min_h(0).pb(10).overflow_y_scrollbar()
        .when(list.length === 0, el => el.child(div().p(14).text_color(t.muted).child("Sin agentes todavía")))
        .child(heading("Te necesitan", attention.some(a => a.status === "blocked") ? t.blocked : t.done, attention.length))
        .children(attention.map(a => card(a)
          .child(title(a).child(div().id(`view-${a.address}`).flex_none().px(8).py(3).rounded(5).bg(t.raised)
            .text_size(11).text_color(t[a.status]).on_mouse_down("left", (_e, cx) => cx.stop_propagation())
            .on_click((_e, cx) => { cx.stop_propagation(); focus(a); }).child("Ver ↵")))
          .child(text(`${a.space_name} · ${a.status === "blocked" ? "Bloqueado" : "Terminó · sin revisar"} · ${age(elapsed(a))}`))))
        .child(heading("Trabajando", t.working, `${working.length} · ${working.reduce((n, a) => n + children(a).length, 0)} sub-agentes`))
        .children(working.map(a => {
          const branch = paneList.find(p => p.pane === a.pane)?.branch || spaceList.find(s => s.id === a.space)?.branch;
          const kids = children(a);
          return card(a).child(title(a).child(div().flex_none().text_size(11).text_color(t.dim).child(age(elapsed(a)))))
            .child(text([a.space_name, branch].filter(Boolean).join(" · ")))
            .when(kids.length > 0, el => el.child(h_flex().pt(4).gap(5).flex_wrap().children(kids.map(subChip))));
        }))
        .child(heading("En reposo", t.idle, idle.length))
        .when(recent.length > 0, el => el.child(bucket("Última hora")).children(recent.map(a => idleRow(a, false))))
        .when(today.length > 0, el => el.child(bucket("Hoy")).children(today.map(a => idleRow(a, true))))
        .when(sleeping.length > 0, el => el
          .child(h_flex().id("sleeping-toggle").px(14).pt(8).pb(4).items_center().justify_between().text_size(11)
            .text_color(t.dim).cursor_pointer().on_click((_e, cx) => { this.sleepingFolded = !this.sleepingFolded; cx.notify(); })
            .child("Dormidos · más de 1 día").child(`${sleeping.length} ${this.sleepingFolded ? "▸" : "▾"}`))
          .when(!this.sleepingFolded, el => el.child(h_flex().px(14).gap(5).flex_wrap().children(sleeping.map(a =>
            div().id(`sleep-${a.address}`).px(7).py(3).max_w(300).truncate().rounded(99).bg(t.raised).opacity(0.55)
              .text_size(11).text_color(t.muted).cursor_pointer().hover(el => el.bg(t.hover))
              .on_click(() => focus(a)).child(`${name(a)} · ${age(elapsed(a))}`)))))));
  }
}
