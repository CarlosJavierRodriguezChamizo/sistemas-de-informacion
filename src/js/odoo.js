/* =========================================================================
   odoo.js — Taller "ERP en la Nube · Demo Odoo".
   Página explicativa (apoyo a la demo en vivo) en la estética futurista del
   proyecto: fondo WebGL (rejilla en perspectiva), scroll suave con Lenis,
   glass + neón y revelado por scroll con Motion. Offline (npm, sin CDN).
   ========================================================================= */
import { inView, animate, stagger } from "motion";
import { createGL } from "./gl/glCanvas.js";
import { BLUEPRINT_FRAG } from "./gl/shaders.js";
import { appUrl } from "../components/_util.js";

const I = (id) => `<svg class="ico"><use href="#${id}"/></svg>`;
const appI = (id) => `<svg><use href="#${id}"/></svg>`;

/* ------------------------------ Sprite ----------------------------------- */
const SPRITE = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-grid" viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></symbol>
  <symbol id="i-cart" viewBox="0 0 24 24"><path d="M3 4h2l2.2 11h10l2-7H6"/><circle cx="9" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/></symbol>
  <symbol id="i-box" viewBox="0 0 24 24"><path d="M12 3 4 7v10l8 4 8-4V7l-8-4z"/><path d="M4 7l8 4 8-4M12 11v10"/></symbol>
  <symbol id="i-chart" viewBox="0 0 24 24"><path d="M4 4v16h16"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></symbol>
  <symbol id="i-people" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><circle cx="17.5" cy="9" r="2.2"/><path d="M15.5 14.6c2.6.2 4.5 1.7 4.5 4.4"/></symbol>
  <symbol id="i-factory" viewBox="0 0 24 24"><path d="M3 20V10l5 3V10l5 3V7l3-3 3 3v13z"/><path d="M3 20h18"/></symbol>
  <symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.5 2.2 2.5 13.8 0 16M12 4c-2.5 2.2-2.5 13.8 0 16"/></symbol>
  <symbol id="i-handshake" viewBox="0 0 24 24"><path d="M3 8l4-2 5 3 5-3 4 2v7l-4 2-5-3-5 3-4-2z"/><path d="M12 9v6"/></symbol>
  <symbol id="i-pos" viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h8M9 15h6"/></symbol>
  <symbol id="i-help" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M9.5 9.5a2.5 2.5 0 0 1 4 1.8c0 1.7-2 2-2 3M12 16.5v.3"/></symbol>
  <symbol id="i-doc" viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></symbol>
  <symbol id="i-cube" viewBox="0 0 24 24"><path d="M12 3 4 7v10l8 4 8-4V7l-8-4z"/><path d="M4 7l8 4 8-4M12 11v10"/></symbol>
  <symbol id="i-open" viewBox="0 0 24 24"><path d="M6 10V8a6 6 0 0 1 12 0"/><rect x="4" y="10" width="16" height="10" rx="2"/></symbol>
  <symbol id="i-spark" viewBox="0 0 24 24"><path d="M12 3l1.6 4.8L18 9l-4.4 1.2L12 15l-1.6-4.8L6 9l4.4-1.2L12 3z"/><path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z"/></symbol>
  <symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></symbol>
  <symbol id="i-money" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M14.5 9.5C14 8.6 13 8 12 8c-1.4 0-2.5.9-2.5 2s1.1 2 2.5 2 2.5.9 2.5 2-1.1 2-2.5 2c-1 0-2-.6-2.5-1.5M12 6.5v11"/></symbol>
  <symbol id="i-cloud" viewBox="0 0 24 24"><path d="M7 18a4 4 0 0 1-.5-7.97A5 5 0 0 1 16 9a3.5 3.5 0 0 1 1 6.9"/><path d="M7 18h9"/></symbol>
  <symbol id="i-branch" viewBox="0 0 24 24"><circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 8v8M6 12h6a4 4 0 0 0 4-4"/></symbol>
  <symbol id="i-server" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="6" rx="1.5"/><rect x="4" y="14" width="16" height="6" rx="1.5"/><path d="M8 7h.01M8 17h.01"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/></symbol>
  <symbol id="i-aeat" viewBox="0 0 24 24"><path d="M4 9 12 4l8 5M5 9v10h14V9"/><path d="M9 19v-5h6v5"/></symbol>
  <symbol id="i-link" viewBox="0 0 24 24"><path d="M9 15l6-6"/><path d="M10.5 7.5 12 6a3 3 0 1 1 4 4l-1.5 1.5"/><path d="M13.5 16.5 12 18a3 3 0 1 1-4-4l1.5-1.5"/></symbol>
  <symbol id="i-building" viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/></symbol>
  <symbol id="i-db" viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/></symbol>
  <symbol id="i-wrench" viewBox="0 0 24 24"><path d="M15 6a4 4 0 0 0-5 5l-6 6 2 2 6-6a4 4 0 0 0 5-5l-2.5 2.5L13 9l1.5-3z"/></symbol>
  <symbol id="i-puzzle" viewBox="0 0 24 24"><path d="M10 4h4v3a2 2 0 1 0 4 0V4h2v6h-3a2 2 0 1 0 0 4h3v6h-6v-3a2 2 0 1 0-4 0v3H4v-6h3a2 2 0 1 0 0-4H4V4h6z"/></symbol>
  <symbol id="i-rocket" viewBox="0 0 24 24"><path d="M12 3c3 1 5 4 5 8l-2 4H9l-2-4c0-4 2-7 5-8z"/><circle cx="12" cy="9" r="1.6"/><path d="M9 17l-2 4M15 17l2 4"/></symbol>
