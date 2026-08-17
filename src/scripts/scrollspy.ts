/**
 * Marca la entrada del nav de la sección en la que estás.
 *
 * Se compara contra una línea imaginaria al 35% del viewport en vez de usar
 * IntersectionObserver: las secciones tienen alturas muy distintas y con el
 * observer dos podían quedar activas a la vez.
 */
const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]')];

if (links.length) {
  const ids = links.map((link) => link.dataset.section ?? '');
  let queued = false;

  const check = () => {
    queued = false;
    const line = window.scrollY + window.innerHeight * 0.35;

    let current = ids[0]!;
    for (const id of ids) {
      const section = document.getElementById(id);
      if (section && section.offsetTop <= line) current = id;
    }

    // Al final de la página gana siempre la última: su offsetTop puede quedar
    // por debajo de la línea aunque la sección esté entera a la vista.
    if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 4) {
      current = ids[ids.length - 1]!;
    }

    for (const link of links) {
      link.classList.toggle('is-active', link.dataset.section === current);
    }
  };

  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(check);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  check();
}

export {};
