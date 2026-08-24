import React, { createContext, useContext, useState } from 'react';
import idJson from '@/locales/id.json';
import enJson from '@/locales/en.json';

export type Language = 'id' | 'en';

const locales: Record<Language, any> = {
  id: idJson,
  en: enJson,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('spmb_lang');
    return (saved === 'en' || saved === 'id') ? saved : 'id';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('spmb_lang', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let current: any = locales[language];
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to id locale
        let fallback: any = locales.id;
        for (const fbK of keys) {
          if (fallback && typeof fallback === 'object' && fbK in fallback) {
            fallback = fallback[fbK];
          } else {
            return key;
          }
        }
        return typeof fallback === 'string' ? fallback : key;
      }
    }
    return typeof current === 'string' ? current : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
