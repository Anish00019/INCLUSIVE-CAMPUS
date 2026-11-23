import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Plus, Calendar, Paperclip, ArrowUpRight, MessageSquare, ShieldCheck, Download, Clock, ChevronRight } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, StatusBadge, Badge, EmptyState, Tabs, Avatar } from '../../components/common/ui';
import SearchInput from '../../components/common/SearchInput';
import Modal from '../../components/common/Modal';
import Timeline from '../../components/dashboard/Timeline';
import { useData } from '../../context/DataContext';
import { fmtDate, timeAgo, PRIORITY_STYLES, REQUEST_STATUSES, cn } from '../../utils/helpers';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function SupportTracking() {
  useDocumentTitle('Track Support Requests');
  const { myRequests, db } = useData();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    let list = myRequests;
    if (tab === 'open') list = list.filter((r) => ['Submitted', 'Under Review', 'Approved', 'In Progress'].includes(r.status));
    if (tab === 'completed') list = list.filter((r) => r.status === 'Completed');
    if (tab === 'closed') list = list.filter((r) => r.status === 'Rejected');
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter((r) => `${r.id} ${r.subject} ${r.category} ${r.description}`.toLowerCase().includes(t));
    }
    return list;
  }, [myRequests, tab, q]);

  const counts = {
    all: myRequests.length,
    open: myRequests.filter((r) => ['Submitted', 'Under Review', 'Approved', 'In Progress'].includes(r.status)).length,
    completed: myRequests.filter((r) => r.status === 'Completed').length,
    closed: myRequests.filter((r) => r.status === 'Rejected').length,
  };

  const staff = selected ? db.supportStaff.find((s) => s.id === selected.assignedTo) : null;

  return (
    <div>
      <PageHeader
        title="Track Support Requests"
        description="Follow the progress of every accessibility request, see who is working on it and read the full decision trail."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Support', to: '/support' }, { label: 'Track' }]}
        icon={Inbox}
        actions={<Link to="/support?new=1" className="btn-primary text-sm"><Plus className="h-4 w-4" aria-hidden="true" /> New request</Link>}
      />

      <Card className="p-3 sm:p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Tabs
            value={tab} onChange={setTab} className="shrink-0"
            tabs={[
              { value: 'all', label: 'All', count: counts.all },
              { value: 'open', label: 'Open', count: counts.open },
              { value: 'completed', label: 'Completed', count: counts.completed },
              { value: 'closed', label: 'Rejected', count: counts.closed },
            ]}
          />
          <SearchInput value={q} onChange={setQ} placeholder="Search by ID, subject or category…" className="sm:ml-auto sm:w-72" label="Search support requests" id="track-search" />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Inbox}
            title={q ? 'No matching requests' : 'Nothing here yet'}
            description={q ? 'Try a different search term or clear the filters.' : 'When you submit an accessibility request, its full progress appears here.'}
            action={q ? <button className="btn-secondary text-xs" onClick={() => { setQ(''); setTab('all'); }}>Clear filters</button> : <Link to="/support?new=1" className="btn-primary text-xs"><Plus className="h-3.5 w-3.5" /> New request</Link>}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <Card key={r.id} hover className="overflow-hidden">
              <div className="p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">{r.id}</span>
                      <Badge className={PRIORITY_STYLES[r.priority]}>{r.priority} priority</Badge>
                      <span className="text-[11px] muted">· {r.category}</span>
                    </div>
                    <h2 className="mt-1.5 text-sm font-bold text-slate-900 dark:text-white">{r.subject}</h2>
                    <p className="mt-1 text-xs muted line-clamp-2 leading-relaxed">{r.description}</p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] muted">
                      <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" aria-hidden="true" /> Raised {fmtDate(r.createdAt)}</span>
                      {r.documents?.length > 0 && <span className="inline-flex items-center gap-1"><Paperclip className="h-3.5 w-3.5" aria-hidden="true" /> {r.documents.length} document{r.documents.length > 1 ? 's' : ''}</span>}
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden="true" /> Updated {timeAgo(r.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:w-56 shrink-0">
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={r.status} />
                      <button onClick={() => setSelected(r)} className="btn-secondary text-[11px] py-1.5 px-2.5">Details <ChevronRight className="h-3 w-3" aria-hidden="true" /></button>
                    </div>
                    {r.assignedTo ? (
                      <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 px-2 py-1.5">
                        <Avatar name={db.supportStaff.find((s) => s.id === r.assignedTo)?.name} size="xs" color="from-violet-500 to-purple-600" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate">{db.supportStaff.find((s) => s.id === r.assignedTo)?.name}</p>
                          <p className="text-[9px] muted truncate">{db.supportStaff.find((s) => s.id === r.assignedTo)?.role}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] muted text-center">Staff assignment pending</p>
                    )}
                  </div>
                </div>

                {/* timeline mini */}
                <div className="mt-4 rounded-xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Progress</p>
                    <button onClick={() => setSelected(r)} className="text-[10px] font-bold text-navy-700 dark:text-brand-300 hover:underline">Full timeline</button>
                  </div>
                  <div className="flex items-center gap-1">
                    {REQUEST_STATUSES.filter((s) => s !== 'Rejected').map((s, i) => {
                      const idx = REQUEST_STATUSES.indexOf(r.status);
                      const done = r.status !== 'Rejected' && i <= idx;
                      return (
                        <div key={s} className="flex-1">
                          <div className={cn('h-1.5 rounded-full', done ? 'bg-navy-700' : 'bg-slate-200 dark:bg-white/15')} />
                          <p className={cn('hidden sm:block text-[9px] mt-1 truncate', done ? 'font-bold text-navy-800 dark:text-white' : 'text-slate-600')}>{s}</p>
                        </div>
                      );
                    })}
                    {r.status === 'Rejected' && <span className="ml-1 text-[9px] font-bold text-rose-600">Rejected</span>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* detail modal */}
      <Modal
        open={!!selected} onClose={() => setSelected(null)} size="lg"
        title={selected ? `${selected.id} · ${selected.subject}` : ''}
        description={selected ? `${selected.category} · raised ${fmtDate(selected.createdAt)}` : ''}
        footer={
          <>
            <Link to="/messages" className="btn-secondary"><MessageSquare className="h-4 w-4" aria-hidden="true" /> Message support team</Link>
            <button className="btn-primary" onClick={() => setSelected(null)}>Close</button>
          </>
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Status</p>
                <div className="mt-1"><StatusBadge status={selected.status} /></div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Priority</p>
                <div className="mt-1"><Badge className={PRIORITY_STYLES[selected.priority]}>{selected.priority}</Badge></div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Assigned staff</p>
                <p className="mt-1 text-xs font-bold text-slate-800 dark:text-white truncate">{staff?.name || 'Not yet assigned'}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Your description</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed rounded-xl bg-slate-50 dark:bg-white/5 p-3">{selected.description}</p>
            </div>

            {selected.documents?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Documents</h4>
                <ul className="space-y-1.5">
                  {selected.documents.map((d) => (
                    <li key={d} className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 px-3 py-2 text-xs">
                      <Paperclip className="h-3.5 w-3.5 text-slate-600 shrink-0" aria-hidden="true" />
                      <span className="truncate flex-1 text-slate-700 dark:text-slate-200">{d}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-navy-700 dark:text-brand-300"><Download className="h-3 w-3" aria-hidden="true" /> Secured</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Decision timeline</h4>
              <Timeline events={selected.timeline} currentStatus={selected.status} />
            </div>

            {staff && (
              <div className="flex items-center gap-3 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30 p-3">
                <Avatar name={staff.name} color="from-violet-500 to-purple-600" size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-violet-900 dark:text-violet-200">{staff.name}</p>
                  <p className="text-[10px] text-violet-700/80 dark:text-violet-300/80">{staff.role} · {staff.availability}</p>
                </div>
                <Link to="/messages" className="text-[10px] font-bold text-violet-800 dark:text-violet-200 inline-flex items-center gap-1 hover:underline">Contact <ArrowUpRight className="h-3 w-3" aria-hidden="true" /></Link>
              </div>
            )}

            <p className="flex items-start gap-2 text-[10px] muted"><ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" /> Every status change is logged with a timestamp for transparency and audit.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
