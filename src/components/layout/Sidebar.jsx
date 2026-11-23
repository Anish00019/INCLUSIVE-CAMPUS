import { useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, LifeBuoy, LogOut, Sparkles } from 'lucide-react';
import { NAV_BY_ROLE } from '../../utils/navigation';
import { useAuth, ROLE_LABELS } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { cn } from '../../utils/helpers';
import { Avatar } from '../common/ui';

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user, role, logout } = useAuth();
  const { myRequests } = useData();
  const nav = NAV_BY_ROLE[role] || NAV_BY_ROLE.student;
  const drawer = useRef(null);
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.activeElement;
    const timer = setTimeout(() => drawer.current?.querySelector('a,button')?.focus(), 0);
    const key = e => {
      if (e.key === 'Escape') setMobileOpen(false);
      if (e.key === 'Tab') {
        const targets = [...(drawer.current?.querySelectorAll('a,button') || [])].filter(el => el.getClientRects().length);
        const first=targets[0],last=targets[targets.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
      }
    };
    document.addEventListener('keydown',key);
    return ()=>{clearTimeout(timer);document.removeEventListener('keydown',key);previous?.focus();};
  },[mobileOpen,setMobileOpen]);
  const pending = myRequests.filter((r) => !['Completed', 'Rejected'].includes(r.status)).length;

  const content = (
    <div className="flex h-full flex-col bg-white dark:bg-navy-950 border-r border-slate-200/80 dark:border-white/10">
      {/* brand */}
      <div className={cn('flex items-center gap-2.5 h-16 px-4 shrink-0 border-b border-slate-100 dark:border-white/10', collapsed && 'lg:justify-center lg:px-2')}>
        <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0" aria-label={collapsed ? "Inclusive Campus home" : undefined}>
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-navy-800 text-white shadow-sm shrink-0">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 3v18M3 12h18" /><circle cx="12" cy="12" r="3.2" />
            </svg>
          </span>
          <span className={cn('min-w-0', collapsed && 'lg:hidden')}>
            <span className="block text-sm font-extrabold tracking-tight text-navy-900 dark:text-white leading-tight">Inclusive Campus</span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-300">Access for all</span>
          </span>
        </Link>
        <button className="ml-auto lg:hidden btn-icon" onClick={() => setMobileOpen(false)} aria-label="Close navigation menu"><X className="h-5 w-5" /></button>
      </div>

      {/* role chip */}
      <div className={cn('px-3 pt-4', collapsed && 'lg:px-2')}>
        <div className={cn('flex items-center gap-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-2.5', collapsed && 'lg:justify-center lg:p-2')}>
          <Avatar name={user?.name} color={user?.avatarColor} size="sm" />
          <div className={cn('min-w-0', collapsed && 'lg:hidden')}>
            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user?.name}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 truncate">{ROLE_LABELS[role]}</p>
          </div>
        </div>
      </div>

      {/* navigation */}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {nav.map((group) => (
          <div key={group.section}>
            <p className={cn('px-2 mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600', collapsed && 'lg:text-center lg:px-0')}>
              {collapsed ? <span className="lg:hidden">{group.section}</span> : group.section}
              {collapsed && <span className="hidden lg:inline">•</span>}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={['/support', '/faculty', '/admin', '/support-admin'].includes(item.to)}
                    onClick={() => setMobileOpen?.(false)}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) => cn('nav-item group', isActive && 'nav-item-active', collapsed && 'lg:justify-center lg:px-2')}
                  >
                    <item.icon className="h-4.5 w-4.5 shrink-0" style={{ width: 18, height: 18 }} aria-hidden="true" />
                    <span className={cn('truncate flex-1', collapsed && 'lg:hidden')}>{item.label}</span>
                    {item.to === '/support/track' && pending > 0 && (
                      <span className={cn('badge bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-500/30 px-1.5', collapsed && 'lg:hidden')}>{pending}</span>
                    )}
                    {item.badge && (
                      <span className={cn('text-[9px] font-extrabold uppercase tracking-wide rounded-full bg-brand-100 text-brand-700 px-1.5 py-0.5 dark:bg-brand-500/20 dark:text-brand-200', collapsed && 'lg:hidden')}>{item.badge}</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* footer */}
      <div className={cn('p-3 border-t border-slate-100 dark:border-white/10 space-y-2', collapsed && 'lg:px-2')}>
        <div className={cn('rounded-xl bg-gradient-to-br from-navy-800 to-brand-700 text-white p-3.5', collapsed && 'lg:hidden')}>
          <p className="text-xs font-bold flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Need help?</p>
          <p className="text-[11px] text-white/80 mt-1 leading-relaxed">The Disability Support Office replies within one working day.</p>
          <Link to={role === 'student' ? '/support' : '/messages'} className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold underline underline-offset-2 hover:text-brand-100">
            <LifeBuoy className="h-3 w-3" aria-hidden="true" /> Request support
          </Link>
        </div>
        <div className={cn('flex items-center gap-1', collapsed ? 'lg:flex-col' : 'justify-between')}>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="btn-ghost text-xs hidden lg:inline-flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
          </button>
          <button onClick={logout} className="btn-ghost text-xs" aria-label="Sign out">
            <LogOut className="h-4 w-4" aria-hidden="true" /><span className={cn(collapsed && 'lg:hidden')}>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* desktop */}
      <aside className={cn('hidden lg:block sticky top-0 h-screen shrink-0 transition-[width] duration-200', collapsed ? 'w-[76px]' : 'w-[264px]')}>
        {content}
      </aside>

      {/* mobile */}
      {mobileOpen && <div className="lg:hidden fixed inset-0 z-[80]">
        <div className={cn('absolute inset-0 bg-navy-950/50 transition-opacity', mobileOpen ? 'opacity-100' : 'opacity-0')} onClick={() => setMobileOpen(false)} />
        <div className={cn('absolute left-0 top-0 h-full w-[280px] shadow-2xl transition-transform duration-200', mobileOpen ? 'translate-x-0' : '-translate-x-full')} ref={drawer} role="dialog" aria-modal="true" aria-label="Navigation menu">
          {content}
        </div>
      </div>}
    </>
  );
}
