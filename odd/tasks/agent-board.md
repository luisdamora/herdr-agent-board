# Feature: herdr-agent-board

Herdr desktop layout `agent-board` with an activity board, built here and
installed into the selected Herdr home. Technical spec: `docs/SPEC.md`.
Visual reference: `docs/prototype.html`, view D. The public layout has no
personal dictate mod; an installer option creates a local-only variant.

## Specs

- **S1** · View D layout, now published as `agent-board`; Spaces left, terminals
  center, activity board right. The initial request included personal dictation;
  S14 supersedes that requirement for the public layout.
- **S2** · `agent-board`: Needs you, Working, Idle (Last hour / Today /
  Sleeping · over 1 day).
- **S3** · No running-command/output box in cards.
- **S4** · No progress/spinner line in cards (working status icons still spin).
- **S5** · `agent-strip` active-agent pills, moved from the tab bar to the status
  row after initial review.
- **S6** · Separate repository and a non-deleting installer scoped to its own
  layout and two mods.
- **S7** · Existing user layouts remain untouched and available via Ctrl+Shift+L.
- **S8** · Monitor icon instead of a text marker on the current agent.
- **S9** · Collapsible board with hover expansion (initial floating drawer
  superseded by S12).
- **S10** · Rail program icons, status badges, current highlight and group counts.
- **S11** · English UI labels/tooltips.
- **S12** · Collapsed rail is docked at 52px; only the hover overlay covers the
  terminal. Hover must not change pane focus.
- **S13** · Rail and overlay share right/top/bottom edges and header alignment.
- **S14** · English publishing name `herdr-agent-board`, English documentation,
  neutral prototype examples, gallery recipe and preview. Public layout has no
  Dictar. `HERDR_DICTATE_MOD` optionally generates a local 168px dictate block.

## Tasks

| ID | Specs | Route | Status | Commit |
|---|---|---|---|---|
| T1 | S1, S7 | implementation writer | done | initial implementation |
| T2 | S2–S4 | implementation writer | done | initial implementation |
| T3 | S5 | implementation writer | done | initial implementation |
| T4 | S6 | implementation writer | done | initial implementation |
| T5 | S1–S7 | parent: checks, status, screenshot review | done | initial implementation |
| T6 | S6 | parent: initial main commit | done | initial implementation |
| T7 | S8–S11 | implementation writer | done | drawer implementation |
| T8 | S8–S11 | parent: screenshot review | done | drawer implementation |
| T9 | S12, S13 | implementation writer | done | rail implementation |
| T10 | S12, S13 | parent: screenshot review | done | rail implementation |
| T11 | S14 | writer: references, installer, English docs/recipe/prototype | implemented; repository checks in handoff | not committed |
| T12 | S14 | parent: preview render, native checks, local install, screenshots | pending | not committed |
| T13 | S14 | parent: repository rename/topic/publication | pending; separate authorization | not committed |

Out of scope: working/done tags in Spaces (requires cloning the shipped mod),
publishing personal dictate code, changing existing user layouts, or restarting
Herdr. No commit, push, or remote mutation is authorized for this preparation.

## Log

Historical observations below describe checks made during earlier work, not
verification of the renamed publishing candidate. Paths and commands use current
English identifiers for readability.

- **L1** · User: "quiero que mires con 'herdr-app' el layout que tengo se ve asi [...] podiramos crear un layout mejor distribuido para los agents? es posdible?" ("Please inspect my current Herdr layout; could we distribute the agents better?")
- **L2** · User: "pdoria inventarte una mejor forma de ver los que tengo activos y los que no?!" ("Could you invent a better way to see active and inactive agents?") → prototype view D added.
- **L3** · User: "no quiero el comando en ejecucion" ("I do not want the running command.") → last-output box removed (S3).
- **L4** · User: "puedes remover ese spiner line" ("Can you remove that spinner line?") → progress line removed (S4).
- **L5** · User: "me gusta, procedamos a implementar este layout, con el mod de dictar aplicado" ("I like it; implement this layout with the dictate mod applied.") → initial local layout (S1); public dependency later removed by S14.
- **L6** · User: "podemos crearlo en un git repo nuevo" ("Can we create it in a new Git repository?") → separate repository, prototype in docs (S6).
- **L7** · User: "crea el odd si te facilita" ("Create the ODD document if it helps.") → this task record.
- **L8** · Initial implementation delegated with scope limited to this layout,
  its two mods, installer and README.
