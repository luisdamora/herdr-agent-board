#!/bin/sh
set -eu

SOURCE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
DEST=${HERDR_APP_HOME:-$HOME/.config/herdr-app}

# Copy only this layout and its two mods; never remove or replace other files.
mkdir -p "$DEST/layouts" "$DEST/mods/tablero-agentes" "$DEST/mods/tira-agentes"
cp "$SOURCE/layouts/agentes.json" "$DEST/layouts/agentes.json"
for mod in tablero-agentes tira-agentes; do
    cp "$SOURCE/mods/$mod/main.js" "$DEST/mods/$mod/main.js"
    cp "$SOURCE/mods/$mod/mod.json" "$DEST/mods/$mod/mod.json"
done
herdr-app check "$DEST/mods/tablero-agentes"
herdr-app check "$DEST/mods/tira-agentes"
printf '\nInstalado. Para cambiar al layout:\n'
printf '%s\n' "herdr-app do layout.switch '{\"name\":\"agentes\"}'"
