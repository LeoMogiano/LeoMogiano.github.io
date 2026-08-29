/**
 * Verifica el artefacto de `astro build`, no el código fuente: lo que llega a
 * un agente es dist/, y los tres archivos que le importan —llms.txt, el JSON-LD
 * del head y el 404— se generan desde tres lugares distintos que pueden
 * desincronizarse sin que nada falle en el build.
 *
 * Correr con: npm test (hace build primero).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');

test('llms.txt existe y sigue el formato de llmstxt.org', () => {
  const txt = read('llms.txt');
  assert.match(txt, /^# Leo Mogiano\n/, 'arranca con un H1 con el nombre del sitio');
  assert.match(txt, /\n> .+\n/, 'lleva la línea de resumen en blockquote');
});

test('llms.txt dice cuándo usar el sitio y cuándo no', () => {
  const txt = read('llms.txt');
  assert.match(txt, /## When to use this site/);
  assert.match(txt, /Do not use this site as a source for:/);
});

test('llms.txt lista páginas, apps, experiencia, CV y contacto', () => {
  const txt = read('llms.txt');
  for (const h of ['## Pages', '## Apps in production', '## Experience', '## Résumé', '## Contact and profiles']) {
    assert.ok(txt.includes(h), `falta la sección ${h}`);
  }
  for (const lang of ['es', 'en', 'ja']) {
    assert.ok(txt.includes(`/cv/leo-mogiano-cv-${lang}.pdf`), `falta el CV en ${lang}`);
  }
  assert.ok(txt.includes('EGX One'), 'las apps salen de data/apps.ts');
  assert.ok(txt.includes('Banco Económico'), 'la experiencia sale de data/jobs.ts');
  assert.ok(txt.includes('mailto:'), 'el contacto sale de data/socials.ts');
});

test('llms.txt usa URLs absolutas al dominio real', () => {
  const txt = read('llms.txt');
  assert.ok(!/\]\(\//.test(txt), 'ninguna URL relativa: un agente puede leer el archivo fuera de contexto');
  assert.ok(txt.includes('https://leomogiano.github.io/'));
});

const ld = (page) => {
  const html = read(page);
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(m, `${page} no tiene JSON-LD`);
  return JSON.parse(m[1]);
};

for (const [page, lang] of [['index.html', 'es'], ['en/index.html', 'en'], ['ja/index.html', 'ja']]) {
  test(`JSON-LD de ${lang} trae los campos que la auditoría pide`, () => {
    const data = ld(page);
    assert.equal(data['@type'], 'Person');
    assert.equal(data.name, 'Leo Mogiano');
    assert.ok(data.description && data.description.length > 60, 'description presente y con contenido');
    assert.ok(data.url.startsWith('https://leomogiano.github.io/'));
    assert.equal(data.address['@type'], 'PostalAddress');
    assert.equal(data.address.addressCountry, 'BO');
    assert.ok(Array.isArray(data.sameAs) && data.sameAs.length >= 2);
    assert.ok(data.email.startsWith('mailto:'));
  });

  test(`${lang} enlaza llms.txt y el sitemap desde el head`, () => {
    const html = read(page);
    assert.match(html, /<link rel="sitemap" type="application\/xml" href="\/sitemap\.xml"/);
    assert.match(html, /<link rel="alternate" type="text\/markdown" href="\/llms\.txt"/);
  });
}

test('la description del JSON-LD está traducida por idioma', () => {
  const descs = ['index.html', 'en/index.html', 'ja/index.html'].map((p) => ld(p).description);
  assert.equal(new Set(descs).size, 3, 'las tres son distintas: sale del META por idioma');
});

test('el 404 le da a un agente por dónde seguir', () => {
  const html = read('404.html');
  assert.ok(html.includes('href="/llms.txt"'), 'apunta al índice en markdown');
  assert.ok(html.includes('href="/sitemap.xml"'), 'apunta al sitemap');
  assert.ok(html.includes('404 Not Found'), 'dice en texto que la ruta no existe');
});

/* --- Accesibilidad y entrega, contra lo que sale del build --- */

test('ningún <span> lleva aria-label sin un rol que lo admita', () => {
  /* `generic` —el rol de un <span> pelado— tiene aria-label prohibido: el
     nombre no se anuncia y axe lo marca como error. Cada aria-label sobre un
     span tiene que venir con un role que sí acepte nombre accesible. */
  const ROLES_CON_NOMBRE = new Set(['img', 'button', 'link', 'dialog', 'group', 'status', 'region']);
  for (const page of ['index.html', 'en/index.html', 'ja/index.html', '404.html']) {
    const html = read(page);
    for (const [tag] of html.matchAll(/<span\b[^>]*\baria-label=[^>]*>/g)) {
      const role = tag.match(/\brole="([^"]+)"/)?.[1];
      assert.ok(
        role && ROLES_CON_NOMBRE.has(role),
        `${page}: span con aria-label y role=${role ?? 'ninguno'} — ${tag.slice(0, 110)}`,
      );
    }
  }
});

test('las pills de plataforma se anuncian con nombre', () => {
  const html = read('index.html');
  for (const label of ['Android', 'Apple', 'Flutter']) {
    const re = new RegExp(`<span[^>]*role="img"[^>]*aria-label="${label}"|<span[^>]*aria-label="${label}"[^>]*role="img"`);
    assert.match(html, re, `la pill de ${label} tiene que ser role="img" con nombre`);
  }
});

test('el CSS va inline: cero hojas que bloqueen el primer pintado', () => {
  for (const page of ['index.html', 'en/index.html', 'ja/index.html', '404.html']) {
    const html = read(page);
    /* fonts-ja.css queda fuera a propósito: es una hoja escrita a mano en
       public/, no un bundle de Astro, y solo la carga el japonés. */
    const externas = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)]
      .map(([tag]) => tag)
      .filter((tag) => !tag.includes('/fonts-ja.css'));
    assert.deepEqual(externas, [], `${page} todavía pide una hoja externa`);
    assert.ok(/<style>/.test(html), `${page} no tiene el CSS inline`);
  }
});
