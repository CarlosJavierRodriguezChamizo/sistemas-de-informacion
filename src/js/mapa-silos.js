/* =========================================================================
   mapa-silos.js — Práctica M2: mapa de sistemas como grafo SVG.
   Nodos = sistemas; aristas = conectado_con. Silos en rojo. Toggle del
   dato de integración crudo/normalizado (muestra la codificación
   inconsistente del dato sin nombrar el error).
   Panel de diagnóstico de gaps (el alumno marca; sin clave de respuesta).
   ========================================================================= */
import { Header } from "../components/index.js";
import { escapeHtml } from "../components/_util.js";
import { getSistemas } from "./data.js";

const sistemas = getSistemas();
const byId = new Map(sistemas.map((s) => [s.id, s]));
const byName = new Map(sistemas.map((s) => [s.sistema, s.id]));

/* Etiqueta corta para el grafo (el nombre completo va en la ficha). */
const SHORT = {
  1: "SAP S/4HANA", 2: "Salesforce Sales", 3: "Salesforce Commerce", 4: "SAP BW/4HANA",
  5: "Power BI", 6: "Zendesk", 7: "Manhattan WMS", 8: "AS/400",
  9: "Google Analytics 4", 10: "Emarsys", 11: "Bazaarvoice", 12: "Báltica+ App",
};

/* Glosario de siglas — para no usar acrónimos sin explicar (tipos, niveles…). */
const GLOSARIO = [
  ["ERP", "Enterprise Resource Planning · procesos internos: finanzas, compras, inventario."],
  ["CRM", "Customer Relationship Management · relación con el cliente: ventas, marketing, servicio."],
  ["SCM", "Supply Chain Management · cadena de suministro y logística."],
  ["WMS", "Warehouse Management System · gestión de almacén."],
  ["BI", "Business Intelligence · analítica e informes de negocio."],
  ["BW", "(SAP) Business Warehouse · almacén de datos de SAP."],
  ["TPS", "Transaction Processing System · transacciones del día a día."],
  ["MIS", "Management Information System · informes y control para mandos."],
  ["DSS", "Decision Support System · apoyo al análisis y la decisión."],
  ["EIS", "Executive Information System · información ejecutiva para dirección."],
  ["NPS", "Net Promoter Score · índice de recomendación del cliente."],
  ["B2B", "Business to Business · negocio entre empresas."],
  ["UGC", "User-Generated Content · contenido de usuarios (p. ej. reseñas)."],
];

/* Posiciones manuales (lienzo 1040×640) — claras para proyección.
   Clúster integrado a la izquierda/centro; silos separados a la derecha. */
const POS = {
  7: [150, 150], 5: [545, 95], 4: [430, 225], 1: [300, 335], 2: [320, 480],
  3: [565, 445], 10: [700, 330], 11: [735, 480], 9: [560, 580],
  12: [870, 250], 6: [895, 425], 8: [895, 560],
};

/* ---------------------------- Aristas (dedup) ---------------------------- */
const edgeMap = new Map();
for (const s of sistemas) {
  for (const ref of s.conectado_con) {
    const parcial = /\(parcial\)/i.test(ref);
    const name = ref.replace(/\s*\(parcial\)\s*/i, "").trim();
    const target = byName.get(name);
    if (!target) continue;
    const key = [s.id, target].sort((a, b) => a - b).join("-");
    const prev = edgeMap.get(key);
    edgeMap.set(key, { a: Math.min(s.id, target), b: Math.max(s.id, target), parcial: (prev?.parcial || false) || parcial });
  }
}
const edges = [...edgeMap.values()];

/* ----------------------------- Escalas ----------------------------------- */
const MAX_INV = Math.max(...sistemas.map((s) => s.inversion_k)); // 6800
const MAX_INC = Math.max(...sistemas.map((s) => s.incidencias_mes)); // 28
const radius = (inv) => 18 + Math.sqrt(inv / MAX_INV) * 34;       // ∝ inversión (área)
const strokeW = (inc) => 2 + (inc / MAX_INC) * 6;                 // ∝ incidencias

/* ----------------------------- Estado ------------------------------------ */
let crudo = false;            // false = normalizado, true = dato crudo
let activo = null;            // id de nodo en ficha
const gaps = new Set();       // ids marcados por el alumno como gap crítico

