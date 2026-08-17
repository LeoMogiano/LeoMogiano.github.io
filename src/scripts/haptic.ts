/**
 * Vibración al tocar el retrato, solo en iOS.
 *
 * Safari en iOS no expone `navigator.vibrate`. El único elemento que dispara
 * háptica nativa es un `<input type="checkbox" switch>`, así que se superpone
 * uno transparente sobre el retrato: el dedo toca el switch (iOS vibra) y el
 * click se reenvía a la imagen.
 */
const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

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

export {};
