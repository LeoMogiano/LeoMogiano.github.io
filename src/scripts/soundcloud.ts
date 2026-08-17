/**
 * El mini reproductor del hero, atado al widget de SoundCloud.
 *
 * Nada de SoundCloud se toca hasta que alguien pulsa play: ni la API (~40 KB)
 * ni el iframe. Quien solo mira el portafolio no le hace una sola petición a
 * un tercero ni recibe sus cookies.
 *
 * El orden importa y es la razón de que esto estuviera roto: el iframe anuncia
 * que está listo con un postMessage en cuanto carga. Si la API llega después,
 * ese aviso ya pasó, no hay nadie escuchando y el widget no responde nunca.
 * Por eso primero se carga la API y solo entonces se le pone src al iframe.
 */
interface SCWidget {
  bind(event: string, handler: (payload: { relativePosition?: number }) => void): void;
  toggle(): void;
}

interface SCApi {
  Widget: ((el: HTMLIFrameElement) => SCWidget) & {
    Events: { READY: string; PLAY: string; PAUSE: string; FINISH: string; PLAY_PROGRESS: string };
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
/*
 * La conexión se cachea como promesa, no como resultado. Dos clicks seguidos
 * mientras carga la API entrarían dos veces y crearían dos widgets sobre el
 * mismo iframe, con los manejadores duplicados: el progreso se escribiría dos
 * veces por evento y el estado de play acabaría desincronizado.
 */
let connecting: Promise<SCWidget | null> | null = null;

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

function connect(): Promise<SCWidget | null> {
  if (widget) return Promise.resolve(widget);
  connecting ??= createWidget();
  return connecting;
}

async function createWidget(): Promise<SCWidget | null> {
  if (!iframe) return null;

  await loadApi();
  const api = window.SC;
  if (!api) return null;

  // La API ya está escuchando: ahora sí puede cargar el iframe.
  if (!iframe.src && iframe.dataset.src) iframe.src = iframe.dataset.src;

  const w = api.Widget(iframe);
  widget = w;

  /*
   * Hay que esperar a READY. El widget acepta llamadas antes de estarlo y las
   * descarta en silencio: el primer click en play no hacía absolutamente nada,
   * y el segundo sí. Aquí se espera al evento antes de devolver el control.
   */
  const ready = new Promise<void>((resolve) => {
    w.bind(api.Widget.Events.READY, () => resolve());
    // Si el evento no llega (bloqueado por red o por el navegador), no se deja
    // el botón muerto para siempre.
    setTimeout(resolve, 4000);
  });

  w.bind(api.Widget.Events.PLAY, () => player?.classList.add('is-playing'));
  w.bind(api.Widget.Events.PAUSE, () => player?.classList.remove('is-playing'));
  w.bind(api.Widget.Events.FINISH, () => {
    player?.classList.remove('is-playing');
    if (progress) progress.style.width = '0%';
  });
  w.bind(api.Widget.Events.PLAY_PROGRESS, (event) => {
    if (progress) progress.style.width = `${Math.round((event.relativePosition ?? 0) * 100)}%`;
  });

  await ready;
  return w;
}

// Mientras el widget arranca, el botón queda deshabilitado: pulsarlo otra vez
// solo encolaría un toggle que llega justo después y lo deja al revés.
toggle?.addEventListener('click', async () => {
  if (!toggle) return;
  const primeraVez = !widget;
  if (primeraVez) toggle.disabled = true;
  try {
    (await connect())?.toggle();
  } catch {
    // Sin red o con el widget bloqueado: el botón no hace nada y ya está.
  } finally {
    if (primeraVez) toggle.disabled = false;
  }
});

export {};
