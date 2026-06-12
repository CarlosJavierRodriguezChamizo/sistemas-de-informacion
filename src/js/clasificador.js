/* =========================================================================
   clasificador.js — Práctica M1: clasificar los 12 sistemas de Báltica.
   Drag & drop + alternativa accesible por teclado (seleccionar + colocar).
   La validación deriva del campo `tipo` del dataset (no hay clave aparte).
   Estado en memoria.
   ========================================================================= */
import { Header, Button } from "../components/index.js";
import { escapeHtml } from "../components/_util.js";
import { getSistemas, sistemasCliente } from "./data.js";

/* ----------------------------- Configuración ----------------------------- */
const ZONES = [
  { key: "erp",  label: "ERP",            desc: "Procesos internos / back-office" },
  { key: "crm",  label: "CRM",            desc: "Relación con el cliente" },
  { key: "scm",  label: "SCM",            desc: "Cadena de suministro / logística" },
  { key: "bi",   label: "BI / DSS / EIS", desc: "Análisis y decisión" },
  { key: "otro", label: "Otro / Operacional", desc: "No encaja en las anteriores" },
];

/** Familia correcta a partir del campo `tipo` (acepta coincidencia de familia). */
function zoneOf(tipo) {
  if (/CRM/i.test(tipo)) return "crm";
  if (/SCM/i.test(tipo)) return "scm";
  if (/BI|DSS|EIS|Analytics/i.test(tipo)) return "bi";
  if (/ERP/i.test(tipo)) return "erp";
  return "otro";
}

/** Explicación breve por familia (feedback de autocorrección). */
const FAMILY_REASON = {
  erp: "Familia ERP: gestiona procesos internos (finanzas, inventario, operaciones).",
  crm: "Familia CRM: gestiona la relación con el cliente (ventas, marketing, servicio).",
  scm: "Familia SCM: gestiona la cadena de suministro y la logística.",
  bi:  "Familia BI/DSS/EIS: explota datos para análisis y decisión.",
  otro: "No encaja en ERP/CRM/SCM/BI.",
};
const ZONE_LABEL = Object.fromEntries(ZONES.map((z) => [z.key, z.label]));

/** Explicación precisa por sistema (por qué pertenece a su tipo). Id → motivo.
    Basada en qué es cada producto y en la nota del dataset; sin inventar. */
const SYSTEM_REASON = {
  1:  "ERP de SAP que integra finanzas, compras, producción e inventario en un único núcleo transaccional: es el back-office central de la empresa.",
  2:  "CRM de ventas de Salesforce: gestiona cuentas, contactos y oportunidades del pipeline comercial. Su foco es la relación con el cliente.",
  3:  "Plataforma de comercio electrónico de Salesforce (el canal de venta online): un sistema de cara al cliente, dentro de la familia CRM/Commerce.",
  4:  "Data warehouse de SAP (Business Warehouse): consolida datos para informar y analizar. Es la capa de BI/DSS de soporte a la decisión.",
  5:  "Herramienta de Microsoft para cuadros de mando y visualización de datos: explota la información para la dirección (BI/EIS).",
  6:  "Plataforma de atención al cliente: gestiona tickets y NPS. Es CRM en su vertiente de servicio.",
  7:  "Warehouse Management System (WMS) de Manhattan Associates: gobierna el almacén y la logística. Pertenece a la cadena de suministro (SCM).",
  8:  "Sistema legado sobre IBM AS/400 que aloja el maestro de clientes y la facturación del Club B2B: funciones de back-office → ERP (legacy).",
  9:  "Analítica web y de aplicación de Google: mide tráfico y comportamiento digital. Es analítica de datos (BI/Analytics).",
  10: "Plataforma de marketing y engagement (SAP Emarsys): campañas y comunicación con clientes. Es CRM en su vertiente de marketing.",
  11: "Plataforma de reseñas y contenido generado por el usuario (UGC) sobre los productos: trabaja sobre la relación con el cliente (CRM/UGC).",
  12: "App propia de fidelización (1,2M socios): gestiona el programa de loyalty y los datos del socio. Es CRM en su vertiente de fidelización.",
};

/* ------------------------------- Estado --------------------------------- */
const sistemas = getSistemas();
/** Map<idCarta, ubicación>  ('pool' | código de zona). */
const ubicacion = new Map(sistemas.map((s) => [s.id, "pool"]));
let seleccionada = null;     // id de carta seleccionada (teclado/click)
let validado = false;

