# Spec 2: current-agent icon + collapsible board with hover drawer

Feature doc: `odd/tasks/layout-agentes.md` (S8, S9). Base spec: `docs/SPEC.md`.

User request (verbatim): "pero pon el texto, de un icono, y tambien que sea colapsable este sidebar y al pasar se vuelva hover expand sobre el area?"

## S8 · Icon instead of the "AQUÍ" text

In `mods/tablero-agentes/main.js` (and the strip pill in `mods/tira-agentes/main.js` if it shows a marker),
replace the "AQUÍ" text badge for the current agent with an icon. Use an existing SVG,
`mods/workspace-chrome/monitor.svg` or `mods/workspace-chrome/terminal.svg` (`svg(path).size(13).text_color(t.accent)`),
with `.tooltip("Estás aquí")` if `tooltip` exists in gpui-kit.d.ts. Keep the accent border and selected background.

## S9 · Collapsible board that expands on hover over the work area

Two states, kept in `shared("board.collapsed")` (boolean, default false), surviving reload:

- **Expanded (docked)**: as today, the `board` column (360px) in `work-body`. The board header
  gets a collapse button (`chevron-right.svg` or `panel-right.svg`, tooltip "Colapsar").
  Clicking it: `setShared("board.collapsed", true)` and `run("layout.hide", { id: "board" })`.
- **Collapsed (drawer)**: the `board` column is hidden, so the terminal takes the width.
  A **floating block with `peek`** on the right edge shows a slim rail; hovering it slides the full
  board out OVER the terminal (it must not resize the terminal). Herdr supports this natively:
  read `~/.config/herdr-app/AGENTS.md` section "Floating blocks" and `placement()` in `herdr.d.ts`.
  Add to `layouts/agentes.json`, on the node that holds `main` (e.g. `work-body` or `main`):
  `"floating": [{ "id": "board-drawer", "content": { "mod": "tablero-agentes", "props": { "drawer": true } }, "edge": "right", "align": "start" or "center", "peek": 44 }]`.
  The drawer copy (`props().drawer`) renders NOTHING when `shared("board.collapsed")` is not true
  (docs: a floating block sizes to its content; render nothing to hide it).
  When collapsed it renders the same board at a fixed width (~360) and bounded height
  (e.g. measured window/area height minus margins, or a sensible max like 640; scrollable),
  following the drawer rule: the content never changes on hover, and what must peek goes on the
  edge side. On the right edge that means rows are **mirrored**: status icon (and the current-agent
  icon) on the RIGHT end of each row, so the 44px peek shows a column of status icons, with the
  current agent's icon visibly accented. A small "Fijar" / expand button in the drawer
  (`panel-right.svg` or `chevron-left.svg`, tooltip "Fijar panel") does
  `setShared("board.collapsed", false)` and `run("layout.show", { id: "board" })`.
- The docked copy, on init/render, keeps the layout consistent with the shared flag
  (if collapsed is true and the board is shown, hide it), without loops.

Factor the board rendering so the docked and drawer copies share code (one module, mode by props).

## Constraints

- Only edit: `mods/tablero-agentes/**`, `mods/tira-agentes/**`, `layouts/agentes.json`, `README.md`
  (add a short "Colapsar el panel" section in neutral Spanish). Install with `sh install.sh`.
- Only use builders present in `~/.config/herdr-app/gpui-kit.d.ts` (grep first).
- No redraw timers for animation. Use `theme()` colors.

## Verification (required)

1. `herdr-app check` passes for both mods (install.sh runs it).
2. `herdr-app status` → `"layout": "agentes"`, `"errors": []`.
3. Expanded: `herdr-app shot`, look at it (icon instead of text visible on the current agent).
4. Collapse via `herdr-app do shared...` is not available, so trigger it the way the button does:
   if there is no CLI to set shared state, temporarily verify by running
   `herdr-app do layout.hide '{"id":"board"}'` plus the mod's own logic, OR document that the
   toggle needs one click by the user. Take a shot of the collapsed state if reachable and look at it
   (rail of icons on the right edge, terminal full width).
5. Leave the window in the EXPANDED state at the end (`layout.show board`, flag false).
