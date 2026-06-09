/* =========================================================================
   migrar-integrar.js — Práctica M3: scorer del trade-off del AS/400.
   Sliders 1–5 con peso editable → dos índices (integrar / migrar) y un
   texto de recomendación orientativo generado a partir de los pesos.
   NO hay "respuesta correcta" en el proyecto: se evalúa la justificación.
   ========================================================================= */
import { Header, Button } from "../components/index.js";
import { escapeHtml } from "../components/_util.js";
import { getSistemaById } from "./data.js";

/* Cada criterio empuja hacia INTEGRAR (corto plazo) o MIGRAR (medio plazo).
   La polaridad es un modelo transparente y discutible, no una clave. */
const CRITERIOS = [
  { id: "criticidad", nombre: "Criticidad del dato", hint: "¿Cómo de crítico es el dato que guarda?", lado: "integrar" },
  { id: "frecuencia", nombre: "Frecuencia de cambio del sistema", hint: "¿Necesita cambios o nuevas funciones a menudo?", lado: "migrar" },
  { id: "coste", nombre: "Coste de migración", hint: "¿Cómo de caro sería reemplazarlo?", lado: "integrar" },
  { id: "riesgo", nombre: "Riesgo operativo de tocarlo", hint: "¿Qué riesgo hay si lo intervienes?", lado: "integrar" },
  { id: "vida", nombre: "Vida útil esperada", hint: "¿Cuántos años más seguirá siendo útil?", lado: "integrar" },
  { id: "apis", nombre: "Disponibilidad de APIs/conectores", hint: "¿Existen formas de conectarlo?", lado: "integrar" },
  { id: "deuda", nombre: "Deuda técnica", hint: "¿Cómo de obsoleto/enredado está por dentro?", lado: "migrar" },
  { id: "skills", nombre: "Escasez de skills (RPG/AS400)", hint: "¿Cómo de difícil es encontrar quien lo mantenga?", lado: "migrar" },
  { id: "crecimiento", nombre: "Crecimiento del negocio B2B", hint: "¿Cuánto crece el negocio que depende de él?", lado: "migrar" },
];
const LADO_TXT = { integrar: "Integrar", migrar: "Migrar" };

/* Estado en memoria (valores y pesos por criterio). Arranque neutral. */
const state = {
  value: Object.fromEntries(CRITERIOS.map((c) => [c.id, 3])),
  weight: Object.fromEntries(CRITERIOS.map((c) => [c.id, 3])),
};

/* ------------------------------- Cálculo --------------------------------- */
function computar() {
  let intS = 0, intM = 0, migS = 0, migM = 0;
  for (const c of CRITERIOS) {
    const v = state.value[c.id], w = state.weight[c.id];
    if (c.lado === "integrar") { intS += v * w; intM += 5 * w; }
    else { migS += v * w; migM += 5 * w; }
  }
  return {
    integrar: intM ? Math.round((intS / intM) * 100) : 0,
    migrar: migM ? Math.round((migS / migM) * 100) : 0,
  };
}

/* Texto de recomendación generado a partir de pesos y diferencia. */
function recomendacion({ integrar, migrar }) {
  const diff = integrar - migrar;
  const pesos = CRITERIOS.map((c) => state.weight[c.id]);
  const todosIgual = pesos.every((w) => w === pesos[0]);
  const top = [...CRITERIOS].sort((a, b) => state.weight[b.id] - state.weight[a.id])[0];
  const pesoFrase = todosIgual
    ? "Todos los criterios pesan igual."
    : `El criterio al que más peso has dado es «${top.nombre}» (peso ${state.weight[top.id]}), que empuja hacia ${LADO_TXT[top.lado].toLowerCase()}.`;

  if (Math.abs(diff) < 6) {
    return {
      clase: "equilibrio", tag: "Empate técnico — decide la justificación",
      texto: `Integrar ${integrar}% vs migrar ${migrar}%: están muy igualados. ${pesoFrase} ` +
        `Aquí el número no decide: lo que se evalúa es cómo lo argumentas: cuánto cuesta, qué ganas y qué puede salir mal.`,
    };
  }
  if (diff > 0) {
    return {
      clase: "integrar", tag: "Se inclina a INTEGRAR (corto plazo)",
      texto: `Integrar ${integrar}% frente a migrar ${migrar}%. La balanza sugiere envolver el AS/400 con APIs ` +
        `y posponer el reemplazo. ${pesoFrase} Recuerda: integrar resuelve el acceso al dato ya, pero no la deuda de fondo.`,
    };
  }
  return {
    clase: "migrar", tag: "Se inclina a MIGRAR / REEMPLAZAR (medio plazo)",
    texto: `Migrar ${migrar}% frente a integrar ${integrar}%. La balanza sugiere planificar la sustitución del AS/400. ` +
      `${pesoFrase} Recuerda: migrar es más caro y arriesgado a corto, pero elimina el silo de raíz.`,
  };
}

/* ------------------------------- Render ---------------------------------- */
function critRowHtml(c) {
  return `<div class="crit-row">
    <div class="crit-name">${escapeHtml(c.nombre)}
      <small>${escapeHtml(c.hint)}</small>
      <span class="side side--${c.lado}">↗ ${LADO_TXT[c.lado]}</span>
    </div>
    <div class="val">
      <input type="range" min="1" max="5" step="1" value="${state.value[c.id]}"
        data-value="${c.id}" aria-label="${escapeHtml(c.nombre)}: valor de 1 a 5" />
      <output data-out="${c.id}">${state.value[c.id]}</output>
    </div>
    <label class="weight">peso
      <input type="number" min="1" max="5" step="1" value="${state.weight[c.id]}"
        data-weight="${c.id}" aria-label="${escapeHtml(c.nombre)}: peso de 1 a 5" />
    </label>
  </div>`;
}

