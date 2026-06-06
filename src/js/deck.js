/* =========================================================================
   deck.js — Inicialización común de los mazos RevealJS.
   Importa Reveal y su CSS por npm (offline). Cada deck HTML solo necesita
   incluir su markup .reveal/.slides y este módulo.
   ========================================================================= */
import Reveal from "reveal.js";
import "reveal.js/dist/reveal.css";
import "../styles/deck.css";

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

deck.initialize().then(sincronizarLogo);
deck.addEventListener("slidechanged", sincronizarLogo);
