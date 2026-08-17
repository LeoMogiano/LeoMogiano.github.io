import type { ImageMetadata } from 'astro';
import datecLogo from '../assets/logos/datec.webp';
import validmeLogo from '../assets/logos/validme.webp';
import prestoLogo from '../assets/logos/presto.webp';
import getserverLogo from '../assets/logos/getserver.webp';
import bancoeconomicoLogo from '../assets/logos/banco-economico.webp';

export interface JobRole {
  /** Clave del diccionario i18n, p. ej. 'roleLead'. */
  roleKey: string;
  /** Clave del diccionario i18n con las fechas, p. ej. 'j1d1'. */
  dateKey: string;
}

export interface Job {
  company: string;
  logo: ImageMetadata;
  /** Clave i18n de la duración, p. ej. 'j1dur'. */
  durKey: string;
  roles: readonly JobRole[];
}

export const jobs: readonly Job[] = [
  {
    company: 'Datec Corp',
    logo: datecLogo,
    durKey: 'j1dur',
    roles: [
      { roleKey: 'roleLead', dateKey: 'j1d1' },
      { roleKey: 'roleMob', dateKey: 'j1d2' },
    ],
  },
  {
    company: 'ValidMe LLC',
    logo: validmeLogo,
    durKey: 'j2dur',
    roles: [{ roleKey: 'roleMob', dateKey: 'j2d' }],
  },
  {
    company: 'Presto Latam',
    logo: prestoLogo,
    durKey: 'j3dur',
    roles: [{ roleKey: 'roleMob', dateKey: 'j3d' }],
  },
  {
    company: 'GetServer',
    logo: getserverLogo,
    durKey: 'j4dur',
    roles: [{ roleKey: 'roleMobWeb', dateKey: 'j4d' }],
  },
  {
    company: 'Banco Económico',
    logo: bancoeconomicoLogo,
    durKey: 'j5dur',
    roles: [{ roleKey: 'roleAnalyst', dateKey: 'j5d' }],
  },
];
