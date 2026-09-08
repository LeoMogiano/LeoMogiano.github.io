/**
 * El contador de visitas del header.
 *
 * A propósito no sabe de ningún proveedor: pide un número a una URL y lo
 * pinta. Para conectarlo basta con poner el endpoint en ENDPOINT y, si la
 * respuesta no es `{ count }`, ajustar `parse`. Sirve igual para GoatCounter,
 * un Worker propio o cualquier cosa que devuelva JSON.
 *
 * Mientras ENDPOINT esté vacío el número lo genera `randomTotal()`: es un
 * marcador de posición para ver el odómetro funcionando, no una métrica.
 */
const ENDPOINT = '';

/** Extrae el total de la respuesta. Acepta número suelto o `{ count }`. */
const parse = (data: unknown): number => {
  const raw = typeof data === 'object' && data !== null ? (data as { count?: unknown }).count : data;
  // GoatCounter devuelve el total ya formateado ("1,284"), no un número.
  const n = typeof raw === 'string' ? Number(raw.replace(/\D/g, '')) : Number(raw);
  return Number.isFinite(n) ? n : NaN;
};

const el = document.querySelector<HTMLElement>('[data-counter]');
const odo = el?.querySelector<HTMLElement>('[data-counter-odo]');
const sr = el?.querySelector<HTMLElement>('[data-counter-sr]');

/** Cuatro dígitos, siempre por encima de mil: nunca cambia de ancho. */
const randomTotal = () => 1_000 + Math.floor(Math.random() * 9_000);

if (el && odo && sr) {
  const locale = document.documentElement.lang || 'es';
  const nf = new Intl.NumberFormat(locale);

  const paint = (value: number) => {
    const text = nf.format(value);
    const chars = [...text];

    // Solo reconstruye la fila si cambió la cantidad de columnas (999 → 1.000).
    if (odo.childElementCount !== chars.length) {
      odo.replaceChildren(
        ...chars.map((ch) => {
          if (!/\d/.test(ch)) {
            const punct = document.createElement('span');
            punct.className = 'counter__punct';
            punct.textContent = ch;
            return punct;
          }
          const col = document.createElement('span');
          col.className = 'counter__col';
          const reel = document.createElement('span');
          reel.className = 'counter__reel';
          for (let d = 0; d <= 9; d++) {
            const cell = document.createElement('span');
            cell.textContent = String(d);
            reel.append(cell);
          }
          col.append(reel);
          return col;
        }),
      );
    }

    chars.forEach((ch, i) => {
      if (!/\d/.test(ch)) return;
      const reel = odo.children[i]?.firstElementChild as HTMLElement | undefined;
      if (reel) reel.style.transform = `translateY(-${ch}em)`;
    });

    sr.textContent = text;
    el.dataset.ready = '';
  };

  const refresh = async () => {
    try {
      const res = await fetch(ENDPOINT, { headers: { accept: 'application/json' } });
      if (!res.ok) return;
      const total = parse(await res.json());
      if (Number.isFinite(total)) paint(total);
    } catch {
      // Sin red o con el servicio caído el contador simplemente no aparece.
    }
  };

  if (ENDPOINT) refresh();
  else paint(randomTotal());
  // Refresco lento: es un total acumulado, no cambia de segundo a segundo, y
  // así una pestaña abierta toda la tarde no machaca el servicio.
  if (ENDPOINT) setInterval(refresh, 60_000);
}

export {};
