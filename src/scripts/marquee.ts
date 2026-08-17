/**
 * Control de pausa de la cinta de tecnologías.
 *
 * WCAG 2.2.2: contenido en movimiento que arranca solo y dura más de cinco
 * segundos necesita un mecanismo para pararlo. Pausar al hover no sirve para
 * quien navega con teclado, así que hace falta un botón de verdad.
 */
const marquee = document.querySelector<HTMLElement>('.marquee');
const toggle = marquee?.querySelector<HTMLButtonElement>('[data-marquee-toggle]');

if (marquee && toggle) {
  const labels = {
    pause: toggle.getAttribute('aria-label') ?? '',
    play: toggle.dataset.labelPlay ?? '',
  };

  toggle.addEventListener('click', () => {
    const paused = marquee.classList.toggle('is-paused');
    toggle.setAttribute('aria-pressed', String(paused));
    const label = paused ? labels.play : labels.pause;
    if (label) {
      toggle.setAttribute('aria-label', label);
      toggle.title = label;
    }
  });
}

export {};
