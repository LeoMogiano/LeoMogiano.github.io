/**
 * Genera public/og.jpg, la miniatura que ven WhatsApp, X y LinkedIn al
 * compartir el sitio. Manual, como el resto de scripts de assets: la salida se
 * commitea.
 *
 * Cuadrada y solo la foto. La proporción decide el formato de la vista previa:
 * con 1.91:1 las plataformas dibujan la tarjeta grande —imagen a lo ancho y
 * texto debajo— y con una cuadrada dibujan la compacta, miniatura a la
 * izquierda y título y descripción al lado. Es la que se pidió.
 *
 * Nada de texto dentro de la imagen: el nombre y la descripción los pone cada
 * plataforma desde og:title y og:description, y repetirlos los duplicaría.
 *
 * Sin escalar ni un píxel: el lado sale del lado corto de la foto, así que se
 * recorta pero nunca se amplía.
 */
import sharp from 'sharp';
import { statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public/og.jpg');

const src = join(ROOT, '.vendor-assets/photos/portrait.jpg');
const { width = 0, height = 0 } = await sharp(src).metadata();

/*
 * Encuadre a cara y hombros, medido a mano sobre la foto: llena el cuadro como
 * lo hace el icono de una app, en vez de dejar media cortina y el teléfono
 * dentro. Va en coordenadas de la fuente (496x554), así que si algún día se
 * cambia la foto hay que volver a medirlo.
 */
const CROP = { left: 60, top: 0, width: 380, height: 380 };

if (CROP.left + CROP.width > width || CROP.top + CROP.height > height) {
  throw new Error(`El recorte se sale de la foto (${width}x${height}). Vuelve a medirlo.`);
}

await sharp(src)
  /* Sin `resize`: se publica al tamaño del recorte. Ampliar 380 a 496 no añade
     un solo detalle, solo lo deja blando, y la miniatura se ve pequeña igual. */
  .extract(CROP)
  /* JPEG y no PNG: el contenido es una foto. */
  .jpeg({ quality: 90, chromaSubsampling: '4:4:4', mozjpeg: true })
  .toFile(OUT);

const bytes = statSync(OUT).size;
console.log(
  `public/og.jpg  ${CROP.width}x${CROP.height} (fuente ${width}x${height})  ${(bytes / 1024).toFixed(1)} KB`,
);
