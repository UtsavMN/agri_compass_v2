import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'en' | 'kn';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n, t } = useTranslation();
  const [language, setLanguageState] = useState<Language>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('language');
    if (stored === 'en' || stored === 'kn') {
      return stored;
    }
    // Check i18n language detector
    return (i18n.language as Language) || 'en';
  });

  useEffect(() => {
    // Sync with i18n
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  useEffect(() => {
    // Listen to i18n language changes
    const handleLanguageChange = (lng: string) => {
      if (lng !== language) {
        setLanguageState(lng as Language);
      }
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [language, i18n]);

  const toggleLanguage = () => {
    setLanguageState(prev => prev === 'en' ? 'kn' : 'en');
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
