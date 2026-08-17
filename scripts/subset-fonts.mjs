/**
 * Genera public/fonts/*.woff2 a partir de los .ttf de Google Fonts.
 *
 * Usa `subset-font` (harfbuzz compilado a wasm) en vez de pyftsubset: mismo
 * subsetter que usa Google, sin dependencia de Python en el repo ni en CI.
 *
 * Variable donde existe — un archivo por familia en vez de uno por peso.
 * harfbuzz preserva los ejes si no se pide instanciación.
 *
 * Dos estrategias de subset:
 *   latin  rango latin + latin-ext fijo. NO se subsetea al texto exacto: el
 *          contenido cambia y un subset por texto se rompe en silencio al
 *          agregar una palabra con un carácter que no estaba.
 *   ja     al texto exacto de src/i18n/ja.ts. Aquí sí: el alfabeto es cerrado
 *          (~220 glifos) y la diferencia es 6 MB contra ~25 KB.
 *
 * Manual, igual que los otros scripts de assets: la salida se commitea.
 */
import subsetFont from 'subset-font';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = join(ROOT, '.vendor-fonts');
const OUT = join(ROOT, 'public/fonts');

const RAW = 'https://raw.githubusercontent.com/google/fonts/main';

const FONTS = [
  {
    out: 'instrument-serif-400.woff2',
    url: `${RAW}/ofl/instrumentserif/InstrumentSerif-Regular.ttf`,
    scope: 'latin',
  },
  {
    out: 'instrument-serif-400-italic.woff2',
    url: `${RAW}/ofl/instrumentserif/InstrumentSerif-Italic.ttf`,
    scope: 'latin',
  },
  {
    out: 'dm-sans-var.woff2',
    url: `${RAW}/ofl/dmsans/DMSans%5Bopsz%2Cwght%5D.ttf`,
    scope: 'latin',
    // DM Sans trae dos ejes: wght y opsz. El peso se conserva variable; el
    // tamaño óptico se fija en 14, que es donde vive todo el cuerpo de texto
    // del sitio. Mantener ese eje costaba un tercio del archivo por una
    // sutileza que a 12-16px nadie distingue.
    axes: { opsz: 14 },
  },
  {
    // La tipografía de los nombres de app. El builder la exponía como una
    // perilla y su valor por defecto —el que salió publicado— era esta.
    out: 'bricolage-grotesque-var.woff2',
    url: `${RAW}/ofl/bricolagegrotesque/BricolageGrotesque%5Bopsz%2Cwdth%2Cwght%5D.ttf`,
    scope: 'latin',
    axes: { opsz: 14, wdth: 100 },
  },
  {
    out: 'dm-mono-400.woff2',
    url: `${RAW}/ofl/dmmono/DMMono-Regular.ttf`,
    scope: 'latin',
  },
  {
    out: 'noto-sans-jp-var.woff2',
    url: `${RAW}/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf`,
    scope: 'ja',
  },
  {
    out: 'noto-serif-jp-var.woff2',
    url: `${RAW}/ofl/notoserifjp/NotoSerifJP%5Bwght%5D.ttf`,
    scope: 'ja',
  },
];

/** latin + latin-ext, el mismo rango que sirve Google Fonts. */
const LATIN =
  ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`' +
  'abcdefghijklmnopqrstuvwxyz{|}~' +
  ' ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿' +
  'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞß' +
  'àáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ' +
  'ĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽž' +
  '‐‑‒–—―‘’‚‛“”„‟†‡•…‰′″‹›‽⁄€™←↑→↓↔⌘' +
  '／·';

/** Todo el texto japonés real del sitio, más los latinos que lo acompañan. */
function japaneseText() {
  const ja = join(ROOT, 'src/i18n/ja.ts');
  if (!existsSync(ja)) {
    throw new Error('falta src/i18n/ja.ts — el subset japonés se saca de ahí');
  }
  // Se toman todos los caracteres del archivo: sobran las palabras clave de TS,
  // pero son ASCII y ya están cubiertas. Lo que importa es no perder un kanji.
  const chars = new Set(readFileSync(ja, 'utf8'));
  return [...chars].join('');
}

mkdirSync(CACHE, { recursive: true });
mkdirSync(OUT, { recursive: true });

const jaText = japaneseText();
const jaGlyphs = [...new Set(jaText)].filter((c) => /[　-ヿ㐀-鿿＀-￯]/.test(c));
console.log(`japonés: ${jaGlyphs.length} glifos CJK únicos\n`);

for (const font of FONTS) {
  const cached = join(CACHE, font.out.replace(/\.woff2$/, '.ttf'));

  if (!existsSync(cached)) {
    const res = await fetch(font.url);
    if (!res.ok) throw new Error(`${res.status} al bajar ${font.url}`);
    writeFileSync(cached, Buffer.from(await res.arrayBuffer()));
  }

  const source = readFileSync(cached);
  const text = font.scope === 'ja' ? LATIN + jaText : LATIN;

  // El eje `wght` nunca se instancia: el archivo sigue siendo variable. Solo se
  // fijan los ejes que la fuente declara en `axes` y el sitio no usa.
  const buf = await subsetFont(source, text, {
    targetFormat: 'woff2',
    ...(font.axes ? { variationAxes: font.axes } : {}),
  });
  writeFileSync(join(OUT, font.out), buf);

  console.log(
    `${font.out.padEnd(34)} ${String(source.length).padStart(9)} -> ${String(buf.length).padStart(7)} B` +
      `  (${(100 - (buf.length / source.length) * 100).toFixed(1)}% menos)`,
  );
}
