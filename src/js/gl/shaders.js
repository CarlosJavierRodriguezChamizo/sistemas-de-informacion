/* =========================================================================
   shaders.js — Fuentes GLSL (fragment shaders) del proyecto.
   Paleta Báltica / ESIC: navy #00133f, azul #0047e9, turquesa #0ae4c3.
   Uniforms estándar (los provee glCanvas): u_res, u_time, u_scroll, u_mouse.
   ========================================================================= */

/* Ruido simplex 2D + fBm, compartido por los shaders 2D. */
const NOISE = `
vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec2 mod289(vec2 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
  for(int i = 0; i < 6; i++){ v += a * snoise(p); p = rot*p*2.0 + 11.3; a *= 0.5; }
  return v;
}
`;

/* --- Apertura inmersiva: aurora que pasa del caos al orden (u_scroll). --- */
export const AURORA_FRAG = `
precision highp float;
uniform vec2 u_res; uniform float u_time; uniform float u_scroll; uniform vec2 u_mouse;
${NOISE}
void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p = uv; p.x *= u_res.x / u_res.y;
  float t = u_time * 0.06;
  float order = smoothstep(0.0, 1.0, clamp(u_scroll, 0.0, 1.0));
  vec2 mo = (u_mouse - 0.5);
  float freq    = mix(3.2, 1.55, order);
  float warpAmt = mix(0.95, 0.45, order);
  vec2 q; q.x = fbm(p*freq + vec2(0.0,t) + mo*0.30); q.y = fbm(p*freq + vec2(5.2,1.3) - t*0.80);
  vec2 r; r.x = fbm(p*freq + warpAmt*q + vec2(1.7,9.2) + t*1.10); r.y = fbm(p*freq + warpAmt*q + vec2(8.3,2.8) - t*0.90);
  float f = 0.5 + 0.5 * fbm(p*freq + warpAmt*r);
  vec3 deep=vec3(0.0,0.02,0.08), navy=vec3(0.0,0.055,0.20), blue=vec3(0.0,0.278,0.914), teal=vec3(0.039,0.894,0.765);
  vec3 col = mix(deep, navy, smoothstep(0.05,0.55,f));
  col = mix(col, blue, smoothstep(0.35,0.88, f + 0.15*length(r)));
  float tealMix = smoothstep(0.60,0.96,f) * mix(0.20,0.95,order);
  col = mix(col, teal, tealMix);
  float lines = abs(fract(f*mix(6.0,9.0,order)) - 0.5);
  col += teal * smoothstep(0.06,0.0,lines) * mix(0.05,0.55,order);
  vec2 cuv = uv-0.5; float vig = smoothstep(1.15,0.20,length(cuv*vec2(1.2,1.0)));
  col *= mix(0.72,1.10,vig);
  float gr = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233)))*43758.5453);
  col += (gr-0.5)*0.015;
  gl_FragColor = vec4(col,1.0);
}
`;

/* --- Fondo de deck: navy profundo, casi quieto, muy bajo contraste. --- */
export const DECK_BG_FRAG = `
precision highp float;
uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse;
${NOISE}
void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p = uv; p.x *= u_res.x / u_res.y;
  float t = u_time * 0.02;                       // movimiento lentísimo
  float f = 0.5 + 0.5 * fbm(p*1.5 + vec2(t, -t*0.7) + (u_mouse-0.5)*0.15);
  // Navy muy oscuro como base; nubes apenas perceptibles de azul.
  vec3 base = vec3(0.0, 0.045, 0.145);
  vec3 lift = vec3(0.0, 0.10, 0.32);
  vec3 col = mix(base, lift, smoothstep(0.45, 0.95, f) * 0.5);
  // Brillo diagonal sutil y un toque turquesa muy contenido.
  col += vec3(0.0, 0.05, 0.06) * pow(smoothstep(0.7, 1.0, f), 2.0) * 0.4;
  // Viñeta para concentrar la atención en el texto.
  vec2 cuv = uv - 0.5; float vig = smoothstep(1.25, 0.25, length(cuv*vec2(1.1,1.0)));
  col *= mix(0.78, 1.04, vig);
  float gr = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233)))*43758.5453);
  col += (gr-0.5)*0.012;
  gl_FragColor = vec4(col, 1.0);
}
`;

