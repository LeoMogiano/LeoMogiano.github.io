/**
 * Genera src/styles/icons.css: cada SVG de .vendor-assets/icons/ se vuelve una
 * custom property con data URI, más la clase .icon--<nombre> que la usa como
 * máscara.
 *
 * Los 30 iconos juntos pesan ~12 KB. Inline en el CSS son cero requests y cero
 * parpadeo; como archivos sueltos serían 30 round-trips de 400 bytes cada uno.
 *
 * Manual, igual que prepare-assets: la salida se commitea.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, '.vendor-assets/icons');

/** Minifica y codifica un SVG para meterlo en url() sin base64 (más corto). */
function toDataUri(svg) {
  const clean = svg
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/<title>.*?<\/title>/g, '')
    .replace(/ class="[^"]*"/g, '')
    .trim();
  const encoded = clean
    .replace(/"/g, "'")
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/\{/g, '%7B')
    .replace(/\}/g, '%7D');
  return `url("data:image/svg+xml,${encoded}")`;
}

const names = readdirSync(SRC).filter((f) => f.endsWith('.svg')).sort();

const vars = [];
const rules = [];
for (const file of names) {
  const name = file.replace(/\.svg$/, '');
  vars.push(`  --icon-${name}: ${toDataUri(readFileSync(join(SRC, file), 'utf8'))};`);
  rules.push(
    `.icon--${name} { -webkit-mask-image: var(--icon-${name}); mask-image: var(--icon-${name}); }`,
  );
}

const css = `/* Generado por scripts/build-icons.mjs — no editar a mano. */
:root {
${vars.join('\n')}
}

/* La máscara pinta el icono con currentColor: hereda el color del contexto y
   cambia solo con el tema, sin duplicar assets por variante. */
.icon {
  display: inline-block;
  flex: none;
  width: 1em;
  height: 1em;
  background: currentColor;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

${rules.join('\n')}
`;

const dest = join(ROOT, 'src/styles/icons.css');
writeFileSync(dest, css);
console.log(`${names.length} iconos -> src/styles/icons.css (${(css.length / 1024).toFixed(1)} KB)`);
