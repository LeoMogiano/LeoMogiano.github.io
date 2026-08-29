/**
 * Fechas y duraciones de la trayectoria, derivadas.
 *
 * Antes cada rango y cada duración eran strings a mano, en tres idiomas: 33
 * cadenas que había que mantener de acuerdo entre sí sin que nada lo
 * verificara. Ya habían discrepado —Datec decía «2 años» sobre un rango de 1
 * año 5 meses— y no podía no volver a pasar: el puesto actual termina en
 * «Ahora», que se mueve, contra una duración congelada que no.
 *
 * Ahora `jobs.ts` guarda solo las fechas y todo lo demás se calcula.
 */
import type { Dict } from './index';

/** Mes en formato 'YYYY-MM'. `null` como fin significa «hasta hoy». */
export type Month = string;

export interface Span {
  start: Month;
  end: Month | null;
}

const parse = (m: Month): [number, number] => {
  const [y, mo] = m.split('-').map(Number);
  return [y, mo];
};

/**
 * Meses de un rango, contados de forma inclusiva: Ago→Nov son 4, no 3. Es la
 * convención de LinkedIn y la que ya seguían cuatro de las cinco entradas
 * escritas a mano, así que las duraciones publicadas no cambian.
 */
export function months({ start, end }: Span): number {
  const [sy, sm] = parse(start);
  const now = new Date();
  const [ey, em] = end ? parse(end) : [now.getFullYear(), now.getMonth() + 1];
  return (ey - sy) * 12 + (em - sm) + 1;
}

/**
 * `Intl` con `month: 'short'` da lo que se quiere en los tres idiomas:
 * «abr 2025», «Apr 2025», «2025年4月». El español lo devuelve en minúscula y a
 * veces con punto; de ahí la limpieza. En japonés empieza por dígito, así que
 * capitalizar no hace nada y es seguro aplicarlo siempre.
 */
export function formatMonth(m: Month, code: string): string {
  const [y, mo] = parse(m);
  const out = new Intl.DateTimeFormat(code, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, mo - 1, 1)));
  const clean = out.replace('.', '');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}


export function formatDuration(span: Span, t: Dict): string {
  const total = months(span);
  const y = Math.floor(total / 12);
  const mo = total % 12;
  const parts: string[] = [];
  if (y) parts.push(`${y}${t.durSep}${y === 1 ? t.durYear : t.durYears}`);
  if (mo) parts.push(`${mo}${t.durSep}${mo === 1 ? t.durMonth : t.durMonths}`);
  /* El japonés no separa la cifra de la unidad ni las dos partes entre sí, y
     usa el mismo separador —vacío— para las dos cosas. Unir con `durSep || ' '`
     habría devuelto «1年 8ヶ月». */
  if (!parts.length) return `0${t.durSep}${t.durMonths}`;
  return parts.join(t.durSep);
}

/**
 * Los dos extremos del rango, cada uno con su etiqueta y su valor ISO. Van en
 * dos `<time>` separados a propósito: el atributo `datetime` admite un
 * instante, no un intervalo, así que `2025-04/2026-03` era inválido.
 * El extremo abierto («Ahora») no es una fecha y va sin `<time>`.
 */
export function rangeParts(span: Span, t: Dict) {
  return {
    from: { iso: span.start, label: formatMonth(span.start, t.code) },
    to: span.end
      ? { iso: span.end, label: formatMonth(span.end, t.code) }
      : { iso: null, label: t.now },
  };
}