/* --- Lluvia de código "Matrix" en colores de marca (fondo de deck). ----- */
export const MATRIX_FRAG = `
precision highp float;
uniform vec2 u_res; uniform float u_time;

float hash11(float n){ return fract(sin(n)*43758.5453123); }
float hash21(vec2 p){ p = fract(p*vec2(123.34, 345.45)); p += dot(p, p+34.345); return fract(p.x*p.y); }

// Máscara de "glifo": subrejilla de puntos que cambia lentamente (sugiere caracteres).
float glyph(vec2 cuv, vec2 cid, float t){
  vec2 sub = floor(cuv * vec2(4.0, 5.0));
  float seed = hash21(cid) + floor(t*1.2)*0.137;     // cambian despacio
  return step(0.62, hash21(sub + seed*9.1));         // menos puntos encendidos
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  float aspect = u_res.x / u_res.y;
  float cols = 34.0;
  float rows = cols / aspect * 1.7;
  vec2 cell = vec2(uv.x*cols, uv.y*rows);
  vec2 cid = floor(cell);
  vec2 cuv = fract(cell);

  float colSeed = hash11(cid.x*2.13 + 5.7);
  float active = step(0.55, hash11(cid.x*1.31 + 0.7));   // solo ~45% de columnas llueven
  float speed = mix(1.0, 2.4, colSeed);                  // mucho más lento
  float head = fract(u_time*speed*0.03 + colSeed*37.0) * (rows + 8.0);
  float rowFromTop = (rows - 1.0) - cid.y;
  float dist = head - rowFromTop;
  float trail = exp(-dist*0.22) * step(-0.5, dist);
  float headGlow = smoothstep(1.6, 0.0, abs(dist));
  float g = glyph(cuv, cid, u_time + colSeed*10.0);
  float lum = g * (trail*0.38 + headGlow*0.6) * active;  // tenue

  vec3 teal = vec3(0.05, 0.95, 0.80);
  vec3 blue = vec3(0.0, 0.45, 1.0);
  vec3 rainCol = mix(blue, teal, 0.55) * lum;
  rainCol += vec3(0.6, 1.0, 0.95) * headGlow * g * active * 0.35;  // cabeza apenas más clara

  vec3 base = vec3(0.0, 0.025, 0.075);                   // navy de fondo

  // La lluvia vive SOLO hacia los bordes; el centro (texto/tarjetas) queda limpio.
  vec2 d = uv - 0.5;
  float periph = smoothstep(0.26, 0.78, length(d * vec2(1.05, 1.0)));
  vec3 col = base + rainCol * periph * 0.6;

  col *= smoothstep(1.25, 0.35, length(d * vec2(1.15, 1.0)));   // viñeta
  gl_FragColor = vec4(col, 1.0);
}
`;

/* --- Rejilla "blueprint" en perspectiva (fondo de M3: proyectos/plan). --- */
export const BLUEPRINT_FRAG = `
precision highp float;
uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse;

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_res.xy) / u_res.y;
  vec3 col = vec3(0.0, 0.025, 0.07);              // navy

  float horizon = 0.10 + (u_mouse.y - 0.5) * 0.04;
  if (uv.y < horizon){
    float z = 1.0 / (horizon - uv.y);             // profundidad (suelo en perspectiva)
    z = min(z, 40.0);
    float x = (uv.x + (u_mouse.x - 0.5) * 0.1) * z;
    float speed = u_time * 0.5;
    vec2 g  = vec2(x, z + speed);
    vec2 gl = abs(fract(g) - 0.5);
    float line = min(gl.x, gl.y);
    float grid = smoothstep(0.07, 0.0, line);
    float fade = exp(-z * 0.09);
    col += vec3(0.0, 0.45, 0.95) * grid * fade * 0.55;
    // líneas maestras cada 5 celdas, algo más marcadas
    vec2 g5 = abs(fract(g/5.0) - 0.5);
    float maj = smoothstep(0.02, 0.0, min(g5.x, g5.y));
    col += vec3(0.05, 0.9, 0.8) * maj * fade * 0.4;
  }

  vec2 dd = (gl_FragCoord.xy/u_res.xy) - 0.5;
  col *= mix(0.6, 1.0, smoothstep(0.1, 0.7, length(dd*vec2(1.05,1.0))));
  col *= smoothstep(1.25, 0.35, length(dd*vec2(1.15,1.0)));
  gl_FragColor = vec4(col, 1.0);
}
`;

/* --- Red 3D de servidores intercomunicados (nodos + aristas). ----------
   Doce nodos proyectados en perspectiva, unidos por aristas (anillo + cuerdas).
   u_scroll = "escena" (índice de slide animado): reorganiza los nodos y gira la
   cámara, de modo que cada diapositiva muestra una configuración distinta. ---- */
