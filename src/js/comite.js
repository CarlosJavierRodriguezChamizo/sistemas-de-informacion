/* =========================================================================
   comite.js — "El reto del Comité" (apoyo al pitch inicial).
   Presenta el mandato del Comité de Grupo Báltica: cuatro preguntas que los
   grupos trabajarán y, el sábado, defenderán (una por grupo). Estética
   futurista del proyecto: fondo WebGL (red), glass + neón, scroll por bloques
   y revelado con Motion. Reutiliza el sistema visual de odoo.css.
   ========================================================================= */
import { inView, animate, stagger } from "motion";
import { createGL } from "./gl/glCanvas.js";
import { NETWORK_FRAG } from "./gl/shaders.js";
import { appUrl } from "../components/_util.js";

const I = (id) => `<svg class="ico"><use href="#${id}"/></svg>`;

const SPRITE = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/></symbol>
  <symbol id="i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></symbol>
  <symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></symbol>
  <symbol id="i-chart" viewBox="0 0 24 24"><path d="M4 4v16h16"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></symbol>
  <symbol id="i-link" viewBox="0 0 24 24"><path d="M9 15l6-6"/><path d="M10.5 7.5 12 6a3 3 0 1 1 4 4l-1.5 1.5"/><path d="M13.5 16.5 12 18a3 3 0 1 1-4-4l1.5-1.5"/></symbol>
  <symbol id="i-db" viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/></symbol>
  <symbol id="i-cube" viewBox="0 0 24 24"><path d="M12 3 4 7v10l8 4 8-4V7l-8-4z"/><path d="M4 7l8 4 8-4M12 11v10"/></symbol>
  <symbol id="i-money" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M14.5 9.5C14 8.6 13 8 12 8c-1.4 0-2.5.9-2.5 2s1.1 2 2.5 2 2.5.9 2.5 2-1.1 2-2.5 2c-1 0-2-.6-2.5-1.5M12 6.5v11"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z"/></symbol>
  <symbol id="i-doc" viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></symbol>
  <symbol id="i-warning" viewBox="0 0 24 24"><path d="M12 4 3 19h18L12 4z"/><path d="M12 10v4M12 17v.4"/></symbol>
  <symbol id="i-leaf" viewBox="0 0 24 24"><path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13z"/><path d="M5 19c3-4 6-6 10-8"/></symbol>
  <symbol id="i-scale" viewBox="0 0 24 24"><path d="M12 4v16M6 20h12M12 4 5 8m7-4 7 4"/><path d="M5 8 2.5 14a3 3 0 0 0 5 0L5 8zM19 8l-2.5 6a3 3 0 0 0 5 0L19 8z"/></symbol>
