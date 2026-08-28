/**
 * El carrusel de capturas dentro del teléfono.
 *
 * El desplazamiento lo hace el CSS: `overflow-x` con `scroll-snap` da gesto
 * táctil, trackpad y teclado gratis, y el navegador ya trae su propia inercia.
 * Aquí solo se agrega lo que el CSS no puede: arrastrar con el mouse y mantener
 * los puntos en sintonía con lo que se ve.
 *
 * No se mueve solo. Un carrusel que gira sin que nadie lo toque le roba la
 * atención a la lista de apps, que es lo que de verdad hay que leer.
 */

/*
 * En táctil no hay nada que inventar: el scroll nativo ya trae la física del
 * sistema y cualquier librería la reimplementaría peor. Lo único que falta es
 * el arrastre con mouse, y ahí se copia lo que hace UIScrollView: al soltar no
 * se salta al vecino, se proyecta hasta dónde llegaría el dedo con esa
 * velocidad y recién ahí se elige la captura.
 */

/** Cuánto sigue corriendo el impulso, en ms. Es la constante de tiempo del roce. */
const DECAY_MS = 280;

/** Cuánto siguen a la vista los puntos después de la última señal de vida. */
const DOTS_MS = 1500;

/** Rango de duración del acomodo. Un tramo corto no puede durar lo mismo que uno largo. */
const GLIDE_MIN = 260;
const GLIDE_MAX = 620;

/** Arranca rápido y frena largo, como el resto de las transiciones del sitio. */
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

const reduced = matchMedia('(prefers-reduced-motion: reduce)');