- **L9** · Initial native checks passed; status had no errors; parent reviewed
  a screenshot showing board, strip and Dictar, without output/progress boxes.
- **L10** · Initial review found decorative title prefixes and strip placement
  after window buttons; both addressed next.
- **L11** · User: "puedes corregir, ya que cuando estoy en un agent, no veo cual es el activo en el sidebar que creaste" ("Can you fix the sidebar so I can see which agent I am currently in?") → accent border/selected background/current marker on cards, rows and strip;
  current sleeping agent kept visible. Decorative prefixes removed and strip
  moved to the status bar. Checks passed and working highlight reviewed;
  idle highlight was not observed live.
- **L12** · User: "pero pon el texto, de un icono, y tambien que sea colapsable este sidebar y al pasar se vuelva hover expand sobre el area?" ("Use an icon instead of the text and make the sidebar collapsible, expanding over the area on hover.") → S8/S9, initial native floating drawer.
- **L13** · User: "puedes mejorar como se ve contraido?, depronto iconos y status" ("Can you improve the collapsed look, perhaps with icons and status?") → S10.
- **L14** · User: "tambien puedes hacer los textos en ingles, de las labels" ("Can you make the labels English too?") → S11.
- **L15** · Drawer checks passed, no status errors, board left expanded.
  Parent reviewed collapsed icon cells/counts/current highlight and English
  expanded labels. Hover, tooltips, blocked/done/sleeping badges not observed
  live. Screenshots moved outside the repository; generated type/config files
  ignored.
- **L16** · User: "no me gusta como se ve la bar contraida, me gustaria que solo este sobrepuesta, cuando se expanda en el hover, que ocupe su espacio base en el sidebar" ("I do not like the collapsed bar; it should occupy sidebar space and only overlap on hover expansion.") → S12, docked rail.
- **L17** · User: "seria posible que en contraido , este alineado con cuando se expande" ("Could the collapsed version align with the expanded one?") → S13.
- **L18** · Rail checks passed, no status errors, board left expanded. Parent
  reviewed `/tmp/herdr-shots/rail-docked.png` (52px rail beside terminal) and
  `rail-overlay.png` (left-growing overlay with aligned edges). Real-pointer
  hover/grace/tooltips/click-to-focus remained untested.
- **L19** · User: "no se contrae" ("It does not collapse.") → CLI collapse worked,
  but clicking left the pointer over the new rail, immediately reopening the
  overlay. Fixed by clearing rail hover and disarming hover-open until pointer
  exit. Checks passed; real pointer click not tested.
- **L20** · User: "cuando lo saco no cierra" ("It does not close when I move out.")
  → overlay swallowed rail exit. Opening now clears rail hover; overlay mouse
  movement marks overlay hover. Command verification showed cleared rail hover,
  successful unpeek, and no errors; real pointer exit not tested.
- **L21** · User: "esta bien, ahora puedes hacer el push a su respectiva rama, deja como isntalar y todos los detalles" ("All right, push to the appropriate branch and document installation and all details.")
  → README expanded. User chose a public repository and main branch. This is
  historical authorization, not permission to push the current candidate.
- **L22** · User: "puedes hacer el repo en un nombre en ingles, toda la doc en ingles, ya que quiero publicar este repo en el gallery de herdr" ("Can you give the repository an English name and make all documentation English so I can publish it in Herdr's gallery?")
  → chosen name `herdr-agent-board`.
- **L23** · User decision: "Sin Dictar en lo público" ("No Dictar in the public version.")
  → public layout has only workspace status and agent strip in its status row;
  optional local variant reuses an existing personal mod without publishing it.
- **L24** · Parent renamed the layout, mods, prototype and task document with
  unstaged filesystem moves. Writer updated references/shared namespace,
  installer, English docs/recipe and neutral prototype. Runtime installation,
  screenshot rendering/review and remote publication remain parent-owned.
- **L25** · Parent runtime verification: `preview.png` rendered from `docs/prototype.html?preview` and reviewed (English labels, example names, no Dictar). `HERDR_DICTATE_MOD=mi-boton sh install.sh` passed both mod checks; `layout.switch agent-board-dictate`, `agent-board.collapse` and `agent-board.expand` returned ok; `herdr-app status` → `"layout": "agent-board-dictate"`, `"errors": []`; real-window screenshot reviewed (board expanded, Dictar in the status bar). Old installed copies (`layouts/agentes.json`, `mods/tablero-agentes`, `mods/tira-agentes`) removed from the Herdr home.
