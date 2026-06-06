# Sistemas de Información · Caso Grupo Báltica Sports — ESIC

Web docente de aula (Executive MBA, ESIC) que sustituye al PowerPoint para una
sesión de 10 h sobre **Sistemas de Información**, anclada al caso *Grupo Báltica
Sports — "El crecimiento que no se puede sostener"*.

Incluye: teoría en **RevealJS**, herramientas interactivas para las prácticas,
una **sala de pitch** con temporizador y scoring, y enlaces a los **Kahoots**.

## Stack

- **Vite 4** (vanilla JS, sin frameworks) · multipágina.
- **reveal.js** vía npm (sin CDN).
- **Offline-first**: todas las dependencias (fuente, logos, JS, CSS) se sirven
  localmente. Funciona aunque caiga el wifi del aula.
- Estado de los interactivos **en memoria** (no persiste entre recargas, por diseño).

## Arranque

```bash
npm install
npm run dev      # servidor de desarrollo (http://localhost:5173)
```

## Build y previsualización

```bash
npm run build    # genera /dist (estático)
npm run preview  # sirve /dist localmente para comprobarlo
```

`vite.config.js` usa `base: './'` (rutas relativas), por lo que `/dist` es
servible desde la raíz de un dominio **o** abriendo los HTML en local.

## Despliegue

Es un sitio estático en `/dist`.

- **Vercel**: framework *Vite*, build `npm run build`, output `dist`. (O `vercel --prod`.)
- **GitHub Pages**: publica el contenido de `/dist` (rama `gh-pages` o carpeta
  `docs/`). Como `base` es relativa, funciona también en `usuario.github.io/repo/`.

## Estructura

```
index.html                      Hub / escaleta viva de los 2 días
decks/   m1 · m2 · m3 · m4       Teoría (RevealJS) — m4: IA, agentes y MCP
         silos · arquitectura    Historias visuales (scrollytelling)
tools/   clasificador · mapa-silos · api · migrar-integrar · mcp · pitch · kahoot
src/
  components/                    Componentes JS (Header, Card, Kpi, Button…)
  data/                          Dataset del caso + textos editoriales
  js/                            Lógica de cada página
  styles/                        tokens · base · components + estilos por tool
public/assets/                   Fuente y logos (offline)
```

## Nota pedagógica (importante)

Este proyecto es **material de alumno**. **No** contiene catálogos de errores,
la lista de gaps "correctos", la recomendación-tipo del AS/400 ni rúbricas de
evaluación. Los botones *Comprobar* validan la respuesta concreta del alumno,
pero **no** exponen la solución completa en el código fuente. El material de
profesor se gestiona por completo **fuera de este repositorio**.
