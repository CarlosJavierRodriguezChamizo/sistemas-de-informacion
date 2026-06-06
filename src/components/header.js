/* header.js — Cabecera con logo (azul/blanco según fondo) + nav/migas.
   El logo se pinta como background-image desde components.css (no como
   <img> con ruta absoluta) para que Vite reescriba la URL de forma relativa
   y funcione offline en cualquier ruta: dominio raíz, subcarpeta o file://.
   Los enlaces "absolutos de app" (/index.html, /tools/…) se vuelven relativos
   con appUrl() para soportar despliegue en subcarpeta (GitHub Pages). */
import { escapeHtml, cx, attrs, appUrl } from "./_util.js";

/** Clase del logo según el fondo (el background-image lo define el CSS). */
const LOGO_CLASS = {
  light: "site-header__logo--blue",   // logo azul sobre fondo claro
  blue: "site-header__logo--white",   // logo blanco sobre fondo azul
};

/**
 * Migas de pan accesibles.
 * @param {Array<{label:string, href?:string, current?:boolean}>} items
 * @returns {string} HTML (<nav> con aria-label)
 */
export function Breadcrumb(items = []) {
  if (!items.length) return "";
  const lis = items
    .map((it) => {
      const label = escapeHtml(it.label);
      if (it.current || !it.href) {
        return `<li><span aria-current="page">${label}</span></li>`;
      }
      return `<li><a href="${escapeHtml(appUrl(it.href))}">${label}</a></li>`;
    })
    .join("");
  return `<nav class="breadcrumb" aria-label="Migas de pan"><ol>${lis}</ol></nav>`;
}

/**
 * Cabecera del sitio.
 * @param {object} o
 * @param {"light"|"blue"} [o.variant="light"]
 * @param {string} [o.brandHref="/index.html"]  Enlace del logo (al hub).
 * @param {Array<{label:string, href:string, current?:boolean}>} [o.nav=[]]
 * @param {Array<{label:string, href?:string, current?:boolean}>} [o.breadcrumb=[]]
 * @param {Record<string,unknown>} [o.extra]
 * @returns {string} HTML (<header>)
 */
export function Header({ variant = "light", brandHref = "/index.html", nav = [], breadcrumb = [], extra = {} } = {}) {
  const cls = cx("site-header", variant === "blue" && "site-header--blue");
  const logoClass = LOGO_CLASS[variant] || LOGO_CLASS.light;

  const navHtml = nav.length
    ? `<nav class="site-header__nav" aria-label="Navegación principal">${nav
        .map((n) =>
          `<a href="${escapeHtml(appUrl(n.href))}"${attrs({ "aria-current": n.current ? "page" : null })}>${escapeHtml(n.label)}</a>`
        )
        .join("")}</nav>`
    : "";

  return `<header class="${cls}"${attrs(extra)}>
    <div class="wrap site-header__inner">
      <div class="site-header__brand">
        <a href="${escapeHtml(appUrl(brandHref))}" aria-label="Ir al hub">
          <span class="site-header__logo ${logoClass}" role="img" aria-label="ESIC"></span>
        </a>
        ${Breadcrumb(breadcrumb)}
      </div>
      ${navHtml}
    </div>
  </header>`;
}
