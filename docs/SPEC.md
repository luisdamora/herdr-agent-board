# Spec: Agent Board for Herdr

Current public layout: `layouts/agent-board.json`. Static visual reference:
`docs/prototype.html`, view **D · Activity board** (default; `?preview` hides
prototype controls). Recipe: `RECIPE.md`. Requirement history:
`odd/tasks/agent-board.md`. Specs 2 and 3 explain the drawer/rail evolution;
Spec 3 and the current source supersede the initial floating drawer.

## Repository structure

```text
layouts/agent-board.json       public layout, no personal mods
mods/agent-board/              activity board (main.js, mod.json)
mods/agent-strip/              active-agent status strip (main.js, mod.json)
install.sh                    copies only the above files; checks both mods
README.md                     installation, usage, checks, limits
RECIPE.md                     gallery build brief
preview.png                   neutral prototype screenshot (publication asset)
```

The repository's publishing name is `herdr-agent-board`. The layout's installed
name is `agent-board`. Gallery discovery requires the GitHub topic `herdr-layout`.
Herdr's local API documentation lives in `~/.config/herdr-app/AGENTS.md`,
`herdr.d.ts`, and `gpui-kit.d.ts`. Do not modify shipped mods or existing layouts.

## S1 · Layout

- Root row: `canvas`, 1px `border` divider, no system titlebar, traffic lights
  at [12, 16], terminal padding [14, 12]. Theme/fonts follow Herdr settings.
- Left `sidebar`: 250px, min 44, max 480, `chrome`, non-resizable internally.
  `workspace-chrome` brand (46px), `spaces` (weight 1, min 90), then
  `workspace-chrome` with `{footer: true}` (69px).
- Work column: shipped `tabs` at 42px with window dragging; work body with
  8px padding/gap; status row at 28px.
- Main terminal block: active tab, pane headers from `pane` at 30px, always
  visible at top; `background`, 1px `border`, focused 1px `accent`, radius 10,
  gap 8, lone pane framed.
- Right `board`: 360px, min 48, max 600, `surface`, 1px `border`, radius 10,
  containing `agent-board`. It becomes 52px when collapsed.
- Optional `panel`: hidden initially, 368px, min 280/max 900, stack with `files`
  selected and `changes` as the other child.
- Public status row: `workspace-status` weight 1, then `agent-strip` at 440px,
  min 220, with window dragging. **No dictate block or personal-mod dependency.**

## S2 · Activity board

Sections use uppercase 11px headings with theme status colors and counts:

1. **Needs you**: `blocked` and `done` agents. Cards contain status icon, name,
   **Open ↵**, and space/status/age metadata (**Blocked**, **Done · unreviewed**).
2. **Working**: working agents, spinner, name, age, space/branch, and live
   sub-agent chips. The count includes total live sub-agents. A chip focuses its
   pane when available, otherwise invokes `terminal.peek`.
3. **Idle**: sorted by age: **Last hour** (<1h), **Today** (1h to <24h), and
   **Sleeping · over 1 day** (>=24h). Recent/today use rows; sleeping uses
   foldable chips. A current sleeping agent remains a visible row.

Cards/rows focus the agent's pane. The current agent has selected background,
accent border, and a 13px monitor icon (**You are here**). Names prefer meaningful
tab/title text, then space/program/address, stripping decorative title prefixes.
No command/output box or progress line. Empty text: **No agents yet**.

Use theme colors only in native mods: `done`, `working`, `blocked`, `idle`,
`muted`, `dim`, `accent`, `foreground`, `surface`, `background`, `border`,
`hover`, `raised`, `selected`, `chrome`. Working spinners use native `.spin(900)`.
A 30-second timer updates ages. Locally persisted observation timestamps reset
on genuine status transitions; done and idle share the age state so viewing done
work does not reset its age. Stale absent entries expire after 30 days.
`setAgentOrder` follows the displayed section order, omitting folded sleeping
agents. See `SPEC-3-rail.md` for collapse and overlay behavior.

## S3 · Active-agent strip

`agent-strip` lives in the status row, not the tab bar. It sorts blocked, done,
and working agents in that order, then shows `N idle`. Pills use a working
spinner or status dot, a name truncated to 14 characters, and `+N` live children.
The current pill gets selected/accent styling and a monitor icon. Clicks focus
panes and stop propagation so window dragging does not interfere. Pills scroll
horizontally when needed.

## S4 · Installer and local dictate option

`install.sh` copies only the public layout and the two bundled mods' `main.js`
and `mod.json` into `${HERDR_APP_HOME:-$HOME/.config/herdr-app}`. It overwrites
these destination files for updates, never deletes anything, then runs
`herdr-app check` on both mods. It prints layout-switch commands without
executing them. README and other documentation are in English.

If `HERDR_DICTATE_MOD` is nonempty, validate its folder name and the existing
`$DEST/mods/$HERDR_DICTATE_MOD/main.js` before copying. Missing dependencies fail
clearly. Python 3 generates an additional installed
`layouts/agent-board-dictate.json` from the public layout, appending to
`status-row` a block with id `dictate`, type `block`, `content.mod` equal to the
variable and `size.px` 168. Never copy or publish that personal mod. Without the
variable, leave any existing local variant alone.

## Verification

Repository checks: `sh -n install.sh` and
`python3 -m json.tool layouts/agent-board.json`.

Runtime checks (after installing): both native mod checks pass; switching to
`agent-board` reports that layout and `errors: []`. With an existing dictate
mod, optional installation and switching to `agent-board-dictate` show the
168px local block. Exercise `agent-board.collapse`, `expand`, `peek`, `unpeek`,
and inspect screenshots under `/tmp/herdr-shots/`. Hover must not change pane
focus. Leave the chosen local layout expanded after verification.
