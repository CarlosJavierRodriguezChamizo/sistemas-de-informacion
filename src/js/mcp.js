/* =========================================================================
   mcp.js — "API → MCP → agente": un agente de IA consulta varios sistemas
   vía MCP (Model Context Protocol) y compone la vista 360 en lenguaje natural.
   Extiende la metáfora del camarero: MCP = el camarero universal / el USB-C
   de los datos. Sin librerías; estado en memoria; accesible.
   ========================================================================= */
import { Header } from "../components/index.js";
import { escapeHtml } from "../components/_util.js";

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, REDUCED ? 0 : ms));
const eur = (n) => n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });

/* Sistemas que el agente consulta vía MCP (cada uno expone una "tool"). */
const SISTEMAS = [
  { id: "crm", name: "Salesforce CRM", tool: "crm.get_cliente", data: { nombre: "Deportes Atlántico S.L.", segmento: "Club B2B", gestor: "M. Pizarro" }, chip: '{ nombre: "Deportes Atlántico S.L.", segmento: "Club B2B" }' },
  { id: "as400", name: "AS/400", tool: "facturacion.get_facturas", data: { saldo_pendiente: 24290.5, facturas_pendientes: 2 }, chip: '{ saldo_pendiente: 24290.50, facturas_pendientes: 2 }' },
  { id: "zendesk", name: "Zendesk", tool: "soporte.get_estado", data: { nps: 41, tickets_abiertos: 1, ultimo: "Retraso en envío B2B" }, chip: '{ nps: 41, tickets_abiertos: 1 }' },
];

const GLOSARIO = [
  ["MCP", "Model Context Protocol: un estándar para que un agente de IA hable con muchos sistemas, como un enchufe universal."],
  ["Servidor MCP", "El conector que pone un sistema (CRM, AS/400…) al alcance del agente, exponiendo sus <code>tools</code>."],
  ["Tool (herramienta)", "Una acción que el agente puede invocar, p. ej. <code>facturacion.get_facturas</code>."],
  ["Agente", "La IA que entiende la pregunta, decide qué tools llamar y redacta la respuesta."],
  ["Contexto", "Todo lo que el agente reúne (de varios sistemas) para responder bien."],
  ["Lenguaje natural", "La respuesta final, en español llano: no una tabla, una explicación."],
];

/* ------------------------------ Composición ------------------------------ */
function sysHtml(s) {
  return `<div class="mcp-sys" id="sys-${s.id}">
    <div class="mcp-sys__head">
      <span class="mcp-sys__name">${escapeHtml(s.name)}</span>
      <span class="mcp-sys__state" data-state="${s.id}">en espera</span>
    </div>
    <div class="mcp-sys__tool">MCP · ${escapeHtml(s.tool)}()</div>
    <div class="mcp-sys__data">${escapeHtml(s.chip)}</div>
  </div>`;
}

const app = document.querySelector("#app");
app.innerHTML = [
  Header({
    variant: "light",
    breadcrumb: [
      { label: "Hub", href: "/index.html" },
      { label: "API → MCP → agente", current: true },
    ],
    nav: [{ label: "Hub", href: "/index.html" }, { label: "¿Cómo funciona una API?", href: "/tools/api.html" }, { label: "Deck M4", href: "/decks/m4.html" }],
  }),

  `<main id="contenido" class="section section--light"><div class="wrap">
    <div class="tool-intro">
      <h1>Del API al MCP: un agente que ve el cliente completo</h1>
      <p class="lead">Si una <strong>API</strong> es un camarero entre dos sistemas, <strong>MCP</strong> es el
      <strong>camarero universal</strong>: deja que un agente de IA pida datos a muchos sistemas con el mismo "idioma".</p>
    </div>
    <p class="mcp-case"><span class="mcp-q"><strong>Pregunta del comercial:</strong>
    «Dame la ficha 360 de <em>Deportes Atlántico</em>: saldo, NPS y si tiene incidencias abiertas.»</span></p>

    <div class="mcp-panel">
      <div class="row" style="justify-content:space-between">
        <span class="muted">El agente decide qué sistemas consultar vía MCP.</span>
        <button class="btn btn--primary" type="button" id="btn-ask">Preguntar al agente</button>
      </div>
      <p class="status-live" id="status-live" role="status" aria-live="polite" style="margin-top:var(--sp-3)"></p>

      <div class="mcp-stage">
        <div class="mcp-agent" id="agent">
          <div class="mcp-agent__ico">🤖</div>
          <div class="mcp-agent__name">Agente de IA</div>
          <div class="mcp-agent__sub">responde en lenguaje natural</div>
        </div>
        <div class="mcp-bus" aria-hidden="true"><span>MCP</span></div>
        <div class="mcp-systems">${SISTEMAS.map(sysHtml).join("")}</div>
      </div>

      <div class="mcp-answer" id="answer" hidden tabindex="-1">
        <div class="mcp-answer__head">🤖 Respuesta del agente</div>
        <p class="mcp-answer__text" id="answer-text"></p>
        <div class="mcp-360" id="answer-360"></div>
      </div>

      <p class="mcp-note"><strong>Sin MCP</strong>, el agente solo vería un sistema a la vez (o nada): respuestas parciales,
      como hoy en Báltica. <strong>Con MCP</strong>, reúne CRM + AS/400 + Zendesk y por fin da la visión 360.</p>
    </div>
  </div></main>`,

  `<section class="section section--blue"><div class="wrap">
    <h2>Mini-glosario de IA + MCP</h2>
    <div class="mcp-gloss">
      ${GLOSARIO.map(([t, d]) => `<div class="gloss-card"><h3>${escapeHtml(t)}</h3><p>${d}</p></div>`).join("")}
    </div>
  </div></section>`,
].join("");

