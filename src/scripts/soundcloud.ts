/**
 * El mini reproductor del hero, atado al widget de SoundCloud.
 *
 * La API del widget se carga bajo demanda, al primer click en play: son ~40 KB
 * de un tercero que nadie debería pagar solo por hacer scroll.
 */
interface SCWidget {
  bind(event: string, handler: (payload: { relativePosition?: number }) => void): void;
  toggle(): void;
}

interface SCApi {
  Widget: ((el: HTMLIFrameElement) => SCWidget) & {
    Events: { PLAY: string; PAUSE: string; FINISH: string; PLAY_PROGRESS: string };
  };
}

declare global {
  interface Window {
    SC?: SCApi;
  }
}

const player = document.querySelector<HTMLElement>('[data-player]');
const iframe = document.querySelector<HTMLIFrameElement>('[data-sc]');
const progress = document.querySelector<HTMLElement>('[data-progress]');
const toggle = document.querySelector<HTMLButtonElement>('[data-play-toggle]');

let widget: SCWidget | null = null;
let loading: Promise<void> | null = null;

function loadApi(): Promise<void> {
  if (window.SC) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://w.soundcloud.com/player/api.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('no se pudo cargar el widget de SoundCloud'));
    document.head.append(script);
  });
  return loading;
}

async function connect(): Promise<SCWidget | null> {
  if (widget) return widget;
  if (!iframe) return null;

  await loadApi();
  const api = window.SC;
  if (!api) return null;

  const w = api.Widget(iframe);
  widget = w;
  w.bind(api.Widget.Events.PLAY, () => player?.classList.add('is-playing'));
  w.bind(api.Widget.Events.PAUSE, () => player?.classList.remove('is-playing'));
  w.bind(api.Widget.Events.FINISH, () => {
    player?.classList.remove('is-playing');
    if (progress) progress.style.width = '0%';
  });
  w.bind(api.Widget.Events.PLAY_PROGRESS, (event) => {
    if (progress) progress.style.width = `${Math.round((event.relativePosition ?? 0) * 100)}%`;
  });

  return w;
}

toggle?.addEventListener('click', async () => {
  try {
    (await connect())?.toggle();
  } catch {
    // Sin red o con el widget bloqueado: el botón no hace nada y ya está.
  }
});

export {};
