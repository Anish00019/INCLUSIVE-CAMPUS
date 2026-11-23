import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, LifeBuoy, BookOpen, CalendarClock, Megaphone, Sparkles, Settings2, ArrowRight, Inbox } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { Card, Badge, EmptyState, Tabs } from '../components/common/ui';
import SearchInput from '../components/common/SearchInput';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useA11y } from '../context/AccessibilityContext';
import { timeAgo, cn } from '../utils/helpers';
import useDocumentTitle from '../hooks/useDocumentTitle';

const ICONS = { support: LifeBuoy, material: BookOpen, assignment: BookOpen, exam: CalendarClock, announcement: Megaphone, accessibility: Sparkles, system: Settings2 };
const TONES = {
  support: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  material: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  assignment: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  exam: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  announcement: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  accessibility: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  system: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
};

export default function Notifications() {
  useDocumentTitle('Notifications');
  const { notifications, actions } = useData();
  const { prefs } = useA11y();
  const toast = useToast();
  const [tab, setTab] = useState('all');
  const [type, setType] = useState('all');
  const [q, setQ] = useState('');
  const [clearOpen, setClearOpen] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;

  const filtered = useMemo(() => {
    let list = notifications;
    if (tab === 'unread') list = list.filter((n) => !n.read);
    if (type !== 'all') list = list.filter((n) => n.type === type);
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter((n) => `${n.title} ${n.body}`.toLowerCase().includes(t));
    }
    return list;
  }, [notifications, tab, type, q]);

  const types = ['all', 'support', 'assignment', 'exam', 'announcement', 'accessibility'];

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Every update in one accessible list — with visual alerts available instead of sound."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Notifications' }]}
        icon={Bell}
        actions={
          <>
            <button onClick={() => { actions.markAllRead(); toast.success('All notifications marked as read'); }} disabled={!unread} className="btn-secondary text-sm">
              <CheckCheck className="h-4 w-4" aria-hidden="true" /> Mark all read
            </button>
            <button onClick={() => setClearOpen(true)} disabled={!notifications.length} className="btn-secondary text-sm text-rose-600">
              <Trash2 className="h-4 w-4" aria-hidden="true" /> Clear all
            </button>
          </>
        }
      />

      {prefs.visualAlerts && unread > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50/70 dark:bg-brand-500/10 dark:border-brand-500/30 p-3.5" role="status">
          <span className="relative grid place-items-center h-9 w-9 rounded-lg bg-brand-600 text-white shrink-0">
            <Bell className="h-4 w-4" aria-hidden="true" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-white dark:ring-navy-900" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <p className="text-xs font-bold text-brand-900 dark:text-brand-200">{unread} unread update{unread > 1 ? 's' : ''}</p>
            <p className="text-[11px] text-brand-800 dark:text-brand-200">Visual alerts are on, so you will always see a badge instead of relying on sound.</p>
          </div>
          <button onClick={() => { actions.markAllRead(); toast.success('All caught up'); }} className="btn-secondary text-xs shrink-0">Mark read</button>
        </div>
      )}

      <Card className="p-3 sm:p-4 mb-4">
        <div className="flex flex-col 2xl:flex-row gap-3">
          <Tabs value={tab} onChange={setTab} tabs={[{ value: 'all', label: 'All', count: notifications.length }, { value: 'unread', label: 'Unread', count: unread }]} className="shrink-0" />
          <div className="flex flex-col sm:flex-row gap-2 2xl:ml-auto">
            <div className="flex gap-1.5 overflow-x-auto">
              {types.map((t) => (
                <button key={t} onClick={() => setType(t)} aria-pressed={type === t}
                  className={cn('rounded-full border px-2.5 py-1.5 text-[10px] font-bold capitalize whitespace-nowrap transition-colors',
                    type === t ? 'bg-navy-800 text-white border-navy-800' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/15')}>
                  {t === 'all' ? 'All types' : t}
                </button>
              ))}
            </div>
            <SearchInput value={q} onChange={setQ} placeholder="Search notifications…" className="sm:w-52" label="Search notifications" id="notif-search" />
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Inbox} title="Nothing here" description={q ? 'No notifications match your search.' : 'You are all caught up. New updates will appear here.'} action={q ? <button className="btn-secondary text-xs" onClick={() => setQ('')}>Clear search</button> : <Link to="/support/track" className="btn-secondary text-xs">View support requests</Link>} /></Card>
      ) : (
        <Card className="overflow-hidden divide-y divide-slate-100 dark:divide-white/10">
          {filtered.map((n) => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <div key={n.id} className={cn('flex items-start gap-3 p-4 transition-colors', !n.read && 'bg-navy-50/40 dark:bg-white/[0.04]')}>
                <span className={cn('grid place-items-center h-10 w-10 rounded-xl shrink-0', TONES[n.type] || TONES.system)}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</p>
                    {!n.read && <span className="badge bg-brand-100 text-brand-700 border-brand-200 dark:bg-brand-500/20 dark:text-brand-200 dark:border-brand-500/30">New</span>}
                    <Badge className="capitalize">{n.type}</Badge>
                  </div>
                  <p className="text-xs muted mt-1 leading-relaxed">{n.body}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="text-[10px] text-slate-600">{timeAgo(n.time)}</span>
                    {n.link && <Link to={n.link} onClick={() => actions.markRead(n.id)} className="text-[10px] font-bold text-navy-700 dark:text-brand-300 hover:underline inline-flex items-center gap-0.5">Open <ArrowRight className="h-2.5 w-2.5" aria-hidden="true" /></Link>}
                    {!n.read && <button onClick={() => actions.markRead(n.id)} className="text-[10px] font-bold text-slate-600 hover:underline">Mark as read</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <ConfirmDialog
        open={clearOpen} onClose={() => setClearOpen(false)}
        onConfirm={() => { actions.clearNotifications(); setClearOpen(false); toast.success('Notifications cleared'); }}
        title="Clear all notifications?" confirmLabel="Clear notifications"
        description="This removes the notification list from this demo account. It does not delete any support requests or academic records."
      />
    </div>
  );
}
