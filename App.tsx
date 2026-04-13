import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { House, ChartPie, Settings as SettingsIcon } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { isSupabaseConfigured } from './services/supabase';

const HomePage = lazy(() => import('./pages/Home'));
const LandingPage = lazy(() => import('./pages/Landing'));
const StatsPage = lazy(() => import('./pages/Stats'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const LoginPage = lazy(() => import('./pages/Login'));
const CategoryList = lazy(() => import('./pages/CategoryList'));
const EditCategory = lazy(() => import('./pages/EditCategory'));
const MemberList = lazy(() => import('./pages/MemberList'));
const EditMember = lazy(() => import('./pages/EditMember'));
const LanguageSettings = lazy(() => import('./pages/LanguageSettings'));
const CurrencySettings = lazy(() => import('./pages/CurrencySettings'));
const DailyLimitSettings = lazy(() => import('./pages/DailyLimitSettings'));
const ReflectionTagList = lazy(() => import('./pages/ReflectionTagList'));
const EditReflectionTag = lazy(() => import('./pages/EditReflectionTag'));

const NavItem = ({ to, icon: Icon, labelKey }: { to: string; icon: any; labelKey: string }) => {
  const location = useLocation();
  const { t } = useSettings();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors ${isActive ? 'text-brand-primary' : 'text-slate-400'}`}>
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
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-brand-surface text-brand-primary' : 'text-slate-600 hover:bg-brand-surface'}`}>
      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
      <span className="font-medium text-[15px]">{t(labelKey as any)}</span>
    </Link>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-surface text-brand-ink">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  return <>{children}</>;
};

const EntryRoute: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-surface text-brand-muted">Loading…</div>;
  return user ? <Layout /> : <LandingPage />;
};

const Layout: React.FC = () => {
  const location = useLocation();
  // Only show bottom nav on main tabs on mobile
  const showNav = ['/', '/stats', '/settings'].includes(location.pathname);

  return (
    <>
      <div className="min-h-screen bg-brand-surface text-brand-ink font-sans flex flex-col md:flex-row pb-safe">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-brand-card border-r border-brand-border h-screen sticky top-0 z-50 shadow-soft">
        <div className="p-6">
            <h1 className="text-2xl font-bold text-brand-primary flex items-center gap-2" style={{ fontFamily: 'Poppins, Nunito, system-ui, sans-serif' }}>
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
        <div className="max-w-6xl mx-auto min-h-screen bg-brand-surface">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-brand-surface text-brand-muted">Loading…</div>}>
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
              <Route path="/settings/reflection-tags" element={<ReflectionTagList />} />
              <Route path="/settings/reflection-tags/add" element={<EditReflectionTag />} />
              <Route path="/settings/reflection-tags/edit/:id" element={<EditReflectionTag />} />
              <Route path="/settings/language" element={<LanguageSettings />} />
              <Route path="/settings/currency" element={<CurrencySettings />} />
              <Route path="/settings/daily-limit" element={<DailyLimitSettings />} />
            </Routes>
          </Suspense>
        </div>

        {/* iOS Style Bottom Navigation (Mobile Only) */}
        {showNav && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe bg-brand-card/90 backdrop-blur-xl border-t border-brand-border flex justify-around items-center shadow-soft">
            <NavItem to="/" icon={House} labelKey="home" />
            <NavItem to="/stats" icon={ChartPie} labelKey="stats" />
            <NavItem to="/settings" icon={SettingsIcon} labelKey="settings" />
          </nav>
        )}
      </main>
      </div>

      {/* Footer */}
      <footer className="bg-brand-card border-t border-brand-border px-6 py-10 text-sm text-brand-muted">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h2 className="text-xl font-bold text-brand-primary flex items-center gap-2" style={{ fontFamily: 'Poppins, Nunito, system-ui, sans-serif' }}>
              <span>💸</span> SmartSpend
            </h2>
            <p className="mt-2">Simplifying family finance with shared clarity.</p>
          </div>
          <div>
            <h3 className="font-semibold text-brand-ink mb-2">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/landing">Features</Link></li>
              <li>Pricing</li>
              <li>Blog</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-brand-ink mb-2">Support</h3>
            <ul className="space-y-2">
              <li>Security</li>
              <li>Help center</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-brand-ink mb-2">Apps</h3>
            <ul className="space-y-2">
              <li>iOS & Android</li>
              <li>Web app</li>
              <li>Backup & export</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 text-xs text-brand-muted/80 flex justify-between">
          <span>© {new Date().getFullYear()} SmartSpend</span>
          <span>Privacy · Terms</span>
        </div>
      </footer>

      <Analytics />
    </>
  );
};

const App: React.FC = () => {
  if (!isSupabaseConfigured) {
    return <SupabaseSetupScreen />;
  }

  return (
    <AuthProvider>
      <SettingsProvider>
        <NotificationsProvider>
          <HashRouter>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-brand-surface text-brand-muted">Loading…</div>}>
              <Routes>
                <Route path="/" element={<EntryRoute />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/auth" element={<LoginPage />} />
                <Route path="/*" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                } />
              </Routes>
            </Suspense>
          </HashRouter>
        </NotificationsProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

const SupabaseSetupScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-canvas text-brand-ink px-6 py-10 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white border border-brand-border rounded-3xl shadow-soft p-8 md:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center text-2xl">
            $
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Connect SmartSpend to Supabase</h1>
            <p className="text-sm text-brand-muted mt-1">The app is ready, but this environment is missing its Supabase settings.</p>
          </div>
        </div>

        <div className="rounded-2xl bg-brand-surface border border-brand-border p-5">
          <p className="text-sm text-brand-muted mb-3">Create a `.env.local` file in the project root with:</p>
          <pre className="bg-slate-950 text-slate-100 rounded-2xl p-4 text-sm overflow-x-auto">
{`VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key`}
          </pre>
          <p className="text-sm text-brand-muted mt-3">After saving the file, restart the dev server so Vite can load the new environment variables.</p>
        </div>

        <div className="mt-6 text-sm text-brand-muted">
          <p>The app now blocks startup instead of silently falling back to a shared backend, which keeps local and preview environments from writing to the wrong Supabase project.</p>
        </div>
      </div>
    </div>
  );
};

export default App;
