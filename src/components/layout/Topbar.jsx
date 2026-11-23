import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Accessibility, HelpCircle, LogOut, User, Settings, BookOpen, ChevronDown, Moon, Sun, ExternalLink } from 'lucide-react';
import { useAuth, ROLE_LABELS } from '../../context/AuthContext';
import { useA11y } from '../../context/AccessibilityContext';
import { Avatar, KeyHint } from '../common/ui';
import NotificationBell from './NotificationBell';
import GlobalSearch from './GlobalSearch';
import Dropdown, { MenuItem, MenuLabel, MenuSeparator } from '../common/Dropdown';

export default function Topbar({ onMenu }) {
  const { user, role, logout } = useAuth();
  const { prefs, set } = useA11y();
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 h-16 bg-white/90 dark:bg-navy-950/90 backdrop-blur border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-2 h-full px-3 sm:px-5">
          <button onClick={onMenu} className="lg:hidden btn-icon" aria-label="Open navigation menu"><Menu className="h-5 w-5" /></button>

          <button
            onClick={() => setSearchOpen(true)}
            className="group flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50/80 dark:bg-white/5 px-3 py-2 text-xs text-slate-600 hover:border-slate-300 dark:hover:border-white/25 transition-colors min-w-0 flex-1 max-w-[180px] sm:max-w-xs"
            title="Search (Control K)"
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Search anything…</span>
            <span className="ml-auto hidden sm:flex items-center gap-0.5" aria-hidden="true"><KeyHint>⌘</KeyHint><KeyHint>K</KeyHint></span>
          </button>

          <div className="ml-auto shrink-0 flex items-center gap-1 sm:gap-1.5">
            <button onClick={() => window.dispatchEvent(new Event('ic:open-a11y'))} className="btn-icon" aria-label="Open accessibility settings" title="Accessibility settings (Alt + A)">
              <Accessibility className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
            <button onClick={() => set('theme', prefs.theme === 'dark' ? 'light' : 'dark')} className="btn-icon hidden sm:grid" aria-label={prefs.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {prefs.theme === 'dark' ? <Sun className="h-[18px] w-[18px]" aria-hidden="true" /> : <Moon className="h-[18px] w-[18px]" aria-hidden="true" />}
            </button>
            <Link to="/settings" className="btn-icon hidden md:grid" aria-label="Help and system settings"><HelpCircle className="h-[18px] w-[18px]" aria-hidden="true" /></Link>

            <NotificationBell />

            <div className="w-px h-6 bg-slate-200 dark:bg-white/15 mx-1 hidden sm:block" aria-hidden="true" />

            <Dropdown
              label={`${user?.name} ${ROLE_LABELS[role]} user menu`} width="w-64"
              trigger={
                <span className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-slate-100 dark:hover:bg-white/10">
                  <span aria-hidden="true"><Avatar name={user?.name} color={user?.avatarColor} size="sm" /></span>
                  <span className="hidden md:block text-left">
                    <span className="block text-xs font-bold text-slate-800 dark:text-white leading-tight max-w-[130px] truncate">{user?.name}</span>
                    <span className="block text-[10px] text-slate-600 dark:text-slate-400">{ROLE_LABELS[role]}</span>
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-600 hidden md:block" aria-hidden="true" />
                </span>
              }
            >
              <div className="px-2.5 py-2">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user?.name}</p>
                <p className="text-[11px] muted truncate">{user?.email}</p>
              </div>
              <MenuSeparator />
              <MenuLabel>Account</MenuLabel>
              <MenuItem icon={User} onClick={() => navigate('/profile')}>My profile</MenuItem>
              <MenuItem icon={Accessibility} onClick={() => navigate('/accessibility-settings')}>Accessibility settings</MenuItem>
              <MenuItem icon={BookOpen} onClick={() => navigate('/assistive-hub')}>Assistive Learning Hub</MenuItem>
              <MenuItem icon={Settings} onClick={() => navigate('/settings')}>Settings</MenuItem>
              <MenuSeparator />
              <MenuItem icon={ExternalLink} onClick={() => navigate('/')}>View public site</MenuItem>
              <MenuItem icon={LogOut} danger onClick={logout}>Sign out</MenuItem>
            </Dropdown>
          </div>
        </div>
      </header>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
