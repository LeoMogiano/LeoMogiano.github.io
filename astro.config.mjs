// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://leomogiano.dev',
  trailingSlash: 'always',
  build: {
    // El CSS del sitio es pequeño y crítico: inline evita un round-trip.
    inlineStylesheets: 'auto',
  },
  image: {
    // Las imágenes ya vienen convertidas a WebP por scripts/prepare-assets.mjs.
    // Astro solo las hashea y copia: cero trabajo de imagen en cada build.
    service: { entrypoint: 'astro/assets/services/noop' },
  },
  // experimental.incrementalBuild está DESACTIVADO a propósito. Se probó y
  // reutilizaba el HTML de una build anterior tras editar un .css: la página
  // quedaba apuntando a un bundle que ya no existía y se servía sin estilos.
  // Astro invalida por el grafo de módulos y por el cacheKey de getStaticPaths,
  // pero un cambio de hash en el CSS no dispara ninguno de los dos.
  // A cambio ahorraba nada: el build completo son ~250 ms para 3 páginas.
  vite: {
    server: {
      // legacy/index.html pesa 21 MB: que Vite ni lo mire.
      watch: { ignored: ['**/legacy/**'] },
    },
  },
});
