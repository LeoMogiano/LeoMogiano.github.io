import type { IconName } from '../components/ui/Icon.astro';

export interface Tech {
  name: string;
  icon: IconName;
}

export const stack: readonly Tech[] = [
  { name: 'Flutter', icon: 'flutter' },
  { name: 'Dart', icon: 'dart' },
  { name: 'Swift', icon: 'swift' },
  { name: 'Kotlin', icon: 'kotlin' },
  { name: 'Android', icon: 'android' },
  { name: 'iOS', icon: 'ios' },
  { name: 'Firebase', icon: 'firebase' },
  { name: 'PostgreSQL', icon: 'postgresql' },
  { name: 'Git', icon: 'git' },
  { name: 'GitHub', icon: 'github-mark' },
  { name: 'Figma', icon: 'figma' },
  { name: 'Docker', icon: 'docker' },
  { name: 'Sentry', icon: 'sentry' },
  { name: 'GitHub Actions', icon: 'github-actions' },
];
