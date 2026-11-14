#!/bin/sh
set -eu

SOURCE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
DEST=${HERDR_APP_HOME:-$HOME/.config/herdr-app}

# Validate the optional local dependency before copying anything.
if [ -n "${HERDR_DICTATE_MOD:-}" ]; then
    case "$HERDR_DICTATE_MOD" in
        .|..|*[!a-zA-Z0-9_-]*)
            printf '%s\n' 'HERDR_DICTATE_MOD must be a mod folder name (letters, digits, underscores or hyphens).' >&2
            exit 1 ;;
    esac
    if [ ! -f "$DEST/mods/$HERDR_DICTATE_MOD/main.js" ]; then
        printf 'Dictate mod missing: %s/mods/%s/main.js\n' "$DEST" "$HERDR_DICTATE_MOD" >&2
        exit 1
    fi
    if ! command -v python3 >/dev/null 2>&1; then
        printf '%s\n' 'python3 is required for HERDR_DICTATE_MOD.' >&2
        exit 1
    fi
fi

# Copy only this layout and its two mods; never delete other installed files.
mkdir -p "$DEST/layouts" "$DEST/mods/agent-board" "$DEST/mods/agent-strip"
cp "$SOURCE/layouts/agent-board.json" "$DEST/layouts/agent-board.json"
for mod in agent-board agent-strip; do
    cp "$SOURCE/mods/$mod/main.js" "$DEST/mods/$mod/main.js"
    cp "$SOURCE/mods/$mod/mod.json" "$DEST/mods/$mod/mod.json"
done

if [ -n "${HERDR_DICTATE_MOD:-}" ]; then
    python3 - "$DEST" "$HERDR_DICTATE_MOD" <<'PY'
import json
import pathlib
import sys

home = pathlib.Path(sys.argv[1])
layout = json.loads((home / "layouts/agent-board.json").read_text())

def find(node):
    if node.get("id") == "status-row":
        return node
    for child in node.get("children", []):
        found = find(child)
        if found is not None:
            return found
    return None

status = find(layout)
if status is None:
    raise SystemExit("Cannot create dictate variant: status-row is missing.")
status["children"].append({
    "id": "dictate", "type": "block",
    "content": {"mod": sys.argv[2]}, "size": {"px": 168}
})
(home / "layouts/agent-board-dictate.json").write_text(json.dumps(layout, indent=2) + "\n")
PY
fi

herdr-app check "$DEST/mods/agent-board"
herdr-app check "$DEST/mods/agent-strip"
printf '\nInstalled. Switch to the public layout with:\n'
printf '%s\n' "herdr-app do layout.switch '{\"name\":\"agent-board\"}'"
if [ -n "${HERDR_DICTATE_MOD:-}" ]; then
    printf '\nOr switch to your local dictate variant:\n'
    printf '%s\n' "herdr-app do layout.switch '{\"name\":\"agent-board-dictate\"}'"
fi
