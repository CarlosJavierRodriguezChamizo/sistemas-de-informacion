/* =========================================================================
   agenda.js — Escaleta viva de los 2 días (datos del hub).
   Cada bloque referencia su deck/herramienta. `cat` marca el tipo visual.
   Las historias visuales (scrollytelling) se enlazan como kind "story".
   El sábado reserva ~30' para el bloque M4 (IA + MCP), recortando otros.
   ========================================================================= */

export const DIAS = [
  {
    id: "viernes",
    dia: "Viernes",
    franja: "16:00 – 21:00",
    lema: "Del concepto al diagnóstico de sistemas",
    bloques: [
      {
        time: "16:00", dur: "20'", cat: "pitch",
        title: "Apertura · la paradoja Báltica + el reto del Comité",
        note: "El profesor presenta el caso apoyándose en la apertura inmersiva.",
        links: [
          { label: "Apertura inmersiva", href: "decks/intro.html", kind: "story" },
          { label: "El reto del Comité", href: "decks/comite.html", kind: "pitch" },
        ],
      },
      {
        time: "16:20", dur: "60'", cat: "deck", block: "m1",
        title: "M1 · Introducción a los SI",
        links: [
          { label: "Abrir deck", href: "decks/m1.html", kind: "deck" },
          { label: "Práctica: clasificar los 12 sistemas", href: "tools/clasificador.html", kind: "tool" },
        ],
      },
      {
        time: "17:20", dur: "60'", cat: "deck", block: "m2",
        title: "M2 · ERP / CRM / SCM",
        links: [
          { label: "Abrir deck", href: "decks/m2.html", kind: "deck" },
          { label: "Historia visual: los silos", href: "decks/silos.html", kind: "story" },
          { label: "Práctica: 3 gaps de integración", href: "tools/mapa-silos.html", kind: "tool" },
        ],
      },
      { time: "18:20", dur: "30'", cat: "descanso", title: "Descanso" },
      {
        time: "18:50", dur: "20'", cat: "demo",
        title: "Taller ERP en la nube · Demo Odoo",
        note: "Demostración en vivo.",
        links: [{ label: "Guía visual del taller", href: "decks/odoo.html", kind: "story" }],
      },
      {
        time: "19:10", dur: "15'", cat: "kahoot", title: "Kahoot #1",
        links: [{ label: "Abrir Kahoots", href: "tools/kahoot.html", kind: "kahoot" }],
      },
      {
        time: "19:25", dur: "60'", cat: "deck",
        title: "Arquitectura de datos",
        note: "Bocetar la arquitectura objetivo y entender las APIs.",
        links: [
          { label: "Historia visual: arquitectura objetivo", href: "decks/arquitectura.html", kind: "story" },
          { label: "Cómo funciona una API", href: "tools/api.html", kind: "tool" },
          { label: "Migrar o integrar (AS/400)", href: "tools/migrar-integrar.html", kind: "tool" },
        ],
      },
      {
        time: "20:25", dur: "30'", cat: "sintesis",
        title: 'Casos "empresas transformadas por SI" + síntesis',
        links: [{ label: "Casos + síntesis", href: "decks/casos.html", kind: "story" }],
      },
      { time: "20:55", dur: "", cat: "cierre", title: "Cierre" },
    ],
  },
  {
    id: "sabado",
    dia: "Sábado",
    franja: "9:00 – 14:00",
    lema: "De los sistemas a las decisiones + IA + pitch",
    bloques: [
      { time: "9:00", dur: "15'", cat: "repaso", title: "Repaso relámpago" },
      {
        time: "9:15", dur: "50'", cat: "deck", block: "m2",
        title: "M2 · DSS / EIS",
        note: "Práctica: del Excel manual al EIS del Comité.",
        links: [{ label: "Abrir deck", href: "decks/m2.html", kind: "deck" }],
      },
      {
        time: "10:05", dur: "45'", cat: "tool",
        title: "⭐ Validación del dato",
        note: "Práctica sobre el Excel real.",
        links: [{ label: "Abrir la práctica", href: "tools/validacion-dato.html", kind: "tool" }],
      },
      { time: "10:50", dur: "25'", cat: "descanso", title: "Descanso" },
      {
        time: "11:15", dur: "15'", cat: "kahoot", title: "Kahoot #2",
        links: [{ label: "Abrir Kahoots", href: "tools/kahoot.html", kind: "kahoot" }],
      },
      {
        time: "11:30", dur: "35'", cat: "deck", block: "m3",
        title: "M3 · Proyectos de SI + caso Lidl-SAP",
        links: [{ label: "Abrir deck", href: "decks/m3.html", kind: "deck" }],
      },
      {
        time: "12:05", dur: "30'", cat: "ia", block: "m4",
        title: "M4 · IA, agentes y MCP en los SI",
        note: "La IA necesita datos integrados y de calidad.",
        links: [
          { label: "Abrir deck", href: "decks/m4.html", kind: "deck" },
          { label: "Práctica: API → MCP → agente", href: "tools/mcp.html", kind: "tool" },
        ],
      },
      {
        time: "12:35", dur: "20'", cat: "pitch", title: "Preparación del pitch ejecutivo",
        note: "Todos los grupos preparan la misma propuesta y la defienden en clave de negocio: por qué su solución es la mejor.",
        links: [
          { label: "El reto del Comité", href: "decks/comite.html", kind: "pitch" },
          { label: "Sala de pitch", href: "tools/pitch.html", kind: "pitch" },
        ],
      },
      {
        time: "12:55", dur: "~65'", cat: "pitch", title: "Pitches + feedback",
        note: "5 grupos × ~12'.",
        links: [{ label: "Sala de pitch", href: "tools/pitch.html", kind: "pitch" }],
      },
    ],
  },
];

/* Metadatos visuales por categoría (etiqueta + clase de color). */
export const CATS = {
  deck:     { label: "Teoría",   cls: "cat--deck" },
  tool:     { label: "Práctica", cls: "cat--tool" },
  ia:       { label: "IA",       cls: "cat--ia" },
  kahoot:   { label: "Kahoot",   cls: "cat--kahoot" },
  pitch:    { label: "Pitch",    cls: "cat--pitch" },
  descanso: { label: "Descanso", cls: "cat--rest" },
  demo:     { label: "Demo",     cls: "cat--demo" },
  sintesis: { label: "Plenaria", cls: "cat--plenary" },
  repaso:   { label: "Plenaria", cls: "cat--plenary" },
  cierre:   { label: "Plenaria", cls: "cat--plenary" },
};
