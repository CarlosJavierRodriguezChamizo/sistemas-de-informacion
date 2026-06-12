/* =========================================================================
   casos.js — "Empresas transformadas por sus SI · Síntesis".
   Cierre del día: casos reales de empresas que el SI convirtió en su modelo,
   el patrón común, la síntesis M1→M4 y la tesis del caso Báltica.
   Estética futurista del proyecto: fondo WebGL (red de nodos que se reconfigura
   con el scroll), glass + neón, scroll por bloques y revelado con Motion.
   ========================================================================= */
import { inView, animate, stagger } from "motion";
import { createGL } from "./gl/glCanvas.js";
import { NETWORK_FRAG } from "./gl/shaders.js";
import { appUrl } from "../components/_util.js";

const I = (id) => `<svg class="ico"><use href="#${id}"/></svg>`;

const SPRITE = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-store" viewBox="0 0 24 24"><path d="M4 9 5 4h14l1 5M4 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 4 0M5 9v11h14V9"/><path d="M10 20v-5h4v5"/></symbol>
  <symbol id="i-glass" viewBox="0 0 24 24"><path d="M6 3h12l-1 7a5 5 0 0 1-10 0L6 3z"/><path d="M12 17v4M8 21h8"/></symbol>
  <symbol id="i-leaf" viewBox="0 0 24 24"><path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13z"/><path d="M5 19c3-4 6-6 10-8"/></symbol>
  <symbol id="i-flask" viewBox="0 0 24 24"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M8 15h8"/></symbol>
  <symbol id="i-building" viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/></symbol>
  <symbol id="i-factory" viewBox="0 0 24 24"><path d="M3 20V10l5 3V10l5 3V7l3-3 3 3v13z"/><path d="M3 20h18"/></symbol>
  <symbol id="i-link" viewBox="0 0 24 24"><path d="M9 15l6-6"/><path d="M10.5 7.5 12 6a3 3 0 1 1 4 4l-1.5 1.5"/><path d="M13.5 16.5 12 18a3 3 0 1 1-4-4l1.5-1.5"/></symbol>
  <symbol id="i-chart" viewBox="0 0 24 24"><path d="M4 4v16h16"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></symbol>
  <symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></symbol>
  <symbol id="i-bulb" viewBox="0 0 24 24"><path d="M9.5 18h5M10.5 21h3"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.7 1 1.2 1 2.5h6c0-1.3.2-1.8 1-2.5A6 6 0 0 0 12 3z"/></symbol>
  <symbol id="i-rocket" viewBox="0 0 24 24"><path d="M12 3c3 1 5 4 5 8l-2 4H9l-2-4c0-4 2-7 5-8z"/><circle cx="12" cy="9" r="1.6"/><path d="M9 17l-2 4M15 17l2 4"/></symbol>
  <symbol id="i-brain" viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M9 5a3 3 0 0 0-3 3 3 3 0 0 0-1 5.6A3 3 0 0 0 8 18.5h1"/><path d="M15 5a3 3 0 0 1 3 3 3 3 0 0 1 1 5.6A3 3 0 0 1 16 18.5h-1"/></symbol>
  <symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.5 2.2 2.5 13.8 0 16M12 4c-2.5 2.2-2.5 13.8 0 16"/></symbol>
  <symbol id="i-pen" viewBox="0 0 24 24"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z"/><path d="M14 5l3 3"/></symbol>
  <symbol id="i-cube" viewBox="0 0 24 24"><path d="M12 3 4 7v10l8 4 8-4V7l-8-4z"/><path d="M4 7l8 4 8-4M12 11v10"/></symbol>
  <symbol id="i-spark" viewBox="0 0 24 24"><path d="M12 3l1.6 4.8L18 9l-4.4 1.2L12 15l-1.6-4.8L6 9l4.4-1.2z"/><path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z"/></symbol>
  <symbol id="i-receipt" viewBox="0 0 24 24"><path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21z"/><path d="M9 8h6M9 12h6"/></symbol>
