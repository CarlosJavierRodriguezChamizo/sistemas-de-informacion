/* =========================================================================
   deckMotion.js — Capa de micro-interacciones con Motion (familia Framer
   Motion, vanilla, offline). Estética 21st.dev recreada sin React:
   - Entrada por slide con stagger tipo "spring".
   - Spotlight: brillo que sigue al cursor en las tarjetas .spot.
   - Contadores animados en elementos [data-count].

   Se activa solo si el <body> declara data-motion (lo hace M3).
   ========================================================================= */
import { animate, stagger } from "motion";

const EASE = [0.2, 0.7, 0.2, 1];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Spotlight que sigue al cursor sobre las tarjetas .spot. */
function initSpotlight(root) {
  root.addEventListener(
    "pointermove",
    (e) => {
      const cards = e.target.closest?.(".spot");
      if (!cards) return;
      const r = cards.getBoundingClientRect();
      cards.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      cards.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    },
    { passive: true }
  );
}

/** Formatea un número con decimales y separador de miles español. */
function fmt(v, dec) {
  return v.toLocaleString("es-ES", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

/** Anima la entrada del contenido de una slide. */
function animarSlide(slide) {
  if (!slide) return;

  // Entrada escalonada de los elementos marcados.
  const items = slide.querySelectorAll("[data-anim]");
  if (items.length) {
    if (reduce) {
      items.forEach((el) => (el.style.opacity = "1"));
    } else {
      animate(
        items,
        { opacity: [0, 1], transform: ["translateY(26px) scale(.97)", "translateY(0) scale(1)"] },
        { delay: stagger(0.07, { startDelay: 0.05 }), duration: 0.6, ease: EASE }
      );
    }
  }

  // Contadores animados.
  slide.querySelectorAll("[data-count]").forEach((el) => {
    const to = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.dec || "0", 10);
    const pre = el.dataset.pre || "";
    const suf = el.dataset.suf || "";
    if (reduce) { el.textContent = pre + fmt(to, dec) + suf; return; }
    animate(0, to, {
      duration: 1.3,
      ease: [0.2, 0.8, 0.2, 1],
      onUpdate: (v) => { el.textContent = pre + fmt(v, dec) + suf; },
    });
  });
}

/** @param {import('reveal.js').Api} deck */
export function initDeckMotion(deck) {
  initSpotlight(document);
  deck.addEventListener("slidechanged", (e) => animarSlide(e.currentSlide));
  animarSlide(deck.getCurrentSlide());
}
