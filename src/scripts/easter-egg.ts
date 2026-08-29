/**
 * Cinco toques al retrato abren la polaroid. Cada toque además dispara el
 * anillo de chispas.
 */
const portrait = document.querySelector<HTMLElement>('[data-portrait]');
const sparks = document.querySelector<HTMLElement>('[data-sparks]');
const egg = document.querySelector<HTMLElement>('[data-egg]');

let taps = 0;

function playSparks() {
  if (!sparks) return;
  // Quitar y volver a poner la clase en el mismo frame no reinicia la
  // animación: hay que forzar un reflow entre medio.
  sparks.classList.remove('is-playing');
  void sparks.offsetWidth;
  sparks.classList.add('is-playing');
}

function closeEgg() {
  if (!egg) return;
  egg.hidden = true;
  taps = 0;
  portrait?.focus();
}

/**
 * Mantiene el foco dentro del diálogo mientras está abierto. Declarar
 * aria-modal sin esto le dice al lector de pantalla que el resto de la página
 * es inerte cuando en realidad el Tab se escapa a los enlaces de atrás.
 */
function trapFocus(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !egg || egg.hidden) return;
  const focusable = egg.querySelectorAll<HTMLElement>(
    'a[href], button, input, [tabindex]:not([tabindex="-1"])',
  );
  const first = focusable[0] ?? egg;
  const last = focusable[focusable.length - 1] ?? egg;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

portrait?.addEventListener('click', () => {
  playSparks();
  taps++;
  if (taps >= 5 && egg) {
    taps = 0;
    egg.hidden = false;
    egg.focus();
  }
});

egg?.addEventListener('click', closeEgg);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && egg && !egg.hidden) closeEgg();
  trapFocus(event);
});

/*
 * Precalentado de la polaroid.
 *
 * La imagen vive dentro de un contenedor con `hidden`, así que el navegador no
 * la pide nunca: al quinto toque empezaban a bajar 120 KB con el diálogo ya
 * abierto y la foto aparecía tarde. Pedirla desde un `new Image()` la mete en
 * la caché HTTP aunque su <img> siga oculto, y al abrir ya está.
 *
 * No se usa <link rel="preload">, que competiría con lo que sí se ve en el
 * primer pintado, ni rel="prefetch", que Safari no implementa —y este sitio se
 * mira sobre todo desde un iPhone—. Va en tiempo ocioso: cuando el navegador
 * no tiene nada mejor que hacer.
 */
function warmEgg() {
  const img = egg?.querySelector<HTMLImageElement>('img');
  const src = img?.currentSrc || img?.src;
  if (!src) return;

  const pre = new Image();
  pre.src = src;
  /* Decodificar aquí evita el tirón de decodificación en el frame en el que se
     abre el diálogo. Si falla, la imagen igual quedó en caché. */
  void pre.decode?.().catch(() => {});
}

/* `saveData` lo activa quien pide al sistema ahorrar datos. Gastar 120 KB en
   un huevo de pascua que quizá nunca abra es justo lo que pidió evitar. */
const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;

if (egg && !conn?.saveData) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(warmEgg, { timeout: 4000 });
  } else {
    /* Safari no tuvo requestIdleCallback hasta 16.4. */
    setTimeout(warmEgg, 2500);
  }
}

export {};
