import type { ImageMetadata } from 'astro';
import egxOne from '../assets/apps/egx-one.webp';
import validme from '../assets/apps/validme.webp';
import egxStaff from '../assets/apps/egx-staff.webp';
import presto from '../assets/apps/presto.webp';
import skeletonpdf from '../assets/apps/skeletonpdf.webp';

export interface App {
  num: string;
  name: string;
  year: string;
  icon: ImageMetadata;
}

export const apps: readonly App[] = [
  { num: '01', name: 'EGX One', year: '2025 — 2026', icon: egxOne },
  { num: '02', name: 'ValidMe', year: '2024 — 2025', icon: validme },
  { num: '03', name: 'EGX Staff', year: '2025', icon: egxStaff },
  { num: '04', name: 'Presto Latam', year: '2024', icon: presto },
  { num: '05', name: 'SkeletonPDF', year: '2024', icon: skeletonpdf },
];
