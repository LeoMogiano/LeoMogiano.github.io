import type { Dict, Lang } from './types';
import { es } from './es';
import { en } from './en';
import { ja } from './ja';

export type { Dict, Lang };

export const langs = ['es', 'en', 'ja'] as const satisfies readonly Lang[];

const dicts: Record<Lang, Dict> = { es, en, ja };

export const getDict = (lang: Lang): Dict => dicts[lang];

export const langPrefix = (lang: Lang): string => (lang === 'es' ? '' : `/${lang}`);

export const nextLang = (lang: Lang): Lang => langs[(langs.indexOf(lang) + 1) % langs.length]!;
