/**
 * El rastro que sigue al cursor. No es decoración opcional: el sitio va con
 * `cursor: none`, así que este trazo *es* el cursor.
 */
import { token } from './tokens';

const canvas = document.querySelector<HTMLCanvasElement>('.lasso');
const ctx = canvas?.getContext('2d');

interface Point {
  x: number;
  y: number;
  t: number;
  w: number;
}

if (canvas && ctx && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const LIFE = 416; // ms que vive cada punto
  const MAX_WIDTH = 9;

  let points: Point[] = [];
  let last: { x: number; y: number; t: number } | null = null;

  const size = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  window.addEventListener('resize', size);

  window.addEventListener(
    'pointermove',
    (event) => {
      const now = performance.now();
      let speed = 0;
      if (last) {
        const dx = event.clientX - last.x;
        const dy = event.clientY - last.y;
        const dt = Math.max(8, now - last.t);
        speed = Math.hypot(dx, dy) / dt;
      }
      last = { x: event.clientX, y: event.clientY, t: now };
      // Cuanto más rápido va el cursor, más grueso el trazo.
      points.push({
        x: event.clientX,
        y: event.clientY,
        t: now,
        w: Math.min(MAX_WIDTH, 1.6 + speed * 3.2),
      });
      if (points.length > 90) points.shift();
      wake();
    },
    { passive: true },
  );

  // El bucle solo corre mientras haya rastro que dibujar. Sin esto seguía
  // pidiendo frames para siempre: en una pantalla de 120 Hz son 120 llamadas
  // por segundo para no pintar nada.
  let running = false;

  const loop = () => {
    if (document.hidden) {
      running = false;
      return;
    }

    const now = performance.now();
    const previous = points;
    points = points.filter((p) => now - p.t < LIFE);

    // Solo se limpia el rectángulo que ocupaba el trazo anterior, no el canvas
    // entero: a pantalla completa esa diferencia se nota en el frame budget.
    if (previous.length) {
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      for (const p of previous) {
        if (p.x < x0) x0 = p.x;
        if (p.y < y0) y0 = p.y;
        if (p.x > x1) x1 = p.x;
        if (p.y > y1) y1 = p.y;
      }
      ctx.clearRect(
        x0 - MAX_WIDTH - 6,
        y0 - MAX_WIDTH - 6,
        x1 - x0 + MAX_WIDTH * 2 + 12,
        y1 - y0 + MAX_WIDTH * 2 + 12,
      );
    }

    if (points.length < 3) {
      running = points.length > 0;
      if (running) requestAnimationFrame(loop);
      return;
    }

    requestAnimationFrame(loop);
    const color = token('--accent', '#c8ff4d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;

    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1]!;
      const b = points[i]!;
      const fade = Math.pow(1 - (now - b.t) / LIFE, 1.7);
      const head = i / points.length;
      ctx.globalAlpha = fade * 0.9;
      ctx.lineWidth = Math.max(0.5, b.w * fade * (0.45 + head * 0.75));
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    const tip = points[points.length - 1]!;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 3.6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };

  function wake() {
    if (running || document.hidden) return;
    running = true;
    requestAnimationFrame(loop);
  }

  // Al volver de otra pestaña el rastro sigue en memoria: hay que retomar el
  // bucle para que se apague solo, o queda un trazo congelado en pantalla.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && points.length) wake();
  });
}

export {};
