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
