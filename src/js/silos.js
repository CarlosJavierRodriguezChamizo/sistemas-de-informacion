/* =========================================================================
   silos.js — Scrollytelling "El problema de los silos" (bloque clave M2).
   Visual: el cliente en el centro y los 12 sistemas alrededor; las escenas
   resaltan los 6 que tocan al cliente y separan los 3 silos. Cierra en el
   mapa interactivo. Datos del dataset; sin claves de respuesta.
   ========================================================================= */
import { Header } from "../components/index.js";
import { escapeHtml, appUrl } from "../components/_util.js";
import { getSistemas } from "./data.js";
import { initScrolly } from "./scrolly.js";

const sistemas = getSistemas();
const SHORT = {
  1: "SAP S/4HANA", 2: "SF Sales Cloud", 3: "SF Commerce", 4: "SAP BW/4HANA",
  5: "Power BI", 6: "Zendesk", 7: "Manhattan WMS", 8: "AS/400",
  9: "GA4", 10: "Emarsys", 11: "Bazaarvoice", 12: "Báltica+ App",
};
const CLIENT = new Set([2, 3, 6, 10, 11, 12]); // tipo contiene CRM

/* --------------------------- Geometría del anillo ------------------------ */
const CX = 380, CY = 300, R = 214;
const pos = {};
sistemas.forEach((s, i) => {
  const ang = (-90 + i * 30) * (Math.PI / 180);
  pos[s.id] = { x: CX + R * Math.cos(ang), y: CY + R * Math.sin(ang), ang };
});

function nodeSvg(s) {
  const { x, y, ang } = pos[s.id];
  const r = 24;
  const cls = `sv-node${CLIENT.has(s.id) ? " is-client" : ""}${s.aislado ? " is-silo" : ""}`;
  // desplazamiento hacia afuera para los silos (escena 4)
  const ox = (Math.cos(ang) * 62).toFixed(0), oy = (Math.sin(ang) * 62).toFixed(0);
  const labelBelow = y > CY;
  const ly = labelBelow ? y + r + 16 : y - r - 10;
  return `<g class="${cls}" style="--ox:${ox}px;--oy:${oy}px">
    <circle class="sv-node__dot" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r}" fill="#e9eeff" stroke="#0047e9" stroke-width="2" />
    <text class="sv-node__inc" x="${x.toFixed(0)}" y="${(y + 4).toFixed(0)}">${s.incidencias_mes}</text>
    <text class="sv-node__label" x="${x.toFixed(0)}" y="${ly.toFixed(0)}">${escapeHtml(SHORT[s.id])}</text>
  </g>`;
}

function stageSvg() {
  return `<div class="scrolly__stage">
    <svg class="scrolly__svg" viewBox="0 0 760 600" role="img" aria-label="El cliente en el centro y los 12 sistemas de Báltica alrededor; tres viven aislados.">
      <g class="sv-center">
        <circle class="sv-center__ring" cx="${CX}" cy="${CY}" r="86" />
        <circle class="sv-center__ring cracked" cx="${CX}" cy="${CY}" r="86" />
        <circle cx="${CX}" cy="${CY}" r="58" fill="#0047e9" />
        <text class="sv-center__label" x="${CX}" y="${CY - 4}" style="fill:#fff;font-size:20px">CLIENTE</text>
        <text class="sv-center__label" x="${CX}" y="${CY + 20}" style="fill:#0ae4c3;font-size:15px">360º</text>
        <text class="sv-center__q" x="${CX}" y="${CY + 14}">?</text>
      </g>
      <g class="sv-nodes">${sistemas.map(nodeSvg).join("")}</g>
    </svg>
    <div class="stage-overlay">
      <p class="o-q">¿Por qué crece el negocio pero no la rentabilidad?</p>
      <div class="o-kpis">
        <div><div class="o-num">+14,5 %</div><div class="o-lab">Ventas</div></div>
        <div><div class="o-num">6,0 → 2,5 %</div><div class="o-lab">EBITDA</div></div>
      </div>
    </div>
  </div>`;
}

const STEPS = [
  { s: 1, k: "La paradoja", h: "Crece el negocio, no la rentabilidad", p: "Grupo Báltica vende más que nunca, pero su margen se desploma. El problema no está en el mercado: está dentro." },
  { s: 2, k: "El mapa", h: "12 sistemas · 18 M€ invertidos", p: "Báltica ha rodeado a su cliente de doce sistemas y casi dieciocho millones de euros. Sobre el papel, está cubierto." },
  { s: 3, k: "El cliente", h: "Seis sistemas tocan al cliente", p: "CRM, e-commerce, fidelización, marketing, reseñas y servicio: seis piezas distintas… y ninguna comparte lo que sabe con las demás." },
  { s: 4, k: "Los silos", h: "Tres viven completamente aislados", p: "El AS/400 (28 incidencias/mes), la app Báltica+ (22) y Zendesk (15) guardan el dato de cliente más valioso — encerrado, sin conectar." },
  { s: 5, k: "La consecuencia", h: "No hay visión 360 del cliente", p: "Sin integración, nadie ve al cliente completo. Se decide a ciegas y se consolida en Excel a mano: tarde y con errores." },
  { s: 6, k: "Tu turno", h: "Explóralo en el mapa interactivo", p: "Recorre el mapa de sistemas, activa el dato crudo y nombra los gaps de integración que más daño hacen al negocio." },
];

function stepHtml(st) {
  const cta = st.s === 6
    ? `<p style="margin-top:var(--sp-4)"><a class="btn btn--primary" href="${appUrl('/tools/mapa-silos.html')}">Ir al mapa de silos</a></p>`
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
      { label: "El problema de los silos", current: true },
    ],
    nav: [{ label: "Hub", href: "/index.html" }, { label: "Deck M2", href: "/decks/m2.html" }, { label: "Mapa interactivo", href: "/tools/mapa-silos.html" }],
  }),
  `<main id="contenido" class="section section--light"><div class="wrap">
    <div class="tool-intro">
      <span class="badge badge--m2">M2 · Historia visual</span>
      <h1 style="margin-top:var(--sp-2)">El problema de los silos</h1>
      <p class="lead">Desplázate para ver cómo doce sistemas y 18 M€ pueden, aun así, dejar a la empresa sin ver a su cliente.</p>
    </div>
    <div class="scrolly" data-scene="1">
      <div class="scrolly__inner">
        <div class="scrolly__visual">${stageSvg()}</div>
        <div class="scrolly__steps">${STEPS.map(stepHtml).join("")}</div>
      </div>
    </div>
  </div></main>`,
].join("");

initScrolly(app.querySelector(".scrolly"));
