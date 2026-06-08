/* =========================================================================
   deck.js — Inicialización común de los mazos RevealJS.
   Importa Reveal y su CSS por npm (offline). Cada deck HTML solo necesita
   incluir su markup .reveal/.slides y este módulo.

   Capa WebGL opcional (offline, vía glCanvas): se activa solo si el <body>
   declara data-gl. Pinta un fondo navy atenuado en todas las slides y una
   "sala de servidores" raymarcheada como fondo de las slides .slide--cover.
   ========================================================================= */
import Reveal from "reveal.js";
import "reveal.js/dist/reveal.css";
import "../styles/deck.css";
import { createGL } from "./gl/glCanvas.js";
import { MATRIX_FRAG, SERVER_FRAG, NETWORK_FRAG, BLUEPRINT_FRAG } from "./gl/shaders.js";

const deck = new Reveal({
  hash: true,            // hash de slide en la URL (offline-friendly)
  controls: true,
  progress: true,
  slideNumber: "c/t",
  center: true,
  transition: "slide",
  width: 1280,           // lienzo 16:9, Reveal lo escala a la pantalla (p.ej. 1920×1080)
  height: 720,
  margin: 0.07,
});

/** Cambia el logo (blanco/azul) según el fondo de la slide actual. */
function sincronizarLogo() {
  const actual = deck.getCurrentSlide();
  const esClara = !!actual && actual.classList.contains("slide--light");
  document.body.classList.toggle("light-slide", esClara);
}

/** Crea un <canvas> de capa GL a pantalla completa. */
function glCanvasEl(id) {
  const c = document.createElement("canvas");
  c.id = id;
  c.setAttribute("aria-hidden", "true");
  return c;
}

/** M1: lluvia de código "Matrix" + sala de servidores en las portadas. */
function montarMatrix() {
  const bgC = glCanvasEl("deck-bg");
  const svC = glCanvasEl("deck-server");
  document.body.prepend(bgC, svC); // bgC debajo, svC (servidores) encima

  createGL(bgC, MATRIX_FRAG, { dprCap: 1.75 });
  const server = createGL(svC, SERVER_FRAG, { dprCap: 1.5, paused: true });

  window.addEventListener(
    "pointermove",
    (e) => server.setMouse(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight),
    { passive: true }
  );

  const sincronizarServer = () => {
    const actual = deck.getCurrentSlide();
    const enPortada = !!actual && actual.classList.contains("slide--cover");
    svC.classList.toggle("is-on", enPortada);
    if (enPortada) server.start(); else server.stop();
  };
  deck.addEventListener("slidechanged", sincronizarServer);
  sincronizarServer();
}

/** M2: red 3D de nodos que se reconfigura al cambiar de diapositiva. */
function montarRed() {
  const bgC = glCanvasEl("deck-bg");
  document.body.prepend(bgC);
  const net = createGL(bgC, NETWORK_FRAG, { dprCap: 1.75 });

  window.addEventListener(
    "pointermove",
    (e) => net.setMouse(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight),
    { passive: true }
  );

  // "Escena" = índice de slide normalizado; se anima suavemente hacia el destino.
  const sceneTarget = () => {
    const n = deck.getTotalSlides();
    return n > 1 ? deck.getIndices().h / (n - 1) : 0;
  };
  let target = sceneTarget();
  let current = target;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  deck.addEventListener("slidechanged", () => { target = sceneTarget(); });
  const tick = () => {
    current += (target - current) * 0.05;
    net.setScroll(current);
    requestAnimationFrame(tick);
  };
  if (reduce) { net.setScroll(target); } else { requestAnimationFrame(tick); }
}

/** M3: rejilla "blueprint" en perspectiva (mismo lenguaje, fondo propio). */
function montarBlueprint() {
  const bgC = glCanvasEl("deck-bg");
  document.body.prepend(bgC);
  const grid = createGL(bgC, BLUEPRINT_FRAG, { dprCap: 1.75 });
  window.addEventListener(
    "pointermove",
    (e) => grid.setMouse(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight),
    { passive: true }
  );
}

/** Monta la capa WebGL según el deck (data-gl). */
function montarGL() {
  const which = document.body.dataset.gl;
  if (which === "m2") montarRed();
  else if (which === "m3") montarBlueprint();
  else montarMatrix();
}

deck.initialize().then(() => {
  sincronizarLogo();
  if (document.body.dataset.gl) montarGL();
  // Micro-interacciones con Motion (carga bajo demanda; solo decks con data-motion).
  if (document.body.hasAttribute("data-motion")) {
    import("./deckMotion.js").then(({ initDeckMotion }) => initDeckMotion(deck));
  }
});
deck.addEventListener("slidechanged", sincronizarLogo);
