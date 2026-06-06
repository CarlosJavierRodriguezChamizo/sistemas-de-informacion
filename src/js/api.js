/* =========================================================================
   api.js — "¿Cómo funciona una API?" anclado al dilema del AS/400.
   Toggle Sin API (silo) / Con API (integrado) + animación request/response.
   Sin librerías: Web Animations API + estado en memoria. Accesible.
   ========================================================================= */
import { Header } from "../components/index.js";
import { escapeHtml } from "../components/_util.js";

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, REDUCED ? 0 : ms));

/* JSON de ejemplo: facturas del cliente B2B que vive en el AS/400. */
const RESPUESTA = {
  cliente_id: 1024,
  nombre: "Deportes Atlántico S.L.",
  segmento: "Club B2B",
  facturas: [
    { num: "F-2026-0345", fecha: "2026-04-12", importe: 12450.0, estado: "pagada" },
    { num: "F-2026-0512", fecha: "2026-05-03", importe: 8990.5, estado: "pendiente" },
    { num: "F-2026-0633", fecha: "2026-05-28", importe: 15300.0, estado: "pendiente" },
  ],
  saldo_pendiente: 24290.5,
  fuente: "AS/400",
};

const eur = (n) => n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });

/* Coloreado mínimo de JSON (datos propios y seguros, sin metacaracteres HTML). */
function highlightJson(obj) {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(
    /("(?:[^"\\]|\\.)*"(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?)/g,
    (m) => {
      let cls = "num";
      if (/^"/.test(m)) cls = /:\s*$/.test(m) ? "key" : "str";
      else if (/true|false|null/.test(m)) cls = "bool";
      return `<span class="j-${cls}">${m}</span>`;
    }
  );
}

/* ------------------------------- Glosario -------------------------------- */
const GLOSARIO = [
  ["Request (petición)", "Lo que un sistema pide a otro: «dame esto»."],
  ["Response (respuesta)", "Lo que el otro devuelve: los datos pedidos… o un error."],
  ["Endpoint", "La dirección concreta a la que se pide, p. ej. <code>/clientes/1024/facturas</code>."],
  ["Método (GET / POST)", "El verbo: <code>GET</code> para leer datos, <code>POST</code> para crear o enviar."],
  ["JSON", "Un texto ordenado que entienden las máquinas y se lee razonablemente bien."],
  ["Latencia", "Lo que tarda la respuesta en volver. Con una API, milisegundos."],
];

