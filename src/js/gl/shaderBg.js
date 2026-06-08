/* =========================================================================
   shaderBg.js — Motor WebGL mínimo (sin dependencias) para un fondo a
   pantalla completa pintado por un fragment shader GLSL.

   - WebGL1 (máxima compatibilidad), un único quad a pantalla completa.
   - DPR-aware (cap a 2), se redimensiona solo, pausa en pestaña oculta.
   - Respeta prefers-reduced-motion: pinta un único fotograma estático.
   - Expone setScroll(0..1), setMouse(x,y), start(), stop(), destroy().

   El shader cuenta la tesis del caso: arranca turbulento y fragmentado
   (silos, caos en azul profundo) y, al avanzar el scroll, se ordena en una
   aurora azul→turquesa con filamentos que conectan (integración / 360º).
   ========================================================================= */

const VERT = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2  u_res;     // resolución en px (con DPR)
uniform float u_time;    // segundos
uniform float u_scroll;  // 0 = caos (silos) … 1 = orden (360º)
uniform vec2  u_mouse;   // 0..1

// --- Simplex noise 2D (Ashima / Stefan Gustavson) -----------------------
vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec2 mod289(vec2 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0))
                          + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// fBm con rotación entre octavas (rompe el patrón en cuadrícula)
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
  for(int i = 0; i < 6; i++){
    v += a * snoise(p);
    p = rot * p * 2.0 + 11.3;
    a *= 0.5;
  }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p  = uv;
  p.x *= u_res.x / u_res.y;                 // corrige aspecto

  float t = u_time * 0.06;
  float order = smoothstep(0.0, 1.0, clamp(u_scroll, 0.0, 1.0));
  vec2  mo = (u_mouse - 0.5);

  // El caos (frecuencia y "warp") cede paso al orden con el scroll
  float freq    = mix(3.2, 1.55, order);
  float warpAmt = mix(0.95, 0.45, order);

  // Domain warping en dos pasadas -> flujo orgánico tipo aurora
  vec2 q;
  q.x = fbm(p*freq + vec2(0.0, t)        + mo*0.30);
  q.y = fbm(p*freq + vec2(5.2, 1.3)      - t*0.80);
  vec2 r;
  r.x = fbm(p*freq + warpAmt*q + vec2(1.7, 9.2) + t*1.10);
  r.y = fbm(p*freq + warpAmt*q + vec2(8.3, 2.8) - t*0.90);
  float f = 0.5 + 0.5 * fbm(p*freq + warpAmt*r);

  // --- Paleta Báltica / ESIC ---
  vec3 deep = vec3(0.000, 0.020, 0.080);
  vec3 navy = vec3(0.000, 0.055, 0.200);   // ~#00133f
  vec3 blue = vec3(0.000, 0.278, 0.914);   // #0047e9
  vec3 teal = vec3(0.039, 0.894, 0.765);   // #0ae4c3

  vec3 col = mix(deep, navy, smoothstep(0.05, 0.55, f));
  col = mix(col, blue, smoothstep(0.35, 0.88, f + 0.15*length(r)));

  // Reflejos turquesa: tímidos en el caos, protagonistas en el orden
  float tealMix = smoothstep(0.60, 0.96, f) * mix(0.20, 0.95, order);
  col = mix(col, teal, tealMix);

  // Filamentos que "conectan": líneas de contorno del campo. Crecen con el orden.
  float lines = abs(fract(f * mix(6.0, 9.0, order)) - 0.5);
  float fil   = smoothstep(0.06, 0.0, lines);
  col += teal * fil * mix(0.05, 0.55, order);

  // Viñeta para asentar el texto encima
  vec2 cuv = uv - 0.5;
  float vig = smoothstep(1.15, 0.20, length(cuv * vec2(1.2, 1.0)));
  col *= mix(0.72, 1.10, vig);

  // Grano sutil anti-banding
  float gr = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (gr - 0.5) * 0.015;

  gl_FragColor = vec4(col, 1.0);
}
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

/**
 * Crea el fondo shader sobre un <canvas>.
 * @param {HTMLCanvasElement} canvas
 * @returns {{setScroll:(v:number)=>void, setMouse:(x:number,y:number)=>void,
 *            start:()=>void, stop:()=>void, destroy:()=>void, ok:boolean}}
 */
export function createShaderBg(canvas) {
  const gl =
    canvas.getContext("webgl", { antialias: false, alpha: false, depth: false }) ||
    canvas.getContext("experimental-webgl");

  // Sin WebGL: degradación elegante (CSS pinta un degradado de marca).
  if (!gl) {
    canvas.classList.add("gl--unsupported");
    return {
      setScroll() {}, setMouse() {}, start() {}, stop() {}, destroy() {}, ok: false,
    };
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error("Program link error: " + gl.getProgramInfoLog(prog));
  }
  gl.useProgram(prog);

  // Quad a pantalla completa (dos triángulos)
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]), // triángulo grande que cubre el viewport
    gl.STATIC_DRAW
  );
  const loc = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = {
    res: gl.getUniformLocation(prog, "u_res"),
    time: gl.getUniformLocation(prog, "u_time"),
    scroll: gl.getUniformLocation(prog, "u_scroll"),
    mouse: gl.getUniformLocation(prog, "u_mouse"),
  };

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let scroll = 0;
  const mouse = { x: 0.5, y: 0.5 };
  const target = { x: 0.5, y: 0.5 }; // ratón suavizado
  let raf = 0;
  let running = false;
  let t0 = performance.now();

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(canvas.clientWidth * dpr);
    const h = Math.floor(canvas.clientHeight * dpr);
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
    t0 = performance.now();
    if (reduceMotion) {
      // Un único fotograma estático, sin bucle.
      resize();
      draw(t0);
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

  // Pausa cuando la pestaña no está visible (batería del aula)
  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVisibility);

  // Redibuja un fotograma al cambiar el tamaño aunque esté en reduce-motion
  const onResize = () => { if (reduceMotion) { resize(); draw(performance.now()); } };
  window.addEventListener("resize", onResize);

  function destroy() {
    stop();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("resize", onResize);
    gl.deleteProgram(prog);
    gl.deleteBuffer(buf);
  }

  return {
    ok: true,
    setScroll: (v) => { scroll = Math.max(0, Math.min(1, v)); },
    setMouse: (x, y) => { target.x = x; target.y = y; },
    start,
    stop,
    destroy,
  };
}
