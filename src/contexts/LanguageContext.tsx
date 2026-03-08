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
  // Auto-detect from browser
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

const LanguageContext = createContext<LanguageContextType | null>(null);

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
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
