/* =========================================================================
   shaderBg.js — Fondo de la apertura inmersiva (aurora caos→orden).
   Fino envoltorio sobre el motor genérico glCanvas + el shader AURORA.
   Conserva la API createShaderBg(canvas) usada por intro.js.
   ========================================================================= */
import { createGL } from "./glCanvas.js";
import { AURORA_FRAG } from "./shaders.js";

/** @param {HTMLCanvasElement} canvas */
export function createShaderBg(canvas) {
  return createGL(canvas, AURORA_FRAG, { dprCap: 2, paused: true });
}