const app = document.querySelector("#app");
const s8 = getSistemaById(8);

app.innerHTML = [
  Header({
    variant: "light",
    breadcrumb: [
      { label: "Hub", href: "/index.html" },
      { label: "Migrar o integrar (AS/400)", current: true },
    ],
    nav: [{ label: "Hub", href: "/index.html" }, { label: "Volver a M3", href: "/decks/m3.html" }],
  }),
  `<main id="contenido" class="section section--light"><div class="wrap">
    <div class="tool-intro">
      <h1>¿Migrar o integrar el AS/400?</h1>
      <p class="lead">Decidir es responder a tres preguntas: <strong>¿cuánto me cuesta?</strong>,
      <strong>¿qué gano?</strong> y <strong>¿qué puede salir mal?</strong> Ajusta cada criterio (1–5)
      y su peso; el componente recalcula en vivo una recomendación <strong>orientativa</strong>.</p>
    </div>

    <div class="toolbar">
      ${Button({ label: "Reiniciar valores", variant: "secondary", extra: { id: "btn-reset" } })}
      <span class="toolbar__spacer"></span>
      <span class="status-live" id="status-live" role="status" aria-live="polite"></span>
    </div>

    <div class="mi-board">
      <div>
        <div class="ctx">
          <h3>Contexto del sistema (AS/400 Legacy)</h3>
          <dl class="ctx__grid">
            <dt>Año</dt><dd>${s8.anio}</dd>
            <dt>Tipo</dt><dd>${escapeHtml(s8.tipo)}</dd>
            <dt>Inversión</dt><dd>${s8.inversion_k} k€</dd>
            <dt>Incidencias</dt><dd>${s8.incidencias_mes} / mes</dd>
            <dt>Integrado</dt><dd>${escapeHtml(s8.integrado_norm)} · <strong style="color:#b01e1e">aislado</strong></dd>
          </dl>
          <p class="ctx__nota">${escapeHtml(s8.nota)}</p>
        </div>

        <h2 style="margin-top:var(--sp-5)">Criterios para decidir</h2>
        <div class="crit">${CRITERIOS.map(critRowHtml).join("")}</div>
      </div>

      <aside class="result" aria-live="polite">
        <div class="gauge gauge--integrar" id="g-integrar">
          <div class="gauge__label"><b>Conviene integrar</b><span class="gauge__pct" id="pct-integrar">0%</span></div>
          <div class="gauge__track"><div class="gauge__fill" id="fill-integrar" style="width:0%"></div></div>
          <span class="gauge__plazo">corto plazo · envolver con APIs</span>
        </div>
        <div class="gauge gauge--migrar" id="g-migrar">
          <div class="gauge__label"><b>Conviene migrar / reemplazar</b><span class="gauge__pct" id="pct-migrar">0%</span></div>
          <div class="gauge__track"><div class="gauge__fill" id="fill-migrar" style="width:0%"></div></div>
          <span class="gauge__plazo">medio plazo · sustituir el sistema</span>
        </div>
        <div class="reco" id="reco">
          <p class="reco__tag" id="reco-tag"></p>
          <p id="reco-text"></p>
        </div>
      </aside>
    </div>

    <p class="didactic"><strong>Nota:</strong> no hay respuesta única. Lo que se evalúa es tu
    <strong>justificación</strong> —cuánto cuesta, qué ganas y qué puede salir mal—, no el número que salga.</p>
  </div></main>`,
].join("");

/* ------------------------------ Actualizar ------------------------------- */
const $ = (s) => document.querySelector(s);
function actualizar() {
  const res = computar();
  $("#pct-integrar").textContent = `${res.integrar}%`;
  $("#pct-migrar").textContent = `${res.migrar}%`;
  $("#fill-integrar").style.width = `${res.integrar}%`;
  $("#fill-migrar").style.width = `${res.migrar}%`;

  const r = recomendacion(res);
  const reco = $("#reco");
  reco.className = `reco reco--${r.clase}`;
  $("#reco-tag").textContent = r.tag;
  $("#reco-text").textContent = r.texto;

  // Resalta el índice recomendado (o ninguno si empate)
  $("#g-integrar").classList.toggle("is-rec", r.clase === "integrar");
  $("#g-migrar").classList.toggle("is-rec", r.clase === "migrar");
}

/* ------------------------------- Eventos --------------------------------- */
app.addEventListener("input", (e) => {
  const vId = e.target.dataset.value;
  const wId = e.target.dataset.weight;
  if (vId) {
    state.value[vId] = Number(e.target.value);
    document.querySelector(`[data-out="${vId}"]`).textContent = e.target.value;
    actualizar();
  } else if (wId) {
    let w = Number(e.target.value);
    if (Number.isNaN(w)) return;
    w = Math.min(5, Math.max(1, w));
    state.weight[wId] = w;
    actualizar();
  }
});

$("#btn-reset").addEventListener("click", () => {
  CRITERIOS.forEach((c) => { state.value[c.id] = 3; state.weight[c.id] = 3; });
  document.querySelectorAll("[data-value]").forEach((el) => { el.value = 3; document.querySelector(`[data-out="${el.dataset.value}"]`).textContent = "3"; });
  document.querySelectorAll("[data-weight]").forEach((el) => { el.value = 3; });
  actualizar();
  $("#status-live").textContent = "Valores reiniciados a neutral (3).";
});

/* Cálculo inicial */
actualizar();
