/**
 * Háptica suave en los cambios de estado.
 *
 * Safari en iOS no expone `navigator.vibrate`. El único elemento que dispara
 * háptica nativa es un `<input type="checkbox" switch>` (iOS 17.4+), así que se
 * mantiene uno oculto y se pulsa por código desde el gesto del usuario.
 *
 * El retrato conserva su superposición propia: ahí el switch va ENCIMA del
 * elemento y lo toca el dedo de verdad, que es el camino ya probado en
 * dispositivo. El resto de puntos usa el switch compartido, más barato —no hay
 * que superponer nada— pero que depende de que iOS acepte un click sintético
 * dentro de un gesto. Si en un iPhone real resulta que no vibra, el arreglo es
 * pasarlos al mismo patrón del retrato, no volver a `navigator.vibrate`.
 *
 * Se dispara solo en cambios de estado —elegir app, cambiar de tema, reiniciar
 * el pong—, no en navegación: un golpecito por cada enlace es ruido, no señal.
 */
const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/**
 * Disparador compartido: un `<label>` que envuelve al switch.
 *
 * Pulsar el `<input switch>` por código NO dispara la háptica —probado en
 * dispositivo—. Lo que sí usan las librerías conocidas del truco es pulsar el
 * `<label>` asociado, que activa el control por la vía que iOS considera
 * legítima. El retrato no necesita nada de esto: ahí el switch va encima del
 * elemento y lo toca el dedo de verdad, que es el camino seguro.
 *
 * Se construye al cargar y solo en iOS: insertar un nodo dentro del handler
 * del click mete una invalidación de estilo justo en el gesto.
 */
let trigger: HTMLLabelElement | null = null;

function buildTrigger(): HTMLLabelElement {
  const label = document.createElement('label');
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.setAttribute('switch', '');
  input.tabIndex = -1;
  label.append(input);
  label.setAttribute('aria-hidden', 'true');
  /* Ni `display:none` ni `visibility:hidden`: sin caja de render el control no
     llega a activarse. Se saca de la vista con 1px y opacidad 0. */
  Object.assign(label.style, {
    position: 'fixed',
    bottom: '0',
    left: '0',
    width: '1px',
    height: '1px',
    margin: '0',
    opacity: '0',
    overflow: 'hidden',
    pointerEvents: 'none',
  });
  document.body.append(label);
  return label;
}

if (isIOS) {
  /* `body` ya existe: los scripts de página van con type="module", que difiere
     hasta después de parsear el documento. */
  trigger = buildTrigger();
}

/** Un golpecito corto. Silencioso donde la plataforma no lo soporta. */
export function haptic(): void {
  if (trigger) {
    trigger.click();
    return;
  }
  navigator.vibrate?.(8);
}

/*
 * Delegado: cualquier elemento con `data-haptic` vibra al pulsarse. Así los
 * puntos se declaran en el marcado y ningún otro script tiene que importar
 * esto. Va en fase de captura para que corra aunque el handler del elemento
 * llame a stopPropagation().
 */
document.addEventListener(
  'click',
  (event) => {
    const target = event.target as Element | null;
    if (target?.closest('[data-haptic]')) haptic();
  },
  true,
);

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
