/* card.js — Tarjeta de contenido (opcionalmente enlazable). */
import { escapeHtml, cx, attrs } from "./_util.js";

/**
 * @param {object} o
 * @param {string} [o.title]     Título de la tarjeta (se renderiza como h3).
 * @param {string} [o.body]      HTML interno (ya seguro) bajo el título.
 * @param {string} [o.href]      Si se pasa, toda la tarjeta es un enlace.
 * @param {boolean} [o.accent]   Filo turquesa superior (detalle gráfico).
 * @param {string} [o.eyebrow]   HTML opcional sobre el título (badge/chip).
 * @param {Record<string,unknown>} [o.extra]
 * @returns {string} HTML
 */
export function Card({ title, body = "", href, accent = false, eyebrow = "", extra = {} } = {}) {
  const cls = cx("card", href && "card--link", accent && "card--accent");
  const tag = href ? "a" : "div";
  const hrefAttr = href ? ` href="${escapeHtml(href)}"` : "";
  const eyebrowHtml = eyebrow ? `<div class="row" style="margin-bottom:var(--sp-3)">${eyebrow}</div>` : "";
  const titleHtml = title ? `<h3 class="card__title">${escapeHtml(title)}</h3>` : "";
  return `<${tag} class="${cls}"${hrefAttr}${attrs(extra)}>
    ${eyebrowHtml}${titleHtml}
    <div class="card__body">${body}</div>
  </${tag}>`;
}
