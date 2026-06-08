/* =========================================================================
   intro.js — Apertura inmersiva de la sesión.
   Lenis (scroll suave) + fondo shader WebGL que pasa del caos (silos) al
   orden (visión 360) según el progreso de scroll. El texto se revela al
   entrar en el viewport. Todo offline: Lenis vía npm, shader en WebGL puro.
   ========================================================================= */
import Lenis from "lenis";
import { createShaderBg } from "./gl/shaderBg.js";
import { appUrl } from "../components/_util.js";

/* --------------------------- Puerta de acceso ---------------------------- */
// Disuasorio del lado del cliente (sitio estático): evita que los alumnos se
// adelanten, NO es seguridad real. Para cambiar la clave, genera el SHA-256:
//   node -e "console.log(require('crypto').createHash('sha256').update('TU_CLAVE').digest('hex'))"
const AUTH_KEY = "baltica-acceso";
const AUTH_HASH = "2287f05a660060d81f01c0bfb3064cb145e9613c3726ab12b1e21c3da2d12a89"; // = SHA-256("baltica2026")
const autenticado = (() => { try { return sessionStorage.getItem(AUTH_KEY) === "ok"; } catch { return false; } })();

async function sha256hex(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* --------------------------- Contenido (narrativa) ----------------------- */
// Cada paso es un "acto" a pantalla completa. La copia ancla el shader al caso.
const STEPS = [
  {
    kicker: "El crecimiento que no se puede sostener",
    h: "12 sistemas.<br>18 M€.<br>Y nadie ve al cliente entero.",
    p: "Grupo Báltica vende más que nunca. Su margen, en cambio, se desploma. El problema no está en el mercado: está dentro.",
  },
  {
    kicker: "Silos",
    h: "Cada sistema guarda<br>una parte de la verdad.",
    p: "CRM, e-commerce, fidelización, servicio, almacén, finanzas… Doce piezas que casi nunca se hablan entre sí.",
  },
  {
    kicker: "El dato existe",
    h: "Lo que falta<br>no es <em>más</em> información.",
    p: "El AS/400, la app y el sistema de tickets encierran el dato más valioso del cliente. ¿Dónde está entonces el problema?",
  },
  {
    kicker: "El punto de inflexión",
    h: "De los silos<br>a la visión 360.",
    p: "Cuando los sistemas se conectan, el caos se ordena. La empresa por fin ve a su cliente completo… y decide con él delante.",
  },
];

/* ------------------------------- Render DOM ------------------------------ */
const app = document.querySelector("#app");

const stepHtml = (st, i) => `
  <section class="act" data-i="${i}">
    <div class="act__inner reveal">
      <span class="act__kicker">${st.kicker}</span>
      <h2 class="act__h">${st.h}</h2>
      <p class="act__p">${st.p}</p>
    </div>
  </section>`;

app.innerHTML = `
  <header class="intro-top">
    <img class="intro-logo" src="${appUrl("/assets/logo_ESIC_blanco.svg")}" alt="ESIC" />
    <a class="intro-skip" href="#acceso">Acceso ↓</a>
  </header>

  <section class="hero">
    <div class="hero__inner reveal is-in">
      <span class="hero__eyebrow">Executive MBA · ESIC</span>
      <h1 class="hero__title">Sistemas de<br>Información</h1>
      <p class="hero__sub">Dos días para ver cómo los datos y los sistemas deciden la estrategia — y llevarlo a la práctica. En clase trabajaremos y desarrollaremos el <strong>Caso Grupo Báltica Sports</strong>: el crecimiento que no se puede sostener.</p>
    </div>
    <div class="hero__scrollhint" aria-hidden="true">
      <span>Desplázate</span>
      <svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 4v14M6 12l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
  </section>

  ${STEPS.map(stepHtml).join("")}

  <section class="profe" id="profe">
    <div class="profe__card reveal">
      <div class="profe__photo" data-ini="CC">
        <img src="${appUrl("/assets/carlos-chamizo.png")}" alt="Carlos Chamizo" loading="lazy"
          onerror="this.onerror=null; if(/\\.png(\\?|$)/.test(this.src)){this.src=this.src.replace('.png','.jpg'); this.onerror=function(){this.remove();};} else {this.remove();}" />
      </div>
      <div class="profe__body">
        <span class="act__kicker">Tu profesor</span>
        <h2 class="profe__name">Carlos Chamizo</h2>
        <p class="profe__role">Consultor digital</p>
        <p class="profe__bio">Consultor digital. Entiendo los <strong>procesos</strong>, la <strong>tecnología</strong> y las <strong>personas</strong>, y los conecto para que las empresas decidan mejor. Esta sesión será muy <strong>práctica</strong>: del caso real a la decisión.</p>
        <div class="profe__tags"><span>Procesos</span><span>Tecnología</span><span>Personas</span></div>
        <a class="profe__link" href="https://www.linkedin.com/in/carloschamizo/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
      </div>
    </div>
  </section>

  <section class="gate" id="acceso">
    <div class="gate__inner reveal">
      <span class="act__kicker">Material reservado</span>
      <h2 class="closing__h">El aula,<br>a partir de aquí.</h2>
      ${autenticado
        ? `<p class="gate__msg">Ya tienes acceso en esta sesión.</p>
           <nav class="closing__cta"><a class="ibtn ibtn--primary" href="${appUrl("/index.html")}">Entrar al hub</a></nav>`
        : `<p class="gate__msg">El contenido del curso está protegido. Introduce la clave que te daré en clase.</p>
           <form class="gate__form" id="gate-form" autocomplete="off">
             <input class="gate__input" id="gate-pass" type="password" placeholder="Clave de acceso" aria-label="Clave de acceso" />
             <button class="ibtn ibtn--primary" type="submit">Entrar</button>
           </form>
           <p class="gate__error" id="gate-error" role="alert" hidden>Clave incorrecta. Inténtalo de nuevo.</p>`}
    </div>
  </section>
`;

/* ------------------------------ Fondo shader ----------------------------- */
const bg = createShaderBg(document.querySelector("#gl"));
bg.start();

// Parallax sutil del shader con el ratón
window.addEventListener(
  "pointermove",
  (e) => bg.setMouse(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight),
  { passive: true }
);

/* --------------------------- Scroll suave (Lenis) ------------------------ */
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reduceMotion) {
  // Sin scroll inercial: el progreso lo da el scroll nativo.
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bg.setScroll(max > 0 ? window.scrollY / max : 0);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
} else {
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  lenis.on("scroll", ({ scroll, limit }) => {
    bg.setScroll(limit > 0 ? scroll / limit : 0);
  });
  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // Los enlaces ancla (#cierre) usan el scroll suave de Lenis
  app.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const el = document.querySelector(a.getAttribute("href"));
      if (el) { e.preventDefault(); lenis.scrollTo(el); }
    });
  });
}

/* --------------------------- Revelado del texto -------------------------- */
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }),
  { threshold: 0.35 }
);
app.querySelectorAll(".reveal:not(.is-in)").forEach((el) => io.observe(el));

/* --------------------------- Validación de la clave ---------------------- */
const gateForm = document.querySelector("#gate-form");
if (gateForm) {
  gateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.querySelector("#gate-pass");
    const error = document.querySelector("#gate-error");
    const ok = (await sha256hex(input.value.trim())) === AUTH_HASH;
    if (ok) {
      try { sessionStorage.setItem(AUTH_KEY, "ok"); } catch { /* sin storage: igualmente navega */ }
      window.location.href = appUrl("/index.html");
    } else {
      error.hidden = false;
      input.value = "";
      input.focus();
    }
  });
}
