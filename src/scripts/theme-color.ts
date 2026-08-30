/**
 * Fija el color de las barras de Safari mientras hay un modal abierto.
 *
 * El sitio no lleva <meta theme-color> a propósito —ver la nota en Base.astro—:
 * sin él Safari muestrea el borde del viewport y tiñe sus barras de forma
 * continua, que es lo que se quiere contra un header translúcido.
 *
 * Con un modal a pantalla completa esa regla se da vuelta. El overlay lleva
 * transparencia y desenfoque; la barra que Safari pinta con el color muestreado
 * es plana. Los dos tonos no coinciden y arriba aparece un bloque con una
 * costura visible justo debajo de la barra de estado.
 *
 * Mientras el modal está abierto, entonces, se le dice el color en vez de
 * dejarlo adivinar. Al cerrar se quita el <meta> y Safari vuelve a muestrear:
 * el comportamiento normal del sitio queda intacto.
 */

let meta: HTMLMetaElement | null = null;

/**
 * @param dark  Color con el que se ve el modal sobre el tema oscuro.
 * @param light Idem sobre el claro. El overlay suele ser translúcido, así que
 *              lo que hay detrás cambia el resultado y no puede ser uno solo.
 */
export function lockThemeColor(dark: string, light: string): void {
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.append(meta);
  }
  meta.content = document.documentElement.dataset.t === 'light' ? light : dark;

  /*
   * Y de paso se apaga la máscara del gradiente de fondo. Se desvanece en los
   * primeros y últimos 120 px para alimentar ese mismo muestreo que acabamos de
   * volver innecesario, y a través de un overlay translúcido esa frontera se ve
   * como una banda plana arriba. La regla vive en global.css, donde vive la
   * máscara.
   */
  document.documentElement.classList.add('has-modal');
}

export function unlockThemeColor(): void {
  meta?.remove();
  meta = null;
  document.documentElement.classList.remove('has-modal');
}
