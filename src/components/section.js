/* section.js — Sección full-bleed con variante clara / azul. */
import { cx, attrs } from "./_util.js";

/**
 * @param {object} o
 * @param {string} o.html                  Contenido interno (HTML ya seguro).
 * @param {"light"|"blue"} [o.variant="light"]
 * @param {boolean} [o.wrap=true]          Envolver el contenido en .wrap (centrado a --maxw).
 * @param {string} [o.id]
 * @param {Record<string,unknown>} [o.extra]
 * @returns {string} HTML
 */
export function Section({ html = "", variant = "light", wrap = true, id, extra = {} } = {}) {
  const cls = cx("section", `section--${variant}`);
  const inner = wrap ? `<div class="wrap">${html}</div>` : html;
  return `<section class="${cls}"${attrs({ id, ...extra })}>${inner}</section>`;
}
