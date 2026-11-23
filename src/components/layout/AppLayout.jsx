import VoiceNavigation from '../accessibility/VoiceNavigation';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AccessibilityToolbar from '../accessibility/AccessibilityToolbar';
import useLocalStorage from '../../hooks/useLocalStorage';
import { ShieldCheck } from 'lucide-react';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useLocalStorage('ic_sidebar', false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-navy-950">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main id="main-content" tabIndex={-1} className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-16 max-w-[1500px] w-full mx-auto outline-none">
          <Outlet />
        </main>
        <footer className="border-t border-slate-200/80 dark:border-white/10 px-4 sm:px-8 py-4">
          <div className="max-w-[1500px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] muted">
            <p className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Demo mode · Sample data is stored locally. Do not enter real medical information.</p>
            <p>Inclusive Campus · Accessibility-first · Demo build</p>
          </div>
        </footer>
      </div>

      <VoiceNavigation />
      <AccessibilityToolbar />
    </div>
  );
}
