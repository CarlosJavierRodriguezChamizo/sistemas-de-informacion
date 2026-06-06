/* =========================================================================
   pitch.js — Sala de pitch: 5 mandatos (jigsaw), temporizador configurable
   y tarjeta del Comité con scoring agregado en memoria + ranking.
   Sin librerías. Estado en memoria (no persiste entre recargas).
   ========================================================================= */
import { Header, Button } from "../components/index.js";
import { escapeHtml } from "../components/_util.js";
import { MANDATOS, CRITERIOS_COMITE, GRUPOS } from "../data/contenido.js";

/* ------------------------------- Estado ---------------------------------- */
/* Grupo i ↔ mandato i (por defecto, editable). Etiqueta = nombre del grupo. */
const grupos = MANDATOS.map((m, i) => ({
  id: m.id,
  label: GRUPOS[i]?.nombre || `Grupo ${m.id}`,
  integrantes: GRUPOS[i]?.integrantes || [],
  mandato: m.titulo,
}));
const votos = []; // {grupoId, claridad, datos, recomendacion, pregunta}

/* ----------------------------- Composición ------------------------------- */
function mandatoHtml(m, i) {
  const g = grupos[i];
  const miembros = g.integrantes.length
    ? `<p class="mandato__miembros">${g.integrantes.map((n) => escapeHtml(n)).join(" · ")}</p>`
    : "";
  return `<article class="mandato">
    <span class="mandato__num">Mandato ${m.id}</span>
    <h3 class="mandato__titulo">${escapeHtml(m.titulo)}</h3>
    <p class="mandato__lema">${escapeHtml(m.lema)}</p>
    <p class="mandato__encargo">${escapeHtml(m.encargo)}</p>
    <ul class="mandato__puntos">${m.puntos.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
    <div class="mandato__foot">
      <span class="mandato__grupo"><label for="grp-${m.id}">Grupo:</label>
        <input id="grp-${m.id}" type="text" value="${escapeHtml(g.label)}" data-grupo="${m.id}" aria-label="Nombre del grupo para ${escapeHtml(m.titulo)}" /></span>
      <a class="mandato__prep" href="${escapeHtml(m.prep.href)}">Preparar → ${escapeHtml(m.prep.label)}</a>
    </div>
    ${miembros}
  </article>`;
}

function ratingHtml(c) {
  const opts = [1, 2, 3, 4, 5]
    .map((n) => `<input type="radio" name="r-${c.id}" id="r-${c.id}-${n}" value="${n}" ${n === 3 ? "checked" : ""} />
       <label for="r-${c.id}-${n}">${n}</label>`)
    .join("");
  return `<fieldset class="rating"><legend>${escapeHtml(c.nombre)}</legend><div class="rating__opts">${opts}</div></fieldset>`;
}

const app = document.querySelector("#app");
app.innerHTML = [
  Header({
    variant: "light",
    breadcrumb: [
      { label: "Hub", href: "/index.html" },
      { label: "Sala de pitch", current: true },
    ],
    nav: [{ label: "Hub", href: "/index.html" }],
  }),

  `<main id="contenido" class="section section--light"><div class="wrap">
    <div class="tool-intro">
      <h1>Sala de pitch</h1>
      <p class="lead">5 grupos, 5 mandatos complementarios. Cada equipo profundiza en una pieza del P1.</p>
    </div>
    <p class="reminder">En clase <strong>dividimos para profundizar</strong>; en vuestro entregable real
    cada equipo cubre <strong>todo el P1</strong>.</p>

    <h2>Mandatos (jigsaw)</h2>
    <div class="mandatos">${MANDATOS.map(mandatoHtml).join("")}</div>
  </div></main>`,

  /* Temporizador */
  `<section class="section section--light"><div class="wrap">
    <h2>Temporizador</h2>
    <div class="timer-card is-pitch" id="timer-card">
      <div class="timer-phase" id="timer-phase">Pitch</div>
      <div class="timer-display" id="timer-display" role="timer" aria-live="off">8:00</div>
      <div class="timer-bar"><div class="timer-bar__fill" id="timer-fill" style="width:100%"></div></div>
      <div class="timer-controls">
        ${Button({ label: "▶ Iniciar", variant: "primary", extra: { id: "t-start" } })}
        ${Button({ label: "Siguiente fase", variant: "secondary", extra: { id: "t-next" } })}
        ${Button({ label: "Reiniciar", variant: "secondary", extra: { id: "t-reset" } })}
      </div>
      <div class="timer-config">
        <label>Pitch <input type="number" id="cfg-pitch" min="1" max="30" value="8" /> min</label>
        <label>Preguntas <input type="number" id="cfg-preg" min="1" max="30" value="4" /> min</label>
        <label class="chk"><input type="checkbox" id="cfg-beep" /> pitido en los avisos</label>
      </div>
    </div>
    <p class="status-live" id="timer-live" role="status" aria-live="assertive" style="text-align:center;margin-top:var(--sp-3)"></p>
  </div></section>`,

  /* Comité */
  `<section class="section section--light"><div class="wrap">
    <h2>Tarjeta del Comité</h2>
    <p class="muted">La audiencia puntúa cada grupo (1–5) y lanza una pregunta incómoda. Se agrega en vivo.</p>
    <div class="comite-board">
      <form class="score-form" id="score-form">
        <label class="field" for="sel-grupo">Grupo evaluado</label>
        <select id="sel-grupo" required>${grupos.map((g) => `<option value="${g.id}">${escapeHtml(g.label)} · ${escapeHtml(g.mandato)}</option>`).join("")}</select>
        <div style="margin-top:var(--sp-4)">${CRITERIOS_COMITE.map(ratingHtml).join("")}</div>
        <label class="field" for="pregunta">1 pregunta incómoda</label>
        <textarea id="pregunta" placeholder="¿Qué le preguntaría el Comité a este grupo?"></textarea>
        <div style="margin-top:var(--sp-4)">${Button({ label: "Guardar puntuación", variant: "primary", extra: { id: "t-submit", type: "submit" } })}</div>
        <p class="status-live" id="score-live" role="status" aria-live="polite"></p>
      </form>

      <div class="ranking" aria-live="polite">
        <h3>Ranking (en vivo)</h3>
        <div id="ranking-body"></div>
        <div class="preguntas-list" id="preguntas-body"></div>
      </div>
    </div>
  </div></section>`,
].join("");

