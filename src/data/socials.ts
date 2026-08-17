import type { IconName } from '../components/ui/Icon.astro';

export interface Social {
  label: string;
  href: string;
  icon: IconName;
  external: boolean;
}

export const socials: readonly Social[] = [
  {
    label: 'GitHub',
    href: 'https://github.com/LeoMogiano',
    icon: 'github-mark',
    external: true,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/leomogiano/',
    icon: 'linkedin',
    external: true,
  },
  {
    label: 'Email',
    href: 'mailto:leomogiano@outlook.com',
    icon: 'mail',
    external: false,
  },
];
