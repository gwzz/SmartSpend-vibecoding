import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEY } from '../constants';
import { getMembers, exportTransactionsToCSV, exportBackupJSON, importBackupJSON } from '../services/storageService';
import { Button, ListGroup, ListItem } from '../components/ui';
import { ChevronRight, User, Share, AlertTriangle, Layers, Globe, Coins, Upload, Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, settings } = useSettings();
  const [memberCount, setMemberCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMemberCount(getMembers().length);
  }, []);

  const handleClearData = () => {
    if (confirm(t('resetConfirm'))) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  const handleImportClick = () => {
    if (confirm(t('importConfirm'))) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = importBackupJSON(content);
      if (success) {
        alert(t('importSuccess'));
        window.location.reload();
      } else {
        alert(t('importError'));
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  return (
    <div className="pt-safe pb-24 px-4 bg-[#F2F2F7] min-h-screen">
      <header className="pt-4 pb-6">
        <h1 className="text-[34px] font-bold text-slate-900 tracking-tight">{t('settings')}</h1>
      </header>

      {/* User Profile */}
      <div className="flex items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-100/50">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl">
          🧑
        </div>
        <div>
          <h3 className="font-semibold text-[19px]">{t('myHousehold')}</h3>
          <p className="text-[14px] text-slate-500">{t('premiumPlan')}</p>
        </div>
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
        <ListItem onClick={() => navigate('/settings/currency')} isLast>
           <div className="flex items-center gap-3">
             <div className="w-7 h-7 bg-yellow-500 rounded-md flex items-center justify-center text-white"><Coins size={16} /></div>
             <span className="text-[17px]">{t('currency')}</span>
           </div>
           <div className="flex items-center gap-2">
             <span className="text-[17px] text-slate-400">{settings.currency}</span>
             <ChevronRight size={20} className="text-slate-300" />
           </div>
        </ListItem>
      </ListGroup>

      <ListGroup title={t('backupRestore')}>
         <ListItem onClick={exportBackupJSON}>
           <div className="flex items-center gap-3">
             <div className="w-7 h-7 bg-indigo-500 rounded-md flex items-center justify-center text-white"><FileJson size={16} /></div>
             <span className="text-[17px]">{t('exportBackup')}</span>
           </div>
           <div className="flex items-center gap-2">
             <Download size={20} className="text-slate-300" />
           </div>
        </ListItem>
        <ListItem onClick={handleImportClick} isLast>
           <div className="flex items-center gap-3">
             <div className="w-7 h-7 bg-indigo-500 rounded-md flex items-center justify-center text-white"><Upload size={16} /></div>
             <span className="text-[17px]">{t('importBackup')}</span>
           </div>
           <div className="flex items-center gap-2">
             <ChevronRight size={20} className="text-slate-300" />
           </div>
        </ListItem>
      </ListGroup>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        className="hidden" 
      />

      <ListGroup title={t('dataManagement')}>
        <ListItem onClick={exportTransactionsToCSV}>
           <div className="flex items-center gap-3">
             <div className="w-7 h-7 bg-green-500 rounded-md flex items-center justify-center text-white"><FileSpreadsheet size={16} /></div>
             <span className="text-[17px]">{t('exportData')}</span>
           </div>
           <div className="flex items-center gap-2">
             <Share size={20} className="text-slate-300" />
           </div>
        </ListItem>
        <ListItem onClick={handleClearData} isLast>
           <div className="flex items-center gap-3">
             <div className="w-7 h-7 bg-red-500 rounded-md flex items-center justify-center text-white"><AlertTriangle size={16} /></div>
             <span className="text-[17px] text-red-500">{t('resetData')}</span>
           </div>
        </ListItem>
      </ListGroup>

      <div className="text-center mt-12">
        <p className="text-[13px] text-slate-400 font-medium">SmartSpend v1.2.0</p>
      </div>
    </div>
  );
};

export default SettingsPage;