</svg>`;

/* ------------------------------ Helpers ---------------------------------- */
const app = (id, label) => `<div class="app" data-anim>${appI(id)}<span>${label}</span></div>`;
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

/* ------------------------------ Contenido -------------------------------- */
const root = document.querySelector("#app");
root.innerHTML = `
  ${SPRITE}
  <header class="odoo-top">
    <img class="odoo-logo" src="${appUrl("/assets/logo_ESIC_blanco.svg")}" alt="ESIC" />
    <a class="odoo-back" href="${appUrl("/index.html")}">Ir al hub →</a>
  </header>

  <main id="contenido">
  <section class="odoo-hero reveal"><div class="wrap">
    <span class="eyebrow" data-anim>Taller · ERP en la Nube</span>
    <h1 class="odoo-hero__title" data-anim>Demo <span class="shine">Odoo</span></h1>
    <p class="lead" data-anim>El ERP open source y modular: qué es, por qué destaca y cómo encaja en un caso como Báltica — antes de verlo en vivo.</p>
    <div class="odoo-hero__hint" data-anim aria-hidden="true">Desplázate ↓</div>
  </div></section>

  ${topic("01", "El qué", "¿Qué es Odoo?", `
    <div class="split2 split2--text">
      <div class="glass panel" data-anim>
        <p><strong>Odoo</strong> no es un único programa, sino una <strong>suite integrada de aplicaciones de negocio</strong> (ERP + CRM + web + RRHH…) construida sobre una <strong>misma base de datos</strong>.</p>
        <p>Es <strong>open source</strong> y <strong>modular</strong>: activas solo las apps que necesitas y vas creciendo. Cubre de la venta a la contabilidad sin integraciones a medida entre piezas sueltas.</p>
        <p class="fineprint">Antes conocido como OpenERP/TinyERP. Hoy, miles de módulos y una comunidad enorme.</p>
      </div>
      <div data-anim>
        <div class="appgrid">
          ${app("i-handshake", "CRM")}${app("i-cart", "Ventas")}${app("i-box", "Inventario")}
          ${app("i-money", "Contabilidad")}${app("i-factory", "Fabricación")}${app("i-cart", "Compras")}
          ${app("i-people", "RRHH")}${app("i-grid", "Proyecto")}${app("i-globe", "Sitio web")}
          ${app("i-cart", "eCommerce")}${app("i-pos", "TPV")}${app("i-help", "Soporte")}
        </div>
      </div>
    </div>`)}

  ${topic("02", "Por qué destaca", "Ventajas frente a otros ERPs", `
    <div class="feats feats--3">
      ${feat("i-cube", "Todo integrado", "Una sola base de datos: el dato fluye entre apps sin puentes ni duplicados.")}
      ${feat("i-grid", "Modular y escalable", "Empiezas con 2–3 apps y añades el resto cuando toca. Pagas por lo que usas.")}
      ${feat("i-open", "Open source", "Sin lock-in: acceso al código, miles de módulos y comunidad activa.")}
      ${feat("i-spark", "UX moderna", "Interfaz limpia y usable; curva de adopción suave frente a ERPs clásicos.")}
      ${feat("i-bolt", "Implantación rápida", "Procesos estándar listos de fábrica; arrancas en semanas, no años.", "feat--accent")}
      ${feat("i-money", "Coste competitivo", "Mucho más asequible que SAP/Oracle para pyme y mediana empresa.")}
    </div>`)}

  ${topic("03", "Las dos ediciones", "Odoo Enterprise vs Community", `
    <div class="vs">
      <div class="vs__col glass spot" data-anim>
        <span class="vs__tag">Gratis · Open source (LGPL)</span>
        <h3>Community</h3>
        <ul class="vs__list">
          <li>Apps base: CRM, ventas, inventario, proyecto, web…</li>
          <li>Autohospedada, personalizable a código</li>
          <li>Soporte de la comunidad</li>
          <li class="no">Sin Odoo Studio (no-code)</li>
          <li class="no">Contabilidad completa y apps avanzadas limitadas</li>
          <li class="no">Sin soporte oficial ni upgrades asistidos</li>
        </ul>
      </div>
      <div class="vs__col vs__col--ent glass spot" data-anim>
        <span class="vs__tag">Suscripción · por usuario/app</span>
        <h3>Enterprise</h3>
        <ul class="vs__list">
          <li>Todo lo de Community +</li>
          <li><strong>Odoo Studio</strong> (personalizar sin programar)</li>
          <li>Contabilidad completa + localizaciones (p. ej. España)</li>
          <li>Apps avanzadas (suscripciones, calidad, MRP, IoT…)</li>
          <li>Apps móviles, soporte oficial y <strong>upgrades</strong></li>
          <li>Hosting incluido (Odoo Online / Odoo.sh según plan)</li>
        </ul>
      </div>
    </div>`)}

  ${topic("04", "El hosting", "¿Qué es Odoo.sh?", `
    <div class="glass panel" data-anim style="margin-bottom:1rem">
      <p><strong>Odoo.sh</strong> es la <strong>plataforma cloud (PaaS)</strong> oficial para desarrollar y alojar Odoo: integrada con <strong>Git</strong>, con ramas de <em>desarrollo → staging → producción</em>, builds automáticos, backups y escalado. Es el punto medio entre el SaaS cerrado y el on-premise.</p>
    </div>
    <div class="feats feats--3" style="margin-bottom:1rem">
      ${feat("i-cloud", "Odoo Online (SaaS)", "Gestionado por Odoo. Rapidísimo de arrancar; personalización solo con Studio.")}
      ${feat("i-branch", "Odoo.sh (PaaS)", "Cloud con acceso a código y Git. Para módulos a medida y equipos de desarrollo.", "feat--accent")}
      ${feat("i-server", "On-premise", "Tú lo alojas. Control total, a cambio de mantener la infraestructura.")}
    </div>
    <div class="flow">
      ${flowStep("Dev", "i-branch", "Desarrollo", "Cada rama git = un entorno aislado para construir y probar.")}
      ${arrow}
      ${flowStep("Test", "i-shield", "Staging", "Copia con datos reales para validar antes de publicar.")}
      ${arrow}
      ${flowStep("Live", "i-rocket", "Producción", "Despliegue con un merge; backups y monitorización incluidos.")}
    </div>`)}

  ${topic("05", "Cumplimiento", "Cómo se adapta Odoo a Veri·Factu", `
    <div class="glass panel" data-anim style="margin-bottom:1rem">
      <p><strong>Veri·Factu</strong> es la normativa antifraude española (Reglamento RD 1007/2023) que obliga a usar software de facturación que garantice la <strong>integridad, trazabilidad e inalterabilidad</strong> de los registros — encadenados con <strong>hash</strong> y, en modo Veri·Factu, <strong>remitidos a la AEAT</strong>.</p>
      <p>Odoo lo cubre con su <strong>localización española</strong> (l10n_es) y el soporte <strong>Veri·Factu</strong>: genera el registro firmado de cada factura, lo encadena y gestiona el envío. Activarlo es configuración, no desarrollo.</p>
    </div>
    <div class="flow">
      ${flowStep("1", "i-doc", "Factura emitida", "Odoo crea la factura con los datos fiscales obligatorios.")}
      ${arrow}
      ${flowStep("2", "i-shield", "Registro encadenado", "Se firma y enlaza con hash al registro anterior (inalterable).")}
      ${arrow}
      ${flowStep("3", "i-aeat", "Envío a la AEAT", "En modo Veri·Factu, el registro se remite a Hacienda.")}
    </div>
    <p class="fineprint">Nota: las fechas de obligatoriedad dependen del tipo de contribuyente; conviene confirmar el calendario vigente y la versión/módulo de Odoo en cada implantación.</p>`)}

  ${topic("06", "Varias sociedades", "Odoo Multiempresa", `
    <div class="split2 split2--text">
      <div class="glass panel" data-anim>
        <p>Una <strong>única base de datos</strong> puede gestionar <strong>varias compañías</strong>: cada usuario ve las suyas, con datos <strong>compartidos o segregados</strong> según las reglas.</p>
        <p>Permite <strong>transacciones intercompañía</strong> (una venta en A genera la compra en B), <strong>multi-moneda y multi-idioma</strong>, planes contables por compañía y <strong>consolidación</strong> para reporting de grupo.</p>
        <p class="fineprint">Ideal para grupos como Báltica: filiales distintas, una sola plataforma y visión consolidada.</p>
      </div>
      <div class="multi glass panel" data-anim>
        <div class="multi__db">${appI("i-db")} Una base de datos</div>
        <div class="multi__rule"></div>
        <div class="multi__cos">
          <div class="multi__co">${appI("i-building")} Báltica Retail</div>
          <div class="multi__co">${appI("i-building")} Báltica Online</div>
          <div class="multi__co">${appI("i-building")} Báltica Logística</div>
        </div>
        <p class="multi__note">Datos compartidos donde interesa · operaciones intercompañía · consolidación de grupo.</p>
      </div>
    </div>`)}

  ${topic("07", "Y además", "Lo que lo hace pegajoso (bonus)", `
    <div class="feats feats--3">
      ${feat("i-wrench", "Odoo Studio", "Crea campos, vistas, informes y apps a medida sin escribir código.", "feat--accent")}
      ${feat("i-puzzle", "Ecosistema de apps", "Miles de módulos en Odoo Apps para cubrir casi cualquier necesidad.")}
      ${feat("i-spark", "IA integrada", "Asistentes y automatizaciones dentro del propio ERP (el puente con M4: agentes + datos integrados).")}
      ${feat("i-bolt", "Versiones anuales", "Una versión nueva al año con mejoras; upgrades asistidos en Enterprise.")}
      ${feat("i-globe", "Web + eCommerce nativos", "La tienda y la web viven en el mismo Odoo: catálogo y stock siempre en sync.")}
      ${feat("i-link", "API e integraciones", "XML-RPC/JSON-RPC y conectores para hablar con el resto del mapa de sistemas.")}
    </div>`)}

  <section class="odoo-close reveal"><div class="wrap">
    <span class="kicker" data-anim>Y ahora…</span>
    <h2 data-anim>Vamos a verlo<br><span class="hl">en vivo</span>.</h2>
    <p class="lead" data-anim style="margin-top:1rem">Abrimos una instancia de Odoo y recorremos estas ideas sobre el caso Báltica.</p>
    <div class="cta-row" data-anim>
      <a class="btn btn--primary" href="https://www.odoo.com" target="_blank" rel="noopener noreferrer">Ir a odoo.com ↗</a>
      <a class="btn" href="${appUrl("/index.html")}">Volver al hub</a>
    </div>
  </div></section>
  </main>
`;

/* ------------------------------ Fondo WebGL ------------------------------ */
const bgCanvas = document.querySelector("#odoo-bg");
if (bgCanvas) {
  const bg = createGL(bgCanvas, BLUEPRINT_FRAG, { dprCap: 1.75 });
  window.addEventListener(
    "pointermove",
    (e) => bg.setMouse(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight),
    { passive: true }
  );
}

/* ------------------------------ Spotlight (cursor) ----------------------- */
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
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    },
    { amount: 0.25 }
  );
}
