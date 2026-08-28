import type { ImageMetadata } from 'astro';
import egxOne from '../assets/apps/egx-one.webp';
import egxOneShot1 from '../assets/apps/shots/egx-one-1.webp';
import egxOneShot2 from '../assets/apps/shots/egx-one-2.webp';
import egxOneShot3 from '../assets/apps/shots/egx-one-3.webp';
import egxOneShot4 from '../assets/apps/shots/egx-one-4.webp';
import egxOneShot5 from '../assets/apps/shots/egx-one-5.webp';
import validmeShot1 from '../assets/apps/shots/validme-1.webp';
import validmeShot2 from '../assets/apps/shots/validme-2.webp';
import validmeShot3 from '../assets/apps/shots/validme-3.webp';
import validmeShot4 from '../assets/apps/shots/validme-4.webp';
import staffShot1 from '../assets/apps/shots/egx-staff-1.webp';
import staffShot2 from '../assets/apps/shots/egx-staff-2.webp';
import staffShot3 from '../assets/apps/shots/egx-staff-3.webp';
import staffShot4 from '../assets/apps/shots/egx-staff-4.webp';
import staffShot5 from '../assets/apps/shots/egx-staff-5.webp';
import prestoShot1 from '../assets/apps/shots/presto-1.webp';
import prestoShot2 from '../assets/apps/shots/presto-2.webp';
import prestoShot3 from '../assets/apps/shots/presto-3.webp';
import prestoShot4 from '../assets/apps/shots/presto-4.webp';
import skeletonShot1 from '../assets/apps/shots/skeletonpdf-1.webp';
import skeletonShot2 from '../assets/apps/shots/skeletonpdf-2.webp';
import skeletonShot3 from '../assets/apps/shots/skeletonpdf-3.webp';
import validme from '../assets/apps/validme.webp';
import egxStaff from '../assets/apps/egx-staff.webp';
import presto from '../assets/apps/presto.webp';
import skeletonpdf from '../assets/apps/skeletonpdf.webp';

export interface App {
  num: string;
  name: string;
  year: string;
  icon: ImageMetadata;
  /**
   * Capturas reales de la app, si las hay. La pantalla del teléfono las
   * muestra a sangre; las apps sin capturas caen a la ficha de texto.
   */
  shots?: readonly ImageMetadata[];
}

export const apps: readonly App[] = [
  {
    num: '01',
    name: 'EGX One',
    year: '2025 — 2026',
    icon: egxOne,
    shots: [egxOneShot1, egxOneShot2, egxOneShot3, egxOneShot4, egxOneShot5],
  },
  {
    num: '02',
    name: 'ValidMe',
    year: '2024 — 2025',
    icon: validme,
    shots: [validmeShot1, validmeShot2, validmeShot3, validmeShot4],
  },
  {
    num: '03',
    name: 'EGX Staff',
    year: '2025',
    icon: egxStaff,
    // Ingreso, eventos, sesiones y las dos respuestas del escáner. Las últimas
    // dos son fotos del lector en un evento real, no capturas de simulador.
    shots: [staffShot1, staffShot2, staffShot3, staffShot4, staffShot5],
  },
  {
    num: '04',
    name: 'Presto Latam',
    year: '2024',
    icon: presto,
    // La app ya no está en ninguna tienda: estas son capturas propias, en
    // orden de recorrido —portada, ingreso, verificación, cuenta—. Al número
    // de teléfono de la tercera se le pasó un desenfoque antes de entrar aquí.
    shots: [prestoShot1, prestoShot2, prestoShot3, prestoShot4],
  },
  {
    num: '05',
    name: 'SkeletonPDF',
    year: '2024',
    icon: skeletonpdf,
    // Android: la captura es de un Pixel, no de un iPhone, pero el formato
    // (1440 x 3120) cae a menos de medio punto porcentual del panel de 6,5".
    shots: [skeletonShot1, skeletonShot2, skeletonShot3],
  },
];
