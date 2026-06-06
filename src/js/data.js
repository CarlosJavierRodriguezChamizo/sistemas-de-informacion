/* =========================================================================
   data.js — Capa de acceso al mapa de sistemas de Grupo Báltica.
   Importa el dataset y expone helpers de consulta/agregación.
   El JSON es la única fuente de verdad; los helpers nunca lo mutan.
   ========================================================================= */
import sistemas from "../data/baltica-sistemas.json";

/** Devuelve TODOS los sistemas (copia superficial, para no mutar el origen). */
export function getSistemas() {
  return sistemas.map((s) => ({ ...s }));
}

/** Sistemas marcados como isla de datos (aislado === true). */
export function getAislados() {
  return getSistemas().filter((s) => s.aislado === true);
}

/**
 * Agrupa por tipo, o filtra por un tipo concreto.
 * @param {string} [tipo]  Si se pasa, devuelve el array de ese tipo (coincidencia exacta).
 * @returns {Object<string, Array>|Array}  Objeto {tipo: [...]} sin argumento; array con argumento.
 */
export function getPorTipo(tipo) {
  const lista = getSistemas();
  if (tipo) return lista.filter((s) => s.tipo === tipo);
  return lista.reduce((acc, s) => {
    (acc[s.tipo] ||= []).push(s);
    return acc;
  }, {});
}

/** Inversión total en sistemas (suma de inversion_k, en miles de €). */
export function inversionTotal() {
  return getSistemas().reduce((sum, s) => sum + s.inversion_k, 0);
}

/**
 * Sistemas que "tocan al cliente": su tipo contiene "CRM".
 * Son seis y ninguno da visión 360 — el "aha" del caso.
 */
export function sistemasCliente() {
  return getSistemas().filter((s) => s.tipo.includes("CRM"));
}

/** Media de incidencias/mes en el conjunto de sistemas. */
export function incidenciasMedia() {
  const lista = getSistemas();
  if (!lista.length) return 0;
  const total = lista.reduce((sum, s) => sum + s.incidencias_mes, 0);
  return total / lista.length;
}

/** Busca un sistema por id (o undefined). */
export function getSistemaById(id) {
  const s = sistemas.find((x) => x.id === id);
  return s ? { ...s } : undefined;
}
