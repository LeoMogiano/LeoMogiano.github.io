import type { ImageMetadata } from 'astro';
import datecLogo from '../assets/logos/datec.webp';
import validmeLogo from '../assets/logos/validme.webp';
import prestoLogo from '../assets/logos/presto.webp';
import getserverLogo from '../assets/logos/getserver.webp';
import bancoeconomicoLogo from '../assets/logos/banco-economico.webp';

export interface JobRole {
  /** Clave del diccionario i18n, p. ej. 'roleLead'. */
  roleKey: string;
  /** Clave i18n de la línea que explica el puesto. Una frase, sin adjetivos. */
  descKey: string;
  /** Mes de inicio, 'YYYY-MM'. */
  start: string;
  /** Mes de fin, o `null` si es el puesto actual. */
  end: string | null;
}

export interface Job {
  company: string;
  logo: ImageMetadata;
  /** Del más reciente al más antiguo. El tramo de la empresa sale de los extremos. */
  roles: readonly JobRole[];
}

export const jobs: readonly Job[] = [
  {
    company: 'Datec Corp',
    logo: datecLogo,
    roles: [
      { roleKey: 'roleLead', descKey: 'descDatecLead', start: '2026-03', end: null },
      { roleKey: 'roleMob', descKey: 'descDatecMob', start: '2025-04', end: '2026-03' },
    ],
  },
  {
    company: 'ValidMe LLC',
    logo: validmeLogo,
    roles: [{ roleKey: 'roleMob', descKey: 'descValidme', start: '2024-12', end: '2025-04' }],
  },
  {
    company: 'Presto Latam',
    logo: prestoLogo,
    roles: [{ roleKey: 'roleMob', descKey: 'descPresto', start: '2024-08', end: '2024-11' }],
  },
  {
    company: 'GetServer',
    logo: getserverLogo,
    roles: [{ roleKey: 'roleMobWeb', descKey: 'descGetserver', start: '2024-01', end: '2024-08' }],
  },
  {
    company: 'Banco Económico',
    logo: bancoeconomicoLogo,
    roles: [{ roleKey: 'roleAnalyst', descKey: 'descBanco', start: '2022-06', end: '2024-01' }],
  },
];