/* ------------------------------ Utilidades DOM --------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const cardEl = (id) => document.getElementById(`card-${id}`);
const bodyEl = (zona) => document.querySelector(`[data-dropbody="${zona}"]`);

function anunciar(msg) {
  const live = $("#status-live");
  if (live) live.textContent = msg;
}

/* ------------------------------- Render --------------------------------- */
function cardHtml(s) {
  return `<button class="csys-card" id="card-${s.id}" type="button"
      draggable="true" aria-pressed="false"
      data-id="${s.id}"
      aria-label="${escapeHtml(s.sistema)}, ${escapeHtml(s.proveedor)}, ${s.anio}. Sin clasificar. Pulsa para seleccionar.">
      <span class="csys-card__name">${escapeHtml(s.sistema)}</span>
      <span class="csys-card__meta">${escapeHtml(s.proveedor)} · ${s.anio}</span>
      <span class="csys-card__status" aria-hidden="true"></span>
      <span class="csys-card__tip" id="tip-${s.id}" role="tooltip"></span>
    </button>`;
}

function zoneHtml(z) {
  return `<section class="zone" aria-labelledby="zt-${z.key}">
      <header class="zone__head">
        <h3 class="zone__title" id="zt-${z.key}">${escapeHtml(z.label)}</h3>
        <button class="zone__place" type="button" data-place="${z.key}" disabled
          aria-label="Mover el sistema seleccionado a ${escapeHtml(z.label)}">Mover aquí</button>
      </header>
      <p class="zone__desc">${escapeHtml(z.desc)} · <span class="count" data-count="${z.key}">0</span></p>
      <div class="dropbody" data-dropbody="${z.key}" data-zone="${z.key}"></div>
    </section>`;
}

const app = $("#app");
app.innerHTML = [
  Header({
    variant: "light",
    breadcrumb: [
      { label: "Hub", href: "/index.html" },
      { label: "Clasificador de sistemas", current: true },
    ],
    nav: [{ label: "Hub", href: "/index.html" }, { label: "Volver a M1", href: "/decks/m1.html" }],
  }),
  `<main id="contenido" class="section section--light"><div class="wrap">
    <div class="tool-intro">
      <h1>Clasifica los 12 sistemas de Báltica</h1>
      <p class="lead">Arrastra cada sistema a su familia, o selecciónalo y pulsa “Mover aquí”.
      Cuando termines, pulsa <strong>Comprobar</strong>.</p>
    </div>

    <div class="toolbar">
      ${Button({ label: "Comprobar", variant: "primary", extra: { id: "btn-check" } })}
      ${Button({ label: "Reiniciar", variant: "secondary", extra: { id: "btn-reset" } })}
      <span class="toolbar__spacer"></span>
      <span class="score" id="score" hidden><span id="score-n">0</span><small>/ 12 correctos</small></span>
    </div>
    <p class="status-live" id="status-live" role="status" aria-live="polite"></p>
    <p class="kbd-hint">Teclado: <kbd>Tab</kbd> a una tarjeta, <kbd>Enter</kbd> para seleccionar,
      luego <kbd>1</kbd>–<kbd>5</kbd> para colocar en una zona o <kbd>0</kbd> para devolver al pool.</p>

    <div class="cls-board">
      <aside class="pool">
        <header class="pool__head">
          <h2 class="pool__title">Sin clasificar</h2>
          <button class="zone__place" type="button" data-place="pool" disabled
            aria-label="Devolver el sistema seleccionado al pool">Devolver aquí</button>
        </header>
        <p class="zone__desc"><span class="count" data-count="pool">12</span> sistemas</p>
        <div class="dropbody" data-dropbody="pool" data-zone="pool"></div>
      </aside>
      <div class="zones">${ZONES.map(zoneHtml).join("")}</div>
    </div>

    <section class="explica" id="explica" hidden tabindex="-1" aria-live="polite">
      <h2 class="explica__title">¡12/12! Por qué cada sistema va donde va</h2>
      <div id="explica-body"></div>
    </section>

    <section class="insight" id="insight" hidden tabindex="-1" aria-live="polite">
      <p class="insight__big" id="insight-big"></p>
      <p id="insight-text"></p>
    </section>
  </div></main>`,
].join("");

/* Pinta las tarjetas en el pool inicial. */
bodyEl("pool").innerHTML = sistemas.map(cardHtml).join("");

