/* =========================================================================
   _util.js — Utilidades compartidas por los componentes.
   Los componentes son funciones puras que devuelven strings de HTML.
   ========================================================================= */

/**
 * Prefijo relativo a la raíz del sitio según la profundidad de la página:
 * "" en la raíz (index.html) y "../" en /decks/ o /tools/. Hace que los
 * enlaces internos funcionen igual servidos desde la raíz de un dominio,
 * desde una subcarpeta (GitHub Pages de proyecto) o abriendo el HTML en local.
 */
export const APP_BASE = /\/(decks|tools)\//.test(location.pathname) ? "../" : "";

/**
 * Convierte un enlace interno "absoluto de app" ("/tools/x.html") en relativo
 * según APP_BASE. Deja intactos anclas (#…), externos (http…) y los ya relativos.
 * @param {string} href
 * @returns {string}
 */
export function appUrl(href) {
  if (!href) return href;
  if (/^([a-z]+:|#|\/\/)/i.test(href)) return href; // http:, mailto:, #ancla, //host
  if (href.startsWith("/")) return APP_BASE + href.slice(1);
  return href; // ya es relativo
}

/**
 * Escapa texto para insertarlo de forma segura en HTML.
 * Úsalo SIEMPRE con cualquier dato que provenga de fuera (datasets, input).
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Une nombres de clase ignorando valores vacíos/falsy.
 * @param {...(string|false|null|undefined)} parts
 * @returns {string}
 */
export function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Convierte un objeto de atributos en una cadena HTML segura.
 * Claves con valor null/undefined/false se omiten; true => atributo booleano.
 * @param {Record<string, unknown>} attrs
 * @returns {string}
 */
export function attrs(attrs = {}) {
  return Object.entries(attrs)
    .filter(([, v]) => v !== null && v !== undefined && v !== false)
    .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${escapeHtml(v)}"`))
    .join("");
}
