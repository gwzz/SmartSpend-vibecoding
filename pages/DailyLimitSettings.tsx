import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, XCircle } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { Card, Button } from '../components/ui';

const DailyLimitSettings: React.FC = () => {
  const navigate = useNavigate();
  const { t, settings, updateSettings, formatCurrency } = useSettings();

  const initial = settings.dailySpendLimit ?? 0;
  const [raw, setRaw] = useState<string>(initial > 0 ? String(initial) : '');

  const parsed = useMemo(() => {
    if (raw.trim() === '') return 0;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : NaN;
  }, [raw]);

  const handleSave = () => {
    updateSettings({ dailySpendLimit: Number.isFinite(parsed) ? parsed : 0 });
    navigate(-1);
  };

  return (
    <div className="pt-safe pb-10 min-h-screen bg-brand-canvas">
      <div className="px-4 py-2 flex items-center justify-between sticky top-0 z-50 bg-brand-canvas/90 backdrop-blur-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-brand-primary active:opacity-50 -ml-2"
        >
          <ChevronLeft size={24} />
          <span className="text-[17px]">{t('settings')}</span>
        </button>
        <h1 className="text-[17px] font-semibold">{t('dailySpendLimit')}</h1>
        <div className="w-16" />
      </div>

      <div className="px-4 mt-4 max-w-xl">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[12px] uppercase tracking-wide text-brand-muted font-semibold">{t('dailySpendLimit')}</p>
              <p className="text-[13px] text-brand-muted">{t('dailySpendLimitHint')}</p>
            </div>
            <button
              className="text-slate-400 hover:text-slate-600 active:opacity-60"
              title={t('clear')}
              onClick={() => setRaw('')}
            >
              <XCircle size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="0"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-[16px] text-brand-ink shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
            <Button
              onClick={handleSave}
              className="whitespace-nowrap flex items-center gap-2"
              disabled={Number.isNaN(parsed)}
            >
              <Check size={18} />
              {t('save')}
            </Button>
          </div>

          <div className="mt-3 text-[13px] text-brand-muted">
            {Number.isNaN(parsed) ? (
              <span className="text-red-600">{t('enterValidNumber')}</span>
            ) : (
              <span>
                {t('preview')}: {parsed > 0 ? formatCurrency(parsed) : t('noLimit')}
              </span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DailyLimitSettings;
