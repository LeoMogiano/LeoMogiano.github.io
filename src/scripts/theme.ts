/**
 * Tema claro/oscuro. El estado vive en `html[data-t]`, que el script bloqueante
 * del <head> ya fijó antes del primer frame; aquí solo se atiende el toggle.
 */
const THEME_COLOR = { dark: '#0a0a0a', light: '#e9e4da' } as const;

function apply(theme: 'dark' | 'light') {
  document.documentElement.dataset.t = theme;
  document.querySelector('#tc')?.setAttribute('content', THEME_COLOR[theme]);
  try {
    localStorage.setItem('lm-theme', theme);
  } catch {
    // Modo privado de Safari: el tema no persiste, pero la página funciona.
  }
}

document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
  apply(document.documentElement.dataset.t === 'light' ? 'dark' : 'light');
});

/**
 * El botón de idioma es un enlace a otra ruta. Se guarda la elección para que
 * una visita futura a `/` pueda saltar al idioma correcto.
 */
document.querySelector('[data-lang-link]')?.addEventListener('click', (event) => {
  const href = (event.currentTarget as HTMLAnchorElement).getAttribute('href') ?? '/';
  const lang = href.replace(/\//g, '') || 'es';
  try {
    localStorage.setItem('lm-lang', lang);
  } catch {
    // Idem: sin persistencia, el enlace sigue navegando igual.
  }
});

export {};
