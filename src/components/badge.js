/* badge.js — Badge de bloque (M1 / M2 / M3) con color propio. */
import { escapeHtml, cx, attrs } from "./_util.js";

/**
 * @param {object} o
 * @param {"m1"|"m2"|"m3"} o.block   Bloque al que pertenece.
 * @param {string} [o.label]         Texto; por defecto el bloque en mayúsculas.
 * @param {Record<string,unknown>} [o.extra]
 * @returns {string} HTML
 */
export function Badge({ block, label, extra = {} } = {}) {
  const key = String(block || "").toLowerCase();
  const text = label ?? key.toUpperCase();
  const cls = cx("badge", ["m1", "m2", "m3"].includes(key) && `badge--${key}`);
  return `<span class="${cls}"${attrs(extra)}>${escapeHtml(text)}</span>`;
}
