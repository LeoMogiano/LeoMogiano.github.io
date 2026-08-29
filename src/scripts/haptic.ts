/**
 * Háptica en iOS, y vibración donde exista `navigator.vibrate`.
 *
 * Safari nunca implementó `navigator.vibrate`. El único disparador es un
 * `<input type="checkbox" switch>` (iOS 17.4+), y desde iOS 26.5 Apple cerró la
 * vía programática que usaban todas las librerías del truco: un `.click()` por
 * código —sobre el input o sobre su `<label>`— ya no vibra. iOS exige un gesto
 * real (`isTrusted`) que aterrice sobre el propio control.
 *
 * Así que el switch no se pulsa: se pone DEBAJO del dedo. A cada elemento con
 * `data-haptic` se le inyecta uno invisible, estirado sobre su caja. El toque
 * cae en el switch —iOS vibra— y el click burbujea al botón que lo contiene,
 * que sigue haciendo lo suyo sin enterarse.
 *
 * Nota de validez: `<button>` no admite contenido interactivo, y esto mete un
 * input dentro. Es la única técnica que funciona tras el parche, y es la que
 * usan las librerías vivas. El coste se acota con `aria-hidden` y
 * `tabIndex = -1`: el árbol de accesibilidad y el orden de tabulación quedan
 * exactamente como estaban.
 */
const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/** Switch transparente que cubre el elemento y recibe el toque en su lugar. */
function overlay(el: HTMLElement, round = false): void {
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.setAttribute('switch', '');
  input.setAttribute('aria-hidden', 'true');
  input.tabIndex = -1;

  Object.assign(input.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    margin: '0',
    opacity: '0',
    zIndex: '2',
    touchAction: 'manipulation',
    cursor: 'none',
  });
  /* Recorta el área al círculo del retrato en vez de a su cuadrado. */
  if (round) input.style.clipPath = 'inset(0 round 999px)';
  input.style.setProperty('-webkit-tap-highlight-color', 'transparent');

  el.append(input);
}

if (isIOS) {
  for (const el of document.querySelectorAll<HTMLElement>('[data-haptic]')) overlay(el);
} else {
  /*
   * Fuera de iOS sí hay API. Delegado y en fase de captura, para que corra
   * aunque el handler del elemento llame a stopPropagation().
   */
  document.addEventListener(
    'click',
    (event) => {
      if ((event.target as Element | null)?.closest('[data-haptic]')) navigator.vibrate?.(8);
    },
    true,
  );
}

/* --- retrato: superposición propia, ver cabecera --- */

const portrait = document.querySelector<HTMLElement>('[data-portrait]');
const host = portrait?.parentElement;

if (isIOS && portrait && host && !host.querySelector('[data-haptic-trigger]')) {
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

  const trigger = document.createElement('input');
  trigger.type = 'checkbox';
  trigger.setAttribute('switch', '');
  trigger.setAttribute('data-haptic-trigger', '');
  trigger.setAttribute('aria-hidden', 'true');
  trigger.tabIndex = -1;

  Object.assign(trigger.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    margin: '0',
    opacity: '0',
    zIndex: '3',
    // Recorta el área táctil al círculo del retrato, no al cuadrado.
    clipPath: 'inset(0 round 999px)',
    touchAction: 'manipulation',
    cursor: 'none',
  });
  trigger.style.setProperty('-webkit-tap-highlight-color', 'transparent');

  trigger.addEventListener('click', () => {
    navigator.vibrate?.(8);
    portrait.click();
  });

  host.append(trigger);
}
