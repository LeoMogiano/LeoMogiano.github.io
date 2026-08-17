import type { IconName } from '../components/ui/Icon.astro';

export interface NavItem {
  id: string;
  icon: IconName;
}

export const nav: readonly NavItem[] = [
  { id: 'top', icon: 'house' },
  { id: 'work', icon: 'layout-grid' },
  { id: 'path', icon: 'briefcase' },
  { id: 'play', icon: 'gamepad-2' },
  { id: 'hello', icon: 'send' },
];
