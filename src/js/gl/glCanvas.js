/* =========================================================================
   glCanvas.js — Motor WebGL mínimo y genérico (sin dependencias).
   Pinta un quad a pantalla completa con el fragment shader que se le pase.

   - WebGL1 (máxima compatibilidad). Uniforms estándar disponibles para
     cualquier shader: u_res, u_time, u_scroll, u_mouse (los no usados se
     ignoran sin error).
   - DPR-aware (cap configurable), se redimensiona solo, pausa en pestaña
     oculta. Respeta prefers-reduced-motion: pinta un único fotograma.
   - API: setScroll(0..1), setMouse(x,y), start(), stop(), destroy(), ok.

   Lo usan tanto la apertura inmersiva (aurora) como los decks (fondo +
   sala de servidores raymarcheada).
   ========================================================================= */

const VERT = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error("Shader compile error: " + log);
  }
  return sh;
}

const NOOP = {
  ok: false,
  setScroll() {}, setMouse() {}, start() {}, stop() {}, destroy() {},
};

/**
 * @param {HTMLCanvasElement} canvas
 * @param {string} frag  Fragment shader (GLSL ES 1.00).
 * @param {{dprCap?:number, paused?:boolean}} [opts]
 */
export function createGL(canvas, frag, opts = {}) {
  const dprCap = opts.dprCap ?? 2;
  const gl =
    canvas.getContext("webgl", { antialias: false, alpha: false, depth: false }) ||
    canvas.getContext("experimental-webgl");

  // Sin WebGL: degradación elegante (CSS pinta el fallback).
  if (!gl) {
    canvas.classList.add("gl--unsupported");
    return NOOP;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error("Program link error: " + gl.getProgramInfoLog(prog));
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  // Localizaciones (las que el shader no use devuelven null → uniform = no-op)
  const U = {
    res: gl.getUniformLocation(prog, "u_res"),
    time: gl.getUniformLocation(prog, "u_time"),
    scroll: gl.getUniformLocation(prog, "u_scroll"),
    mouse: gl.getUniformLocation(prog, "u_mouse"),
  };

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let scroll = 0;
  const mouse = { x: 0.5, y: 0.5 };
  const target = { x: 0.5, y: 0.5 };
  let raf = 0;
  let running = false;
  let t0 = performance.now();

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  function draw(now) {
    const time = reduceMotion ? 0 : (now - t0) / 1000;
    mouse.x += (target.x - mouse.x) * 0.06;
    mouse.y += (target.y - mouse.y) * 0.06;
    gl.uniform2f(U.res, canvas.width, canvas.height);
    gl.uniform1f(U.time, time);
    gl.uniform1f(U.scroll, scroll);
    gl.uniform2f(U.mouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function loop(now) {
    resize();
    draw(now);
    if (running && !reduceMotion) raf = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    t0 = performance.now() - (t0 ? 0 : 0);
    if (reduceMotion) {
      resize();
      draw(performance.now());
      running = false;
    } else {
      raf = requestAnimationFrame(loop);
    }
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  // Al ocultar la pestaña se pausa; al volver se reanuda SOLO si estaba activo
  // (así un canvas detenido a propósito —p.ej. la sala fuera de portada— sigue parado).
  let wasRunning = false;
  const onVisibility = () => {
    if (document.hidden) { wasRunning = running; stop(); }
    else if (wasRunning) { start(); }
  };
  document.addEventListener("visibilitychange", onVisibility);

  const onResize = () => { if (reduceMotion) { resize(); draw(performance.now()); } };
  window.addEventListener("resize", onResize);

  function destroy() {
    stop();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("resize", onResize);
    gl.deleteProgram(prog);
    gl.deleteBuffer(buf);
  }

  if (!opts.paused) start();

  return {
    ok: true,
    setScroll: (v) => { scroll = Math.max(0, Math.min(1, v)); },
    setMouse: (x, y) => { target.x = x; target.y = y; },
    start,
    stop,
    destroy,
  };
}
