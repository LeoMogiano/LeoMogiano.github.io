# leomogiano.dev

Portafolio en Astro. Tres idiomas prerenderizados (`/`, `/en/`, `/ja/`), sin
framework de UI en el cliente.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # -> dist/
npm run check     # tipos
```

## Cómo está organizado

```
src/
  data/        datos: apps, trayectoria, stack, nav, redes
  i18n/        textos por idioma. types.ts obliga a que es/en/ja coincidan
  components/  una sección por archivo; ui/ son las piezas repetidas
  scripts/     comportamiento, un archivo por widget
  styles/      tokens, fuentes, globales, iconos (generado)
  pages/[...lang]/index.astro   las tres rutas
```

Para cambiar un texto se toca `src/i18n/<idioma>.ts`. Si agregas una clave a
uno, TypeScript exige agregarla a los tres.

## Assets y fuentes: se generan aparte, no en el build

El build no procesa imágenes ni fuentes; solo copia y hashea. Las conversiones
se corren a mano cuando cambia el material y **su salida se commitea**:

```bash
npm run assets    # .vendor-assets/ -> src/assets/  (WebP verificado)
npm run fonts     # descarga los .ttf y genera public/fonts/*.woff2
node scripts/build-icons.mjs   # SVG -> src/styles/icons.css
```

`npm run assets` verifica lo que produce: los gráficos planos van a WebP sin
pérdida y compara el bitmap decodificado contra el original; las fotos van a
quality 95 y se miden con PSNR. Si algo baja de umbral, el script falla.

`npm run fonts` subsetea con harfbuzz. Las familias con versión variable se
sirven como un solo archivo; los ejes que el sitio no usa (`opsz`, `wdth`) se
fijan, pero `wght` se conserva variable. El japonés se subsetea al texto real de
`src/i18n/ja.ts` (23 MB de Noto → 324 KB) y **solo lo carga `/ja/`**.

## Deploy

Push a `main` → GitHub Actions corre `astro build` y publica `dist/`. En
Settings → Pages, el source debe estar en «GitHub Actions».

## De dónde viene esto

El sitio era un único `index.html` de 21.4 MB exportado de un builder, con todo
embebido en base64. Sigue en la historia:

```bash
git show 76ac6a3:index.html > legacy/index.html
```

Ese archivo es la referencia visual de la migración y la entrada de
`scripts/extract-assets.mjs`.
