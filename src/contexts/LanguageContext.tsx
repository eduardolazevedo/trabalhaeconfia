import React, { createContext, useContext, useState, useCallback } from 'react';
import { type Language, type Translations, getTranslations } from '@/lib/i18n';

const LANG_KEY = 'harada-lang';

function loadLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored && ['en', 'es', 'pt-br', 'fr', 'de'].includes(stored)) {
      return stored as Language;
    }
  } catch {}
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('pt')) return 'pt-br';
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('de')) return 'de';
  return 'en';
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

// Provide a default value so HMR module duplication never crashes
const defaultLang = loadLanguage();
const defaultValue: LanguageContextType = {
  language: defaultLang,
  setLanguage: () => {},
  t: getTranslations(defaultLang),
};

const LanguageContext = createContext<LanguageContextType>(defaultValue);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLangState] = useState<Language>(loadLanguage);
  const t = getTranslations(language);

  const setLanguage = useCallback((lang: Language) => {
    setLangState(lang);
    localStorage.setItem(LANG_KEY, lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
