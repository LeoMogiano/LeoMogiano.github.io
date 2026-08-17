/**
 * La lista de apps y la pantalla del teléfono.
 *
 * Los 5 estados ya están en el HTML y el CSS decide cuál se ve, así que aquí
 * solo se mueve un atributo. Sin reescribir texto no hay reflow ni parpadeo, y
 * el contenido de las 5 apps queda en el HTML para quien no ejecute JS.
 */
const section = document.querySelector<HTMLElement>('[data-app-current]');

const status = document.querySelector<HTMLElement>('[data-app-status]');

if (section) {
  const buttons = [...section.querySelectorAll<HTMLButtonElement>('[data-app-pick]')];

  const sync = (current: string) => {
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.appPick === current));
    }
    // Sin esto la pantalla del teléfono cambia en silencio: quien usa lector
    // pulsa el botón y no recibe ninguna señal de que pasó algo.
    if (status) {
      const active = buttons.find((b) => b.dataset.appPick === current);
      const name = active?.querySelector('[data-app-name]')?.textContent?.trim();
      if (name) status.textContent = `${status.dataset.appStatusLabel ?? ''} ${name}`.trim();
    }
  };

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const num = button.dataset.appPick;
      if (!num) return;
      section.dataset.appCurrent = num;
      sync(num);
    });
  }

  sync(section.dataset.appCurrent ?? '');
}

export {};