</svg>`;

/* ------------------------------ Helpers ---------------------------------- */
const feat = (id, h, p) => `<div class="feat glass spot" data-anim><span class="ico-chip">${I(id)}</span><h3>${h}</h3><p>${p}</p></div>`;

function topic(n, kicker, title, body) {
  return `<section class="topic reveal"><div class="wrap">
    <div class="topic__head"><span class="topic__n" data-anim>${n}</span>
      <div><span class="kicker" data-anim>${kicker}</span><h2 data-anim>${title}</h2></div></div>
    ${body}
  </div></section>`;
}

function question(n, kicker, title, claim, expects, tool, note) {
  return topic(n, kicker, title, `
    <div class="glass panel" data-anim style="margin-bottom:1rem"><p class="claim">${claim}</p></div>
    <div class="feats feats--3">${expects.map((e) => feat(e.i, e.h, e.p)).join("")}</div>
    ${note ? `<p class="fineprint" data-anim style="margin-top:1rem">${note}</p>` : ""}
    ${tool ? `<p data-anim style="margin-top:1rem"><a class="btn" href="${appUrl(tool.href)}">${tool.label}</a></p>` : ""}
  `);
}

/* ------------------------------ Render ----------------------------------- */
const root = document.querySelector("#app");
root.innerHTML = `
  ${SPRITE}
  <header class="odoo-top">
    <img class="odoo-logo" src="${appUrl("/assets/logo_ESIC_blanco.svg")}" alt="ESIC" />
    <a class="odoo-back" href="${appUrl("/index.html")}">Ir al hub →</a>
  </header>

  <main id="contenido">
  <section class="odoo-hero reveal"><div class="wrap">
    <span class="eyebrow" data-anim>Pitch inicial · El mandato</span>
    <h1 class="odoo-hero__title" data-anim>El reto del <span class="shine">Comité</span></h1>
    <p class="lead" data-anim>Cuatro preguntas que Grupo Báltica necesita responder. Pero no basta con la respuesta correcta: tendréis que <strong>convencer</strong> al Comité de que vuestra solución es la mejor.</p>
    <div class="odoo-hero__hint" data-anim aria-hidden="true">Desplázate ↓</div>
  </div></section>

  ${question("01", "Pregunta 1 · Diagnóstico", "Los 3 gaps de integración más críticos",
    "Identifica y prioriza los <span class=\"hl\">tres gaps de integración de datos</span> más críticos para el negocio.",
    [
      { i: "i-bolt", h: "Impacto operativo", p: "Qué procesos se rompen o se hacen a mano por cada gap." },
      { i: "i-chart", h: "Impacto analítico", p: "Qué decisiones no se pueden tomar sin ese dato unido." },
      { i: "i-target", h: "Prioriza", p: "Ordénalos por daño al negocio, no por dificultad técnica." },
    ],
    { label: "Explóralo en el mapa de silos", href: "/tools/mapa-silos.html" })}

  ${question("02", "Pregunta 2 · Diseño", "Arquitectura de datos objetivo",
    "Propón una <span class=\"hl\">arquitectura de datos objetivo</span> (Data Architecture Target State) que resuelva los silos. Apóyate en un diagrama conceptual.",
    [
      { i: "i-link", h: "Capa de integración", p: "APIs / middleware: conectar una vez, no N veces." },
      { i: "i-db", h: "Única fuente de la verdad", p: "Un data warehouse con un solo significado por dato." },
      { i: "i-cube", h: "Diagrama conceptual", p: "Fuentes → integración → SSOT → 360 / BI / IA." },
    ],
    { label: "Historia visual: arquitectura objetivo", href: "/decks/arquitectura.html" })}

  ${question("03", "Pregunta 3 · Decisión", "AS/400 de Club B2B: ¿migrar o integrar?",
    "¿Qué <span class=\"hl\">criterios</span> usarías para decidir si migrar el AS/400 de Club B2B o integrarlo vía API con el ecosistema SAP/Salesforce?",
    [
      { i: "i-money", h: "¿Cuánto me cuesta?", p: "Migrar es un proyecto completo; integrar es envolverlo con APIs. ¿Qué esfuerzo y dinero?" },
      { i: "i-bolt", h: "¿Qué gano si lo hago?", p: "Qué desbloquea cada opción para el negocio." },
      { i: "i-shield", h: "¿Qué puede salir mal?", p: "Legado, dependencia del proveedor y continuidad de la operación." },
    ],
    { label: "Matriz migrar / integrar", href: "/tools/migrar-integrar.html" },
    "Decídelo respondiendo a tres preguntas: ¿cuánto me cuesta?, ¿qué gano? y ¿qué puede salir mal?")}

  ${question("04", "Pregunta 4 · Datos", "Calidad del dato: 5 problemas, mínimo",
    "Antes de cualquier análisis del dataset, ¿qué <span class=\"hl\">problemas de calidad del dato</span> detectas?",
    [
      { i: "i-doc", h: "Localiza", p: "Hoja y celda exactas de cada error." },
      { i: "i-warning", h: "Tipifica", p: "Duplicado, formato, vacío, incoherencia, fuera de rango…" },
      { i: "i-chart", h: "Impacto", p: "Cómo distorsiona el análisis si no se corrige." },
    ],
    null,
    "Documenta al menos <strong>cinco</strong> problemas (lo trabajaréis sobre el Excel real del caso).")}

  ${topic("★", "Modo ejecutivo · comercial", "No basta con responder: convencer", `
    <div class="glass panel" data-anim style="margin-bottom:1rem">
      <p class="claim">Todos los grupos respondéis a las <strong>mismas</strong> preguntas. La diferencia la marca quién <span class="hl">defiende mejor, en clave de negocio</span>, por qué su propuesta tecnológica es la mejor.</p>
    </div>
    <div class="feats">
      ${feat("i-leaf", "Sostenibilidad", "¿Aguanta en el tiempo? Mantenimiento, escalabilidad y dependencia del proveedor.")}
      ${feat("i-money", "Precio / coste", "Inversión, coste de operación y retorno. Defended el caso económico.")}
      ${feat("i-target", "Priorización", "Qué primero y por qué: quick wins frente a cimientos.")}
      ${feat("i-chart", "Criterio de negocio", "Impacto, riesgo y lo que vosotros consideréis clave para el Comité.")}
    </div>`)}

  <section class="odoo-close reveal"><div class="wrap">
    <span class="kicker" data-anim>El reto, en realidad</span>
    <h2 data-anim>No basta con tener razón.<br>Hay que <span class="hl">convencer</span>.</h2>
    <p class="lead" data-anim style="margin-top:1rem">Todos respondéis a las mismas preguntas. Gana quien mejor defiende —en clave de negocio— por qué su solución es la mejor.</p>
    <div class="cta-row" data-anim>
      <a class="btn btn--primary" href="${appUrl("/index.html")}">Volver al hub</a>
    </div>
  </div></section>
  </main>
`;

/* ------------------------------ Fondo WebGL (red, sigue al scroll) ------- */
const bgCanvas = document.querySelector("#odoo-bg");
if (bgCanvas) {
  const bg = createGL(bgCanvas, NETWORK_FRAG, { dprCap: 1.6 });
  window.addEventListener(
    "pointermove",
    (e) => bg.setMouse(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight),
    { passive: true }
  );
  let target = 0, cur = 0;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    target = max > 0 ? window.scrollY / max : 0;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const tick = () => { cur += (target - cur) * 0.06; bg.setScroll(cur); requestAnimationFrame(tick); };
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) requestAnimationFrame(tick);
  else bg.setScroll(0);
}

/* ------------------------------ Spotlight -------------------------------- */
document.addEventListener(
  "pointermove",
  (e) => {
    const c = e.target.closest?.(".spot");
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    c.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  },
  { passive: true }
);

/* ------------------------------ Revelado por bloque ---------------------- */
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  inView(
    "section.reveal",
    (el) => {
      animate(el, { opacity: [0, 1] }, { duration: .5 });
      const items = el.querySelectorAll("[data-anim]");
      if (items.length) {
        animate(
          items,
          { opacity: [0, 1], transform: ["translateY(32px) scale(.96)", "translateY(0) scale(1)"] },
          { delay: stagger(0.06, { startDelay: 0.04 }), duration: .6, ease: [0.2, 0.7, 0.2, 1] }
        );
      }
    },
    { amount: 0.25 }
  );
}
