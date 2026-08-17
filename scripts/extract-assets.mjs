/**
 * One-shot: saca los assets embebidos del index.html del builder.
 *
 * Ya se ejecutó: su salida vive en .vendor-assets/ y de ahí sale src/assets/.
 * Se conserva para documentar de dónde salió cada archivo. Para volver a
 * correrlo hace falta recuperar el artefacto original, que ya no está en el
 * árbol pero sí en la historia:
 *
 *   git show 76ac6a3:index.html > legacy/index.html
 *
 * El export del builder guarda todos los assets en una línea JSON con forma
 * { uuid: { mime, compressed, data(base64) } }, y el markup los referencia por
 * uuid. Este script decodifica solo los que el markup usa, les pone nombre real
 * y los deja en .vendor-assets/ para que prepare-assets.mjs los convierta.
 *
 * No se corre en cada build: su salida vive commiteada en src/assets/.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '.vendor-assets');

/** uuid -> ruta de salida. Mapeo hecho a mano leyendo el markup legacy. */
const NAMES = {
  // Fotos
  'f2b6ca93-84bf-40a6-a3a2-342102d36136': 'photos/portrait.jpg',
  'eb789c4a-6710-4856-9189-61bb0b0804d4': 'photos/egg.jpg',
  // Iconos de app
  '8420123c-af2d-45c7-8327-f2684f178efe': 'apps/egx-one.webp',
  'a1145eb8-fffb-4b98-80b6-3e2cf7557236': 'apps/validme.webp',
  '59dddf97-2bf4-4648-9924-b80262b94e65': 'apps/egx-staff.png',
  '8e461298-04a3-4038-a6f0-4231181ffd7c': 'apps/presto.png',
  'c8f0f7ec-b004-4bbf-8fd2-a336552c7aa1': 'apps/skeletonpdf.png',
  // Logos de empresa
  'f6891f61-f864-4ace-a60d-5011cfe9f577': 'logos/datec.png',
  'd2d09ec6-2fe2-4d0d-977f-f2e1bf929e1b': 'logos/validme.png',
  '3bc203cd-fdec-414d-8604-c20691868618': 'logos/presto.png',
  '0ee65a5b-85cd-43a3-b7c5-375505a34857': 'logos/getserver.png',
  '376953e2-d313-4324-a7e4-4956d6a6b6b0': 'logos/banco-economico.png',
  // Iconos de marca y stack (SVG, se quedan como SVG)
  'd88a4920-890c-43b2-b0a7-a3de01ea29e2': 'icons/ios.svg',
  '115038d8-cbbf-440d-88bc-362b0959a512': 'icons/android.svg',
  '0aba4c1c-6258-40ae-8189-5cc51257c489': 'icons/github.svg',
  '06400b2c-d472-470f-a2b2-ee0db3a03960': 'icons/linkedin.svg',
  '310daca5-04a3-4881-8b51-603925566ff2': 'icons/mail.svg',
  '029bfc19-37a9-46a1-a4e9-16ee55fbc12f': 'icons/flutter.svg',
  'f71fbcc7-1bde-4dca-8308-b3ffbfa8aa8a': 'icons/dart.svg',
  '255e0b3d-3d3a-4ea1-bd05-a5f92f8f1b0d': 'icons/swift.svg',
  '9c4806b4-cf03-43d7-b892-8317675124f6': 'icons/kotlin.svg',
  'e0ddf54d-de6c-4997-9df3-d90bc278d52e': 'icons/firebase.svg',
  '2b050db4-4677-441b-a50f-a81ac7a3a47e': 'icons/postgresql.svg',
  '68213739-b1fa-42bb-9472-0a919c8846ef': 'icons/git.svg',
  '65b76e44-29e8-4194-81e6-fe48890ef31b': 'icons/github-mark.svg',
  'd6542c1f-e935-4e78-9c51-1630a4d2ab76': 'icons/figma.svg',
  '5073e237-65e3-4ee9-a10a-c2f510563661': 'icons/docker.svg',
  'b1fa60d5-b564-4dde-816b-b62ede8a097b': 'icons/sentry.svg',
  '86a60366-1ef4-4698-988e-481d2fd9cabb': 'icons/github-actions.svg',
  // Iconos de badge de sección
  '5ed99cfb-47c8-4fb1-93fa-6c54fd15acbb': 'icons/badge-apps.svg',
  'a48f47b0-dcf5-4c3b-9a4c-0339651e3d9e': 'icons/badge-path.svg',
  '26f0b525-3413-441b-aee9-78047ab51cf4': 'icons/badge-play.svg',
  '6644c83c-cc82-4bb6-8d39-6c3f33de68fb': 'icons/reset.svg',
};

const legacy = join(ROOT, 'legacy/index.html');
if (!existsSync(legacy)) {
  console.error('falta legacy/index.html — recupéralo con:');
  console.error('  mkdir -p legacy && git show 76ac6a3:index.html > legacy/index.html');
  process.exit(1);
}

const lines = readFileSync(legacy, 'utf8').split('\n');
const assets = JSON.parse(lines[376]);

let written = 0;
let bytes = 0;
for (const [uuid, name] of Object.entries(NAMES)) {
  const asset = assets[uuid];
  if (!asset) {
    console.warn(`  falta ${uuid} (${name})`);
    continue;
  }
  let buf = Buffer.from(asset.data, 'base64');
  if (asset.compressed) buf = gunzipSync(buf);
  const dest = join(OUT, name);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, buf);
  written++;
  bytes += buf.length;
}

// El markup escribe el contenido del <script type="__bundler/template"> como
// string JSON en la línea 389. Se vuelca aparte para poder trocearlo por sección.
writeFileSync(join(ROOT, '.vendor-assets/legacy-markup.html'), JSON.parse(lines[388]));

console.log(`${written} assets, ${(bytes / 1024).toFixed(0)} KB -> .vendor-assets/`);
