/* =========================================================================
   intro.js — Apertura inmersiva de la sesión.
   Lenis (scroll suave) + fondo shader WebGL que pasa del caos (silos) al
   orden (visión 360) según el progreso de scroll. El texto se revela al
   entrar en el viewport. Todo offline: Lenis vía npm, shader en WebGL puro.
   ========================================================================= */
import Lenis from "lenis";
import { createShaderBg } from "./gl/shaderBg.js";
import { appUrl } from "../components/_util.js";

/* --------------------------- Contenido (narrativa) ----------------------- */
// Cada paso es un "acto" a pantalla completa. La copia ancla el shader al caso.
const STEPS = [
  {
    kicker: "El crecimiento que no se puede sostener",
    h: "12 sistemas.<br>18 M€.<br>Y nadie ve al cliente entero.",
    p: "Grupo Báltica vende más que nunca. Su margen, en cambio, se desploma. El problema no está en el mercado: está dentro.",
  },
  {
    kicker: "Silos",
    h: "Cada sistema guarda<br>una parte de la verdad.",
    p: "CRM, e-commerce, fidelización, servicio, almacén, finanzas… Doce piezas que casi nunca se hablan entre sí.",
  },
  {
    kicker: "El dato existe",
    h: "Lo que falta<br>no es información.<br>Es integración.",
    p: "El AS/400, la app y el sistema de tickets encierran el dato más valioso del cliente — sin conectar con el resto.",
  },
  {
    kicker: "El punto de inflexión",
    h: "De los silos<br>a la visión 360.",
    p: "Cuando los sistemas se conectan, el caos se ordena. La empresa por fin ve a su cliente completo… y decide con él delante.",
  },
];

/* ------------------------------- Render DOM ------------------------------ */
const app = document.querySelector("#app");

const stepHtml = (st, i) => `
  <section class="act" data-i="${i}">
    <div class="act__inner reveal">
      <span class="act__kicker">${st.kicker}</span>
      <h2 class="act__h">${st.h}</h2>
      <p class="act__p">${st.p}</p>
    </div>
  </section>`;

app.innerHTML = `
  <header class="intro-top">
    <img class="intro-logo" src="${appUrl("/assets/logo_ESIC_blanco.svg")}" alt="ESIC" />
    <a class="intro-skip" href="${appUrl("/index.html")}">Ir al hub →</a>
  </header>

  <section class="hero">
    <div class="hero__inner reveal is-in">
      <span class="hero__eyebrow">Executive MBA · ESIC</span>
      <h1 class="hero__title">Sistemas de<br>Información</h1>
      <p class="hero__sub">Caso <strong>Grupo Báltica Sports</strong> — el crecimiento que no se puede sostener.</p>
    </div>
    <div class="hero__scrollhint" aria-hidden="true">
      <span>Desplázate</span>
      <svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 4v14M6 12l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
  </section>

  ${STEPS.map(stepHtml).join("")}

  <section class="closing" id="cierre">
    <div class="closing__inner reveal">
      <span class="act__kicker">Empecemos</span>
      <h2 class="closing__h">Dos días para convertir<br>el caos en ventaja.</h2>
      <nav class="closing__cta">
        <a class="ibtn ibtn--primary" href="${appUrl("/index.html")}">Abrir el hub de la sesión</a>
        <a class="ibtn" href="${appUrl("/decks/m1.html")}">Empezar por M1</a>
        <a class="ibtn" href="${appUrl("/decks/silos.html")}">Ver el problema de los silos</a>
      </nav>
    </div>
  </section>
`;

/* ------------------------------ Fondo shader ----------------------------- */
const bg = createShaderBg(document.querySelector("#gl"));
bg.start();

// Parallax sutil del shader con el ratón
window.addEventListener(
  "pointermove",
  (e) => bg.setMouse(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight),
  { passive: true }
);

/* --------------------------- Scroll suave (Lenis) ------------------------ */
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reduceMotion) {
  // Sin scroll inercial: el progreso lo da el scroll nativo.
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bg.setScroll(max > 0 ? window.scrollY / max : 0);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
} else {
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  lenis.on("scroll", ({ scroll, limit }) => {
    bg.setScroll(limit > 0 ? scroll / limit : 0);
  });
  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // Los enlaces ancla (#cierre) usan el scroll suave de Lenis
  app.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const el = document.querySelector(a.getAttribute("href"));
      if (el) { e.preventDefault(); lenis.scrollTo(el); }
    });
  });
}

/* --------------------------- Revelado del texto -------------------------- */
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }),
  { threshold: 0.35 }
);
app.querySelectorAll(".reveal:not(.is-in)").forEach((el) => io.observe(el));