/* ----------------------------- Colocar carta ----------------------------- */
function colocar(id, zona) {
  const card = cardEl(id);
  bodyEl(zona).appendChild(card);
  ubicacion.set(id, zona);
  limpiarValidacion();      // cualquier movimiento invalida la corrección previa
  actualizarContadores();
  deseleccionar();
  card.focus();
}

function actualizarContadores() {
  const conteo = { pool: 0, erp: 0, crm: 0, scm: 0, bi: 0, otro: 0 };
  ubicacion.forEach((z) => (conteo[z] += 1));
  document.querySelectorAll("[data-count]").forEach((el) => {
    el.textContent = conteo[el.dataset.count];
  });
}

/* ----------------------------- Selección -------------------------------- */
function seleccionar(id) {
  if (seleccionada === id) return deseleccionar();
  deseleccionar();
  seleccionada = id;
  const card = cardEl(id);
  card.setAttribute("aria-pressed", "true");
  document.querySelectorAll(".zone__place").forEach((b) => (b.disabled = false));
  const s = sistemas.find((x) => x.id === id);
  anunciar(`${s.sistema} seleccionado. Elige una zona y pulsa “Mover aquí”, o las teclas 1–5 / 0.`);
}
function deseleccionar() {
  if (seleccionada != null) cardEl(seleccionada)?.setAttribute("aria-pressed", "false");
  seleccionada = null;
  document.querySelectorAll(".zone__place").forEach((b) => (b.disabled = true));
}

/* ----------------------------- Validación ------------------------------- */
function limpiarValidacion() {
  if (!validado) return;
  validado = false;
  document.querySelectorAll(".csys-card").forEach((c) => {
    c.classList.remove("is-correct", "is-incorrect", "is-unclassified", "has-tip");
    const tip = c.querySelector(".csys-card__tip");
    if (tip) tip.textContent = "";
    c.removeAttribute("aria-describedby");
    reetiquetar(c, "Sin clasificar");
  });
  $("#score").hidden = true;
  $("#insight").hidden = true;
  $("#explica").hidden = true;
}

function reetiquetar(card, estadoTxt) {
  const s = sistemas.find((x) => x.id === Number(card.dataset.id));
  card.setAttribute("aria-label", `${s.sistema}, ${s.proveedor}, ${s.anio}. ${estadoTxt}. Pulsa para seleccionar.`);
}

function comprobar() {
  let correctos = 0;
  let sinClasificar = 0;

  sistemas.forEach((s) => {
    const card = cardEl(s.id);
    const zona = ubicacion.get(s.id);
    const tip = card.querySelector(".csys-card__tip");
    card.classList.remove("is-correct", "is-incorrect", "is-unclassified");
    card.classList.add("has-tip");
    card.setAttribute("aria-describedby", `tip-${s.id}`);

    if (zona === "pool") {
      sinClasificar += 1;
      card.classList.add("is-unclassified");
      tip.textContent = "Aún sin clasificar.";
      reetiquetar(card, "Sin clasificar");
      return;
    }
    const correcta = zoneOf(s.tipo);
    if (zona === correcta) {
      correctos += 1;
      card.classList.add("is-correct");
      tip.textContent = `Correcto · ${s.tipo}. ${SYSTEM_REASON[s.id]}`;
      reetiquetar(card, "Correcto");
    } else {
      card.classList.add("is-incorrect");
      tip.textContent = `Revisa: lo pusiste en ${ZONE_LABEL[zona]}, pero su tipo es ${s.tipo} → ${ZONE_LABEL[correcta]}.`;
      reetiquetar(card, `Incorrecto, debería ir en ${ZONE_LABEL[correcta]}`);
    }
  });

  validado = true;
  const score = $("#score");
  score.hidden = false;
  $("#score-n").textContent = correctos;

  const restante = sinClasificar ? ` Quedan ${sinClasificar} sin clasificar.` : "";
  anunciar(`${correctos} de 12 correctos.${restante} Pasa el ratón o el foco por cada tarjeta para ver la explicación.`);

  // Explicación completa (por qué cada sistema va donde va) solo si TODO está bien.
  if (correctos === sistemas.length && sinClasificar === 0) mostrarExplicacion();
  else $("#explica").hidden = true;

  mostrarInsight();
}

