import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { ListGroup, ListItem } from '../components/ui';
import { ChevronLeft, Check } from 'lucide-react';
import { Language } from '../types';

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'zh', label: 'Chinese', native: '中文' },
];

const LanguageSettings: React.FC = () => {
  const navigate = useNavigate();
  const { t, settings, updateSettings } = useSettings();

  const handleSelect = (code: Language) => {
    updateSettings({ language: code });
    navigate(-1);
  };

  return (
    <div className="pt-safe pb-10 min-h-screen bg-[#F2F2F7]">
      <div className="px-4 py-2 flex items-center justify-between sticky top-0 z-50 bg-[#F2F2F7]/90 backdrop-blur-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-[#007AFF] active:opacity-50 -ml-2"
        >
          <ChevronLeft size={24} />
          <span className="text-[17px]">{t('settings')}</span>
        </button>
        <h1 className="text-[17px] font-semibold">{t('selectLanguage')}</h1>
        <div className="w-16"></div>
      </div>

      <div className="px-4 mt-4">
        <ListGroup>
          {LANGUAGES.map((lang, index) => (
            <ListItem
              key={lang.code}
              isLast={index === LANGUAGES.length - 1}
              onClick={() => handleSelect(lang.code)}
            >
              <span className="text-[17px] font-medium text-slate-900">{lang.native}</span>
              {settings.language === lang.code && <Check size={20} className="text-[#007AFF]" />}
            </ListItem>
          ))}
        </ListGroup>
      </div>
    </div>
  );
};

export default LanguageSettings;