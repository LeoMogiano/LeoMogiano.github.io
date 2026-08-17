/**
 * Marca la entrada del nav de la sección en la que estás.
 *
 * Se compara contra una línea imaginaria al 35% del viewport en vez de usar
 * IntersectionObserver: las secciones tienen alturas muy distintas y con el
 * observer dos podían quedar activas a la vez.
 */
const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]')];

if (links.length) {
  const sections = links
    .map((link) => document.getElementById(link.dataset.section ?? ''))
    .filter((el): el is HTMLElement => el !== null);

  // Los offsets se miden una vez y se refrescan al redimensionar. Leerlos en
  // cada frame de scroll obliga al navegador a recalcular layout justo en el
  // momento en el que menos margen hay.
  let offsets: number[] = [];
  const measure = () => {
    offsets = sections.map((el) => el.offsetTop);
  };

  let queued = false;

  const check = () => {
    queued = false;
    const line = window.scrollY + window.innerHeight * 0.35;

    let current = sections[0]?.id ?? '';
    for (let i = 0; i < sections.length; i++) {
      if (offsets[i]! <= line) current = sections[i]!.id;
    }

    // Al final de la página gana siempre la última: su offsetTop puede quedar
    // por debajo de la línea aunque la sección esté entera a la vista.
    if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 4) {
      current = sections[sections.length - 1]?.id ?? current;
    }

    for (const link of links) {
      const active = link.dataset.section === current;
      link.classList.toggle('is-active', active);
      // El color no es información para quien no lo ve: hace falta el estado.
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  };

  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(check);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => {
    measure();
    schedule();
  }, { passive: true });

  // Las fuentes cambian la altura de las secciones al terminar de cargar.
  document.fonts?.ready.then(measure);

  measure();
  check();
}

export {};
