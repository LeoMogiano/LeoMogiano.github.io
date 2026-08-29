/**
 * Sitemap generado desde `langs`, no escrito a mano: al añadir un idioma la
 * lista se actualiza sola en vez de quedarse desincronizada en silencio.
 *
 * Cada URL declara sus alternativas con `xhtml:link`, que es lo que le dice a
 * Google que las tres páginas son la misma en distintos idiomas y no contenido
 * duplicado.
 */
import type { APIRoute } from 'astro';
import { langs, langPrefix } from '../i18n';

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('Falta `site` en astro.config.mjs');

  const href = (lang: (typeof langs)[number]) => new URL(`${langPrefix(lang)}/`, site).href;

  const alternates = [
    ...langs.map((l) => `      <xhtml:link rel="alternate" hreflang="${l}" href="${href(l)}"/>`),
    `      <xhtml:link rel="alternate" hreflang="x-default" href="${href('es')}"/>`,
  ].join('\n');

  const urls = langs
    .map(
      (lang) => `  <url>
    <loc>${href(lang)}</loc>
${alternates}
  </url>`,
    )
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
