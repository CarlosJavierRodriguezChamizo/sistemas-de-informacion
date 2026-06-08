/* =========================================================================
   hub.js — Render del Hub / Escaleta viva + interacción de estado.
   El estado de cada bloque (pendiente/en curso/hecho) vive en memoria.
   ========================================================================= */
import { Header, Section, Kpi, Chip } from "../components/index.js";
import { escapeHtml } from "../components/_util.js";
import { DIAS, CATS } from "../data/agenda.js";

/* ----- Estado en memoria (no persiste entre recargas, por diseño) ----- */
const STATES = ["pendiente", "encurso", "hecho"];
const STATE_LABEL = { pendiente: "Pendiente", encurso: "En curso", hecho: "Hecho" };
/** Map<string,string>  id de bloque -> estado actual. */
const estados = new Map();

/* --------------------------- Helpers de render --------------------------- */

/** Un enlace de acción (deck/tool/kahoot/pitch). */
function linkHtml({ label, href, kind }) {
  return `<a class="agenda-link agenda-link--${escapeHtml(kind)}" href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
}

/** Botón de estado de un bloque. */
function statusButton(id) {
  const st = estados.get(id) || "pendiente";
  return `<button class="status" type="button" data-status="${st}" data-toggle="${escapeHtml(id)}"
    aria-label="Estado del bloque: ${STATE_LABEL[st]}. Pulsa para cambiar.">
    <span class="status__dot" aria-hidden="true"></span>
    <span class="status__label">${STATE_LABEL[st]}</span>
  </button>`;
}

/** Una tarjeta de bloque de la escaleta. */
function itemHtml(b, id) {
  const cat = CATS[b.cat] || { label: b.cat, cls: "cat--plenary" };
  const st = estados.get(id) || "pendiente";
  const block = b.block ? `<span class="badge badge--${escapeHtml(b.block)}">${escapeHtml(b.block.toUpperCase())}</span>` : "";
  const note = b.note ? `<p class="agenda-item__note">${escapeHtml(b.note)}</p>` : "";
  const links = b.links?.length
    ? `<div class="agenda-links">${b.links.map(linkHtml).join("")}</div>`
    : "";
  const dur = b.dur ? `<span class="agenda-item__dur">${escapeHtml(b.dur)}</span>` : "";

  return `<article class="agenda-item ${cat.cls}" data-status="${st}">
    <div class="agenda-item__time">
      <span class="agenda-item__hour">${escapeHtml(b.time)}</span>
      ${dur}
      ${statusButton(id)}
    </div>
    <div class="agenda-item__main">
      <div class="agenda-item__head">
        <span class="cat ${cat.cls}">${escapeHtml(cat.label)}</span>
        ${block}
      </div>
      <h3 class="agenda-item__title">${escapeHtml(b.title)}</h3>
      ${note}
      ${links}
    </div>
  </article>`;
}

/** Una columna de día con su lista de bloques. */
function dayHtml(d) {
  const items = d.bloques.map((b, i) => itemHtml(b, `${d.id}-${i}`)).join("");
  return `<div class="day" id="${escapeHtml(d.id)}">
    <header class="day__head">
      <h2 class="day__name">${escapeHtml(d.dia)} <span class="day__franja">${escapeHtml(d.franja)}</span></h2>
      <p class="day__lema">${escapeHtml(d.lema)}</p>
    </header>
    <div class="day__list">${items}</div>
  </div>`;
}

/** Leyenda de tipos de bloque. */
function legendHtml() {
  const keys = ["deck", "tool", "ia", "kahoot", "pitch", "descanso"];
  return `<div class="legend">${keys
    .map((k) => `<span class="cat ${CATS[k].cls}">${escapeHtml(CATS[k].label)}</span>`)
    .join("")}</div>`;
}

/* ------------------------------- Composición ------------------------------- */

const app = document.querySelector("#app");

app.innerHTML = [
  Header({
    variant: "light",
    nav: [
      { label: "Viernes", href: "#viernes" },
      { label: "Sábado", href: "#sabado" },
      { label: "Pitch", href: "tools/pitch.html" },
    ],
  }),

  /* Hero */
  Section({
    variant: "light",
    html: `
      <h1 class="hero__title">Sistemas de Información</h1>
      <p class="hero__subtitle">Del concepto al diagnóstico — Caso Grupo Báltica Sports</p>
      <p style="margin-top:var(--sp-5)"><a class="btn btn--primary" href="decks/intro.html">▶ Abrir apertura inmersiva</a></p>`,
  }),

  /* Banda azul con el gancho del caso */
  Section({
    variant: "blue",
    html: `
      <div class="gancho">
        <p class="gancho__q">¿Por qué crece el negocio pero no la rentabilidad?</p>
        <div class="gancho__kpis">
          ${Kpi({ value: "+14,5 %", label: "Crecimiento de ventas" })}
          ${Kpi({ value: "6,0 % → 2,5 %", label: "Caída del EBITDA" })}
        </div>
      </div>`,
  }),

  /* Escaleta de los 2 días */
  Section({
    variant: "light",
    html: `
      <h2>Escaleta de los 2 días</h2>
      <p class="muted">Cada bloque enlaza a su deck o herramienta. Pulsa el estado para marcar
      <strong>pendiente → en curso → hecho</strong> durante la sesión.</p>
      ${legendHtml()}
      <div class="days" style="margin-top:var(--sp-6)">
        ${DIAS.map(dayHtml).join("")}
      </div>`,
  }),

  /* Footer */
  `<footer class="hub-footer wrap">Sistemas de Información · Executive MBA — ESIC · Caso Grupo Báltica Sports</footer>`,
].join("");

/* --------------------- Interacción: alternar estado --------------------- */
/* Delegación de eventos: un único listener para todos los botones de estado. */
app.addEventListener("click", (e) => {
  const btn = e.target.closest(".status");
  if (!btn) return;
  const id = btn.dataset.toggle;
  const actual = estados.get(id) || "pendiente";
  const siguiente = STATES[(STATES.indexOf(actual) + 1) % STATES.length];
  estados.set(id, siguiente);

  // Actualiza el botón y la tarjeta sin re-renderizar todo (conserva el foco).
  btn.dataset.status = siguiente;
  btn.setAttribute("aria-label", `Estado del bloque: ${STATE_LABEL[siguiente]}. Pulsa para cambiar.`);
  btn.querySelector(".status__label").textContent = STATE_LABEL[siguiente];
  btn.closest(".agenda-item").dataset.status = siguiente;
});