for (const shots of document.querySelectorAll<HTMLElement>('[data-app-shots]')) {
  const track = shots.querySelector<HTMLElement>('[data-shots-track]');
  const dotsBox = shots.querySelector<HTMLElement>('[data-shots-dots]');
  const dots = [...shots.querySelectorAll<HTMLButtonElement>('[data-shots-dot]')];
  if (!track || !dotsBox || dots.length < 2) continue;

  const index = () => Math.round(track.scrollLeft / track.clientWidth);

  // --- ir a una captura ---

  let glide = 0;

  const stopGlide = () => {
    if (glide) cancelAnimationFrame(glide);
    glide = 0;
  };

  /**
   * Anima scrollLeft a mano. Con `scrollTo({behavior:'smooth'})` la duración y
   * la curva las decide el navegador, y cada uno decide distinto.
   */
  const go = (i: number, animate = true) => {
    stopGlide();
    const target = Math.max(0, Math.min(i, dots.length - 1)) * track.clientWidth;
    const from = track.scrollLeft;
    const delta = target - from;

    if (!delta || !animate || reduced.matches) {
      track.scrollLeft = target;
      track.style.scrollSnapType = '';
      return;
    }

    // La duración sale de la distancia: si falta un dedo de recorrido no puede
    // tardar lo mismo que si falta una pantalla entera. Es lo que hace que no
    // se sienta un salto.
    const span = Math.abs(delta) / track.clientWidth;
    const ms = GLIDE_MIN + (GLIDE_MAX - GLIDE_MIN) * Math.min(span, 1);

    /*
     * El snap del navegador se apaga mientras dura la animación. Con él puesto,
     * ve un scroll en movimiento a mitad de camino y decide por su cuenta: un
     * empujón fuerte terminaba dos capturas más allá, peleando contra esto.
     */
    track.style.scrollSnapType = 'none';

    let start = 0;
    const step = (now: number) => {
      start ||= now;
      const t = Math.min((now - start) / ms, 1);
      track.scrollLeft = from + delta * ease(t);
      if (t < 1) {
        glide = requestAnimationFrame(step);
        return;
      }
      glide = 0;
      track.style.scrollSnapType = '';
    };
    glide = requestAnimationFrame(step);
  };

  // --- puntos ---

  /*
   * Los puntos viven escondidos y asoman cuando hay algo que contar. El
   * temporizador se reinicia con cada señal, así que mientras se arrastra no
   * se van; se van 1.5 s después de la última.
   */
  let hide = 0;

  const reveal = () => {
    // Escribir el atributo que ya está puesto ensucia el estilo para nada, y
    // esto se llama desde pointermove.
    if (!dotsBox.hasAttribute('data-visible')) dotsBox.setAttribute('data-visible', '');
    clearTimeout(hide);
    hide = window.setTimeout(() => dotsBox.removeAttribute('data-visible'), DOTS_MS);
  };

  let painted = index();

  // Solo se toca el DOM cuando la captura cambia de verdad. Esto corre en cada
  // frame de scroll: reescribir cinco aria-current por frame es recalcular
  // estilo sesenta veces por segundo para dejar todo igual.
  const paint = () => {
    const current = index();
    if (current === painted) return;
    painted = current;
    reveal();
    for (const [i, dot] of dots.entries()) {
      dot.setAttribute('aria-current', String(i === current));
    }
  };

  // Siguen al scroll, no al revés: así también aciertan cuando el que desplaza
  // es el dedo o el trackpad.
  let frame = 0;
  track.addEventListener('scroll', () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      paint();
    });
  });
  for (const [i, dot] of dots.entries()) {
    dot.setAttribute('aria-current', String(i === painted));
    dot.addEventListener('click', () => go(i));
  }

  // Basta acercarse o empezar a arrastrar para que aparezcan.
  shots.addEventListener('pointerenter', reveal);
  shots.addEventListener('pointermove', reveal, { passive: true });

  // --- carga de las capturas que no son la primera ---

  /*
   * Solo la primera captura viaja en el HTML. Las otras cuatro pesan 250 KB y
   * no le sirven de nada a quien mira la pantalla y sigue de largo, así que
   * esperan al primer gesto sobre el carrusel. Después de eso no hace falta
   * volver a mirar: los listeners se quitan solos.
   */
  const load = () => {
    for (const img of track.querySelectorAll<HTMLImageElement>('[data-shot-src]')) {
      img.srcset = img.dataset.shotSrcset ?? '';
      img.src = img.dataset.shotSrc ?? '';
      delete img.dataset.shotSrc;
      delete img.dataset.shotSrcset;
    }
  };

  for (const type of ['pointerenter', 'pointerdown', 'focusin'] as const) {
    shots.addEventListener(type, load, { once: true, passive: true });
  }
  // El scroll no burbujea, así que va en el propio carrusel: cubre el dedo y
  // el trackpad, que no disparan pointerenter.
  track.addEventListener('scroll', load, { once: true, passive: true });

  // --- arrastre con el mouse ---

  /*
   * El dedo y el trackpad ya desplazan el carrusel; el mouse no. Sin esto, el
   * único gesto que un mouse puede intentar —arrastrar— arranca el drag&drop
   * del navegador y el carrusel parece trabado.
   *
   * Mientras el botón está apretado el carrusel sigue al cursor 1:1, sin
   * animación de por medio. Solo se toca el puntero tipo mouse: en táctil el
   * scroll nativo y su inercia son mejores que cualquier reimplementación.
   */
  let dragging = false;
  let startX = 0;
  let startScroll = 0;
  let lastX = 0;
  let lastAt = 0;
  let velocity = 0;

  track.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    stopGlide();
    dragging = true;
    startX = lastX = event.clientX;
    startScroll = track.scrollLeft;
    lastAt = event.timeStamp;
    velocity = 0;
    // Corta la selección de texto y el fantasma de la imagen antes de que
    // empiecen. El snap se reactiva al soltar.
    event.preventDefault();
    track.setPointerCapture(event.pointerId);
    track.style.scrollSnapType = 'none';
  });

  track.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    track.scrollLeft = startScroll - (event.clientX - startX);

    // px/ms del último tramo, que es lo que el que arrastra siente como impulso.
    const dt = event.timeStamp - lastAt;
    if (dt > 0) velocity = (event.clientX - lastX) / dt;
    lastX = event.clientX;
    lastAt = event.timeStamp;
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;

    /*
     * Dónde terminaría el carrusel si lo soltaran sobre hielo: la velocidad del
     * último tramo por la constante de roce. Sobre esa posición imaginaria se
     * busca la captura más cercana, así un empujón flojo se queda y uno firme
     * pasa —sin que el salto dependa de un umbral duro.
     *
     * El destino se limita a la captura vecina: es un carrusel paginado, no un
     * scroll libre, y pasar tres de un tirón desorienta.
     */
    const width = track.clientWidth;
    const here = track.scrollLeft / width;
    const target = Math.round((track.scrollLeft - velocity * DECAY_MS) / width);

    // Entre las dos capturas que el arrastre dejó a la vista. Si no se movió de
    // una —`here` cae justo en un entero— el vecino de cualquiera de los lados.
    const low = Math.floor(here);
    const high = Math.ceil(here);
    const first = low === high ? low - 1 : low;
    const last = low === high ? high + 1 : high;

    go(Math.max(first, Math.min(target, last)));
  };

  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);

  // El ancho del teléfono es relativo al viewport: al redimensionar, la posición
  // en píxeles deja de caer en un múltiplo del ancho y la captura queda partida.
  let resizeFrame = 0;
  addEventListener('resize', () => {
    const current = index();
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => go(current, false));
  });
}

export {};
