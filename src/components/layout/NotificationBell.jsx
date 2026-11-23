import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, LifeBuoy, BookOpen, CalendarClock, Megaphone, Sparkles, Settings2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { timeAgo, cn } from '../../utils/helpers';
import { EmptyState } from '../common/ui';

const ICONS = { support: LifeBuoy, material: BookOpen, assignment: BookOpen, exam: CalendarClock, announcement: Megaphone, accessibility: Sparkles, system: Settings2 };

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { notifications, actions } = useData();
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="true"
        className="relative grid place-items-center h-9 w-9 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
      >
        <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 grid place-items-center rounded-full bg-rose-500 text-white text-[10px] font-bold ring-2 ring-white dark:ring-navy-950">{unread}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(90vw,380px)] rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-navy-900 shadow-2xl animate-in overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/10">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Notifications</p>
              <p className="text-[11px] muted">{unread ? `${unread} unread` : 'You are all caught up'}</p>
            </div>
            {unread > 0 && (
              <button onClick={actions.markAllRead} className="btn-ghost text-[11px] px-2 py-1">
                <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[58vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <EmptyState icon={Bell} title="No notifications" description="Updates about requests, materials and exams will appear here." />
            ) : notifications.slice(0, 6).map((n) => {
              const Icon = ICONS[n.type] || Bell;
              return (
                <Link
                  key={n.id} to={n.link || '/notifications'} onClick={() => { actions.markRead(n.id); setOpen(false); }}
                  className={cn('flex gap-3 px-4 py-3 border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5', !n.read && 'bg-navy-50/40 dark:bg-white/[0.04]')}
                >
                  <span className={cn('grid place-items-center h-8 w-8 rounded-lg shrink-0', n.read ? 'bg-slate-100 text-slate-600 dark:bg-white/10' : 'bg-navy-100 text-navy-700 dark:bg-white/15 dark:text-white')}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-white leading-snug">{n.title}</span>
                      {!n.read && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" aria-label="Unread" />}
                    </span>
                    <span className="block text-[11px] muted mt-0.5 line-clamp-2">{n.body}</span>
                    <span className="block text-[10px] text-slate-600 mt-1">{timeAgo(n.time)}</span>
                  </span>
                </Link>
              );
            })}
          </div>
          <Link to="/notifications" onClick={() => setOpen(false)} className="block text-center text-xs font-bold text-navy-700 dark:text-brand-300 py-3 hover:bg-slate-50 dark:hover:bg-white/5">
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
