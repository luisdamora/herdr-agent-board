# Agentes para Herdr

Layout para la app de escritorio de [Herdr](https://herdr.dev) pensado para
trabajar con muchos agentes a la vez. En lugar de la lista de agentes de la
barra lateral, muestra un **tablero de actividad** que ordena los agentes según
lo que te piden: primero los que te necesitan, después los que trabajan y al
final los que están en reposo.

> El prototipo navegable está en `docs/prototipos.html` (ábrelo en el
> navegador; la vista **D · Tablero de actividad** es la que se implementó).

## Qué incluye

| Archivo | Qué es |
|---|---|
| `layouts/agentes.json` | El layout: Spaces a la izquierda (250 px), terminales en el centro, tablero a la derecha (360 px), barra de estado con la tira de agentes y **Dictar**. |
| `mods/tablero-agentes/` | El tablero de actividad, contraíble a una franja de iconos. |
| `mods/tira-agentes/` | La tira de agentes activos en la barra de estado. |
| `install.sh` | Copia el layout y los mods a la carpeta de Herdr y los comprueba. |
| `docs/` | Prototipo HTML y especificaciones (`SPEC*.md`). |
| `odd/tasks/layout-agentes.md` | Registro de requisitos, tareas y decisiones. |

## Requisitos

- La app de escritorio de Herdr (`herdr-app`) instalada, en el `PATH` y abierta.
- Los mods que trae Herdr (se instalan solos): `workspace-chrome`,
  `workspace-status`, `spaces`, `tabs`, `pane`, `files` y `changes`.
- **El mod personal `mi-boton`** (botón **Dictar** de la barra de estado), que
  abre el dictado del mod `voice-input`. Este repositorio **no** lo instala: si
  no lo tienes, quita el bloque `"id": "dictar"` de `layouts/agentes.json`
  antes de instalar.

## Instalación

```sh
git clone https://github.com/luisdamora/herdr-layouts.git ~/herdr-layouts
cd ~/herdr-layouts
sh install.sh
herdr-app do layout.switch '{"name":"agentes"}'
```

`install.sh`:

1. Copia `layouts/agentes.json` a `~/.config/herdr-app/layouts/`.
2. Copia `main.js` y `mod.json` de `tablero-agentes` y `tira-agentes` a
   `~/.config/herdr-app/mods/`.
3. Ejecuta `herdr-app check` en los dos mods y falla si alguno tiene errores.

No borra nada, no toca otros layouts, mods, teclas ni ajustes, no cambia de
layout por ti y no reinicia Herdr. Herdr recarga los archivos copiados en
menos de un segundo.

Para otra carpeta de Herdr:

```sh
HERDR_APP_HOME=/ruta/a/herdr-app sh install.sh
```

## Actualizar

```sh
cd ~/herdr-layouts
git pull
sh install.sh
```

Si editas el código, hazlo en este repositorio (no en `~/.config/herdr-app`)
y vuelve a ejecutar `sh install.sh`: la carpeta de Herdr es solo la copia
instalada.

## Cambiar de layout o volver al anterior

- **Ctrl+Shift+L** recorre los layouts instalados.
- O por comando: `herdr-app do layout.switch '{"name":"mi-layout"}'`.

## Desinstalar

```sh
herdr-app do layout.switch '{"name":"main"}'
rm ~/.config/herdr-app/layouts/agentes.json
rm -r ~/.config/herdr-app/mods/tablero-agentes ~/.config/herdr-app/mods/tira-agentes
```

## Uso

### El tablero

- **Needs you**: agentes bloqueados (esperan una aprobación) o que terminaron
  y no has revisado. Clic en la tarjeta o en **Open ↵** para ir a ellos.
- **Working**: agentes trabajando, con su space, su rama, el tiempo que llevan
  y sus sub-agentes como chips. Un chip enfoca el sub-agente o, si no tiene
  panel, abre una vista previa.
- **Idle**: agentes en reposo, más compactos cuanto más tiempo llevan parados:
  **Last hour** (filas), **Today** (filas tenues) y **Sleeping · over 1 day**
  (chips; el encabezado los pliega).
- **El agente en el que estás** lleva un icono de monitor (**You are here**),
  borde de acento y fondo resaltado, en cualquier sección.

Los tiempos cuentan desde el último cambio de estado de cada agente y se
actualizan cada 30 segundos. Tras la primera instalación empiezan a contar
desde que el tablero ve cada agente por primera vez.

### Contraer el panel

- El botón **›** de la cabecera **Agents** contrae el tablero a una franja de
  52 px que ocupa su propio espacio (no tapa la terminal). Cada agente es una
  celda con su icono y su estado: un indicador que gira (trabajando), un punto
  (terminado), **!** (bloqueado) o un anillo (en reposo). El agente actual
  tiene borde de acento; los que están en reposo se ven atenuados.
- **Al pasar el ratón** por la franja, el tablero completo se abre por encima
  de la terminal, alineado con la franja, y se cierra al sacar el ratón.
  Justo después de contraer con el botón, hay que sacar el ratón de la franja
  una vez antes de que se abra al pasar por encima.
- **‹ (Pin panel)** lo vuelve a dejar fijo con su ancho anterior.
- El estado contraído y el ancho se conservan al recargar.

También por comando:

```sh
herdr-app do tablero-agentes.collapse   # contraer
herdr-app do tablero-agentes.expand     # fijar
herdr-app do tablero-agentes.peek       # abrir el tablero flotante
herdr-app do tablero-agentes.unpeek     # cerrarlo
```

### La tira de la barra de estado

Una píldora por cada agente bloqueado, terminado o trabajando (`+N` si tiene
sub-agentes), y el número de agentes en reposo. Clic en una píldora para ir a
ese agente. El agente actual se resalta.

## Comprobar que funciona

```sh
herdr-app check ~/.config/herdr-app/mods/tablero-agentes
herdr-app check ~/.config/herdr-app/mods/tira-agentes
herdr-app status          # debe mostrar "layout": "agentes" y "errors": []
herdr-app shot /tmp/agentes.png
```

La captura incluye lo que se ve en tus terminales: revísala antes de
compartirla.

## Limitaciones conocidas

- Abrir y cerrar el tablero al pasar el ratón depende de los eventos de hover
  de Herdr; si se queda abierto, `herdr-app do tablero-agentes.unpeek` lo
  cierra.
- Los Spaces de la izquierda todavía no marcan cuáles tienen agentes
  trabajando (requiere clonar el mod `spaces`).
