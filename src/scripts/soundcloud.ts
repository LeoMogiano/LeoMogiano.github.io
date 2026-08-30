/**
 * El mini reproductor del hero, atado al widget de SoundCloud.
 *
 * Nada de SoundCloud se toca hasta que el visitante hace algo: ni la API
 * (~40 KB) ni el iframe. Quien abre la página, mira y se va no le hace una sola
 * petición a un tercero ni recibe sus cookies.
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
/*
 * El widget existe desde que se crea, pero no acepta órdenes hasta READY: las
 * de antes las descarta sin avisar. Solo esta referencia, que se rellena tras
 * el evento, habilita el camino síncrono del botón.
 */
let readyWidget: SCWidget | null = null;
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
  const whenReady = new Promise<void>((resolve) => {
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

  await whenReady;
  readyWidget = w;
  return w;
}

/*
 * Calentar el widget con tiempo es todo el truco: las políticas de autoplay
 * exigen que toggle() se llame de forma síncrona dentro del gesto, y eso solo
 * es posible si para cuando llega el click ya está READY.
 *
 * Se dispara desde dos sitios, y hacen falta los dos.
 */
function warm() {
  void connect().catch(() => {});
}

/* Uno: acercarse al reproductor — el cursor encima, el dedo bajando, el foco
   en el botón. */
for (const event of ['pointerenter', 'pointerdown', 'focusin'] as const) {
  player?.addEventListener(event, warm, { once: true, passive: true });
}

/*
 * Dos: la primera interacción con la página, sea donde sea.
 *
 * Los de arriba alcanzan con un mouse: el puntero pasa por encima del
 * reproductor antes de pulsarlo, y ese medio segundo es justo el que el widget
 * necesita. Con un dedo no hay hover. `pointerenter` y `pointerdown` llegan en
 * el mismo instante que el tap, el `click` llega milisegundos después y para
 * entonces todavía falta bajar la API, cargar el iframe y esperar READY: el
 * botón se iba por el camino asíncrono de abajo, iOS lo bloqueaba por estar
 * fuera del gesto, y había que tocar una segunda vez.
 *
 * Esto no rompe la promesa de la cabecera. Quien entra, mira y se va sigue sin
 * hacerle una sola petición a SoundCloud: hace falta que haga algo —un scroll,
 * un toque en cualquier parte, una tecla—. Pero con casi cualquier cosa que
 * haga, al llegar al botón el widget ya está listo y suena al primer tap.
 */
for (const event of ['pointerdown', 'keydown', 'scroll'] as const) {
  addEventListener(event, warm, { once: true, passive: true });
}

toggle?.addEventListener('click', () => {
  if (!toggle) return;

  // Camino normal: ya está listo, así que esto ocurre dentro del gesto.
  if (readyWidget) {
    readyWidget.toggle();
    return;
  }

  /*
   * Primer uso sin haber podido calentar: el tap sobre play fue la primera
   * interacción de la visita. Se conecta y se intenta reproducir en cuanto
   * esté, aunque en iOS ese toggle cae fuera del gesto y el sistema lo bloquea.
   *
   * El botón NO se deshabilita mientras tanto. Lo hacía, y era peor: connect()
   * ya cachea la promesa —`connecting ??=`—, así que dos clicks nunca pudieron
   * crear dos widgets, y lo único que conseguía era tragarse el tap siguiente,
   * que es precisamente el que sí habría sonado. De ahí el tercer tap.
   */
  connect()
    .then((w) => w?.toggle())
    .catch(() => {});
});

export {};
