/**
 * Genera public/og.png, la tarjeta que ven X, LinkedIn y WhatsApp al compartir
 * el sitio. Manual, como el resto de scripts de assets: la salida se commitea.
 *
 * El texto va como TRAZADOS en src/assets/og/text.svg, no como <text>. Los
 * binarios precompilados de sharp en macOS no respetan FONTCONFIG_FILE ni
 * FONTCONFIG_PATH —probado— y renderizaban Helvetica en vez de Instrument
 * Serif. Con las letras ya convertidas a contornos el render no depende de que
 * haya ninguna fuente instalada, ni aquí ni en otra máquina.
 *
 * Para reescribir el texto hay que volver a generar ese SVG desde los .ttf de
 * .vendor-fonts/. No es un paso frecuente: son un nombre y dos subtítulos.
 */
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public/og.jpg');

/* 1200x630 es la proporción que piden Open Graph y Twitter para la tarjeta
   grande. Por debajo de 600px de ancho, X degrada a la tarjeta pequeña. */
const W = 1200;
const H = 630;
const PHOTO = 380;
const PHOTO_X = 130;
const PHOTO_Y = (H - PHOTO) / 2;

/* Mismos tokens que el tema oscuro del sitio: --bg y los dos halos de acento
   que body::before pinta detrás del contenido. */
const backdrop = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="warm">
      <stop offset="0" stop-color="#c3ea43" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#c3ea43" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cool">
      <stop offset="0" stop-color="#5b8cff" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#5b8cff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0a0a0a"/>
  <ellipse cx="${W * 0.86}" cy="${H * -0.05}" rx="560" ry="420" fill="url(#warm)"/>
  <ellipse cx="${W * 0.04}" cy="${H * 1.02}" rx="520" ry="400" fill="url(#cool)"/>
</svg>`);

/* El retrato se recorta a círculo con una máscara, no con un borde redondeado:
   sobre el halo del fondo un rectángulo se notaría. */
const circle = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${PHOTO}" height="${PHOTO}">
     <circle cx="${PHOTO / 2}" cy="${PHOTO / 2}" r="${PHOTO / 2}" fill="#fff"/>
   </svg>`,
);

const portrait = await sharp(join(ROOT, '.vendor-assets/photos/portrait.jpg'))
  .resize(PHOTO, PHOTO, { fit: 'cover', position: 'top' })
  .composite([{ input: circle, blend: 'dest-in' }])
  .png()
  .toBuffer();

await sharp(backdrop)
  .composite([
    { input: portrait, left: PHOTO_X, top: Math.round(PHOTO_Y) },
    { input: readFileSync(join(ROOT, 'src/assets/og/text.svg')), left: 0, top: 0 },
  ])
  /* JPEG y no PNG: el contenido es una foto y ocupa la mitad del lienzo. En
     PNG la tarjeta pesaba 322 KB. Todas las plataformas que consumen og:image
     aceptan JPEG. */
  .jpeg({ quality: 88, chromaSubsampling: '4:4:4', mozjpeg: true })
  .toFile(OUT);

const { size } = await sharp(OUT).metadata().then(async (m) => ({ ...m, size: (await sharp(OUT).toBuffer()).length }));
console.log(`public/og.jpg  ${W}x${H}  ${(size / 1024).toFixed(1)} KB`);