/* -------------------------- Explicación (12/12) -------------------------- */
function mostrarExplicacion() {
  const porZona = { erp: [], crm: [], scm: [], bi: [], otro: [] };
  sistemas.forEach((s) => porZona[zoneOf(s.tipo)].push(s));

  $("#explica-body").innerHTML = ZONES
    .filter((z) => porZona[z.key].length)
    .map((z) => `
      <div class="explica__group">
        <h3 class="explica__fam">${escapeHtml(z.label)} <span>· ${escapeHtml(FAMILY_REASON[z.key])}</span></h3>
        <ul class="explica__list">
          ${porZona[z.key]
            .map((s) => `<li><strong>${escapeHtml(s.sistema)}</strong> <span class="explica__tipo">${escapeHtml(s.tipo)}</span><br>${escapeHtml(SYSTEM_REASON[s.id])}</li>`)
            .join("")}
        </ul>
      </div>`)
    .join("");

  const panel = $("#explica");
  panel.hidden = false;
  panel.focus();
}

/* ------------------------------- Insight -------------------------------- */
function mostrarInsight() {
  const nCliente = sistemasCliente().length; // 6 (hecho del caso)
  $("#insight-big").textContent = `${nCliente} de tus 12 sistemas tocan al cliente (CRM)`;
  $("#insight-text").innerHTML =
    `…y están dispersos en silos: <strong>ninguno ofrece una visión 360º del cliente</strong>. ` +
    `Datos de fidelización, servicio y facturación B2B viven en sistemas que no se hablan entre sí. ` +
    `Ese es el verdadero problema de Báltica.`;
  const panel = $("#insight");
  panel.hidden = false;
  panel.focus();
}

/* ------------------------------- Reiniciar ------------------------------- */
function reiniciar() {
  validado = true;            // fuerza la limpieza de clases en limpiarValidacion()
  document.querySelectorAll(".csys-card").forEach((c) => bodyEl("pool").appendChild(c));
  ubicacion.forEach((_, id) => ubicacion.set(id, "pool"));
  limpiarValidacion();
  actualizarContadores();
  deseleccionar();
  anunciar("Reiniciado. Los 12 sistemas vuelven al pool.");
}

/* ------------------------------- Eventos -------------------------------- */
// Click en tarjeta → seleccionar; click en “Mover aquí”/“Devolver” → colocar.
app.addEventListener("click", (e) => {
  const card = e.target.closest(".csys-card");
  if (card) { seleccionar(Number(card.dataset.id)); return; }
  const place = e.target.closest("[data-place]");
  if (place && seleccionada != null) { colocar(seleccionada, place.dataset.place); return; }
});

// Teclado: 1–5 colocan en zona, 0 al pool (con carta seleccionada).
app.addEventListener("keydown", (e) => {
  if (seleccionada == null) return;
  if (e.target.closest("input, textarea")) return;
  const map = { 1: "erp", 2: "crm", 3: "scm", 4: "bi", 5: "otro", 0: "pool" };
  if (e.key in map) { e.preventDefault(); colocar(seleccionada, map[e.key]); }
  if (e.key === "Escape") deseleccionar();
});

// Botones principales
$("#btn-check").addEventListener("click", comprobar);
$("#btn-reset").addEventListener("click", reiniciar);

/* ------------------------- Drag & drop (ratón) -------------------------- */
let arrastrando = null;
app.addEventListener("dragstart", (e) => {
  const card = e.target.closest(".csys-card");
  if (!card) return;
  arrastrando = Number(card.dataset.id);
  card.classList.add("is-dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", String(arrastrando));
});
app.addEventListener("dragend", (e) => {
  e.target.closest(".csys-card")?.classList.remove("is-dragging");
  document.querySelectorAll(".dropbody.is-dragover").forEach((d) => d.classList.remove("is-dragover"));
});
app.addEventListener("dragover", (e) => {
  const body = e.target.closest(".dropbody");
  if (!body) return;
  e.preventDefault();
  body.classList.add("is-dragover");
});
app.addEventListener("dragleave", (e) => {
  const body = e.target.closest(".dropbody");
  if (body && !body.contains(e.relatedTarget)) body.classList.remove("is-dragover");
});
app.addEventListener("drop", (e) => {
  const body = e.target.closest(".dropbody");
  if (!body || arrastrando == null) return;
  e.preventDefault();
  body.classList.remove("is-dragover");
  colocar(arrastrando, body.dataset.zone);
  arrastrando = null;
});

/* Estado inicial */
actualizarContadores();
