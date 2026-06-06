/* kpi.js — KPI grande: número en display + etiqueta. */
import { escapeHtml, attrs } from "./_util.js";

/**
 * @param {object} o
 * @param {string|number} o.value   Número/valor destacado (ej. "18 M€").
 * @param {string} o.label          Etiqueta descriptiva.
 * @param {string} [o.sub]          Línea secundaria opcional.
 * @param {Record<string,unknown>} [o.extra]
 * @returns {string} HTML
 */
export function Kpi({ value, label, sub = "", extra = {} } = {}) {
  const subHtml = sub ? `<span class="kpi__sub">${escapeHtml(sub)}</span>` : "";
  return `<div class="kpi"${attrs(extra)}>
    <span class="kpi__num">${escapeHtml(value)}</span>
    <span class="kpi__label">${escapeHtml(label)}</span>
    ${subHtml}
  </div>`;
}
