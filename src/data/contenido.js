/* =========================================================================
   contenido.js — Textos editoriales del curso (mandatos de pitch y Kahoots).

   IMPORTANTE (regla pedagógica): este archivo es material de ALUMNO.
   Los mandatos son el ENCARGO de cada grupo (qué deben entregar), NO la
   solución: no contienen el catálogo de errores, ni los gaps "correctos",
   ni rúbricas de profesor. Los Kahoots se juegan en la plataforma Kahoot!;
   aquí solo guardamos títulos/enlaces, nunca las respuestas correctas.
   ========================================================================= */

/* -------------------------------------------------------------------------
   MANDATOS DE PITCH (5) — formato jigsaw: pitches complementarios.
   Cada grupo recibe un encargo distinto; juntos cubren todo el P1.
   ------------------------------------------------------------------------- */
export const MANDATOS = [
  {
    id: 1,
    titulo: "El mapa de silos",
    lema: "Diagnóstico de integración",
    encargo: "Clasificad los 12 sistemas y nombrad los 3 gaps de integración críticos, con su impacto de negocio.",
    puntos: [
      "Clasificación por tipo y nivel (TPS–MIS–DSS–EIS)",
      "Los 3 gaps de integración más críticos",
      "Impacto de negocio de cada gap",
    ],
    prep: { label: "Mapa de silos", href: "mapa-silos.html" },
  },
  {
    id: 2,
    titulo: "La arquitectura objetivo",
    lema: "Target state",
    encargo: "Proponed el estado objetivo que mata los silos: middleware/API/DWH y single source of truth.",
    puntos: [
      "Middleware / API / data warehouse",
      "Single source of truth del cliente",
      "Cómo debería fluir el dato de extremo a extremo",
    ],
    prep: { label: "¿Cómo funciona una API?", href: "api.html" },
  },
  {
    id: 3,
    titulo: "AS/400: ¿migrar o integrar?",
    lema: "Trade-off coste–beneficio–riesgo",
    encargo: "Evaluad el trade-off coste–beneficio–riesgo del AS/400 y dad una recomendación justificada.",
    puntos: [
      "Coste, beneficio y riesgo de cada opción",
      "Horizonte corto vs medio plazo",
      "Recomendación y su justificación",
    ],
    prep: { label: "Matriz migrar / integrar", href: "migrar-integrar.html" },
  },
  {
    id: 4,
    titulo: "Garbage in, garbage out",
    lema: "Calidad del dato",
    encargo: "Auditad la calidad del dato: los errores más dañinos, su impacto y cómo prevenirlos.",
    puntos: [
      "Qué errores de dato hacen más daño",
      "Su impacto en las decisiones del Comité",
      "Cómo prevenirlos (gobierno del dato)",
    ],
    prep: { label: "Mapa de silos · dato crudo", href: "mapa-silos.html" },
  },
  {
    id: 5,
    titulo: "Las lecciones de los 18 M€",
    lema: "ROI y gestión del cambio",
    encargo: "Explicad por qué una inversión grande no da retorno (paralelo Lidl–SAP) y cómo no repetirlo.",
    puntos: [
      "Por qué 18 M€ no rinden sin integración",
      "Paralelo con el caso Lidl–SAP",
      "Cómo evitar repetir el error",
    ],
    prep: { label: "Deck M3 · Lidl–SAP", href: "../decks/m3.html" },
  },
];

/* Grupos de clase (TG4). PRIVACIDAD: este proyecto se publica en abierto, así
   que NO incluimos los nombres de los estudiantes (datos personales / RGPD).
   El profesor escribe los nombres en vivo en la Sala de pitch (campos
   editables; no se guardan). La asignación grupo↔mandato es por orden y editable. */
export const GRUPOS = [
  { id: 1, nombre: "TG4 Grupo 1", integrantes: [] },
  { id: 2, nombre: "TG4 Grupo 2", integrantes: [] },
  { id: 3, nombre: "TG4 Grupo 3", integrantes: [] },
  { id: 4, nombre: "TG4 Grupo 4", integrantes: [] },
  { id: 5, nombre: "TG4 Grupo 5", integrantes: [] },
];

/* Criterios de scoring del Comité (1–5 cada uno). */
export const CRITERIOS_COMITE = [
  { id: "claridad", nombre: "Claridad ejecutiva" },
  { id: "datos", nombre: "Anclaje en datos" },
  { id: "recomendacion", nombre: "Recomendación accionable" },
];

/* -------------------------------------------------------------------------
   KAHOOTS (2) — solo metadatos y enlaces. Las preguntas/respuestas viven
   en Kahoot!, no aquí. `url` se rellena en la Fase 10.
   ------------------------------------------------------------------------- */
/* El profesor pega la URL y el PIN en vivo (campos editables en la página).
   `url`/`pin` son placeholders por defecto; las preguntas viven en Kahoot!. */
export const KAHOOTS = [
  {
    id: "kahoot-1",
    titulo: "Kahoot #1",
    momento: "Viernes · 19:10",
    valida: "Conceptos de SI: qué es un SI, la pirámide TPS–MIS–DSS–EIS y ERP/CRM/SCM.",
    url: "", // p. ej. https://kahoot.it/  o el enlace de juego del profesor
    pin: "", // PIN de la partida (se proyecta para que los alumnos se unan)
  },
  {
    id: "kahoot-2",
    titulo: "Kahoot #2",
    momento: "Sábado · 11:35",
    valida: "Decisiones y proyectos: DSS/EIS, integración vs silos y proyectos de SI.",
    url: "",
    pin: "",
  },
];
