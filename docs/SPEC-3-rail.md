# Spec 3: docked rail when collapsed, overlay only on hover

Feature doc: `odd/tasks/layout-agentes.md` (S12). Replaces the collapsed behavior of
`docs/SPEC-2-drawer.md` S9 / S10. Screenshot of what the user disliked: the current
collapsed rail is a floating `peek` drawer that sits OVER the terminal, with tall cells
(~72px each), big gaps and heavy separators.

User request (verbatim): "no me gusta como se ve la bar contraida, me gustaria que solo este sobrepuesta, cuando se expanda en el hover, que ocupe su espacio base en el sidebar"

## S12 · Behavior

- **Collapsed = docked rail.** The `board` column stays in the layout but is resized to the rail
  width (about 52px, `run("layout.resize", { id: "board", px: 52 })`), so it takes its own space
  beside the terminal and never covers it. Remember the expanded width (shared key, default 360)
  to restore it on "Pin panel" (`layout.resize` back). Remove the `floating` `board-drawer`
  entry from `layouts/agentes.json` and the drawer mode, unless you reuse it differently.
  Note the board column has `min: 280` in the layout: lower `min` so 52 works (e.g. `min: 48`).
- **Hover = overlay.** Hovering the rail opens the full board as an overlay ABOVE the terminal,
  anchored to the rail's left edge (right side of the window, top aligned with the rail),
  360px wide, height of the rail area (or 640 max), scrollable. It closes when the pointer
  leaves both the rail and the overlay (use `on_hover` on the rail root and on the overlay root;
  close with a short grace so moving from rail into overlay does not close it). Use the Herdr
  overlay API (`openOverlay({ mod: "tablero-agentes", props: { overlay: true }, kind: "window"
  or "popup", at: {x, y}, width, height, frame })`, `closeOverlay(id)`, `props().overlay`) — read
  `~/.config/herdr-app/AGENTS.md` and `herdr.d.ts` for the exact semantics (window vs popup,
  coordinates, whether a popup steals focus or closes on outside clicks). Must not change which
  pane has keyboard focus. Clicking an agent in the overlay focuses it and closes the overlay.
  If an overlay that follows hover is impossible with the API, fall back to: hover does nothing,
  click on the rail's expand button opens the overlay; report it.
- **Expanded (pinned)**: unchanged from today (docked 360px board, collapse button `›`).

## S12 · Rail look (compact, calm)

- Cells 36px tall, 52px wide, 4px vertical gap, icon 16px centered, status badge 8px on the
  bottom-right corner of the icon (spinner for working, dot for done, "!" for blocked, ring for idle).
- Current agent: rounded 8px background `t.selected` with a 1px `t.accent` border around the cell.
- No per-section boxes. Between groups only a 12px gap with a 16px-wide 1px line centered;
  group counts only for "Needs you" (shown only when > 0, a small colored badge on top of the group).
- Idle cells at 0.55 opacity, sleeping (>1 day) at 0.35, current agent always full opacity.
- Top of the rail: the expand/pin button `‹` (tooltip "Pin panel"). Background `t.chrome`,
  left border `t.border`, same card radius as the panel when expanded is not needed.
- Tooltip with the agent name on each cell.

## Constraints

Only edit `mods/tablero-agentes/**`, `layouts/agentes.json`, `README.md` (update the "Colapsar
el panel" section). Labels stay in English. Install with `sh install.sh`. Builders must exist in
`~/.config/herdr-app/gpui-kit.d.ts`. No animation timers. Do not commit, do not restart Herdr,
do not change focus. Save screenshots to `/tmp/herdr-shots/`, never inside the repo.

## Verification

1. `herdr-app check` passes (install.sh).
2. `herdr-app do tablero-agentes.collapse` → `herdr-app status` no errors → shot: rail docked,
   terminal NOT covered (its right border visible left of the rail). Look at it.
3. If you can open the overlay by command (add `tablero-agentes.peek` command for testing),
   shot of the overlay open over the terminal; then close it.
4. `herdr-app do tablero-agentes.expand` → shot of the restored 360px board. Leave it expanded.
