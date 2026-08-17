/**
 * iOS vs Android dentro del teléfono.
 *
 * Simulación con paso fijo de 4 ms e interpolación al pintar: así la física es
 * idéntica a 60, 90 o 120 Hz. Un `dt` variable haría que la pelota fuera más
 * rápida en una pantalla de 120 Hz.
 */
const canvas = document.querySelector<HTMLCanvasElement>('[data-pong]');
const ctx = canvas?.getContext('2d', { alpha: false });

if (canvas && ctx) {
  let W = 0;
  let H = 0;

  const size = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  window.addEventListener('resize', size);

  const state = {
    bx: W / 2,
    by: H / 2,
    vx: 3.2,
    vy: 5.4,
    /** Posición del dedo/ratón: la paleta de abajo. */
    px: W / 2,
    /** Paleta de la CPU, arriba. Persigue la pelota con retraso. */
    ax: W / 2,
    pw: 70,
    ph: 7,
    score: [0, 0],
    prevX: W / 2,
    prevY: H / 2,
  };

  const reset = () => {
    state.bx = W / 2;
    state.by = H / 2;
    state.vx = (Math.random() > 0.5 ? 1 : -1) * 3.4;
    state.vy = (Math.random() > 0.5 ? 1 : -1) * 5.4;
    state.score = [0, 0];
  };

  document.querySelector('[data-pong-reset]')?.addEventListener('click', reset);

  canvas.addEventListener(
    'pointermove',
    (event) => {
      state.px = event.clientX - canvas.getBoundingClientRect().left;
    },
    { passive: true },
  );

  canvas.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      state.px = Math.max(state.pw / 2, state.px - 26);
      event.preventDefault();
    }
    if (event.key === 'ArrowRight') {
      state.px = Math.min(W - state.pw / 2, state.px + 26);
      event.preventDefault();
    }
  });

  // Fuera de pantalla el bucle no simula ni pinta: es un juguete, no debe
  // gastar batería mientras alguien lee otra sección.
  let visible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 },
    ).observe(canvas);
  }

  const token = (name: string, fallback: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

  const STEP = 4;
  let lastTime = performance.now();
  let accumulator = 0;

  const loop = () => {
    requestAnimationFrame(loop);
    if (!visible) return;

    const accent = token('--accent', '#c8ff4d');
    const fg = token('--fg', '#f2f1ee');

    const now = performance.now();
    accumulator += Math.min(50, now - lastTime);
    lastTime = now;

    while (accumulator >= STEP) {
      accumulator -= STEP;
      const dt = STEP / 16.6667;

      state.prevX = state.bx;
      state.prevY = state.by;
      state.bx += state.vx * dt;
      state.by += state.vy * dt;

      if (state.bx < 8) {
        state.bx = 8;
        state.vx = Math.abs(state.vx);
      }
      if (state.bx > W - 8) {
        state.bx = W - 8;
        state.vx = -Math.abs(state.vx);
      }

      // Seguimiento exponencial: la CPU nunca llega perfecta, así se puede ganar.
      state.ax += (state.bx - state.ax) * (1 - Math.pow(1 - 0.11, dt));

      const paddle = Math.max(state.pw / 2, Math.min(W - state.pw / 2, state.px));

      if (
        state.by > H - 46 &&
        state.by < H - 30 &&
        Math.abs(state.bx - paddle) < state.pw / 2 + 4 &&
        state.vy > 0
      ) {
        state.by = H - 46;
        state.vy = -Math.abs(state.vy);
        state.vx += (state.bx - paddle) * 0.05;
      }

      if (
        state.by < 46 &&
        state.by > 30 &&
        Math.abs(state.bx - state.ax) < state.pw / 2 + 4 &&
        state.vy < 0
      ) {
        state.by = 46;
        state.vy = Math.abs(state.vy);
        state.vx += (state.bx - state.ax) * 0.045;
      }

      state.vx = Math.max(-5.5, Math.min(5.5, state.vx));

      if (state.by > H + 16) {
        state.score[0]!++;
        Object.assign(state, { bx: W / 2, by: H / 2, vy: -5.4, vx: 3.2 });
        state.prevX = state.bx;
        state.prevY = state.by;
      }
      if (state.by < -16) {
        state.score[1]!++;
        Object.assign(state, { bx: W / 2, by: H / 2, vy: 5.4, vx: -3.2 });
        state.prevX = state.bx;
        state.prevY = state.by;
      }
    }

    // Interpolación con lo que sobró del acumulador: sin esto la pelota vibra.
    const alpha = accumulator / STEP;
    const bx = state.prevX + (state.bx - state.prevX) * alpha;
    const by = state.prevY + (state.by - state.prevY) * alpha;
    const paddle = Math.max(state.pw / 2, Math.min(W - state.pw / 2, state.px));

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = fg;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 9]);
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = fg;
    ctx.font = "10px 'DM Mono', monospace";
    ctx.textAlign = 'left';
    ctx.fillText(`ANDROID  ${state.score[0]}`, 18, H / 2 - 14);
    ctx.textAlign = 'right';
    ctx.fillText(`${state.score[1]}  iOS`, W - 18, H / 2 + 22);

    ctx.globalAlpha = 1;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.roundRect(state.ax - state.pw / 2, 34, state.pw, state.ph, 4);
    ctx.fill();

    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.roundRect(paddle - state.pw / 2, H - 41, state.pw, state.ph, 4);
    ctx.fill();

    // Estela: siete círculos hacia atrás con opacidad creciente.
    const color = state.vy < 0 ? accent : fg;
    for (let k = 7; k >= 1; k--) {
      ctx.globalAlpha = 0.055 * (8 - k);
      ctx.beginPath();
      ctx.arc(bx - state.vx * k * 0.42, by - state.vy * k * 0.42, 6 - k * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(bx, by, 6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };

  loop();
}

export {};
