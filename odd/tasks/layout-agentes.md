# Feature: layout-agentes

Herdr desktop layout `agentes` with an activity board for agents, built in this repo
and installed into `~/.config/herdr-app`. Detailed technical spec: `docs/SPEC.md`.
Visual reference: `docs/prototipos.html`, view D.

## Specs

- **S1** · Layout based on view D: "me gusta, procedamos a implementar este layout, con el mod de dictar aplicado". The `mi-boton` "Dictar" block stays in the status row. Details: `docs/SPEC.md` S1.
- **S2** · Activity board mod (`tablero-agentes`): sections "Te necesitan", "Trabajando", "En reposo" (Última hora / Hoy / Dormidos · más de 1 día). Details: `docs/SPEC.md` S2.
- **S3** · No running command in the cards: "no quiero el comando en ejecucion".
- **S4** · No spinner line in the cards: "puedes remover ese spiner line".
- **S5** · Active-agents strip mod (`tira-agentes`) in the tab bar row. Details: `docs/SPEC.md` S3.
- **S6** · Separate repo: "podemos crearlo en un git repo nuevo". Repo `~/herdr-layouts`, `install.sh` copies into the Herdr home and touches nothing else. Details: `docs/SPEC.md` S4.
- **S8** · Icon instead of the text marker: "pero pon el texto, de un icono". Details: `docs/SPEC-2-drawer.md` S8.
- **S9** · Collapsible board with hover drawer: "y tambien que sea colapsable este sidebar y al pasar se vuelva hover expand sobre el area?". Details: `docs/SPEC-2-drawer.md` S9.
- **S10** · Collapsed rail shows icons and status: "puedes mejorar como se ve contraido?, depronto iconos y status". Each agent is a rail cell with its program icon, a status badge, an accent ring on the current agent, dimmed idle agents and section separators with counts.
- **S11** · UI labels in English: "tambien puedes hacer los textos en ingles, de las labels" (Needs you, Working, Idle, Last hour, Today, Sleeping · over 1 day, Blocked, Done · unreviewed, Open ↵, sub-agents, No agents yet, N idle, tooltips).
- **S12** · Collapsed rail docked, overlay only on hover: "no me gusta como se ve la bar contraida, me gustaria que solo este sobrepuesta, cuando se expanda en el hover, que ocupe su espacio base en el sidebar". Replaces the floating collapsed drawer of S9/S10. Details: `docs/SPEC-3-rail.md`.
- **S13** · Collapsed rail aligned with the expanded panel: "seria posible que en contraido , este alineado con cuando se expande". Same card frame, top/bottom/right edges; the hover overlay grows leftward from the rail with identical edges and header position.
- **S7** · `mi-layout` stays untouched and available (`Ctrl+Shift+L`).

## Tasks

| ID | Specs | Route | Status | Commit |
|----|-------|-------|--------|--------|
| T1 | S1, S7 | worker mwfqy815-1-9aff | done | first commit |
| T2 | S2, S3, S4 | worker mwfqy815-1-9aff | done | first commit |
| T3 | S5 | worker mwfqy815-1-9aff | done | first commit |
| T4 | S6 | worker mwfqy815-1-9aff | done | first commit |
| T5 | S1-S7 | parent: herdr-app check + status + shot review | done | first commit |
| T6 | S6 | parent: first commit on `main` | done | first commit |
| T7 | S8-S11 | worker mwfrmw9h-2-knx1 | done | drawer commit |
| T8 | S8-S11 | parent: review shots + commit | done | drawer commit |
| T9 | S12, S13 | worker mwfs713m-3-p843 | done | rail commit |
| T10 | S12, S13 | parent: review shots + commit | done | rail commit |

Out of scope (v1): `trabajando` / `listo` tags in the Spaces list (needs a clone of the `spaces` mod).

## Log

