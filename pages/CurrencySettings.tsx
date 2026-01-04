import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { ListGroup, ListItem } from '../components/ui';
import { ChevronLeft, Check } from 'lucide-react';
import { CurrencyCode } from '../types';

const CURRENCIES: { code: CurrencyCode; label: string }[] = [
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'CNY', label: 'Chinese Yuan (¥)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'JPY', label: 'Japanese Yen (¥)' },
  { code: 'GBP', label: 'British Pound (£)' },
];

const CurrencySettings: React.FC = () => {
  const navigate = useNavigate();
  const { t, settings, updateSettings } = useSettings();

  const handleSelect = (code: CurrencyCode) => {
    updateSettings({ currency: code });
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
        <h1 className="text-[17px] font-semibold">{t('selectCurrency')}</h1>
        <div className="w-16"></div>
      </div>

      <div className="px-4 mt-4">
        <ListGroup>
          {CURRENCIES.map((curr, index) => (
            <ListItem
              key={curr.code}
              isLast={index === CURRENCIES.length - 1}
              onClick={() => handleSelect(curr.code)}
            >
              <div className="flex flex-col">
                  <span className="text-[17px] font-medium text-slate-900">{curr.code}</span>
                  <span className="text-[13px] text-slate-500">{curr.label}</span>
              </div>
              {settings.currency === curr.code && <Check size={20} className="text-[#007AFF]" />}
            </ListItem>
          ))}
        </ListGroup>
      </div>
    </div>
  );
};

export default CurrencySettings;