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
import { DECK_BG_FRAG, SERVER_FRAG } from "./gl/shaders.js";

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

/** Monta la capa WebGL (fondo + sala de servidores en las portadas). */
function montarGL() {
  const bgC = document.createElement("canvas");
  bgC.id = "deck-bg";
  bgC.setAttribute("aria-hidden", "true");
  const svC = document.createElement("canvas");
  svC.id = "deck-server";
  svC.setAttribute("aria-hidden", "true");
  document.body.prepend(bgC, svC); // bgC debajo, svC (servidores) encima

  createGL(bgC, DECK_BG_FRAG, { dprCap: 1.75 });                 // fondo: siempre activo
  const server = createGL(svC, SERVER_FRAG, { dprCap: 1.5, paused: true }); // servidores: bajo demanda

  // Parallax sutil de la sala con el ratón
  window.addEventListener(
    "pointermove",
    (e) => server.setMouse(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight),
    { passive: true }
  );

  // La sala solo se pinta (y consume) en las slides de portada.
  const sincronizarServer = () => {
    const actual = deck.getCurrentSlide();
    const enPortada = !!actual && actual.classList.contains("slide--cover");
    svC.classList.toggle("is-on", enPortada);
    if (enPortada) server.start(); else server.stop();
  };
  deck.addEventListener("slidechanged", sincronizarServer);
  sincronizarServer();
}

deck.initialize().then(() => {
  sincronizarLogo();
  if (document.body.dataset.gl) montarGL();
});
deck.addEventListener("slidechanged", sincronizarLogo);
