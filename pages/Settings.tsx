import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMembers, getReflectionTags, exportTransactionsToCSV, exportBackupJSON } from '../services/storageService';
import { Button, ListGroup, ListItem, Modal, Card, Badge } from '../components/ui';
import { ChevronRight, User, Share, Layers, Globe, Coins, Download, FileJson, FileSpreadsheet, Smartphone, LogOut, Tag, Target } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, settings, formatCurrency } = useSettings();
  const { user, signOut } = useAuth();
  const [memberCount, setMemberCount] = useState(0);
  const [tagCount, setTagCount] = useState(0);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMembers().then(mems => setMemberCount(mems.length));
    getReflectionTags().then(tags => setTagCount(tags.length));
  }, []);

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await signOut();
      navigate('/auth');
    }
  };

  return (
    <div className="pt-safe pb-24 md:pb-12 px-4 md:px-6 bg-brand-canvas min-h-screen">
      <header className="pt-4 pb-6 md:pt-8 flex items-center justify-between">
        <div>
          <p className="text-[12px] uppercase tracking-[0.2em] text-brand-muted font-semibold">{t('settings')}</p>
          <h1 className="text-[32px] md:text-[34px] font-bold text-brand-ink tracking-tight">{t('appSettings')}</h1>
        </div>
        <Badge variant="outline">v1.3.0</Badge>
      </header>
    
      <div className="max-w-3xl space-y-6">
        {/* User Profile */}
        <Card className="p-5 md:p-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-brand-surface rounded-2xl border border-brand-border flex items-center justify-center text-3xl shadow-soft">
            🧑
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[19px] truncate text-brand-ink">{user?.email || t('myHousehold')}</h3>
            <p className="text-[14px] text-brand-muted">{t('premiumPlan')}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-brand-muted text-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Cloud sync on
          </div>
        </Card>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[12px] uppercase text-brand-muted font-semibold tracking-wide">{t('members')}</p>
              <p className="text-2xl font-bold text-brand-ink">{memberCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">👥</div>
          </Card>
          <Card className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[12px] uppercase text-brand-muted font-semibold tracking-wide">{t('reflectionTags')}</p>
              <p className="text-2xl font-bold text-brand-ink">{tagCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center">🏷️</div>
          </Card>
        </div>

        <ListGroup title={t('general')}>
            <ListItem onClick={() => navigate('/settings/categories')}>
            <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-orange-500 rounded-md flex items-center justify-center text-white"><Layers size={16} /></div>
                <span className="text-[17px]">{t('categories')}</span>
            </div>
            <div className="flex items-center gap-2">
                <ChevronRight size={20} className="text-slate-300" />
            </div>
            </ListItem>
            <ListItem onClick={() => navigate('/settings/reflection-tags')}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-purple-500 rounded-md flex items-center justify-center text-white"><Tag size={16} /></div>
              <span className="text-[17px]">{t('reflectionTags')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[17px] text-slate-400">{tagCount} {t('items')}</span>
              <ChevronRight size={20} className="text-slate-300" />
            </div>
            </ListItem>
            <ListItem onClick={() => navigate('/settings/members')}>
            <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-blue-500 rounded-md flex items-center justify-center text-white"><User size={16} /></div>
                <span className="text-[17px]">{t('members')}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[17px] text-slate-400">{memberCount} {t('active')}</span>
                <ChevronRight size={20} className="text-slate-300" />
            </div>
            </ListItem>
        </ListGroup>

        <ListGroup title={t('appSettings')}>
            <ListItem onClick={() => navigate('/settings/language')}>
            <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-slate-500 rounded-md flex items-center justify-center text-white"><Globe size={16} /></div>
                <span className="text-[17px]">{t('language')}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[17px] text-slate-400">{settings.language === 'en' ? 'English' : '中文'}</span>
                <ChevronRight size={20} className="text-slate-300" />
            </div>
            </ListItem>
            <ListItem onClick={() => navigate('/settings/currency')}>
            <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-yellow-500 rounded-md flex items-center justify-center text-white"><Coins size={16} /></div>
                <span className="text-[17px]">{t('currency')}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[17px] text-slate-400">{settings.currency}</span>
                <ChevronRight size={20} className="text-slate-300" />
            </div>
            </ListItem>
            <ListItem onClick={() => navigate('/settings/daily-limit')}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-emerald-500 rounded-md flex items-center justify-center text-white"><Target size={16} /></div>
              <span className="text-[17px]">{t('dailySpendLimit')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[17px] text-slate-400">{(settings.dailySpendLimit ?? 0) > 0 ? formatCurrency(settings.dailySpendLimit ?? 0) : t('noLimit')}</span>
              <ChevronRight size={20} className="text-slate-300" />
            </div>
            </ListItem>
            <ListItem onClick={() => setShowInstallModal(true)} isLast>
            <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center text-white"><Smartphone size={16} /></div>
                <span className="text-[17px]">{t('installGuide')}</span>
            </div>
            <div className="flex items-center gap-2">
                <ChevronRight size={20} className="text-slate-300" />
            </div>
            </ListItem>
        </ListGroup>

        <ListGroup title={t('backupRestore')}>
            <ListItem onClick={exportBackupJSON} isLast>
            <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-indigo-500 rounded-md flex items-center justify-center text-white"><FileJson size={16} /></div>
                <span className="text-[17px]">{t('exportBackup')}</span>
            </div>
            <div className="flex items-center gap-2">
                <Download size={20} className="text-slate-300" />
            </div>
            </ListItem>
        </ListGroup>

        <ListGroup title={t('dataManagement')}>
            <ListItem onClick={exportTransactionsToCSV} isLast>
            <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-green-500 rounded-md flex items-center justify-center text-white"><FileSpreadsheet size={16} /></div>
                <span className="text-[17px]">{t('exportData')}</span>
            </div>
            <div className="flex items-center gap-2">
                <Share size={20} className="text-slate-300" />
            </div>
            </ListItem>
        </ListGroup>

        <div className="mt-6">
          <Button variant="danger" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut size={20} />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="text-center mt-12 text-slate-400">
        <p className="text-[13px] font-medium">SmartSpend v1.3.0</p>
      </div>

      {/* Install Guide Modal */}
      <Modal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} title={t('installInstructions')}>
        <div className="p-4 space-y-6">
           <div className="bg-brand-card p-4 rounded-xl border border-brand-border shadow-soft">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span>🍎</span> iOS (Safari)
              </h3>
              <ul className="space-y-3 text-[15px] text-brand-ink">
                <li className="flex gap-2">
                  <span className="font-bold text-slate-300">1</span>
                  {t('iosStep1')}
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-slate-300">2</span>
                  {t('iosStep2')}
                </li>
                <li className="flex gap-2">
                   <span className="font-bold text-slate-300">3</span>
                   {t('iosStep3')}
                </li>
              </ul>
           </div>

             <div className="bg-brand-card p-4 rounded-xl border border-brand-border shadow-soft">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span>🤖</span> Android (Chrome)
              </h3>
                <ul className="space-y-3 text-[15px] text-brand-ink">
                <li className="flex gap-2">
                  <span className="font-bold text-slate-300">1</span>
                  {t('androidStep1')}
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-slate-300">2</span>
                  {t('androidStep2')}
                </li>
              </ul>
           </div>
           
           <div className="pt-2">
             <Button onClick={() => setShowInstallModal(false)} variant="secondary">OK</Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