/* ------------------------------ Interacción ------------------------------ */
const $ = (s) => document.querySelector(s);
const anunciar = (m) => { $("#status-live").textContent = m; };
let ocupado = false;

function resetSys() {
  SISTEMAS.forEach((s) => {
    const el = $(`#sys-${s.id}`);
    el.classList.remove("is-calling", "is-done");
    $(`[data-state="${s.id}"]`).textContent = "en espera";
  });
  $("#answer").hidden = true;
}

async function preguntar() {
  if (ocupado) return;
  ocupado = true;
  $("#btn-ask").disabled = true;
  resetSys();

  $("#agent").classList.add("is-busy");
  anunciar("El agente interpreta la pregunta y decide qué tools llamar…");
  await sleep(700);

  // Llamadas MCP (secuenciales, una por sistema)
  for (const s of SISTEMAS) {
    const el = $(`#sys-${s.id}`);
    const state = $(`[data-state="${s.id}"]`);
    el.classList.add("is-calling");
    state.innerHTML = '<span class="mcp-spinner" aria-hidden="true"></span> llamando';
    anunciar(`MCP → ${s.tool}() en ${s.name}…`);
    await sleep(650);
    el.classList.remove("is-calling");
    el.classList.add("is-done");
    state.textContent = "✓ datos";
  }

  $("#agent").classList.remove("is-busy");
  anunciar("El agente compone la respuesta con el contexto de los tres sistemas…");
  await sleep(600);
  renderAnswer();
  anunciar("Respuesta 360 lista: el agente unió CRM, AS/400 y Zendesk en una sola explicación.");

  $("#btn-ask").disabled = false;
  ocupado = false;
}

function renderAnswer() {
  const crm = SISTEMAS[0].data, as = SISTEMAS[1].data, zd = SISTEMAS[2].data;
  $("#answer-text").innerHTML =
    `<strong>${escapeHtml(crm.nombre)}</strong> (${escapeHtml(crm.segmento)}, gestor ${escapeHtml(crm.gestor)}) ` +
    `tiene <strong>${eur(as.saldo_pendiente)}</strong> pendientes en ${as.facturas_pendientes} facturas (AS/400), ` +
    `un <strong>NPS de ${zd.nps}</strong> y <strong>${zd.tickets_abiertos} incidencia abierta</strong> en Zendesk ` +
    `(«${escapeHtml(zd.ultimo)}»). Recomendación: resolver la incidencia y priorizar el cobro antes de renovar.`;
  $("#answer-360").innerHTML = `
    <div><b>${eur(as.saldo_pendiente)}</b><small>saldo pendiente · AS/400</small></div>
    <div><b>${zd.nps}</b><small>NPS · Zendesk</small></div>
    <div><b>${zd.tickets_abiertos}</b><small>incidencia abierta · Zendesk</small></div>`;
  const panel = $("#answer");
  panel.hidden = false;
  panel.focus();
}

$("#btn-ask").addEventListener("click", preguntar);
