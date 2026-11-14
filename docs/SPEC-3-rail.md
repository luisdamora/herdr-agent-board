# Spec 3: docked rail, overlay only on hover

Feature history: `odd/tasks/agent-board.md` (S12, S13). This supersedes Spec 2's
floating collapsed drawer. Current implementation: `mods/agent-board/main.js`.

User request (verbatim): "no me gusta como se ve la bar contraida, me gustaria que solo este sobrepuesta, cuando se expanda en el hover, que ocupe su espacio base en el sidebar" ("I do not like the collapsed bar; it should occupy its own sidebar space and only overlap the work area when expanded on hover.")

## S12 · Behavior

- **Collapsed means docked.** Keep node `board` visible and run
  `layout.resize {id: "board", px: 52}`. Remember its expanded width (default
  360px; remember widths >=280px) in `agent-board.expandedWidth`. The layout's
  minimum is 48px so the 52px rail fits. No floating drawer is used.
- **Hover means overlay.** Open `agent-board` with `{peekBoard: true}` as a
  `kind: "window"`, `frame: "none"` overlay, 360px wide, with the rail's height.
  Align right/top/bottom edges with the rail; it grows left over the terminal.
  Use measured pointer bounds when available, otherwise resolve layout bounds
  from the viewport and visible siblings. Do not change pane focus merely by
  hovering. Clicking an agent focuses its pane and dismisses the overlay.
- **Leaving closes it.** Track rail/overlay hover separately. Close after a
  180ms grace when neither is hovered. Opening clears rail hover because the
  overlay covers the rail and would otherwise swallow its pointer-exit event.
  Overlay mouse movement explicitly marks the overlay hovered.
- **Collapse must look collapsed.** A collapse-button click disarms hover-open
  until the pointer leaves the rail once, preventing immediate overlay reopening
  under the pointer. CLI collapse does not disarm it.
- **Pin restores the board.** Show `board`, close the overlay, restore the saved
  expanded width. The main copy repairs stale hidden/collapsed layout state
  without repeating requests on every render.

Shared keys are namespaced: `agent-board.collapsed`, `expandedWidth`, `peek`,
`railHovered`, `overlayHovered`, `hoverArmed`, and `changed` (each suffix after
`agent-board.`). The overlay reads the main copy's published age snapshot.

## S12 · Compact rail appearance

- 52px layout column inside the same `surface`, 1px `border`, radius-10 frame
  used by the expanded panel; no extra chrome frame or floating collapsed rail.
- Cells: 36px high, full interior width, 4px vertical gap, radius 8; 16px program
  icon centered with an 8px badge at bottom right (offset -3px).
- Working: spinner; done: dot; blocked: **!**; idle: ring.
- Current agent: `selected` background, 1px `accent` border, full opacity.
- Idle opacity 0.55; sleeping (>=1 day) 0.35; current always 1.
- Group separators: 12px region containing a centered 16×1px `border` line.
  Only Needs you gets a count badge, when nonempty.
- Top pin control: 40px tall, 16px left chevron, tooltip **Pin panel**.
- Every cell has an agent-name tooltip. Rail and full board scroll vertically.

## S13 · Edge alignment

User request (verbatim): "seria posible que en contraido , este alineado con cuando se expande" ("Could the collapsed version align with the expanded one?")

Keep the same card frame and right/top/bottom edges in the collapsed and overlay
states, including the header position. The 360px overlay includes the rail's
width rather than sitting beside it.

## Commands and verification

- `herdr-app do agent-board.collapse`: docked 52px rail, terminal uncovered.
- `herdr-app do agent-board.peek`: 360px overlay if the rail is measured/armed.
- `herdr-app do agent-board.unpeek`: overlay dismissed.
- `herdr-app do agent-board.expand`: restored pinned board.

Run native checks on both installed mods, inspect status (`errors: []`), then
inspect screenshots of rail, overlay, and expanded states under
`/tmp/herdr-shots/`. Also test real-pointer collapse, leave-to-arm, hover open,
leave-to-close, tooltips, and agent clicks. Command-driven checks do not prove
pointer behavior. Do not restart Herdr or change pane focus during structural
checks. Leave the board expanded.