</svg>`;

/* ------------------------------ Helpers ---------------------------------- */
const lnk = (href, label, cls = "") =>
  href ? `<a class="${cls}" href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>` : "";

const caseCard = (id, tag, name, txt, source, video) => `
  <div class="case glass spot" data-anim>
    <span class="ico-chip">${I(id)}</span>
    <span class="tag">${tag}</span>
    <h3>${name}</h3>
    <p>${txt}</p>
    <div class="case__links">
      ${lnk(source, "Fuente ↗")}
      ${lnk(video, "▷ Vídeo", "case__video")}
    </div>
  </div>`;
const feat = (id, h, p, cls = "") => `<div class="feat glass spot ${cls}" data-anim><span class="ico-chip">${I(id)}</span><h3>${h}</h3><p>${p}</p></div>`;
const flowStep = (n, id, h, p) => `<div class="flow__step glass spot" data-anim><span class="num">${n}</span> <span class="ico-chip" style="margin:0 0 .4em">${I(id)}</span><h3>${h}</h3><p>${p}</p></div>`;
const arrow = `<span class="flow__arrow" data-anim>→</span>`;

function topic(n, kicker, title, body) {
  return `<section class="topic reveal"><div class="wrap">
    <div class="topic__head"><span class="topic__n" data-anim>${n}</span>
      <div><span class="kicker" data-anim>${kicker}</span><h2 data-anim>${title}</h2></div></div>
    ${body}
  </div></section>`;
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
    <span class="eyebrow" data-anim>Síntesis · Cierre del día</span>
    <h1 class="odoo-hero__title" data-anim>Empresas que integraron su <span class="shine">SI</span></h1>
    <p class="lead" data-anim>Primero <strong>rediseñas tu propio stack</strong>; luego vemos una empresa que ya lo hizo y el patrón que se repite. Y qué nos dice del caso Báltica.</p>
    <div class="odoo-hero__hint" data-anim aria-hidden="true">Desplázate ↓</div>
  </div></section>

  ${topic("01", "Reto individual · Tu empresa", "Antes de mirar otras empresas, mira la tuya", `
    <div class="glass panel" data-anim style="margin-bottom:1rem; border-color: rgba(10,228,195,.45)">
      <span class="kicker">La pregunta de salida</span>
      <p class="claim">¿<span class="hl">Cuántas herramientas tecnológicas</span> usas en tu día a día en la empresa? Cuéntalas. Casi siempre son más —y más desconectadas— de lo que parece.</p>
    </div>
    <p class="lead" data-anim style="margin-bottom:1rem;max-width:54ch">Ya tienes <strong>arquitectura</strong> y <strong>APIs</strong>. El reto no es añadir software: es <span class="hl">rediseñar el tuyo</span>. Primero el proceso, luego las herramientas.</p>
    <div class="flow">
      ${flowStep("1", "i-cube", "Inventaría", "Lista el software que usas cada día. Uno por uno, sin olvidar el Excel ni el WhatsApp.")}
      ${arrow}
      ${flowStep("2", "i-link", "Mapea procesos", "¿Qué hace cada herramienta y cómo se pasan el dato? Localiza silos, duplicidades y copia-pega.")}
      ${arrow}
      ${flowStep("3", "i-bolt", "Detecta el dolor", "¿Dónde se rompe? Dato que no fluye, esperas, trabajo manual, errores que se repiten.")}
      ${arrow}
      ${flowStep("4", "i-spark", "Rediseña el stack", "Quita lo que sobra y pon lo que falta. ¿Qué necesitas de verdad y cómo lo conectas por API?")}
    </div>
    <div class="glass panel spot" data-anim style="margin-top:1rem">
      <p style="color:rgba(255,255,255,.86)">El objetivo no es tener <em>más</em> sistemas, sino los <span class="hl">justos y bien conectados</span>. Lo mismo que le pasa a Báltica, a tu escala.</p>
    </div>`)}

  ${topic("02", "Caso local · Sevilla", "Terapia Urbana, todo conectado", `
    <div class="glass panel" data-anim style="margin-bottom:1rem">
      <p class="claim"><strong>Terapia Urbana</strong> —empresa sevillana de <span class="hl">jardines verticales</span>, spin-off de la Universidad de Sevilla— orquesta un stack completo: cada herramienta hace su trabajo y <span class="hl">Odoo centraliza la gestión</span>. La <span class="hl">IA</span> se ha vuelto el acelerador de la fase creativa.</p>
      <p class="fineprint" style="margin-top:.6rem">+31.000 m² instalados en +23 países · tecnología propia Fytotextile® (según la empresa) · caso trabajado de primera mano · <a href="https://www.terapiaurbana.com" target="_blank" rel="noopener noreferrer" style="color:var(--c-accent)">terapiaurbana.com ↗</a></p>
    </div>
    <div class="feats feats--3">
      ${feat("i-globe", "WordPress", "La web pública: escaparate de proyectos y captación de clientes.")}
      ${feat("i-chart", "Analytics", "Mide visitas y leads: qué proyectos atraen y por dónde llegan.")}
      ${feat("i-pen", "AutoCAD", "Planimetría técnica 2D del jardín y su estructura.")}
      ${feat("i-cube", "Revit · BIM", "Modelo 3D del jardín integrado en el edificio.")}
      ${feat("i-spark", "IA · Renders", "Visualiza la fachada verde sobre el edificio del cliente antes de instalarla.", "feat--accent")}
      ${feat("i-receipt", "Odoo", "Toda la gestión comercial y la facturación en un único sistema.")}
    </div>
    <div class="glass panel spot" data-anim style="margin-top:1rem; border-color: rgba(10,228,195,.45)">
      <span class="kicker">El papel de la IA</span>
      <p style="color:rgba(255,255,255,.86)">Enseñar cómo quedaría un jardín vertical sobre el edificio del cliente exigía renders lentos o subcontratados. Hoy la IA los genera en <strong>minutos</strong>: el cliente “ve” su fachada verde al instante, se <strong>cierran propuestas antes</strong> y el equipo prueba más variantes de diseño. <span class="hl">No sustituye al diseñador: le da velocidad.</span></p>
    </div>`)}

  ${topic("03", "El denominador común", "El patrón que se repite", `
    <div class="glass panel" data-anim style="margin-bottom:1rem">
      <p class="claim">En todas, el sistema dejó de <em>apoyar</em> el negocio para <strong>ser</strong> el negocio. Y el combustible siempre es el mismo: <span class="hl">dato integrado y de calidad</span>.</p>
    </div>
    <div class="feats feats--3">
      ${feat("i-link", "Una sola verdad", "El dato fluye entre áreas sin silos ni copias divergentes.")}
      ${feat("i-chart", "Decidir con datos", "Menos intuición, más evidencia y en tiempo real.")}
      ${feat("i-bolt", "Escalar sin romperse", "Procesos y arquitectura que crecen con el negocio.")}
    </div>`)}

  ${topic("04", "El hilo del día", "De la teoría al caso Báltica", `
    <div class="flow">
      ${flowStep("M1", "i-bulb", "Qué es un SI", "Personas + procesos + datos + tecnología que convierten datos en decisiones.")}
      ${arrow}
      ${flowStep("M2", "i-link", "Integrar", "ERP/CRM/SCM y una capa común: matar los silos.")}
      ${arrow}
      ${flowStep("M3", "i-rocket", "Proyectos", "Integrar pesa más que invertir (lección Lidl–SAP).")}
      ${arrow}
      ${flowStep("M4", "i-brain", "IA + MCP", "La IA necesita dato integrado; agentes que componen la vista 360.")}
    </div>`)}

  ${topic("05", "La tesis", "Báltica tiene las piezas. Le falta que hablen.", `
    <div class="stats">
      <div class="stat glass spot" data-anim><span class="bignum" data-count="14.5" data-dec="1" data-pre="+" data-suf=" %">+0 %</span><span class="lab">Crecen las ventas</span></div>
      <div class="stat glass spot stat--warn" data-anim><span class="bignum">6,0 → 2,5 %</span><span class="lab">…y cae el EBITDA</span></div>
      <div class="stat glass spot" data-anim><span class="bignum" data-count="18" data-suf=" M€">0 M€</span><span class="lab">En sistemas que no se hablan</span></div>
    </div>
    <p class="lead" data-anim style="margin-top:1.2rem;max-width:48ch">Más ventas y menos margen: el problema no está en el mercado, está en la <strong>desintegración</strong>. La ventaja no es tener sistemas, sino <span class="hl">conectarlos</span>.</p>`)}
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

/* ------------------------------ Revelado + contadores -------------------- */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fmt = (v, dec) => v.toLocaleString("es-ES", { minimumFractionDigits: dec, maximumFractionDigits: dec });

if (!reduce) {
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
      el.querySelectorAll("[data-count]").forEach((c) => {
        const to = parseFloat(c.dataset.count), dec = parseInt(c.dataset.dec || "0", 10);
        const pre = c.dataset.pre || "", suf = c.dataset.suf || "";
        animate(0, to, { duration: 1.3, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => { c.textContent = pre + fmt(v, dec) + suf; } });
      });
    },
    { amount: 0.25 }
  );
}
