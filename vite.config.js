// Configuración de Vite — proyecto multipágina, offline-first.
// base:'./' => rutas relativas, para servir desde GitHub Pages / Vercel
// y también al abrir los HTML directamente en local (file://).
import { defineConfig } from 'vite';
import { resolve } from 'path';

const r = (p) => resolve(__dirname, p);

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      // Todas las páginas de la arquitectura declaradas como entradas.
      // (No existe ninguna página de profesor: se gestiona fuera del proyecto.)
      input: {
        // Hub / escaleta viva
        index: r('index.html'),
        // Mazos de teoría (RevealJS)
        m1: r('decks/m1.html'),
        m2: r('decks/m2.html'),
        m3: r('decks/m3.html'),
        m4: r('decks/m4.html'),
        // Historias visuales (scrollytelling) de los bloques clave
        silos: r('decks/silos.html'),
        arquitectura: r('decks/arquitectura.html'),
        // Herramientas interactivas (prácticas)
        clasificador: r('tools/clasificador.html'),
        mapaSilos: r('tools/mapa-silos.html'),
        api: r('tools/api.html'),
        migrarIntegrar: r('tools/migrar-integrar.html'),
        mcp: r('tools/mcp.html'),
        pitch: r('tools/pitch.html'),
        kahoot: r('tools/kahoot.html'),
      },
    },
  },
});
