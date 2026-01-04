import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { House, ChartPie, Settings as SettingsIcon } from 'lucide-react';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import HomePage from './pages/Home';
import StatsPage from './pages/Stats';
import SettingsPage from './pages/Settings';
import CategoryList from './pages/CategoryList';
import EditCategory from './pages/EditCategory';
import MemberList from './pages/MemberList';
import EditMember from './pages/EditMember';
import LanguageSettings from './pages/LanguageSettings';
import CurrencySettings from './pages/CurrencySettings';
import { initStoragePersistence } from './services/storageService';

const NavItem = ({ to, icon: Icon, labelKey }: { to: string; icon: any; labelKey: string }) => {
  const location = useLocation();
  const { t } = useSettings();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors ${isActive ? 'text-[#007AFF]' : 'text-slate-400'}`}>
      <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[10px] mt-0.5 font-medium">{t(labelKey as any)}</span>
    </Link>
  );
};

const Layout: React.FC = () => {
  const location = useLocation();
  // Only show nav on main tabs
  const showNav = ['/', '/stats', '/settings'].includes(location.pathname);

  useEffect(() => {
    initStoragePersistence();
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 font-sans pb-safe">
      {/* Main Content Area */}
      <div className="max-w-md mx-auto min-h-screen bg-[#F2F2F7] relative shadow-2xl">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/categories" element={<CategoryList />} />
          <Route path="/settings/categories/add" element={<EditCategory />} />
          <Route path="/settings/categories/edit/:id" element={<EditCategory />} />
          <Route path="/settings/members" element={<MemberList />} />
          <Route path="/settings/members/add" element={<EditMember />} />
          <Route path="/settings/members/edit/:id" element={<EditMember />} />
          <Route path="/settings/language" element={<LanguageSettings />} />
          <Route path="/settings/currency" element={<CurrencySettings />} />
        </Routes>
        
        {/* iOS Style Bottom Navigation */}
        {showNav && (
          <nav className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-md z-50 pb-safe bg-white/80 backdrop-blur-xl border-t border-slate-200 flex justify-around items-center">
            <NavItem to="/" icon={House} labelKey="home" />
            <NavItem to="/stats" icon={ChartPie} labelKey="stats" />
            <NavItem to="/settings" icon={SettingsIcon} labelKey="settings" />
          </nav>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <HashRouter>
        <Layout />
      </HashRouter>
    </SettingsProvider>
  );
};

export default App;