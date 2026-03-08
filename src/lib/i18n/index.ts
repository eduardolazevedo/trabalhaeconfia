import type { Language, Translations } from './types';
export type { Language, Translations } from './types';
export { LANGUAGE_NAMES } from './types';

import en from './en';
import es from './es';
import ptBr from './pt-br';
import fr from './fr';
import de from './de';

const translations: Record<Language, Translations> = {
  en,
  es,
  'pt-br': ptBr,
  fr,
  de,
};

export function getTranslations(lang: Language): Translations {
  return translations[lang] || translations.en;
}

export function getRandomFromArray(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}
