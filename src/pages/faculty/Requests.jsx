import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy, ShieldCheck, Lock, MessageSquare, ArrowRight, UserCheck, Clock, CheckCircle2, Send } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, StatCard, Badge, StatusBadge, EmptyState, Tabs, Avatar } from '../../components/common/ui';
import SearchInput from '../../components/common/SearchInput';
import Modal from '../../components/common/Modal';
import Timeline from '../../components/dashboard/Timeline';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { fmtDate, timeAgo, PRIORITY_STYLES } from '../../utils/helpers';
import useDocumentTitle from '../../hooks/useDocumentTitle';

// Request descriptions can contain sensitive information regardless of category.
// Faculty receive coordination metadata and approved accommodations, not free-text disclosures.
const FACULTY_VISIBLE = [];

export default function FacultyRequests() {
  useDocumentTitle('Student Support Requests');
  const { db, me, actions } = useData();
  const toast = useToast();
  const [tab, setTab] = useState('open');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');

  const profile = me?.faculty;
  const myStudents = (db?.students || []).filter((s) => s.department === profile?.department);
  const requests = (db?.supportRequests || []).filter((r) => myStudents.some((s) => s.id === r.studentId));

  const filtered = requests
    .filter((r) => tab === 'all' || (tab === 'open' ? !['Completed', 'Rejected'].includes(r.status) : r.status === tab))
    .filter((r) => !q.trim() || `${r.studentName} ${r.id} ${r.category}`.toLowerCase().includes(q.toLowerCase()));

  const addNote = () => {
    if (!note.trim()) { toast.error('Add a note first'); return; }
    actions.updateStatus(selected.id, selected.status, `Faculty note (${profile.name}): ${note.trim()}`);
    setNote('');
    setSelected(null);
    toast.success('Note added to case', 'The Disability Support Office has been notified.');
  };

  const staff = selected ? db.supportStaff.find((s) => s.id === selected.assignedTo) : null;

  if (!db) return null;

  return (
    <div>
      <PageHeader
        title="Student Support Requests"
        description="Coordination view for your students’ accessibility cases. Sensitive medical details remain restricted to the support office."
        breadcrumbs={[{ label: 'Faculty Dashboard', to: '/faculty' }, { label: 'Support Requests' }]}
        icon={LifeBuoy}
        actions={<Link to="/messages" className="btn-secondary text-sm"><MessageSquare className="h-4 w-4" aria-hidden="true" /> Message support office</Link>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
        <StatCard label="Cases (visible)" value={requests.length} icon={LifeBuoy} tone="navy" hint="Your department" />
        <StatCard label="Open" value={requests.filter((r) => !['Completed', 'Rejected'].includes(r.status)).length} icon={Clock} tone="amber" hint="Awaiting resolution" />
        <StatCard label="Approved" value={requests.filter((r) => ['Approved', 'In Progress'].includes(r.status)).length} icon={CheckCircle2} tone="green" hint="Accommodations active" />
        <StatCard label="Completed" value={requests.filter((r) => r.status === 'Completed').length} icon={UserCheck} tone="brand" hint="Resolved this year" />
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 p-3.5 mb-4 flex items-start gap-2.5">
        <Lock className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-[11px] muted leading-relaxed"><strong className="text-slate-700 dark:text-slate-200">Privacy notice.</strong> You see requests that affect your teaching. Categories such as assistive technology, exam accommodations and mobility are shown as summaries — full descriptions and documents are restricted to authorised Disability Support staff.</p>
      </div>

      <Card className="p-3 sm:p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Tabs value={tab} onChange={setTab} tabs={[
            { value: 'open', label: 'Open', count: requests.filter((r) => !['Completed', 'Rejected'].includes(r.status)).length },
            { value: 'Under Review', label: 'Under review' },
            { value: 'In Progress', label: 'In progress' },
            { value: 'Completed', label: 'Completed' },
            { value: 'all', label: 'All', count: requests.length },
          ]} />
          <SearchInput value={q} onChange={setQ} placeholder="Search student or case ID…" className="sm:ml-auto sm:w-60" label="Search cases" id="fac-req-search" />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={LifeBuoy} title="No cases to show" description="No support requests match this filter." /></Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-3.5">
          {filtered.map((r) => {
            const visible = FACULTY_VISIBLE.includes(r.category);
            return (
              <Card key={r.id} hover className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Avatar name={r.studentName} size="sm" color="from-blue-500 to-indigo-600" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{r.studentName}</p>
                      <p className="text-[10px] muted">{myStudents.find((s) => s.id === r.studentId)?.rollNo} · {r.id}</p>
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Badge tone="slate">{r.category}</Badge>
                  <Badge className={PRIORITY_STYLES[r.priority]}>{r.priority}</Badge>
                  {!visible && <Badge tone="amber"><Lock className="h-2.5 w-2.5" aria-hidden="true" /> Details restricted</Badge>}
                </div>

                <p className="mt-2.5 text-xs muted line-clamp-2 leading-relaxed">
                  {visible ? r.description : `Summary: ${r.category} support requested. The Disability Support Office manages the details of this case.`}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] muted">
                  <span>Raised {fmtDate(r.createdAt)}</span>
                  {r.assignedTo && <span className="inline-flex items-center gap-1"><UserCheck className="h-3 w-3" aria-hidden="true" /> {staff?.name || db.supportStaff.find((s) => s.id === r.assignedTo)?.name}</span>}
                  <span className="ml-auto">Updated {timeAgo(r.updatedAt)}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10 flex flex-wrap gap-1.5">
                  <button onClick={() => { setSelected(r); setNote(''); }} className="btn-secondary text-[10px] py-1.5">View case</button>
                  <Link to="/faculty/students" className="btn-ghost text-[10px] py-1.5">Accommodations</Link>
                  <Link to="/messages" className="btn-ghost text-[10px] py-1.5 ml-auto">Message support <ArrowRight className="h-3 w-3" aria-hidden="true" /></Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} size="lg" title={selected ? `${selected.id} · ${selected.category}` : ''} description={selected ? `${selected.studentName} · raised ${fmtDate(selected.createdAt)}` : ''}
        footer={<><button className="btn-secondary" onClick={() => setSelected(null)}>Close</button><button className="btn-primary" onClick={addNote} disabled={!note.trim()}><Send className="h-4 w-4" aria-hidden="true" /> Add note to case</button></>}
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Status</p><div className="mt-1"><StatusBadge status={selected.status} /></div></div>
              <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Priority</p><div className="mt-1"><Badge className={PRIORITY_STYLES[selected.priority]}>{selected.priority}</Badge></div></div>
              <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Assigned staff</p><p className="mt-1 text-xs font-bold text-slate-800 dark:text-white truncate">{staff?.name || 'Support office'}</p></div>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Request summary</h4>
              {FACULTY_VISIBLE.includes(selected.category) ? (
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed rounded-xl bg-slate-50 dark:bg-white/5 p-3">{selected.description}</p>
              ) : (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-3 flex items-start gap-2">
                  <Lock className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">The detailed description for this category is restricted. If you need context to deliver a specific accommodation, contact the Disability Support Office — they will share only what is necessary.</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">Case timeline</h4>
              <Timeline events={selected.timeline.map(e=>({...e,note:`Status updated to ${e.status}.`}))} currentStatus={selected.status} />
            </div>

            <div>
              <label htmlFor="fac-note" className="label">Add a teaching note (visible to support office)</label>
              <textarea id="fac-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="input" placeholder="e.g. Student can use the front-row seat during lab sessions." />
              <p className="text-[10px] muted mt-1 flex items-center gap-1"><ShieldCheck className="h-3 w-3" aria-hidden="true" /> Notes are appended to the case timeline with your name and timestamp.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
