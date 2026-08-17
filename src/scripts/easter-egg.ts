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
});

export {};
