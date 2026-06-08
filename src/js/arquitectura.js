/* =========================================================================
   arquitectura.js — Scrollytelling "La arquitectura objetivo".
   La visual es un diagrama 3D real (CSS preserve-3d): las capas flotan a
   distinta profundidad, los nodos tienen grosor y las conexiones son haces
   con datos que suben. Reacciona al ratón (parallax) y se revela por escena:
   fuentes → integración → data warehouse (SSOT) → 360/BI/IA.
   ========================================================================= */
import { Header } from "../components/index.js";
import { escapeHtml, appUrl } from "../components/_util.js";
import { initScrolly } from "./scrolly.js";
import { createGL } from "./gl/glCanvas.js";
import { BLUEPRINT_FRAG } from "./gl/shaders.js";

/* ------------------------------- Datos ----------------------------------- */
const SOURCES = [
  { label: "SAP ERP" }, { label: "CRM" }, { label: "e-commerce" },
  { label: "WMS" }, { label: "Báltica+ App" }, { label: "AS/400", cls: "is-as400" },
];

/* --------------------------- Nodos 3D (HTML) ----------------------------- */
function node(label, cls = "", { pin = false, beam = false, tag = "" } = {}) {
  return `<div class="a3d__node ${cls}">
    ${beam ? `<span class="a3d__beam"></span>` : ""}
    ${pin ? `<span class="a3d__pin"></span>` : ""}
    <span class="a3d__lbl">${escapeHtml(label)}</span>
    ${tag ? `<span class="a3d__tag">${escapeHtml(tag)}</span>` : ""}
  </div>`;
}

function stage3d() {
  const sources = SOURCES.map((s) =>
    node(s.label, `is-src ${s.cls || ""}`, { pin: true, tag: s.cls === "is-as400" ? "¿migrar o integrar?" : "" })
  ).join("");

  return `<div class="scrolly__stage">
    <div class="a3d" role="img"
      aria-label="Arquitectura objetivo en 3D: sistemas fuente abajo, capa de integración, data warehouse como única fuente de la verdad y, arriba, vista 360, BI e IA.">
      <div class="a3d__world" id="a3dWorld">

        <div class="a3d__layer a3d__layer--top arch-el" data-layer="top">
          ${node("Vista 360", "", { beam: true })}
          ${node("BI / EIS", "", { beam: true })}
          ${node("IA / Agentes", "is-ia", { beam: true })}
        </div>

        <div class="a3d__layer a3d__layer--dwh arch-el" data-layer="dwh">
          ${node("Data Warehouse · SSOT", "is-dwh", { beam: true })}
        </div>

        <div class="a3d__layer a3d__layer--int arch-el" data-layer="integration">
          ${node("Capa de integración · API / Middleware", "is-int", { beam: true })}
        </div>

        <div class="a3d__layer a3d__layer--src">
          ${sources}
        </div>

        <span class="a3d__floor" aria-hidden="true"></span>
      </div>
    </div>
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
  root.querySelector(".is-as400")?.classList.toggle("pulse", n >= 5);
  root.querySelector(".a3d__tag")?.classList.toggle("on", n >= 5);
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
    variant: "blue",
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
        <div class="scrolly__visual">${stage3d()}</div>
        <div class="scrolly__steps">${STEPS.map(stepHtml).join("")}</div>
      </div>
    </div>
  </div></main>`,
].join("");

initScrolly(app.querySelector(".scrolly"), onScene);

/* Parallax 3D del diagrama con el ratón. */
const world = document.getElementById("a3dWorld");
if (world && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.addEventListener(
    "pointermove",
    (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      world.style.setProperty("--rx", `${(x * 18).toFixed(1)}deg`);
      world.style.setProperty("--ry", `${(-y * 10).toFixed(1)}deg`);
    },
    { passive: true }
  );
}

/* Fondo WebGL: rejilla en perspectiva (suelo de "mapa 3D" futurista). */
const archBg = document.querySelector("#arch-bg");
if (archBg) {
  const bg = createGL(archBg, BLUEPRINT_FRAG, { dprCap: 1.75 });
  window.addEventListener(
    "pointermove",
    (e) => bg.setMouse(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight),
    { passive: true }
  );
}
