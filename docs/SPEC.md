# Spec: "agentes" Herdr layout with an activity board

Source of truth for the look: `docs/prototipos.html`, view **D · Tablero de actividad**
(open it in a browser). The user approved that view, minus two things already removed
from it: no "last command / last output line" box in cards, and no progress/spinner
line at the bottom of cards.

## Repo layout (mirrors the Herdr home `~/.config/herdr-app`)

```
layouts/agentes.json          the layout
mods/tablero-agentes/         the activity board (main.js, mod.json)
mods/tira-agentes/            the active-agents strip for the tab bar row (main.js, mod.json)
install.sh                    copies layouts/ and mods/ into the Herdr home
README.md                     what it is, install, switch (Ctrl+Shift+L), dependencies
```

Herdr docs: `~/.config/herdr-app/AGENTS.md` (sections "Layouts", "Mods", "The herdr
module"), API: `~/.config/herdr-app/herdr.d.ts`, UI builders: `~/.config/herdr-app/gpui-kit.d.ts`.
Reference implementation to borrow from (read only, never edit):
`~/.config/herdr-app/mods/agents/main.js` (agents(), terminals() sub-agent tree,
status icons, `this.changed` state-change timestamps, `setAgentOrder`, `pane.focus`).

## S1 · Layout `layouts/agentes.json`

Start from `~/.config/herdr-app/layouts/mi-layout.json` (keep its look: `titlebar: "none"`,
`terminal_padding`, root `background`/`divider`, pane frame of `main`, the brand
`workspace-chrome` block and footer, and the **status row with the `mi-boton`
"Dictar" block at 168px** — the dictation mod must stay applied). Changes:
- `sidebar`: 250px, holding brand, **only `spaces`** (no agents block), footer.
- `tabs` row: a `row` containing the shipped `tabs` block (weight 1) and the
  `tira-agentes` block (fixed px, about 420, min sensible) — keep `window_drag` on the tabs block.
- `work-body` row: `main` (tab active) + a right column `board` of 360px (min 280, max 600)
  showing `tablero-agentes` in a card (surface background, border, radius 10), then
  the existing `panel` (files/changes stack, hidden by default) after it.
- Root `"preview": "layouts/agentes.svg"` optional; skip unless trivial.

## S2 · Mod `tablero-agentes`

Sections, top to bottom, each with an uppercase header colored by theme status color
and a count on the right:
1. **"Te necesitan"** — agents with status `blocked` or `done`. Card per agent: status
   dot, bold name, a small "Ver ↵" button; meta line `space_name · <"Bloqueado" | "Terminó · sin revisar"> · <age>`.
   Clicking the card or the button runs `pane.focus {pane}`.
2. **"Trabajando"** — status `working`. Card: spinner (`mods/workspace-chrome/spinner.svg` `.spin(900)`),
   bold name, age on the right; meta `space_name · branch` (branch from the space/pane if available);
   live sub-agents (terminals() with `parent === address`, state live) as small chips with their own
   status icon; clicking a chip focuses it if it has a pane, else `terminal.peek`. Focused agent's card gets accent border.
   Header count reads e.g. `2 · 2 sub-agentes`.
3. **"En reposo"** — status `idle`, bucketed by time since its last state change:
   "Última hora" (< 1h, normal rows), "Hoy" (< 24h, dimmer rows), "Dormidos · más de 1 día"
   (chips `name · age`, faded, the bucket header folds/unfolds it, folded by default is NOT required).
   Rows: idle ring, name, age; click focuses.
Rules: no last-output box, no progress line. Use `theme()` colors only (done, working,
blocked, idle, muted, dim, accent, surface, background, border, hover, raised). No redraw timers for
animation; a 30 s `cx.timer.every` for ages is fine. Call `setAgentOrder` with the shown order.
Name of an agent: same logic as the shipped agents mod (space name / tab title); keep it simple.
Empty state: a muted line "Sin agentes todavía".

## S3 · Mod `tira-agentes`

Horizontal, right-aligned in the tab bar row, chrome background with the bottom border
the tabs bar uses: one pill per agent that is `blocked`, `done` or `working`
(ring: spinner for working, solid done color for done, blocked color for blocked;
short name truncated ~14 chars; `+N` when it has live sub-agents), then a muted
`· N en reposo`. Click a pill → `pane.focus`. Keep `window_drag` behavior unaffected
(stop propagation on pill presses).

## S4 · install.sh + README

`install.sh`: copy `layouts/agentes.json` and `mods/*` into `${HERDR_APP_HOME:-$HOME/.config/herdr-app}`
(never touch other files there, never delete), then run `herdr-app check` on each mod and print
how to switch (`herdr-app do layout.switch '{"name":"agentes"}'`). README in Spanish (neutral),
code and comments in English.

## Verification (required)

- `herdr-app check <home>/mods/tablero-agentes` and `.../tira-agentes` pass.
- After install, `herdr-app do layout.switch '{"name":"agentes"}'`, then `herdr-app status`
  shows `"layout": "agentes"` and `"errors": []`, then `herdr-app shot /tmp/agentes.png` and LOOK at it.
- Do not switch back or touch `mi-layout.json`. Do not edit shipped mods or other user mods.
