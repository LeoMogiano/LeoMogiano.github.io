import type { ImageMetadata } from 'astro';
import egxOne from '../assets/apps/egx-one.webp';
import egxOneShot1 from '../assets/apps/shots/egx-one-1.webp';
import egxOneShot2 from '../assets/apps/shots/egx-one-2.webp';
import egxOneShot3 from '../assets/apps/shots/egx-one-3.webp';
import egxOneShot4 from '../assets/apps/shots/egx-one-4.webp';
import egxOneShot5 from '../assets/apps/shots/egx-one-5.webp';
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
  { num: '02', name: 'ValidMe', year: '2024 — 2025', icon: validme },
  { num: '03', name: 'EGX Staff', year: '2025', icon: egxStaff },
  { num: '04', name: 'Presto Latam', year: '2024', icon: presto },
  { num: '05', name: 'SkeletonPDF', year: '2024', icon: skeletonpdf },
];
