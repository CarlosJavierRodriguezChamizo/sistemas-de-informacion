/* =========================================================================
   styleguide.js — Renderiza TODOS los componentes en fondo claro y azul.
   Herramienta interna de verificación visual (contraste + foco).
   ========================================================================= */
import { Header, Section, Card, Chip, Kpi, Button, Badge } from "../components/index.js";

/* Pequeña ayuda: una galería de ejemplos con título. */
function group(title, html) {
  return `<div style="margin-bottom:var(--sp-7)">
    <h3 style="margin-bottom:var(--sp-4)">${title}</h3>
    <div class="row" style="align-items:flex-start;gap:var(--sp-5)">${html}</div>
  </div>`;
}

/* Conjunto de demos de componentes; se reutiliza en claro y en azul. */
function demos() {
  return `
    ${group("Botones", [
      Button({ label: "Primario", variant: "primary" }),
      Button({ label: "Secundario", variant: "secondary" }),
      Button({ label: "Ghost", variant: "ghost" }),
      Button({ label: "Enlace primario", variant: "primary", href: "#" }),
      Button({ label: "Deshabilitado", variant: "primary", disabled: true }),
    ].join(""))}

    ${group("Chips", [
      Chip({ label: "TPS" }),
      Chip({ label: "MIS" }),
      Chip({ label: "Aislado", variant: "outline" }),
      Chip({ label: "28 inc/mes", icon: "⚠️" }),
    ].join(""))}

    ${group("Badges de bloque", [
      Badge({ block: "m1" }),
      Badge({ block: "m2" }),
      Badge({ block: "m3" }),
      Badge({ block: "m1", label: "M1 · Teoría" }),
    ].join(""))}

    ${group("KPIs", `
      <div class="grid grid--3" style="flex:1 1 100%">
        ${Kpi({ value: "18 M€", label: "Inversión total en sistemas", sub: "12 sistemas mapeados" })}
        ${Kpi({ value: "6", label: "Sistemas que tocan al cliente", sub: "ninguno da visión 360" })}
        ${Kpi({ value: "28", label: "Incidencias/mes del AS/400", sub: "silo crítico" })}
      </div>`)}

    ${group("Tarjetas", `
      <div class="grid grid--3" style="flex:1 1 100%">
        ${Card({
          title: "Card simple",
          body: "<p class='muted'>Texto de cuerpo dentro de una tarjeta estándar.</p>",
        })}
        ${Card({
          title: "Card con filo",
          accent: true,
          eyebrow: Badge({ block: "m2" }),
          body: "<p class='muted'>Detalle gráfico turquesa en el borde superior.</p>",
        })}
        ${Card({
          title: "Card enlazable",
          href: "#",
          eyebrow: Chip({ label: "interactivo" }),
          body: "<p class='muted'>Toda la tarjeta es un enlace (hover + foco).</p>",
        })}
      </div>`)}
  `;
}

const app = document.querySelector("[data-styleguide]");

app.innerHTML = [
  /* Cabecera clara */
  Header({
    variant: "light",
    nav: [
      { label: "Hub", href: "/index.html" },
      { label: "Styleguide", href: "#", current: true },
    ],
    breadcrumb: [
      { label: "Hub", href: "/index.html" },
      { label: "Styleguide", current: true },
    ],
  }),

  /* Intro */
  Section({
    variant: "light",
    html: `
      <h1>Styleguide de componentes</h1>
      <p class="lead">Verificación visual del sistema de diseño en fondo claro y azul:
      contraste correcto y foco visible (navega con Tab).</p>`,
  }),

  /* Demos sobre claro */
  Section({ variant: "light", html: `<h2>Sobre fondo claro</h2>${demos()}` }),

  /* Cabecera azul + demos sobre azul */
  Header({
    variant: "blue",
    nav: [
      { label: "Hub", href: "/index.html" },
      { label: "Styleguide", href: "#", current: true },
    ],
    breadcrumb: [
      { label: "Hub", href: "/index.html" },
      { label: "Styleguide", current: true },
    ],
  }),
  Section({ variant: "blue", html: `<h2>Sobre fondo azul</h2>${demos()}` }),
].join("");
