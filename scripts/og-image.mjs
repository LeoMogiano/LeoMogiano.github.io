/**
 * Genera public/og.jpg, la miniatura que ven WhatsApp, X y LinkedIn al
 * compartir el sitio. Manual, como el resto de scripts de assets: la salida se
 * commitea.
 *
 * Cuadrada y solo la foto. La proporción decide el formato en X y LinkedIn:
 * con 1.91:1 dibujan la tarjeta grande —imagen a lo ancho y texto debajo— y
 * con una cuadrada la compacta, miniatura a la izquierda y título y
 * descripción al lado. Es la que se pidió.
 *
 * WhatsApp no mira la proporción sino el tamaño: a partir de 300x300 dibuja la
 * tarjeta grande aunque la imagen sea cuadrada. Por eso el lado publicado es
 * 256, por debajo de ese umbral, y no el del recorte.
 *
 * El encuadre ya viene hecho en la fuente: .vendor-assets/photos/og-source.jpg
 * es el retrato recortado a mano. Aquí solo se reduce, nunca se recorta ni se
 * amplía, así que cambiar el encuadre es cambiar esa foto y volver a correr
 * esto.
 *
 * Nada de texto dentro de la imagen: el nombre y la descripción los pone cada
 * plataforma desde og:title y og:description, y repetirlos los duplicaría.
 */
import sharp from 'sharp';
import { statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public/og.jpg');

const src = join(ROOT, '.vendor-assets/photos/og-source.jpg');
const { width = 0, height = 0 } = await sharp(src).metadata();

/* Lado mayor de la miniatura. Por debajo del umbral de 300 de WhatsApp, y con
   holgura para la retina de la tarjeta compacta. */
const SIDE = 256;

if (width < SIDE || height < SIDE) {
  throw new Error(`La fuente (${width}x${height}) es menor que ${SIDE}: ampliarla la dejaría blanda.`);
}

/* Las medidas publicadas: la fuente encogida hasta que su lado mayor sea SIDE.
   Van en og:image:width/height, y si no coinciden con el archivo algunos
   rastreadores reservan el hueco equivocado. */
const scale = SIDE / Math.max(width, height);
const OUT_W = Math.round(width * scale);
const OUT_H = Math.round(height * scale);

await sharp(src)
  /* `inside`: cabe entero en el cuadro de SIDE sin recortar ni deformar. */
  .resize(SIDE, SIDE, { fit: 'inside', withoutEnlargement: true })
  /* JPEG y no PNG: el contenido es una foto. */
  .jpeg({ quality: 90, chromaSubsampling: '4:4:4', mozjpeg: true })
  .toFile(OUT);

const bytes = statSync(OUT).size;
console.log(
  `public/og.jpg  ${OUT_W}x${OUT_H} (fuente ${width}x${height})  ${(bytes / 1024).toFixed(1)} KB`,
);
