/**
 * El visor de capturas a pantalla completa. Solo móvil.
 *
 * Dentro del teléfono la captura mide 282 px CSS: alcanza para reconocer la
 * pantalla, no para leerla. En un viewport de 390 hay 108 px de sobra a cada
 * lado sin usar, así que el botón los reclama.
 *
 * No usa la Fullscreen API. En iPhone no existió para elementos que no fueran
 * <video> hasta Safari 26, y aun donde existe el navegador pinta su barra de
 * salida encima y se queda con el gesto de cierre. Un <dialog> modal ocupa el
 * mismo viewport y deja el swipe y la transición de nuestro lado; encima trae
 * foco atrapado y Escape sin escribir una línea.
 *
 * Es uno solo para las cinco apps: las diapositivas se arman al abrirlo con las
 * capturas de la que el teléfono esté mostrando. Cinco visores en el HTML serían
 * 21 <img> que en escritorio no se abren nunca.
 */

import { attachHaptic } from './haptic';

/** Mismo corte que el selector de iconos: donde la rejilla de Work se apila. */
const MOBILE = '(max-width: 705px)';

/** Cuánto hay que arrastrar hacia abajo para que soltar cierre, en px. */
const DISMISS = 90;

/** A partir de aquí el gesto ya decidió si es horizontal o vertical. */
const SLOP = 10;

const dialog = document.querySelector<HTMLDialogElement>('[data-shots-full]');
const track = dialog?.querySelector<HTMLElement>('[data-shotsfs-track]');
const dotsBox = dialog?.querySelector<HTMLElement>('[data-shotsfs-dots]');
const closeBtn = dialog?.querySelector<HTMLButtonElement>('[data-shotsfs-close]');

