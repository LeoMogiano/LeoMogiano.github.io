/**
 * La lista de apps y la pantalla del teléfono.
 *
 * Los 5 estados ya están en el HTML y el CSS decide cuál se ve, así que aquí
 * solo se mueve un atributo. Sin reescribir texto no hay reflow ni parpadeo, y
 * el contenido de las 5 apps queda en el HTML para quien no ejecute JS.
 */
const section = document.querySelector<HTMLElement>('[data-app-current]');

if (section) {
  for (const button of section.querySelectorAll<HTMLButtonElement>('[data-app-pick]')) {
    button.addEventListener('click', () => {
      const num = button.dataset.appPick;
      if (num) section.dataset.appCurrent = num;
    });
  }
}

export {};
