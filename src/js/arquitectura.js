/* =========================================================================
   arquitectura.js — Scrollytelling "La arquitectura objetivo" (bloque clave).
   La visual construye, capa a capa, el target state que mata los silos:
   fuentes → integración/API → data warehouse (SSOT) → 360/BI/IA. Cierra en
   el explicador de APIs y la matriz migrar/integrar.
   ========================================================================= */
import { Header } from "../components/index.js";
import { escapeHtml, appUrl } from "../components/_util.js";
import { initScrolly } from "./scrolly.js";

/* ----------------------------- Geometría --------------------------------- */
function box(x, y, w, h, label, cls = "") {
  return `<g class="arch-box ${cls}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" />
    <text x="${x + w / 2}" y="${y + h / 2}">${escapeHtml(label)}</text>
  </g>`;
}
function arrow(x1, y1, x2, y2) {
  return `<line class="arch-arrow" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#ah)" />`;
}

/* Fuentes (abajo) */
const SOURCES = [
  { label: "SAP ERP" }, { label: "CRM" }, { label: "e-commerce" },
  { label: "WMS" }, { label: "Báltica+ App" }, { label: "AS/400", cls: "arch-as400" },
];
const SW = 108, SH = 54, SY = 500;
const SX = SOURCES.map((_, i) => 30 + i * 118);

function stageSvg() {
  const sources = SOURCES.map((s, i) => box(SX[i], SY, SW, SH, s.label, s.cls)).join("");
  // flechas fuentes -> integración (capa en y 360-414)
  const arrowsToInt = SX.map((x) => arrow(x + SW / 2, SY, x + SW / 2, 416)).join("");

  return `<div class="scrolly__stage">
    <svg class="scrolly__svg" viewBox="0 0 760 600" role="img"
      aria-label="Arquitectura objetivo por capas: sistemas fuente, capa de integración con APIs, data warehouse como única fuente de la verdad y, encima, vista 360, BI e IA.">
      <defs>
        <marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#9aa3b8" />
        </marker>
      </defs>

      <!-- Fuentes (siempre visibles) -->
      <text class="arch-layer-label" x="30" y="486">Sistemas fuente</text>
      <g class="arch-sources">${sources}</g>

      <!-- Capa de integración -->
      <g class="arch-el arch-integration" data-layer="integration">
        ${arrowsToInt}
        <rect x="40" y="360" width="680" height="54" />
        <text x="380" y="387">Capa de integración · API / Middleware</text>
      </g>

      <!-- Data warehouse / SSOT -->
      <g class="arch-el arch-dwh" data-layer="dwh">
        <line class="arch-arrow" x1="380" y1="360" x2="380" y2="301" marker-end="url(#ah)" />
        <rect x="220" y="236" width="320" height="62" />
        <text x="380" y="261">Data Warehouse</text>
        <text x="380" y="281" style="font-weight:600;font-size:12px">Single source of truth</text>
      </g>

      <!-- Consumo: 360 / BI / IA -->
      <g class="arch-el arch-top" data-layer="top">
        <line class="arch-arrow" x1="320" y1="236" x2="150" y2="158" marker-end="url(#ah)" />
        <line class="arch-arrow" x1="380" y1="236" x2="380" y2="158" marker-end="url(#ah)" />
        <line class="arch-arrow" x1="440" y1="236" x2="610" y2="158" marker-end="url(#ah)" />
        ${box(50, 92, 200, 64, "Vista 360 del cliente")}
        ${box(280, 92, 200, 64, "BI / EIS del Comité")}
        ${box(510, 92, 200, 64, "IA / Agentes", "ia")}
      </g>

      <!-- Etiqueta migrar/integrar sobre el AS/400 -->
      <g class="arch-as400-tag">
        <rect x="${SX[5] - 16}" y="${SY - 42}" width="140" height="28" />
        <text x="${SX[5] + 54}" y="${SY - 28}">¿migrar o integrar?</text>
      </g>
    </svg>
  </div>`;
}

