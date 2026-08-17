/**
 * Lectura de tokens CSS para los canvas.
 *
 * `getComputedStyle()` obliga al navegador a resolver estilo. Llamarlo dentro
 * de un bucle de animación son dos recálculos por frame que no hacen falta:
 * el color de acento solo cambia cuando cambia el tema. Se cachea y se
 * invalida observando el atributo `data-t` del <html>.
 */
const cache = new Map<string, string>();

export function token(name: string, fallback: string): string {
  let value = cache.get(name);
  if (value === undefined) {
    value = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
    cache.set(name, value);
  }
  return value;
}

new MutationObserver(() => cache.clear()).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-t'],
});