export const NETWORK_FRAG = `
precision highp float;
uniform vec2 u_res; uniform float u_time; uniform float u_scroll; uniform vec2 u_mouse;

float hash11(float n){ return fract(sin(n)*43758.5453123); }
mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0.0,-s, 0.0,1.0,0.0, s,0.0,c); }
mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1.0,0.0,0.0, 0.0,c,-s, 0.0,s,c); }

vec3 nodePos(float fi, float scene, float t){
  vec3 b = vec3(hash11(fi*1.3+0.1), hash11(fi*2.7+0.5), hash11(fi*3.9+0.9)) * 2.0 - 1.0;
  b *= 1.25;
  // cada escena (slide) reorganiza la nube de nodos + respiración leve
  b += 0.45 * vec3(sin(fi*1.7 + scene*6.2831),
                   cos(fi*2.3 + scene*4.6 + 1.0),
                   sin(fi*0.9 + scene*5.4 + 2.0));
  b.y += 0.05 * sin(t*0.6 + fi);
  return b;
}
// (x,y proyectado en pantalla, z = profundidad)
vec3 proj(float fi, mat3 rot, float scene, float t, float camZ){
  vec3 w = rot * nodePos(fi, scene, t);
  float z = w.z + camZ;
  return vec3(w.xy / (z*0.42), z);
}
float seg(vec2 p, vec2 a, vec2 b){ vec2 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0); return length(pa-ba*h); }

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_res.xy) / u_res.y;
  float t = u_time; float scene = u_scroll; float camZ = 3.6;
  mat3 rot = rotY(t*0.05 + scene*1.2) * rotX(0.35 + (u_mouse.y-0.5)*0.4);

  vec3 col  = vec3(0.0, 0.03, 0.085);   // navy
  vec3 teal = vec3(0.06, 0.95, 0.80);
  vec3 blue = vec3(0.05, 0.5, 1.0);
  const float NF = 12.0;

  // Aristas: anillo (i,i+1) + cuerdas (i,i+5)
  for(int i = 0; i < 12; i++){
    float fi = float(i);
    vec3 a = proj(fi, rot, scene, t, camZ);
    vec3 b = proj(mod(fi+1.0, NF), rot, scene, t, camZ);
    vec3 c = proj(mod(fi+5.0, NF), rot, scene, t, camZ);
    float f1 = 1.0 / (0.6 + 0.5*(a.z+b.z));
    col += blue * smoothstep(0.006, 0.0, seg(uv, a.xy, b.xy)) * f1 * 0.9;
    float f2 = 1.0 / (0.6 + 0.5*(a.z+c.z));
    col += mix(blue, teal, 0.5) * smoothstep(0.004, 0.0, seg(uv, a.xy, c.xy)) * f2 * 0.5;
  }
  // Nodos (servidores): núcleo + halo, tamaño por profundidad
  for(int i = 0; i < 12; i++){
    vec3 a = proj(float(i), rot, scene, t, camZ);
    float d = length(uv - a.xy);
    float size = 0.018 * (camZ / a.z);
    col += teal * smoothstep(size, size*0.2, d) * 1.2;
    col += mix(teal, blue, 0.4) * smoothstep(size*3.5, size, d) * 0.35;
  }

  // Atenuar centro (legibilidad) + viñeta
  vec2 dd = (gl_FragCoord.xy/u_res.xy) - 0.5;
  col *= mix(0.55, 1.0, smoothstep(0.1, 0.7, length(dd*vec2(1.05,1.0))));
  col *= smoothstep(1.25, 0.35, length(dd*vec2(1.15,1.0)));
  gl_FragColor = vec4(col, 1.0);
}
`;