/* ------------------------------ Composición ------------------------------ */
const app = document.querySelector("#app");
app.innerHTML = [
  Header({
    variant: "light",
    breadcrumb: [
      { label: "Hub", href: "/index.html" },
      { label: "¿Cómo funciona una API?", current: true },
    ],
    nav: [{ label: "Hub", href: "/index.html" }, { label: "Arquitectura (M2)", href: "/decks/m2.html" }],
  }),

  `<main id="contenido" class="section section--light"><div class="wrap">
    <div class="tool-intro">
      <h1>¿Cómo funciona una API?</h1>
      <p class="lead">Sin tecnicismos. Una API es lo que permitiría que el <strong>CRM</strong> de Báltica
      leyera, en el momento, datos que hoy viven encerrados en el <strong>AS/400</strong>.</p>
    </div>
    <p class="case-box"><strong>Caso Báltica:</strong> el CRM necesita el <strong>historial de facturas</strong>
    de un cliente B2B… pero ese dato vive en el AS/400, sin integrar.</p>
  </div></main>`,

  /* Metáfora del camarero / contrato */
  `<section class="section section--blue"><div class="wrap">
    <h2>La metáfora: un camarero con un contrato</h2>
    <p class="lead">Tú (el CRM) no entras en la cocina (el AS/400). Le pides al camarero (la API)
    lo que necesitas y te lo trae. El menú es el contrato: define qué puedes pedir y cómo.</p>
    <div class="meta-grid">
      <div class="meta-step"><div class="ico">🧑‍💼</div><h3>Cliente</h3><p class="muted">El CRM hace el pedido (request).</p></div>
      <div class="meta-step"><div class="ico">🤵</div><h3>Camarero = API</h3><p class="muted">Lleva el pedido y trae el plato. No improvisa: sigue el contrato.</p></div>
      <div class="meta-step"><div class="ico">🍳</div><h3>Cocina</h3><p class="muted">El AS/400 prepara la respuesta con sus datos.</p></div>
    </div>
  </div></section>`,

  /* Demo interactiva */
  `<section class="section section--light"><div class="wrap">
    <h2>Pruébalo: el mismo dato, con y sin API</h2>
    <div class="modes" role="group" aria-label="Modo de integración">
      <button class="m-sin" type="button" data-mode="sin" aria-pressed="false">🐌 Sin API (silo)</button>
      <button class="m-con" type="button" data-mode="con" aria-pressed="true">⚡ Con API (integrado)</button>
    </div>
    <p class="status-live" id="status-live" role="status" aria-live="polite" style="margin-top:var(--sp-3)"></p>

    <!-- CON API -->
    <div class="stage-panel" id="panel-con">
      <div class="row" style="justify-content:space-between">
        <span class="endpoint">GET /clientes/1024/facturas</span>
        <button class="btn btn--primary" type="button" id="btn-send">Enviar request</button>
      </div>
      <div class="stage" id="stage">
        <div class="actor actor--crm" id="actor-crm">
          <span class="actor__role">Cliente</span>
          <span class="actor__name">Salesforce CRM</span>
          <span class="actor__sub">quiere las facturas</span>
        </div>
        <div class="actor actor--api" id="actor-api">
          <span class="actor__role">Contrato</span>
          <span class="actor__name">API</span>
          <span class="actor__sub">recibe y entrega</span>
        </div>
        <div class="actor actor--as400" id="actor-as400">
          <span class="actor__role">Sistema</span>
          <span class="actor__name">AS/400</span>
          <span class="actor__sub">tiene los datos</span>
        </div>
        <div class="packet" id="packet"></div>
      </div>

      <div class="view360" id="view360" hidden>
        <div class="view360__head">
          <h3 style="margin:0">Vista 360 del cliente</h3>
          <span class="view360__live">● en tiempo real · ${RESPUESTA.fuente}</span>
        </div>
        <div id="view360-body"></div>
      </div>

      <div class="json-wrap">
        <p class="muted" style="margin:0 0 .3em">Respuesta de ejemplo (JSON):</p>
        <pre id="json-out" aria-label="Respuesta JSON de ejemplo"><code>${highlightJson(RESPUESTA)}</code></pre>
      </div>
    </div>

    <!-- SIN API -->
    <div class="stage-panel" id="panel-sin" hidden>
      <div class="row" style="justify-content:space-between">
        <span class="muted">Mismo dato, proceso manual</span>
        <button class="btn btn--secondary" type="button" id="btn-play">▶ Reproducir el proceso</button>
      </div>
      <ol class="manual-steps" id="manual">
        <li data-step><span class="step-ico">🧑‍💼</span><span class="step-txt"><b>El comercial necesita el historial de facturas del cliente.</b></span></li>
        <li data-step><span class="step-ico">✉️</span><span class="step-txt"><b>Abre un ticket a IT</b><small>«¿me sacáis las facturas del AS/400?»</small></span></li>
        <li data-step><span class="step-ico">🗄️</span><span class="step-txt"><b>IT entra en el AS/400 y exporta a Excel a mano</b><small>copia, pega, filtra…</small></span></li>
        <li data-step><span class="step-ico">📎</span><span class="step-txt"><b>Envía el Excel por email.</b></span></li>
        <li data-step data-bad><span class="step-ico">⚠️</span><span class="step-txt"><b>Llega 3 días después — y con errores de copia/pega.</b><small>Decides con datos viejos y poco fiables → mala calidad del dato.</small></span></li>
      </ol>
      <p class="late-badge" id="late" hidden>⏳ ~3 días · 🔴 con errores</p>
    </div>
  </div></section>`,

  /* Glosario */
  `<section class="section section--blue"><div class="wrap">
    <h2>Mini-glosario, sin jerga</h2>
    <div class="glossary">
      ${GLOSARIO.map(([t, d]) => `<div class="gloss-card"><h3>${escapeHtml(t)}</h3><p>${d}</p></div>`).join("")}
    </div>
  </div></section>`,
].join("");

/* ------------------------------ Referencias ------------------------------ */
const $ = (s) => document.querySelector(s);
const status = $("#status-live");
const anunciar = (m) => { status.textContent = m; };

/* ------------------------------- Modo toggle ----------------------------- */
function setMode(mode) {
  const con = mode === "con";
  $("#panel-con").hidden = !con;
  $("#panel-sin").hidden = con;
  document.querySelectorAll(".modes button").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.mode === mode))
  );
  anunciar(con
    ? "Modo Con API: el CRM puede pedir el dato directamente y recibirlo en milisegundos."
    : "Modo Sin API: el dato hay que pedirlo a IT y exportarlo a mano; llega tarde y con errores.");
}
document.querySelector(".modes").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-mode]");
  if (b) setMode(b.dataset.mode);
});

/* -------------------------- Animación CON API ---------------------------- */
const packet = $("#packet");
let currentX = 0;
let enviando = false;