/* =========================================================================
   TEMPORIZADOR
   ========================================================================= */
const cfg = { pitch: 8, preguntas: 4, beep: false };
const T = { phase: "idle", remaining: cfg.pitch * 60, running: false, lastTs: 0, warned: false };

const $ = (s) => document.querySelector(s);
const card = $("#timer-card");
const disp = $("#timer-display");

function fmt(sec) {
  sec = Math.max(0, Math.ceil(sec));
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}
function totalDe(phase) {
  return (phase === "preguntas" ? cfg.preguntas : cfg.pitch) * 60;
}
function tLive(msg) { $("#timer-live").textContent = msg; }

function pintarTimer() {
  disp.textContent = fmt(T.remaining);
  const total = T.phase === "idle" ? cfg.pitch * 60 : totalDe(T.phase);
  const pct = total ? Math.max(0, Math.min(100, (T.remaining / total) * 100)) : 0;
  $("#timer-fill").style.width = `${pct}%`;
  $("#timer-phase").textContent =
    T.phase === "preguntas" ? "Preguntas" : T.phase === "done" ? "Tiempo" : "Pitch";

  const warn = T.remaining <= 60 && T.phase !== "done" && T.phase !== "idle";
  card.classList.toggle("is-pitch", T.phase === "pitch" && !warn);
  card.classList.toggle("is-preguntas", T.phase === "preguntas" && !warn);
  card.classList.toggle("is-warn", warn);
  card.classList.toggle("is-done", T.phase === "done");
  $("#t-start").textContent = T.running ? "⏸ Pausar" : (T.phase === "idle" || T.phase === "done") ? "▶ Iniciar" : "▶ Reanudar";
}

function iniciarFase(phase) {
  T.phase = phase;
  T.remaining = totalDe(phase);
  T.warned = false;
}

function startPause() {
  if (T.phase === "idle" || T.phase === "done") {
    iniciarFase("pitch");
    T.running = true;
    T.lastTs = performance.now();
    tLive("Empieza el pitch.");
  } else {
    T.running = !T.running;
    if (T.running) T.lastTs = performance.now();
    tLive(T.running ? "Reanudado." : "En pausa.");
  }
  pintarTimer();
}

function siguienteFase() {
  if (T.phase === "pitch" || T.phase === "idle") {
    iniciarFase("preguntas");
    tLive("Turno de preguntas.");
  } else {
    T.phase = "done";
    T.remaining = 0;
    T.running = false;
    tLive("Fin del turno.");
  }
  pintarTimer();
}

function reiniciar() {
  T.phase = "idle";
  T.remaining = cfg.pitch * 60;
  T.running = false;
  T.warned = false;
  tLive("Temporizador reiniciado.");
  pintarTimer();
}

/* Tic robusto: mide el tiempo real transcurrido para no acumular deriva. */
setInterval(() => {
  const now = performance.now();
  if (!T.running) { T.lastTs = now; return; }
  const delta = (now - T.lastTs) / 1000;
  T.lastTs = now;
  T.remaining -= delta;

  if (T.remaining <= 60 && !T.warned && T.phase !== "done") {
    T.warned = true;
    tLive("¡Falta 1 minuto!");
    beep(1);
  }
  if (T.remaining <= 0) {
    if (T.phase === "pitch") {
      iniciarFase("preguntas");
      tLive("Tiempo de pitch agotado. Turno de preguntas.");
      beep(1);
    } else {
      T.phase = "done";
      T.remaining = 0;
      T.running = false;
      tLive("Tiempo agotado.");
      beep(2);
    }
  }
  pintarTimer();
}, 200);