if (dialog && track && dotsBox && closeBtn) {
  const mobile = matchMedia(MOBILE);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  /** El carrusel del teléfono que abrió el visor, para devolverle la posición. */
  let origin: HTMLElement | null = null;

  const index = () => Math.round(track.scrollLeft / track.clientWidth);

  // --- armar el visor con las capturas de una app ---

  const fill = (shots: HTMLElement, at: number) => {
    const app = shots.dataset.appLabel ?? '';
    const imgs = [...shots.querySelectorAll<HTMLImageElement>('.phone__shot')];

    const slides = imgs.map((source, i) => {
      const slide = document.createElement('div');
      slide.className = 'shotsfs__slide';

      /*
       * La chica de fondo mientras la grande viaja. Ya está decodificada —es la
       * que se ve en el teléfono— así que aparece en el mismo frame en que se
       * abre el visor: sin ella el primer cuarto de segundo es un rectángulo
       * negro. `data-shot-src` cubre a las que aún no se pidieron.
       */
      const small = source.currentSrc || source.src || source.dataset.shotSrc;
      if (small) slide.style.backgroundImage = `url("${small}")`;

      const img = document.createElement('img');
      img.className = 'shotsfs__shot';
      img.alt = source.alt;
      img.decoding = 'async';
      /*
       * La que se abre y sus dos vecinas, ya: el swipe tiene que aterrizar sobre
       * una captura nítida, no sobre el fondo borroso. Las demás quedan en lazy
       * y las pide el navegador cuando el carrusel se acerca. A 30–190 KB cada
       * una, cargar las cinco de golpe es medio mega por abrir el visor.
       */
      img.loading = Math.abs(i - at) <= 1 ? 'eager' : 'lazy';
      img.src = source.dataset.shotFull ?? small ?? '';
      // Hasta que no esté, manda el fondo: un <img> a medio pintar sobre su
      // propia versión borrosa se ve como un parpadeo.
      img.addEventListener('load', () => img.setAttribute('data-ready', ''), { once: true });
      if (img.complete) img.setAttribute('data-ready', '');

      slide.append(img);
      return slide;
    });

    track.replaceChildren(...slides);

    const goTpl = dialog.dataset.go ?? '';
    dotsBox.replaceChildren(
      ...imgs.map((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'shotsfs__dot';
        dot.setAttribute('data-haptic', '');
        dot.setAttribute('aria-label', goTpl.replace('{app}', app).replace('{n}', String(i + 1)));
        dot.addEventListener('click', () => {
          track.scrollTo({ left: i * track.clientWidth, behavior: reduced.matches ? 'auto' : 'smooth' });
        });
        // El barrido de haptic.ts ya pasó: estos puntos nacen al abrir el visor.
        attachHaptic(dot);
        return dot;
      }),
    );

    dialog.setAttribute('aria-label', (dialog.dataset.label ?? '').replace('{app}', app));
  };

  // --- puntos ---

  let painted = -1;

  const paint = () => {
    const current = index();
    if (current === painted) return;
    painted = current;
    for (const [i, dot] of [...dotsBox.children].entries()) {
      dot.setAttribute('aria-current', String(i === current));
    }
  };

  let frame = 0;
  track.addEventListener('scroll', () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      paint();
    });
  });

  // --- abrir y cerrar ---

  const open = (shots: HTMLElement, at: number) => {
    origin = shots.querySelector<HTMLElement>('[data-shots-track]');
    fill(shots, at);
    dialog.showModal();

    /*
     * Después de showModal, que hasta ahí el <dialog> no tiene ancho y
     * `at * clientWidth` daría cero. Leer clientWidth fuerza el layout, así que
     * la posición queda puesta antes del primer frame: nadie ve la captura 1.
     */
    track.style.scrollBehavior = 'auto';
    track.scrollLeft = at * track.clientWidth;
    track.style.scrollBehavior = '';
    painted = -1;
    paint();

    // El <dialog> modal ya bloquea el foco, pero no el scroll de la página
    // detrás: en iOS se sigue arrastrando bajo el visor.
    document.documentElement.style.overflow = 'hidden';
  };

  const close = () => {
    if (!dialog.open) return;
    // Salir por donde se entró: la captura que quedó a la vista es la que el
    // teléfono tiene que mostrar al volver.
    if (origin) origin.scrollLeft = index() * origin.clientWidth;
    dialog.close();
  };

  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    dialog.removeAttribute('data-dragging');
    dialog.style.removeProperty('--drag');
    // Las <img> grandes se sueltan al cerrar: son hasta 190 KB cada una y el
    // visor se rearma entero en la siguiente apertura.
    track.replaceChildren();
    origin = null;
  });

  closeBtn.addEventListener('click', close);

  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-shots-open]')) {
    button.addEventListener('click', () => {
      if (!mobile.matches) return;
      const shots = button.closest<HTMLElement>('[data-app-shots]');
      const from = shots?.querySelector<HTMLElement>('[data-shots-track]');
      if (!shots || !from) return;
      open(shots, Math.round(from.scrollLeft / from.clientWidth));
    });
  }

  // Girar el teléfono con el visor abierto cambia el ancho, y la posición en
  // píxeles deja de caer en un múltiplo: la captura quedaba partida.
  addEventListener('resize', () => {
    if (!dialog.open) return;
    if (!mobile.matches) {
      close();
      return;
    }
    const at = painted;
    requestAnimationFrame(() => {
      track.style.scrollBehavior = 'auto';
      track.scrollLeft = at * track.clientWidth;
      track.style.scrollBehavior = '';
    });
  });

  // --- arrastrar hacia abajo para cerrar ---

  /*
   * El gesto que un iPhone espera de cualquier cosa abierta a pantalla completa.
   * Convive con el carrusel horizontal sin pelearse por dos razones:
   *
   *   - El track lleva `touch-action: pan-x`. Si el navegador decide que el
   *     gesto es scroll horizontal, se lo queda y nos manda `pointercancel`:
   *     ahí soltamos sin hacer nada.
   *   - El arrastre vertical solo arranca si el carrusel está quieto sobre una
   *     captura. A mitad de camino entre dos, manda el scroll.
   */
  let dragging = false;
  let deciding = false;
  let startX = 0;
  let startY = 0;
  let dy = 0;

  track.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;
    // Solo con el carrusel asentado en una captura.
    const rest = Math.abs(track.scrollLeft % track.clientWidth);
    if (rest > 2 && rest < track.clientWidth - 2) return;
    deciding = true;
    dragging = false;
    startX = event.clientX;
    startY = event.clientY;
    dy = 0;
  });

  track.addEventListener('pointermove', (event) => {
    if (!deciding && !dragging) return;

    if (deciding) {
      const dx = Math.abs(event.clientX - startX);
      const down = event.clientY - startY;
      if (Math.abs(down) < SLOP && dx < SLOP) return;
      // Claramente vertical y hacia abajo, o el gesto es del carrusel.
      deciding = false;
      if (down <= 0 || Math.abs(down) < dx * 1.5) return;
      dragging = true;
      dialog.setAttribute('data-dragging', '');
      track.setPointerCapture(event.pointerId);
    }

    dy = Math.max(0, event.clientY - startY);
    dialog.style.setProperty('--drag', `${dy}px`);
  });

  const endDrag = (cancelled = false) => {
    deciding = false;
    if (!dragging) return;
    dragging = false;
    dialog.removeAttribute('data-dragging');

    if (!cancelled && dy > DISMISS) {
      close();
      return;
    }
    dialog.style.removeProperty('--drag');
  };

  track.addEventListener('pointerup', () => endDrag());
  // El navegador se quedó con el gesto: es scroll horizontal, no cierre.
  track.addEventListener('pointercancel', () => endDrag(true));
}

export {};
