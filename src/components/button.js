/* button.js — Botón reutilizable (primario / secundario / ghost). */
import { escapeHtml, cx, attrs } from "./_util.js";

/**
 * @param {object} o
 * @param {string} o.label        Texto del botón.
 * @param {string} [o.href]       Si se pasa, renderiza <a>; si no, <button>.
 * @param {"primary"|"secondary"|"ghost"} [o.variant="primary"]
 * @param {"button"|"submit"} [o.type="button"]  Solo para <button>.
 * @param {boolean} [o.disabled=false]
 * @param {Record<string,unknown>} [o.extra]     Atributos extra (id, data-*, aria-*).
 * @returns {string} HTML
 */
export function Button({ label, href, variant = "primary", type = "button", disabled = false, extra = {} } = {}) {
  const cls = cx("btn", `btn--${variant}`);
  if (href) {
    return `<a class="${cls}" href="${escapeHtml(href)}"${attrs({ "aria-disabled": disabled || null, ...extra })}>${escapeHtml(label)}</a>`;
  }
  return `<button class="${cls}" type="${escapeHtml(type)}"${attrs({ disabled, ...extra })}>${escapeHtml(label)}</button>`;
}
