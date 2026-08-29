// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // La URL real del sitio. El artefacto del builder traía leomogiano.dev, un
  // dominio que no está registrado: canonical, los tres hreflang y og:url
  // apuntaban a un host muerto. Si algún día se compra el dominio, se cambia
  // aquí y se agrega public/CNAME.
  site: 'https://leomogiano.github.io',
  trailingSlash: 'always',
  build: {
    /*
     * 'always', no 'auto'. Con 'auto' Astro deja fuera cualquier hoja de más de
     * 4 kB, y las dos del sitio pesan 12 y 7 kB: quedaban como dos <link>
     * bloqueantes delante del primer pintado. Inline sale gratis aquí porque
     * GitHub Pages sirve todo con Cache-Control de 10 minutos —el CSS no se
     * cachea entre visitas de todos modos— y porque no hay navegación entre
     * páginas que reuse la hoja: cada idioma es una sola página.
     */
    inlineStylesheets: 'always',
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
  // Escucha en todas las interfaces, no solo en localhost. Es lo que permite
  // abrir el dev desde el iPhone por wifi —la vitrina de apps y el visor de
  // capturas a pantalla completa solo existen bajo 705 px— sin acordarse del
  // flag `--host` cada vez. En un sitio estático que se compila a HTML no
  // expone nada: el servidor de desarrollo solo vive mientras alguien lo corre.
  server: { host: true },
  vite: {
    server: {
      // legacy/index.html pesa 21 MB: que Vite ni lo mire.
      watch: { ignored: ['**/legacy/**'] },
    },
  },
});
