/**
 * Convierte .vendor-assets/ a WebP en src/assets/. Manual: se corre cuando
 * cambia una imagen, y la salida se commitea. El build de Astro no toca
 * imágenes (image.service = noop), así que este paso no cuesta nada en CI.
 *
 * Dos modos, según el origen:
 *
 *   lossless  PNG/WebP (logos, iconos): webp lossless. Se verifica que el
 *             bitmap decodificado sea idéntico bit a bit al de la fuente.
 *   photo     JPEG (retrato, polaroid): lossless aquí sería absurdo — el JPEG
 *             ya perdió información y re-encodearlo sin pérdida solo preserva
 *             sus artefactos al triple de tamaño. Se usa quality 95 y se
 *             verifica con PSNR contra la fuente.
 *   shot      Capturas de app: UI sintética con degradados saturados y renders
 *             3D. No entra en ninguno de los dos anteriores. Lossless pesa 1.5
 *             MB para las cinco —inaceptable para un portafolio— y en photo el
 *             PSNR se estanca en 35 dB por más que se suba la calidad: incluso
 *             a quality 100 el degradado naranja no llega a 45. El umbral se
 *             baja a 34 dB SOLO para este modo, con la comparación visual
 *             hecha a mano: a quality 92 no hay diferencia apreciable. Un 35 dB
 *             sobre un degradado sintético no es lo mismo que un 35 dB sobre
 *             una foto.
 *
 *
 * Cada imagen se redimensiona a 2x su tamaño de despliegue: no es pérdida de
 * calidad, es dejar de mandar píxeles que la pantalla nunca va a mostrar.
 */
import sharp from 'sharp';
import { copyFileSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, '.vendor-assets');
const OUT = join(ROOT, 'src/assets');

/** width: 2x del tamaño CSS de despliegue. null = no redimensionar. */
const JOBS = [
  // Fotos — quality 95
  { in: 'photos/portrait.jpg', out: 'portrait.webp', mode: 'photo', width: 336 },
  { in: 'photos/egg.jpg', out: 'egg.webp', mode: 'photo', width: 720 },
  // Iconos de app — se muestran a 96px
  // Estos dos ya vienen como WebP lossy y pesan 15 y 12 KB. Cualquier
  // re-encode vuelve a perder (el 4:2:0 de WebP lossy castiga los colores
  // saturados de un icono: 35 dB) o engorda para preservar artefactos
  // (lossless: 30 KB). Se copian tal cual: cero pérdida nueva, menor tamaño.
  { in: 'apps/egx-one.webp', out: 'apps/egx-one.webp', mode: 'copy' },
  { in: 'apps/validme.webp', out: 'apps/validme.webp', mode: 'copy' },
  { in: 'apps/egx-staff.png', out: 'apps/egx-staff.webp', mode: 'lossless', width: 192 },
  { in: 'apps/presto.png', out: 'apps/presto.webp', mode: 'lossless', width: 192 },
  { in: 'apps/skeletonpdf.png', out: 'apps/skeletonpdf.webp', mode: 'lossless', width: 192 },
  // Capturas de EGX One — la pantalla del teléfono mide ~282 px CSS
  ...[1, 2, 3, 4, 5].map((n) => ({
    in: `apps/shots/egx-one-${n}.png`,
    out: `apps/shots/egx-one-${n}.webp`,
    mode: 'shot',
    width: 564,
  })),
  // Logos — se muestran a 60px y la fuente ya viene a 120
  { in: 'logos/datec.png', out: 'logos/datec.webp', mode: 'lossless', width: null },
  { in: 'logos/validme.png', out: 'logos/validme.webp', mode: 'lossless', width: null },
  { in: 'logos/presto.png', out: 'logos/presto.webp', mode: 'lossless', width: null },
  { in: 'logos/getserver.png', out: 'logos/getserver.webp', mode: 'lossless', width: null },
  { in: 'logos/banco-economico.png', out: 'logos/banco-economico.webp', mode: 'lossless', width: null },
];

/** Bitmap RGBA crudo, para comparar dos imágenes sin que el contenedor estorbe. */
const raw = (input) => sharp(input).ensureAlpha().raw().toBuffer();

