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

- **Needs you:** agentes bloqueados o terminados sin revisar. La tarjeta
  y **Open ↵** enfocan su panel.
- **Working:** nombre, espacio, rama disponible, tiempo y chips de
  subagentes vivos. Un chip enfoca su panel o abre una vista previa si no tiene uno.
- **Idle:** filas de **Last hour**, filas más tenues de **Today** y chips
  para agentes con al menos un día en reposo. El encabezado **Sleeping · over 1 day** permite
  plegarlos. Los tiempos se guardan por mod y se actualizan cada 30 segundos;
  en la primera instalación empiezan al observar cada agente. Revisar un
  agente terminado no reinicia su tiempo de reposo.
- **Tira superior:** agentes bloqueados, terminados y trabajando, con `+N`
  para sus subagentes vivos y un contador de agentes en reposo. Si no caben,
  la lista se desplaza horizontalmente. Pulsar una píldora enfoca su panel;
  el fondo libre sigue permitiendo arrastrar la ventana.

El tablero expandido conserva el ancho elegido (360 px por defecto, hasta 600 px).
El layout admite 48 px como mínimo para el modo contraído. Files/Changes siguen
presentes después del tablero, ocultos por defecto y accesibles desde la
barra de pestañas. El orden de navegación de agentes sigue el tablero.
Los mods usan los colores del tema y animación nativa, sin consultar salidas
de terminales, ejecutar programas ni acceder a la red.

## Colapsar el panel

Las etiquetas de ambos mods están en inglés. El icono de monitor con el texto
emergente **You are here** identifica al agente
actual, junto al borde de acento y el fondo seleccionado.

Pulsa **Collapse** en el encabezado del tablero. La columna se reduce a una
barra fija de 52 px que ocupa su propio espacio: nunca tapa la terminal.
Las celdas tienen 36 px de alto, iconos de 16 px y estados de 8 px:
un indicador gira para los agentes trabajando; un punto indica los terminados,
**!** los bloqueados y un anillo los inactivos. El agente actual conserva el
borde de acento y el fondo seleccionado. Los inactivos se atenúan a 0,55 y los
dormidos a 0,35; el actual nunca se atenúa. Entre grupos solo hay un separador
corto; únicamente **Needs you** muestra un contador, cuando no está vacío.
Cada celda muestra el nombre del agente al pasar el puntero.

Al pasar el puntero por la barra, el tablero crece hacia la izquierda sobre
la terminal, cubriendo la barra, sin redimensionarla ni tomar el teclado.
**S12-align:** la barra y el tablero comparten marco (fondo surface, borde de
1 px y radio de 10 px), márgenes de 8 px y el mismo encabezado. El overlay
mide 360 px de ancho y exactamente la altura de la barra: sus bordes derecho,
superior e inferior coinciden. La posición se calcula a partir del layout vivo
y del tamaño medido; al mover el puntero se usan sus límites exactos.
Los agentes mantienen el mismo orden y el contenido permite desplazarse. Se cierra 180 ms después de abandonar tanto la barra
como el overlay; pulsar un agente lo cierra y enfoca ese agente.
**Pin panel** (en la barra o el overlay) restaura el tablero fijo con su ancho
anterior. El estado contraído y el ancho expandido se conservan al recargar.

También se puede usar la misma lógica desde la CLI, sin cambiar de panel:

```sh
herdr-app do tablero-agentes.collapse
herdr-app do tablero-agentes.peek     # abrir overlay sin mover el puntero
herdr-app do tablero-agentes.unpeek   # cerrar solo el overlay
herdr-app do tablero-agentes.expand
```

## Comprobación

```sh
herdr-app check "$HOME/.config/herdr-app/mods/tablero-agentes"
herdr-app check "$HOME/.config/herdr-app/mods/tira-agentes"
herdr-app do layout.switch '{"name":"agentes"}'
herdr-app status
herdr-app shot /tmp/herdr-shots/agentes.png
```

Comprueba que el estado muestre `"layout": "agentes"` y `"errors": []` y
abre la captura para revisar el resultado. La captura contiene el contenido
visible de las terminales; revísala antes de compartirla.