/* --------------------------- Reveal por escena --------------------------- */
function onScene(scene) {
  const n = Number(scene);
  const root = document.querySelector(".scrolly");
  const setOn = (sel, cond) => root.querySelector(sel)?.classList.toggle("on", cond);
  setOn('[data-layer="integration"]', n >= 2);
  setOn('[data-layer="dwh"]', n >= 3);
  setOn('[data-layer="top"]', n >= 4);
  setOn(".arch-as400-tag", n >= 5);
  root.querySelector(".arch-as400")?.classList.toggle("pulse", n >= 5);
}

const STEPS = [
  { s: 1, k: "El punto de partida", h: "Sistemas valiosos, pero sueltos", p: "Báltica ya tiene ERP, CRM, e-commerce, WMS, su app… y el AS/400. No faltan piezas: lo que falta es que se hablen entre sí." },
  { s: 2, k: "La capa que conecta", h: "Una capa de integración (API / middleware)", p: "En vez de cables uno a uno, una capa común por la que cada sistema publica y consume datos mediante APIs. Conectas una vez, no N veces." },
  { s: 3, k: "Una sola verdad", h: "Data warehouse: single source of truth", p: "Los datos clave se consolidan en un almacén único. Una sola definición de «cliente», «pedido» o «stock» para toda la empresa." },
  { s: 4, k: "El cliente, completo", h: "Vista 360, BI y —ahora— IA", p: "Encima se construyen la visión 360 del cliente, el BI/EIS del Comité y los agentes de IA. Todos beben de la misma verdad integrada." },
  { s: 5, k: "La pieza incómoda", h: "El AS/400: ¿migrar o integrar?", p: "El legado no desaparece solo. Hay que decidir: envolverlo con APIs ahora o planificar su reemplazo. Es un trade-off, no un dogma." },
  { s: 6, k: "Tu turno", h: "Diseña el target state", p: "Apóyate en el explicador de APIs y en la matriz de decisión para defender tu arquitectura objetivo ante el Comité." },
];

function stepHtml(st) {
  const cta = st.s === 6
    ? `<p class="row" style="margin-top:var(--sp-4)">
         <a class="btn btn--primary" href="${appUrl('/tools/api.html')}">¿Cómo funciona una API?</a>
         <a class="btn btn--secondary" href="${appUrl('/tools/migrar-integrar.html')}">Matriz migrar/integrar</a>
       </p>`
    : "";
  return `<div class="scrolly__step" data-scene="${st.s}">
    <div class="scrolly__card">
      <span class="scrolly__kicker">${escapeHtml(st.k)}</span>
      <h3>${escapeHtml(st.h)}</h3>
      <p>${escapeHtml(st.p)}</p>
      ${cta}
    </div>
  </div>`;
}

const app = document.querySelector("#app");
app.innerHTML = [
  Header({
    variant: "light",
    breadcrumb: [
      { label: "Hub", href: "/index.html" },
      { label: "La arquitectura objetivo", current: true },
    ],
    nav: [{ label: "Hub", href: "/index.html" }, { label: "API", href: "/tools/api.html" }, { label: "Migrar/Integrar", href: "/tools/migrar-integrar.html" }],
  }),
  `<main id="contenido" class="section section--light"><div class="wrap">
    <div class="tool-intro">
      <span class="badge badge--m2">Arquitectura · Historia visual</span>
      <h1 style="margin-top:var(--sp-2)">La arquitectura objetivo</h1>
      <p class="lead">Desplázate para construir, capa a capa, el estado objetivo que mata los silos.</p>
    </div>
    <div class="scrolly" data-scene="1">
      <div class="scrolly__inner">
        <div class="scrolly__visual">${stageSvg()}</div>
        <div class="scrolly__steps">${STEPS.map(stepHtml).join("")}</div>
      </div>
    </div>
  </div></main>`,
].join("");

initScrolly(app.querySelector(".scrolly"), onScene);