const centerX = (el) => el.offsetLeft + el.offsetWidth / 2;

async function travel(toX, dur) {
  const from = currentX, to = toX - packet.offsetWidth / 2;
  if (!REDUCED) {
    const anim = packet.animate(
      [{ transform: `translateX(${from}px)` }, { transform: `translateX(${to}px)` }],
      { duration: dur, easing: "ease-in-out", fill: "forwards" }
    );
    await anim.finished;
  }
  packet.style.transform = `translateX(${to}px)`;
  currentX = to;
}

function setPacket(text, isRes) {
  packet.textContent = text;
  packet.classList.toggle("packet--res", !!isRes);
}

function renderView360() {
  const r = RESPUESTA;
  const filas = r.facturas
    .map((f) => `<tr>
        <td>${escapeHtml(f.num)}</td>
        <td>${escapeHtml(f.fecha)}</td>
        <td class="num">${eur(f.importe)}</td>
        <td><span class="estado estado--${f.estado}">${f.estado}</span></td>
      </tr>`)
    .join("");
  $("#view360-body").innerHTML = `
    <p style="margin:.2em 0"><strong>${escapeHtml(r.nombre)}</strong> · ${escapeHtml(r.segmento)} · id ${r.cliente_id}</p>
    <table class="inv-table">
      <thead><tr><th>Factura</th><th>Fecha</th><th>Importe</th><th>Estado</th></tr></thead>
      <tbody>${filas}</tbody>
    </table>
    <p style="margin:.6em 0 0;font-weight:600">Saldo pendiente: ${eur(r.saldo_pendiente)}</p>`;
  $("#view360").hidden = false;
}

async function enviarRequest() {
  if (enviando) return;
  enviando = true;
  $("#btn-send").disabled = true;
  $("#view360").hidden = true;

  const crm = $("#actor-crm"), api = $("#actor-api"), as400 = $("#actor-as400");

  // posición inicial en el CRM
  setPacket("GET /clientes/1024/facturas", false);
  packet.style.transform = `translateX(${centerX(crm) - packet.offsetWidth / 2}px)`;
  currentX = centerX(crm) - packet.offsetWidth / 2;
  packet.classList.add("is-visible");

  anunciar("El CRM envía la petición a la API…");
  await travel(centerX(api), 260);
  api.classList.add("is-busy");
  await sleep(150);
  api.classList.remove("is-busy");

  anunciar("La API consulta el AS/400…");
  await travel(centerX(as400), 260);
  as400.classList.add("is-busy");
  await sleep(REDUCED ? 0 : 250);
  as400.classList.remove("is-busy");

  // respuesta de vuelta
  setPacket("200 OK · JSON", true);
  anunciar("El AS/400 responde con los datos (200 OK)…");
  await travel(centerX(api), 220);
  await travel(centerX(crm), 220);

  packet.classList.remove("is-visible");
  renderView360();
  anunciar("Vista 360 lista. Latencia ≈ 200 ms — el dato del AS/400 ya se ve en el CRM.");

  $("#btn-send").disabled = false;
  enviando = false;
}
$("#btn-send").addEventListener("click", enviarRequest);

/* -------------------------- Secuencia SIN API ---------------------------- */
let reproduciendo = false;
async function reproducirManual() {
  if (reproduciendo) return;
  reproduciendo = true;
  const btn = $("#btn-play");
  btn.disabled = true;
  const steps = [...document.querySelectorAll("#manual [data-step]")];
  steps.forEach((s) => s.classList.remove("is-on", "is-bad"));
  $("#late").hidden = true;

  for (let i = 0; i < steps.length; i++) {
    const li = steps[i];
    // spinner mientras "trabaja" el paso intermedio (no en el primero ni el último)
    const trabajando = i > 0 && i < steps.length - 1;
    if (trabajando) li.querySelector(".step-ico").innerHTML = '<span class="spinner" aria-hidden="true"></span>';
    li.classList.add("is-on");
    anunciar(`Paso ${i + 1} de ${steps.length}: ${li.querySelector("b").textContent}`);
    await sleep(900 + (trabajando ? 500 : 0)); // lento y tosco a propósito
    if (trabajando) li.querySelector(".step-ico").textContent = "✅";
    if (li.hasAttribute("data-bad")) li.classList.add("is-bad");
  }
  $("#late").hidden = false;
  anunciar("Resultado: el dato llega ~3 días tarde y con errores. Eso es vivir en un silo.");
  btn.disabled = false;
  reproduciendo = false;
}
$("#btn-play").addEventListener("click", reproducirManual);

/* Estado inicial: modo Con API */
setMode("con");