/* ----------------------------- Helpers ----------------------------------- */
const $ = (s, r = document) => r.querySelector(s);
const normKey = (v) => (v === "Sí" ? "si" : v === "No" ? "no" : "parcial");
const fmtInv = (k) =>
  k >= 1000
    ? `${k.toLocaleString("es-ES")} k€ (${(k / 1000).toLocaleString("es-ES", { maximumFractionDigits: 1 })} M€)`
    : `${k.toLocaleString("es-ES")} k€`;

/* --------------------------- Render del grafo ---------------------------- */
function edgeSvg(e) {
  const [x1, y1] = POS[e.a], [x2, y2] = POS[e.b];
  return `<line class="edge ${e.parcial ? "edge--parcial" : "edge--solid"}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
}

function pillSvg(s, x, yTop) {
  const txt = crudo ? s.integrado_raw : s.integrado_norm;
  const cls = normKey(s.integrado_norm);
  const w = Math.max(34, txt.length * 8.5 + 16);
  return `<g class="pill pill--${cls}" transform="translate(${x}, ${yTop})">
      <rect class="pill__bg" x="${-w / 2}" y="-11" width="${w}" height="22" />
      <text class="pill__txt" x="0" y="1">${escapeHtml(txt)}</text>
    </g>`;
}

function incBadgeSvg(s, x, y) {
  const txt = `${s.incidencias_mes}/mes`;
  const w = txt.length * 7 + 12;
  return `<g class="inc-badge" transform="translate(${x}, ${y})">
      <rect class="inc-badge__bg" x="${-w / 2}" y="-9" width="${w}" height="18" />
      <text class="inc-badge__txt" x="0" y="1">${escapeHtml(txt)}</text>
    </g>`;
}

function nodeSvg(s) {
  const [x, y] = POS[s.id];
  const r = radius(s.inversion_k);
  const sw = strokeW(s.incidencias_mes);
  const fill = s.aislado ? "#fdeaea" : "#e9eeff";
  const labelY = y + r + 18;
  const inc = s.aislado ? incBadgeSvg(s, x, y - r - 30) : "";
  return `<g class="node ${s.aislado ? "node--silo" : ""}" data-id="${s.id}" tabindex="0" role="button"
      aria-label="${escapeHtml(s.sistema)}. ${s.aislado ? "Silo aislado, " : ""}${s.incidencias_mes} incidencias al mes. Activar para ver la ficha.">
      <circle class="node__halo" cx="${x}" cy="${y}" r="${r + 6}" />
      <circle class="node__circle" cx="${x}" cy="${y}" r="${r}" fill="${fill}" style="stroke-width:${sw.toFixed(1)}" />
      <text class="node__flag" x="${x + r * 0.72}" y="${y - r * 0.72}">⚑</text>
      <text class="node__label" x="${x}" y="${labelY}">${escapeHtml(SHORT[s.id])}</text>
      ${pillSvg(s, x, y - r - 8)}
      ${inc}
    </g>`;
}

function graphSvg() {
  return `<svg class="graph" viewBox="0 0 1040 640" role="group" aria-label="Mapa de sistemas de Grupo Báltica">
      <g class="edges">${edges.map(edgeSvg).join("")}</g>
      <g class="nodes">${sistemas.map(nodeSvg).join("")}</g>
    </svg>`;
}

/* ------------------------------- Ficha ----------------------------------- */
function fichaHtml(id) {
  if (id == null) return `<p class="ficha__empty">Pasa el ratón, haz clic o navega con <kbd>Tab</kbd> por un sistema para ver su ficha.</p>`;
  const s = byId.get(id);
  const ek = normKey(s.integrado_norm);
  const marcado = gaps.has(id);
  return `
    <h4 class="ficha__title">${escapeHtml(s.sistema)}</h4>
    <p class="ficha__sub">${escapeHtml(s.proveedor)} · ${escapeHtml(s.nivel)}${s.aislado ? " · <strong style='color:#d33'>silo aislado</strong>" : ""}</p>
    <dl class="ficha__grid">
      <dt>Tipo</dt><dd>${escapeHtml(s.tipo)}</dd>
      <dt>Año</dt><dd>${s.anio}</dd>
      <dt>Inversión</dt><dd>${fmtInv(s.inversion_k)}</dd>
      <dt>Integración</dt><dd><span class="tag-int tag-int--${ek}">${escapeHtml(s.integrado_norm)}</span></dd>
      <dt>Incidencias</dt><dd>${s.incidencias_mes} / mes</dd>
    </dl>
    <p class="ficha__nota">${escapeHtml(s.nota)}</p>
    <button class="btn ${marcado ? "btn--secondary" : "btn--ghost"}" type="button" id="btn-gap" style="margin-top:var(--sp-3)">
      ${marcado ? "✓ Marcado como gap" : "⚑ Marcar como gap crítico"}
    </button>`;
}

/* --------------------------- Diagnóstico de gaps ------------------------- */
function gapListHtml() {
  if (!gaps.size) return `<p class="gap-empty">Aún no has marcado ningún sistema.</p>`;
  return `<div class="gap-list">${[...gaps]
    .map((id) => `<span class="gap-chip">${escapeHtml(SHORT[id])}<button type="button" data-ungap="${id}" aria-label="Quitar ${escapeHtml(SHORT[id])}">✕</button></span>`)
    .join("")}</div>`;
}

/* ------------------------------ Glosario --------------------------------- */
function glosarioHtml() {
  return `<details class="glossary">
    <summary>Glosario de siglas</summary>
    <dl class="gloss-dl">${GLOSARIO
      .map(([k, v]) => `<div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`)
      .join("")}</dl>
  </details>`;
}

/* ------------------------- Reto del Comité (pista gated) ----------------- */
const GAPS_PARA_PISTA = 3;
let hintOpen = false;
function hintBoxHtml() {
  const n = gaps.size;
  const unlocked = n >= GAPS_PARA_PISTA;
  return `
    <p class="hint-reto"><strong>El Comité no os da la respuesta.</strong> Primero, respondedos vosotros:</p>
    <ul class="hint-q">
      <li>¿Dónde se <strong>concentran las incidencias</strong>?</li>
      <li>¿Qué sistemas <strong>tocan al cliente</strong> y no comparten su dato?</li>
      <li>¿Qué <strong>dato valioso</strong> está atrapado en un silo sin integrar?</li>
    </ul>
    ${unlocked
      ? `<p class="hint-unlocked"><strong>✓ Pista desbloqueada.</strong> Un gap crítico no es (solo) el sistema con más incidencias: es el <strong>dato de cliente atrapado</strong> que, al no integrarse, impide la visión 360 y arrastra al resto. Priorizad cruzando <em>incidencias × valor del dato × aislamiento</em>.</p>`
      : `<p class="hint-locked"><strong>🔒 Pista bloqueada.</strong> Se desbloquea cuando marquéis al menos <strong>${GAPS_PARA_PISTA} gaps candidatos</strong> en el mapa (desde la ficha o con doble clic en un nodo). Lleváis <strong>${n}/${GAPS_PARA_PISTA}</strong>.</p>`}
  `;
}
function repintarHint() {
  const box = $("#hint-box");
  box.hidden = !hintOpen;
  box.innerHTML = hintOpen ? hintBoxHtml() : "";
  $("#btn-hint").setAttribute("aria-expanded", String(hintOpen));
}

/* ------------------------------ Composición ------------------------------ */
const app = $("#app");
app.innerHTML = [
  Header({
    variant: "light",
    breadcrumb: [
      { label: "Hub", href: "/index.html" },
      { label: "Mapa de silos", current: true },
    ],
    nav: [{ label: "Hub", href: "/index.html" }, { label: "Volver a M2", href: "/decks/m2.html" }],
  }),
  `<main id="contenido" class="section section--light"><div class="wrap">
    <div class="tool-intro">
      <h1>Mapa de sistemas de Báltica</h1>
      <p class="lead">Explora cómo se conectan (y cómo NO se conectan) los 12 sistemas.
      Los <strong>silos</strong> aparecen en rojo y sin conexiones. Identifica los <strong>gaps de integración</strong> críticos.</p>
    </div>

    <div class="toolbar">
      <label class="switch">
        <input type="checkbox" id="toggle-crudo" />
        <span class="switch__track" aria-hidden="true"></span>
        <span>Dato de integración: <span class="switch__state" id="switch-state">normalizado</span></span>
      </label>
      <span class="toolbar__spacer"></span>
      <span class="status-live" id="status-live" role="status" aria-live="polite"></span>
    </div>

    <div class="silos-board">
      <div>
        <div class="graph-wrap">${graphSvg()}</div>
        <div class="legend-row">
          <span><i class="swatch--dot"></i> Integrado</span>
          <span><i class="swatch--silo"></i> Silo (aislado)</span>
          <span><i class="swatch"></i> Conexión</span>
          <span><i class="swatch swatch--parcial"></i> Conexión parcial</span>
          <span>Tamaño ∝ inversión · grosor del borde ∝ incidencias</span>
        </div>
        ${glosarioHtml()}
      </div>

      <aside class="side">
        <div class="panel" id="ficha" aria-live="polite">${fichaHtml(null)}</div>

        <div class="panel">
          <h3>Diagnóstico de gaps</h3>
          <p style="font-size:.88rem;color:var(--c-ink-soft);margin:0 0 var(--sp-2)">
            Marca a mano los sistemas que consideres <strong>gaps críticos</strong> (desde la ficha o haciendo doble clic en un nodo).</p>
          <div id="gap-list">${gapListHtml()}</div>
          <label for="gap-notes" style="font-size:.85rem;font-weight:600">Tus notas sobre los gaps</label>
          <textarea class="gap-notes" id="gap-notes" placeholder="Escribe aquí los gaps de integración que detectes…"></textarea>
          <button class="btn btn--ghost" type="button" id="btn-hint" style="margin-top:var(--sp-3)" aria-expanded="false">🧭 Reto del Comité</button>
          <div class="hint-box" id="hint-box" hidden></div>
        </div>
      </aside>
    </div>
  </div></main>`,
].join("");

/* --------------------------- Re-render parcial --------------------------- */
function repintarGrafo() {
  $(".graph .nodes").innerHTML = sistemas.map(nodeSvg).join("");
  aplicarEstadoNodos();
}
function aplicarEstadoNodos() {
  document.querySelectorAll(".node").forEach((n) => {
    const id = Number(n.dataset.id);
    n.classList.toggle("is-active", id === activo);
    n.classList.toggle("is-gap", gaps.has(id));
  });
}
function repintarFicha() {
  $("#ficha").innerHTML = fichaHtml(activo);
}
function repintarGapList() {
  $("#gap-list").innerHTML = gapListHtml();
}
function anunciar(m) { $("#status-live").textContent = m; }

/* ------------------------------- Acciones -------------------------------- */
function activar(id) {
  activo = id;
  aplicarEstadoNodos();
  repintarFicha();
}
function toggleGap(id) {
  if (gaps.has(id)) gaps.delete(id); else gaps.add(id);
  aplicarEstadoNodos();
  repintarFicha();
  repintarGapList();
  if (hintOpen) repintarHint();
  anunciar(`${gaps.size} sistema(s) marcados como gap.`);
}

/* ------------------------------- Eventos --------------------------------- */
const svg = $(".graph");
svg.addEventListener("mouseover", (e) => {
  const n = e.target.closest(".node");
  if (n) activar(Number(n.dataset.id));
});
svg.addEventListener("focusin", (e) => {
  const n = e.target.closest(".node");
  if (n) activar(Number(n.dataset.id));
});
svg.addEventListener("click", (e) => {
  const n = e.target.closest(".node");
  if (n) activar(Number(n.dataset.id));
});
svg.addEventListener("dblclick", (e) => {
  const n = e.target.closest(".node");
  if (n) toggleGap(Number(n.dataset.id));
});
svg.addEventListener("keydown", (e) => {
  const n = e.target.closest(".node");
  if (!n) return;
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activar(Number(n.dataset.id)); }
  if (e.key.toLowerCase() === "g") { e.preventDefault(); toggleGap(Number(n.dataset.id)); }
});

/* Botón "Marcar como gap" dentro de la ficha (delegado en #app) */
app.addEventListener("click", (e) => {
  if (e.target.closest("#btn-gap") && activo != null) { toggleGap(activo); return; }
  const ungap = e.target.closest("[data-ungap]");
  if (ungap) { toggleGap(Number(ungap.dataset.ungap)); return; }
});

/* Toggle crudo / normalizado */
$("#toggle-crudo").addEventListener("change", (e) => {
  crudo = e.target.checked;
  $("#switch-state").textContent = crudo ? "crudo" : "normalizado";
  repintarGrafo();
  anunciar(crudo
    ? "Mostrando el dato crudo: el mismo significado aparece escrito de varias formas distintas."
    : "Mostrando el dato normalizado: Sí / No / Parcial.");
});

/* Reto del Comité (pista bloqueada hasta marcar ≥ N gaps) */
$("#btn-hint").addEventListener("click", () => {
  hintOpen = !hintOpen;
  repintarHint();
});