/* --- Sala de servidores (raymarching): racks en niebla + LEDs. ---------- */
export const SERVER_FRAG = `
precision highp float;
uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse;

float hash21(vec2 p){ p = fract(p*vec2(123.34,345.45)); p += dot(p, p+34.345); return fract(p.x*p.y); }

float sdBox(vec3 p, vec3 b){ vec3 q = abs(p)-b; return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0); }

// id: 0 nada, 1 racks, 2 suelo
float map(vec3 p, out float id, out vec3 cell){
  id = 0.0; cell = vec3(0.0);
  // Dos hileras de racks (x=±1.7), repetidas en z cada 2.4 u.
  float period = 2.4;
  vec3 q = p;
  float zc = floor(p.z / period);
  q.z = mod(p.z, period) - period*0.5;
  // hilera izquierda
  vec3 pl = vec3(q.x + 1.7, q.y, q.z);
  float dl = sdBox(pl, vec3(0.6, 1.3, 0.95));
  // hilera derecha
  vec3 pr = vec3(q.x - 1.7, q.y, q.z);
  float dr = sdBox(pr, vec3(0.6, 1.3, 0.95));
  float racks = min(dl, dr);
  float floorD = p.y + 1.3;

  float d = min(racks, floorD);
  if (racks < floorD) { id = 1.0; cell = vec3(zc, (dl < dr ? -1.0 : 1.0), dl < dr ? dl : dr); }
  else { id = 2.0; }
  return d;
}

vec3 calcNormal(vec3 p){
  vec2 e = vec2(0.0015, 0.0);
  float d, du; vec3 c;
  d = map(p, du, c);
  return normalize(vec3(
    map(p+e.xyy, du, c) - map(p-e.xyy, du, c),
    map(p+e.yxy, du, c) - map(p-e.yxy, du, c),
    map(p+e.yyx, du, c) - map(p-e.yyx, du, c)
  ));
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_res.xy) / u_res.y;

  // Cámara avanzando por el pasillo (corredor infinito por la niebla)
  float t = u_time;
  vec3 ro = vec3(0.0, 0.15, t*0.5);
  vec2 m = (u_mouse - 0.5);
  // mirada hacia el fondo con leve parallax de ratón
  vec3 ta = ro + vec3(m.x*0.5, -0.05 + m.y*0.25, 1.0);
  vec3 fw = normalize(ta - ro);
  vec3 rt = normalize(cross(vec3(0.0,1.0,0.0), fw));
  vec3 up = cross(fw, rt);
  vec3 rd = normalize(uv.x*rt + uv.y*up + 1.05*fw);   // FOV ancho: pasillo envolvente

  // Raymarch
  float dist = 0.0; float id = 0.0; vec3 cell = vec3(0.0); bool hit = false;
  vec3 p = ro;
  for(int i = 0; i < 80; i++){
    p = ro + rd*dist;
    float d = map(p, id, cell);
    if(d < 0.002){ hit = true; break; }
    dist += d;
    if(dist > 40.0) break;
  }

  vec3 col = vec3(0.0, 0.02, 0.07);   // fondo / niebla navy

  if(hit){
    vec3 n = calcNormal(p);
    vec3 ldir = normalize(vec3(0.2, 0.7, -0.3));
    float diff = max(dot(n, ldir), 0.0);
    float amb = 0.30;

    vec3 mat;
    vec3 emis = vec3(0.0);

    if(id > 1.5){
      // Suelo oscuro pulido
      mat = vec3(0.02, 0.04, 0.08);
    } else {
      // Carcasa del rack (gris azulado oscuro)
      mat = vec3(0.07, 0.10, 0.15);
      // Cara interior (mirando al pasillo): rejilla de LEDs parpadeantes
      bool innerFace = abs(n.x) > 0.5;
      if(innerFace){
        // coordenadas locales sobre la cara (alto y, profundidad z)
        float period = 2.4;
        float zl = mod(p.z, period) - period*0.5;
        vec2 g = vec2(zl, p.y);                 // ~[-0.95,0.95] x [-1.25,1.25]
        vec2 gridN = vec2(7.0, 18.0);           // columnas x filas de "bahías"
        vec2 cellUv = fract((g*0.5+0.5) * gridN);
        vec2 cellId = floor((g*0.5+0.5) * gridN) + cell.xy*31.0;
        // LED: punto pequeño dentro de cada bahía
        vec2 lp = cellUv - vec2(0.18, 0.5);
        float led = smoothstep(0.10, 0.0, length(lp*vec2(1.0,1.6)));
        // parpadeo pseudoaleatorio por bahía
        float seed = hash21(cellId);
        float blink = 0.4 + 0.6*sin(t*(1.5+seed*4.0) + seed*30.0);
        blink = smoothstep(0.2, 1.0, blink) * step(0.25, seed); // ~75% encendidos
        // color: mayoría turquesa, algunos azules, algún ámbar raro
        vec3 lc = (seed > 0.93) ? vec3(0.95,0.55,0.15)
                 : (seed > 0.6) ? vec3(0.0,0.45,1.0)
                 : vec3(0.04,0.95,0.78);
        emis += lc * led * blink * 1.6;
        // ranuras horizontales tenues entre bahías
        float slot = smoothstep(0.03, 0.0, abs(cellUv.y-0.5)-0.42);
        mat += vec3(0.02,0.04,0.07) * slot;
      }
    }

    vec3 lit = mat * (amb + diff*0.7) + emis;

    // Niebla exponencial: funde la distancia en navy
    float fog = 1.0 - exp(-dist*0.085);
    col = mix(lit, vec3(0.0,0.02,0.07), fog);
  }

  // Bloom barato: realza los LEDs cercanos
  col += col*col*0.25;

  // Viñeta y grano
  vec2 vuv = gl_FragCoord.xy/u_res.xy - 0.5;
  col *= smoothstep(1.2, 0.3, length(vuv*vec2(1.15,1.0)));
  float gr = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233)))*43758.5453);
  col += (gr-0.5)*0.02;

  gl_FragColor = vec4(col, 1.0);
}
`;
