import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, Language, CurrencyCode } from '../types';
import { getSettings, saveSettings as persistSettings, formatCurrency as formatCurrencyService } from '../services/storageService';
import { translations } from '../locales';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  t: (key: keyof typeof translations.en) => string;
  formatCurrency: (amount: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // Refresh settings when user changes
  const [settings, setSettings] = useState<AppSettings>({
    language: 'en',
    currency: 'USD'
  });

  useEffect(() => {
    if (user) {
        getSettings().then(setSettings);
    }
  }, [user]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    persistSettings(updated);
  };

  const t = (key: keyof typeof translations.en): string => {
    const langData = translations[settings.language] || translations.en;
    return (langData as any)[key] || (translations.en as any)[key] || key;
  };

  const formatCurrency = (amount: number) => {
    return formatCurrencyService(amount, settings.currency);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, t, formatCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
