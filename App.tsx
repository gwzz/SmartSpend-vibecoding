import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { House, ChartPie, Settings as SettingsIcon } from 'lucide-react';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/Home';
import StatsPage from './pages/Stats';
import SettingsPage from './pages/Settings';
import LoginPage from './pages/Login';
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

const DesktopNavItem = ({ to, icon: Icon, labelKey }: { to: string; icon: any; labelKey: string }) => {
  const location = useLocation();
  const { t } = useSettings();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-blue-50 text-[#007AFF]' : 'text-slate-600 hover:bg-slate-50'}`}>
      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
      <span className="font-medium text-[15px]">{t(labelKey as any)}</span>
    </Link>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7]">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  return <>{children}</>;
};

const Layout: React.FC = () => {
  const location = useLocation();
  // Only show bottom nav on main tabs on mobile
  const showNav = ['/', '/stats', '/settings'].includes(location.pathname);

  // Init data on mount (AuthContext handles session check first)
  useEffect(() => {
    initStoragePersistence();
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 font-sans flex flex-col md:flex-row pb-safe">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0 z-50">
        <div className="p-6">
            <h1 className="text-2xl font-bold text-[#007AFF] flex items-center gap-2">
              <span>💸</span> SmartSpend
            </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
            <DesktopNavItem to="/" icon={House} labelKey="home" />
            <DesktopNavItem to="/stats" icon={ChartPie} labelKey="stats" />
            <DesktopNavItem to="/settings" icon={SettingsIcon} labelKey="settings" />
        </nav>
        <div className="p-6 text-xs text-slate-400">
           v1.3.0 (Cloud)
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 relative">
        <div className="max-w-6xl mx-auto min-h-screen bg-[#F2F2F7]">
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
        </div>

        {/* iOS Style Bottom Navigation (Mobile Only) */}
        {showNav && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe bg-white/80 backdrop-blur-xl border-t border-slate-200 flex justify-around items-center">
            <NavItem to="/" icon={House} labelKey="home" />
            <NavItem to="/stats" icon={ChartPie} labelKey="stats" />
            <NavItem to="/settings" icon={SettingsIcon} labelKey="settings" />
          </nav>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <HashRouter>
          <Routes>
            <Route path="/auth" element={<LoginPage />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            } />
          </Routes>
        </HashRouter>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;