/* Pitido suave opcional (Web Audio), desactivado por defecto. */
let audioCtx;
function beep(times) {
  if (!cfg.beep) return;
  try {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < times; i++) {
      const t = audioCtx.currentTime + i * 0.22;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.05, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t); osc.stop(t + 0.18);
    }
  } catch { /* sin audio: degradación silenciosa */ }
}

$("#t-start").addEventListener("click", startPause);
$("#t-next").addEventListener("click", siguienteFase);
$("#t-reset").addEventListener("click", reiniciar);
$("#cfg-pitch").addEventListener("change", (e) => {
  cfg.pitch = Math.min(30, Math.max(1, Number(e.target.value) || 8));
  e.target.value = cfg.pitch;
  if (T.phase === "idle") { T.remaining = cfg.pitch * 60; pintarTimer(); }
});
$("#cfg-preg").addEventListener("change", (e) => {
  cfg.preguntas = Math.min(30, Math.max(1, Number(e.target.value) || 4));
  e.target.value = cfg.preguntas;
});
$("#cfg-beep").addEventListener("change", (e) => { cfg.beep = e.target.checked; });

pintarTimer();

/* =========================================================================
   MANDATOS: edición de etiqueta de grupo
   ========================================================================= */
app.addEventListener("input", (e) => {
  const id = e.target.dataset.grupo;
  if (!id) return;
  const g = grupos.find((x) => x.id === Number(id));
  g.label = e.target.value.trim() || `Grupo ${id}`;
  // refresca opciones del selector y ranking conservando selección
  const sel = $("#sel-grupo");
  const prev = sel.value;
  sel.innerHTML = grupos.map((gr) => `<option value="${gr.id}">${escapeHtml(gr.label)} · ${escapeHtml(gr.mandato)}</option>`).join("");
  sel.value = prev;
  renderRanking();
});

/* =========================================================================
   COMITÉ: guardar puntuación + ranking
   ========================================================================= */
$("#score-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const grupoId = Number($("#sel-grupo").value);
  const get = (id) => Number(document.querySelector(`input[name="r-${id}"]:checked`)?.value || 0);
  const voto = {
    grupoId,
    claridad: get("claridad"),
    datos: get("datos"),
    recomendacion: get("recomendacion"),
    pregunta: $("#pregunta").value.trim(),
  };
  votos.push(voto);
  const g = grupos.find((x) => x.id === grupoId);
  $("#score-live").textContent = `Guardada la puntuación de ${g.label}. Total de votos: ${votos.length}.`;
  // reset suave del formulario (vuelve a 3 y limpia la pregunta)
  CRITERIOS_COMITE.forEach((c) => { document.getElementById(`r-${c.id}-3`).checked = true; });
  $("#pregunta").value = "";
  renderRanking();
});

function renderRanking() {
  const body = $("#ranking-body");
  if (!votos.length) { body.innerHTML = `<p class="rk-empty">Aún no hay votos. El ranking aparecerá aquí.</p>`; return; }

  const agg = grupos.map((g) => {
    const v = votos.filter((x) => x.grupoId === g.id);
    const sumaTotal = v.reduce((s, x) => s + x.claridad + x.datos + x.recomendacion, 0);
    const media = v.length ? sumaTotal / v.length : 0; // media del total (sobre 15)
    return { ...g, votos: v.length, media };
  }).filter((g) => g.votos > 0)
    .sort((a, b) => b.media - a.media);

  body.innerHTML = `<ol>${agg.map((g) => `
    <li>
      <span class="rk-name">${escapeHtml(g.label)}<small>${escapeHtml(g.mandato)}</small></span>
      <span class="rk-score">${g.media.toFixed(1)}<small> / 15 · ${g.votos} voto(s)</small></span>
    </li>`).join("")}</ol>`;

  // Preguntas incómodas agrupadas
  const conPreg = grupos.map((g) => ({
    label: g.label,
    preguntas: votos.filter((x) => x.grupoId === g.id && x.pregunta).map((x) => x.pregunta),
  })).filter((g) => g.preguntas.length);

  $("#preguntas-body").innerHTML = conPreg.length
    ? `<details class="preguntas-list"><summary>Preguntas incómodas (${conPreg.reduce((s, g) => s + g.preguntas.length, 0)})</summary>
        ${conPreg.map((g) => `<p style="margin:.4em 0 0"><strong>${escapeHtml(g.label)}</strong></p>
          <ul>${g.preguntas.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>`).join("")}</details>`
    : "";
}

renderRanking();
