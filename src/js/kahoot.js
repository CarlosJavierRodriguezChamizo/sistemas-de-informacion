/* =========================================================================
   kahoot.js — Enlaces a los 2 Kahoots. El profesor pega URL y PIN en vivo.
   Las preguntas/respuestas viven en Kahoot!, no en este proyecto.
   ========================================================================= */
import { Header } from "../components/index.js";
import { escapeHtml } from "../components/_util.js";
import { KAHOOTS } from "../data/contenido.js";

function cardHtml(k) {
  return `<article class="kcard">
    <span class="kcard__when">${escapeHtml(k.momento)}</span>
    <h2 class="kcard__title">${escapeHtml(k.titulo)}</h2>
    <p class="kcard__valida"><strong>Valida:</strong> ${escapeHtml(k.valida)}</p>

    <div class="kfield">
      <label for="url-${k.id}">URL / enlace de juego</label>
      <input id="url-${k.id}" type="url" inputmode="url" data-url="${k.id}"
        placeholder="https://kahoot.it/…" value="${escapeHtml(k.url)}" />
    </div>
    <div class="kfield">
      <label for="pin-${k.id}">PIN de la partida</label>
      <input id="pin-${k.id}" type="text" inputmode="numeric" data-pin="${k.id}"
        placeholder="123456" value="${escapeHtml(k.pin)}" />
    </div>
    <p class="kpin" id="pinshow-${k.id}" aria-live="polite" hidden></p>

    <a class="kcard__open" id="open-${k.id}" data-open="${k.id}" href="#"
       target="_blank" rel="noopener" aria-disabled="true">▶ Abrir ${escapeHtml(k.titulo)}</a>
  </article>`;
}

const app = document.querySelector("#app");
app.innerHTML = [
  Header({
    variant: "light",
    breadcrumb: [
      { label: "Hub", href: "/index.html" },
      { label: "Kahoots", current: true },
    ],
    nav: [{ label: "Hub", href: "/index.html" }],
  }),
  `<main id="contenido" class="section section--light"><div class="wrap">
    <div class="tool-intro">
      <h1>Kahoots</h1>
      <p class="lead">Pega aquí la URL y el PIN de cada partida; el botón abrirá Kahoot! en una pestaña nueva.
      El PIN grande se proyecta para que los alumnos se unan.</p>
    </div>
    <div class="kahoots">${KAHOOTS.map(cardHtml).join("")}</div>
  </div></main>`,
].join("");

/* --------------------------- Estado de enlaces --------------------------- */
function syncCard(k) {
  const url = document.querySelector(`[data-url="${k.id}"]`).value.trim();
  const pin = document.querySelector(`[data-pin="${k.id}"]`).value.trim();
  const open = document.querySelector(`[data-open="${k.id}"]`);
  open.href = url || "#";
  open.setAttribute("aria-disabled", url ? "false" : "true");

  const pinShow = document.querySelector(`#pinshow-${k.id}`);
  if (pin) { pinShow.textContent = `PIN ${pin}`; pinShow.hidden = false; }
  else { pinShow.hidden = true; pinShow.textContent = ""; }
}
KAHOOTS.forEach(syncCard);

app.addEventListener("input", (e) => {
  const id = e.target.dataset.url || e.target.dataset.pin;
  if (id) syncCard(KAHOOTS.find((k) => k.id === id));
});

/* Evita navegar a "#" si no hay URL */
app.addEventListener("click", (e) => {
  const open = e.target.closest("[data-open]");
  if (open && open.getAttribute("aria-disabled") === "true") e.preventDefault();
});
