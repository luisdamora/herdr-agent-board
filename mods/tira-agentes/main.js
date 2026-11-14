import { View, div, svg } from "gpui-kit";
import { h_flex } from "gpui-base";
import { agents, terminals, focused, theme, run } from "herdr";

function name(a) {
  const title = (a.title ?? "").replace(/^[^\p{L}\p{N}~/]+/u, "").replace(/^\S{1,3}\s+[-–·]\s+/u, "").trim();
  const telling = title && !/^[~/]|^[A-Za-z]:\\/.test(title) && !title.includes("@")
    && title !== a.program?.name && title.toLowerCase() !== a.program?.key;
  const label = a.tab_name && !/^\d+$/.test(a.tab_name) && a.tab_name !== a.program?.name
    ? a.tab_name : telling ? title : a.space_name || a.program?.name || a.address;
  return label.length > 14 ? `${label.slice(0, 13)}…` : label;
}

export default class ActiveStrip extends View {
  render() {
    const t = theme();
    const list = agents();
    const all = terminals();
    const rank = { blocked: 0, done: 1, working: 2 };
    const active = list.filter(a => a.status !== "idle").sort((a, b) => rank[a.status] - rank[b.status]);
    const idle = list.filter(a => a.status === "idle").length;
    const f = focused();
    const isCurrent = a => a.focused || (f?.pane && f.pane === a.pane) || (f?.terminal && f.terminal === a.address);
    return h_flex().size_full().min_w(0).bg(t.chrome).border_t(1).border_color(t.border)
      .items_center().justify_end().px(8).gap(6).text_size(11)
      .child(h_flex().id("active-scroll").min_w(0).gap(6).items_center().overflow_x_scrollbar()
        .children(active.map(a => {
          const kids = all.filter(k => k.parent === a.address && k.state === "live").length;
          const icon = a.status === "working"
            ? svg("mods/workspace-chrome/spinner.svg").size(12).flex_none().text_color(t.working).spin(900)
            : div().size(8).rounded(8).flex_none().bg(t[a.status]);
          return h_flex().id(`pill-${a.address}`).flex_none().px(8).py(1).gap(6).rounded(99)
            .bg(isCurrent(a) ? t.selected : t.surface).border(1).border_color(isCurrent(a) ? t.accent : t.border).items_center().cursor_pointer()
            .hover(el => el.bg(t.hover))
            .on_mouse_down("left", (_e, cx) => cx.stop_propagation())
            .on_click((_e, cx) => { cx.stop_propagation(); run("pane.focus", { pane: a.pane }); })
            .child(icon).child(div().text_color(t.foreground).child(name(a)))
            .when(kids > 0, el => el.child(div().text_color(t.muted).child(`+${kids}`)));
        })))
      .child(div().flex_none().text_color(t.muted).child(`· ${idle} en reposo`));
  }
}