/**
 * Peak signal-to-noise ratio en dB. >40 dB = diferencia imperceptible.
 * Solo cuenta píxeles visibles: el RGB bajo alfa 0 no se ve y los codecs no se
 * ponen de acuerdo en qué guardar ahí, así que incluirlo hunde la métrica sin
 * que haya una sola diferencia perceptible. El canal alfa sí se compara entero.
 */
function psnr(a, b) {
  if (a.length !== b.length) throw new Error('dimensiones distintas');
  let sum = 0;
  let n = 0;
  for (let i = 0; i < a.length; i += 4) {
    const da = a[i + 3] - b[i + 3];
    sum += da * da;
    n++;
    if (a[i + 3] === 0 && b[i + 3] === 0) continue;
    for (let c = 0; c < 3; c++) {
      const d = a[i + c] - b[i + c];
      sum += d * d;
      n++;
    }
  }
  const mse = sum / n;
  return mse === 0 ? Infinity : 10 * Math.log10(255 * 255 / mse);
}

let before = 0;
let after = 0;
const report = [];

for (const job of JOBS) {
  const src = join(SRC, job.in);
  const dest = join(OUT, job.out);
  mkdirSync(dirname(dest), { recursive: true });

  if (job.mode === 'copy') {
    copyFileSync(src, dest);
    const bytes = statSync(src).size;
    before += bytes;
    after += bytes;
    report.push([job.out, bytes, bytes, 'copiado sin re-encode']);
    continue;
  }

  const base = job.crop
    ? sharp(src).extract(job.crop)
    : sharp(src);
  const resized = job.width
    ? base.clone().resize({ width: job.width, withoutEnlargement: true, kernel: 'lanczos3' })
    : base.clone();

  const opts = job.mode === 'lossless'
    ? { lossless: true, effort: 6 }
    : job.mode === 'shot'
      ? { quality: 92, effort: 6, smartSubsample: false }
      : { quality: 95, effort: 6, smartSubsample: false };

  await resized.clone().webp(opts).toFile(dest);

  // Verificación: se compara contra la fuente ya redimensionada, no contra el
  // original, porque el redimensionado es intencional y no es "pérdida".
  const reference = await resized.clone().png({ compressionLevel: 0 }).toBuffer();
  const [refRaw, outRaw] = await Promise.all([raw(reference), raw(dest)]);

  const srcBytes = statSync(src).size;
  const outBytes = statSync(dest).size;
  before += srcBytes;
  after += outBytes;

  if (job.mode === 'lossless') {
    // Los píxeles totalmente transparentes pueden traer RGB distinto según el
    // codec (WebP los pone en cero, PNG los conserva) y son invisibles. Lo que
    // tiene que coincidir exacto es el canal alfa y el RGB donde alfa > 0.
    let same = refRaw.length === outRaw.length;
    for (let i = 0; same && i < refRaw.length; i += 4) {
      if (refRaw[i + 3] !== outRaw[i + 3]) same = false;
      else if (refRaw[i + 3] > 0) {
        for (let c = 0; c < 3; c++) if (refRaw[i + c] !== outRaw[i + c]) same = false;
      }
    }
    report.push([job.out, srcBytes, outBytes, same ? 'idéntico' : 'DIFIERE ✗']);
    if (!same) process.exitCode = 1;
  } else {
    const db = psnr(refRaw, outRaw);
    const floor = job.mode === 'shot' ? 34 : 45;
    report.push([job.out, srcBytes, outBytes, `PSNR ${db.toFixed(1)} dB`]);
    if (db < floor) process.exitCode = 1;
  }
}

for (const [name, a, b, note] of report) {
  const pct = (100 - (b / a) * 100).toFixed(0);
  console.log(
    `${name.padEnd(28)} ${String(a).padStart(7)} -> ${String(b).padStart(6)} B  ${String(pct).padStart(3)}%  ${note}`,
  );
}
console.log(`\ntotal ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB`);
if (process.exitCode) console.error('\n✗ alguna imagen no pasó la verificación de calidad');
