# Agentes para Herdr

Layout de escritorio basado en la vista **D · Tablero de actividad** de
`docs/prototipos.html`. Mantiene las terminales en el centro, Spaces en una
barra lateral de 250 px y un tablero de actividad de 360 px a la derecha.
Conserva los marcos de las terminales, la marca, el pie y **Dictar** de `mi-layout`.

## Instalación

Requiere Herdr en ejecución, `herdr-app` en el PATH y los mods incluidos con
Herdr: `workspace-chrome` (también su `spinner.svg`), `workspace-status`,
`spaces`, `tabs`, `pane`, `files` y `changes`. **Dictar requiere el mod personal
`mi-boton` ya instalado**; este repositorio no lo modifica ni lo instala.

Desde este repositorio:

```sh
sh install.sh
herdr-app do layout.switch '{"name":"agentes"}'
```

También puedes usar **Ctrl+Shift+L** para recorrer los layouts.
`HERDR_APP_HOME` permite seleccionar otro directorio de Herdr:

```sh
HERDR_APP_HOME=/ruta/a/herdr sh install.sh
```

La instalación copia únicamente `layouts/agentes.json`, y `main.js` y
`mod.json` de `tablero-agentes` y `tira-agentes`. Sobrescribe esas copias en
instalaciones posteriores; no borra archivos ni toca `mi-layout.json`, otros
mods, las teclas o la configuración. Después comprueba ambos mods. No cambia
el layout automáticamente ni reinicia Herdr.

## Uso

- **Te necesitan:** agentes bloqueados o terminados sin revisar. La tarjeta
  y **Ver ↵** enfocan su panel.
- **Trabajando:** nombre, espacio, rama disponible, tiempo y chips de
  subagentes vivos. Un chip enfoca su panel o abre una vista previa si no tiene uno.
- **En reposo:** filas de la última hora, filas más tenues de hoy y chips
  para agentes con al menos un día en reposo. El encabezado Dormidos permite
  plegarlos. Los tiempos se guardan por mod y se actualizan cada 30 segundos;
  en la primera instalación empiezan al observar cada agente. Revisar un
  agente terminado no reinicia su tiempo de reposo.
- **Tira superior:** agentes bloqueados, terminados y trabajando, con `+N`
  para sus subagentes vivos y un contador de agentes en reposo. Si no caben,
  la lista se desplaza horizontalmente. Pulsar una píldora enfoca su panel;
  el fondo libre sigue permitiendo arrastrar la ventana.

El tablero puede redimensionarse entre 280 y 600 px. Files/Changes siguen
presentes después del tablero, ocultos por defecto y accesibles desde la
barra de pestañas. El orden de navegación de agentes sigue el tablero.
Los mods usan los colores del tema y animación nativa, sin consultar salidas
de terminales, ejecutar programas ni acceder a la red.

## Comprobación

```sh
herdr-app check "$HOME/.config/herdr-app/mods/tablero-agentes"
herdr-app check "$HOME/.config/herdr-app/mods/tira-agentes"
herdr-app do layout.switch '{"name":"agentes"}'
herdr-app status
herdr-app shot /tmp/agentes.png
```

Comprueba que el estado muestre `"layout": "agentes"` y `"errors": []` y
abre la captura para revisar el resultado. La captura contiene el contenido
visible de las terminales; revísala antes de compartirla.
