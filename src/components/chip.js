/* chip.js — Etiqueta breve (chip) con fondo turquesa o contorno. */
import { escapeHtml, cx, attrs } from "./_util.js";

/**
 * @param {object} o
 * @param {string} o.label
 * @param {"solid"|"outline"} [o.variant="solid"]
 * @param {string} [o.icon]   HTML/emoji opcional antes del texto.
 * @param {Record<string,unknown>} [o.extra]
 * @returns {string} HTML
 */
export function Chip({ label, variant = "solid", icon = "", extra = {} } = {}) {
  const cls = cx("chip", variant === "outline" && "chip--outline");
  const ico = icon ? `<span aria-hidden="true">${icon}</span>` : "";
  return `<span class="${cls}"${attrs(extra)}>${ico}${escapeHtml(label)}</span>`;
}