- **L1** · User: "quiero que mires con 'herdr-app' el layout que tengo se ve asi [...] podiramos crear un layout mejor distribuido para los agents? es posdible?"
- **L2** · User: "pdoria inventarte una mejor forma de ver los que tengo activos y los que no?!" → view D (activity board) was added to the prototype.
- **L3** · User: "no quiero el comando en ejecucion" → last-output box removed from the cards (S3).
- **L4** · User: "puedes remover ese spiner line" → progress line removed from the cards (S4).
- **L5** · User: "me gusta, procedamos a implementar este layout, con el mod de dictar aplicado" (S1).
- **L6** · User: "podemos crearlo en un git repo nuevo" → `~/herdr-layouts` created with `git init`, prototype moved to `docs/` (S6).
- **L7** · User: "crea el odd si te facilita" → this document.
- **L8** · Implementation delegated to a gentle-ai-worker (task mwfqy815-1-9aff), scoped to `layouts/agentes.json`, `mods/tablero-agentes/**`, `mods/tira-agentes/**`, `install.sh`, `README.md`.
- **L9** · Worker finished: `herdr-app check` passed for both mods; `herdr-app status` → `"layout": "agentes"`, `"errors": []`; parent reviewed `/tmp/agentes.png` (board, strip and Dictar visible, no output box or progress line in cards).
- **L10** · Follow-ups seen in the screenshot (not done): agent names keep the `π - ` title prefix; the strip sits to the right of the window buttons instead of before them.
- **L11** · User: "puedes corregir, ya que cuando estoy en un agent, no veo cual es el activo en el sidebar que creaste" → the agent you are in (focused pane or shown terminal) gets an accent border, selected background and an "AQUÍ" badge in cards, idle rows and the strip; a current agent idle for over a day is shown as a row, never hidden in the folded chips. Also fixed L10: `π - ` prefix stripped from names; the strip moved to the status bar (before Dictar), so the tab bar keeps its window buttons at the edge. Checks passed, status `errors: []`, screenshot reviewed (working card highlighted). Highlight on an idle row was not seen live.
- **L12** · User: "pero pon el texto, de un icono, y tambien que sea colapsable este sidebar y al pasar se vuelva hover expand sobre el area?" → S8, S9; delegated to worker mwfrmw9h-2-knx1 using Herdr's native floating `peek` drawer.
- **L13** · User: "puedes mejorar como se ve contraido?, depronto iconos y status" → S10, sent to the running worker mwfrmw9h-2-knx1 as an extra requirement.
- **L14** · User: "tambien puedes hacer los textos en ingles, de las labels" → S11, sent to the running worker mwfrmw9h-2-knx1.
- **L15** · Worker finished: checks passed, status `errors: []`, board left expanded. Parent reviewed `rail.png` (collapsed: icon cells, counts, accent ring on current agent) and `expanded-final.png` (English labels, monitor icon on the current agent). Not seen live: hover slide-out, tooltips, blocked/done/sleeping badges. Screenshots moved out of the repo to `/tmp/herdr-shots/`; generated `gpui-kit.d.ts`/`jsconfig.json` ignored via `.gitignore`.
- **L16** · User (with a screenshot of the floating rail over the terminal): "no me gusta como se ve la bar contraida, me gustaria que solo este sobrepuesta, cuando se expanda en el hover, que ocupe su espacio base en el sidebar" → S12, delegated to worker mwfs713m-3-p843.
- **L17** · User: "seria posible que en contraido , este alineado con cuando se expande" → S13, sent to the running worker mwfs713m-3-p843.
- **L18** · Worker finished: checks passed, status `errors: []`, board left expanded. Parent reviewed `/tmp/herdr-shots/rail-docked.png` (rail in its own 52px column, terminal not covered) and `rail-overlay.png` (overlay opened by `tablero-agentes.peek` grows left with the rail's right/top/bottom edges). Not exercised with a real pointer: hover open/close and its 180ms grace, tooltips, click-to-focus-and-close.
- **L19** · User: "no se contrae". Reproduced: `tablero-agentes.collapse` by CLI does collapse (screenshot `/tmp/herdr-shots/diag-collapse.png` shows the 52px rail), so the layout works. Cause: clicking the collapse button leaves the pointer where the rail appears, and hover-open (plus a stale `board.railHovered: true` in shared state) opened the overlay at once with the same edges as the expanded panel (S13), so it looked like nothing changed. Fix: collapsing from the button disarms hover-open until the pointer leaves the rail once; collapsing clears `board.railHovered`. Checks passed, `errors: []`. Not tested with a real pointer click.
- **L20** · User: "cuando lo saco no cierra". Cause: the overlay covers the whole rail, so the rail never receives its pointer-exit event and `board.railHovered` stayed `true`; the close check needs both rail and overlay un-hovered. Fix: opening the overlay clears `board.railHovered`, and the overlay marks itself hovered on pointer move, so leaving the overlay closes it after the 180ms grace. Verified by command (`peek` → `railHovered: false`, `unpeek` → no overlays, `errors: []`); not tested with a real pointer.
