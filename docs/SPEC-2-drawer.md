# Spec 2: current-agent icon and collapsible board

Feature history: `odd/tasks/agent-board.md` (S8–S11). Base: `docs/SPEC.md`.
This records the initial drawer design; `SPEC-3-rail.md` supersedes its floating
collapsed behavior. Current source uses the docked rail and a separate overlay.

User request (verbatim): "pero pon el texto, de un icono, y tambien que sea colapsable este sidebar y al pasar se vuelva hover expand sobre el area?" ("Use an icon instead of the text, and make this sidebar collapsible, expanding over the work area on hover.")

## S8 · Current-agent icon

In `mods/agent-board/main.js` and `mods/agent-strip/main.js`, replace the former
text marker with `mods/workspace-chrome/monitor.svg`, size 13px, `t.accent`,
tooltip **You are here**. Preserve the accent border and selected background.

## S9 · Initial drawer design (historical)

The initial design hid the 360px board when collapsed and exposed a floating
peek drawer. Its mirrored rows put status icons on the right, so the peek edge
remained informative. A pin button restored the docked board. Shared rendering
avoided separate implementations of the same cards. The floating rail covered
the terminal, which the user rejected; do not recreate it in a fresh build.

The current implementation instead keeps the `board` node visible at 52px and
opens an `agent-board` overlay only on hover. It uses
`shared("agent-board.collapsed")`, defaults expanded, and preserves the
expanded width. The header has **Collapse** and **Pin panel** controls.

## S10 · Compact rail

Each agent has a program icon, status badge, and current-agent accent highlight.
Idle agents are dimmed. Groups have separators rather than individual boxes.
See Spec 3 for exact dimensions and hover geometry.

## S11 · English labels

All native UI labels and tooltips are English: **Needs you**, **Working**,
**Idle**, **Last hour**, **Today**, **Sleeping · over 1 day**, **Blocked**,
**Done · unreviewed**, **Open ↵**, **sub-agents**, **No agents yet**, **N idle**,
**Collapse**, **Pin panel**, **You are here**.

## Constraints and verification

Use native builders supported by Herdr's `gpui-kit.d.ts`, theme colors, native
spinner animation, and no animation redraw timer. The age timer is separate.
Both mods must pass `herdr-app check`; screenshots must confirm the monitor
marker, collapsed rail and expanded board. A passing native check alone does
not prove hover, tooltip or click behavior. Keep screenshots outside the repo
under `/tmp/herdr-shots/`. Do not restart Herdr or change pane focus during
layout verification. Leave the board expanded.
