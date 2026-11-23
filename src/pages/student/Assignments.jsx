import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenCheck, FileText, Clock, CheckCircle2, Award, Upload, CalendarDays, Paperclip, MessageSquare, ArrowRight, Loader2, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, StatCard, Badge, StatusBadge, EmptyState, Tabs, ProgressBar } from '../../components/common/ui';
import SearchInput from '../../components/common/SearchInput';
import Modal from '../../components/common/Modal';
import SpeakButton from '../../components/accessibility/SpeakButton';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { fmtDate, cn, todayISO } from '../../utils/helpers';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function Assignments() {
  useDocumentTitle('Assignments');
  const { db, actions } = useData();
  const toast = useToast();
  const [tab, setTab] = useState('pending');
  const [q, setQ] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [note, setNote] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const subjects = useMemo(() => Object.fromEntries((db?.subjects || []).map((s) => [s.id, s])), [db]);
  const faculty = useMemo(() => Object.fromEntries((db?.faculty || []).map((f) => [f.id, f])), [db]);
  const all = useMemo(()=>db?.assignments || [],[db]);

  const filtered = useMemo(() => {
    let list = all;
    if (tab === 'pending') list = list.filter((a) => a.status === 'Pending');
    if (tab === 'submitted') list = list.filter((a) => a.status === 'Submitted');
    if (tab === 'graded') list = list.filter((a) => a.status === 'Graded');
    if (subjectFilter !== 'all') list = list.filter((a) => a.subjectId === subjectFilter);
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter((a) => `${a.title} ${a.description} ${subjects[a.subjectId]?.name}`.toLowerCase().includes(t));
    }
    return list.sort((a, b) => a.due.localeCompare(b.due));
  }, [all, tab, subjectFilter, q, subjects]);

  const graded = all.filter((a) => a.status === 'Graded');
  const avg = graded.length ? Math.round((graded.reduce((s, a) => s + (a.marks / a.max) * 100, 0) / graded.length)) : 0;

  const startSubmit = (a) => { setSelected(a); setNote(''); setFiles([]); setSubmitOpen(true); };

  const doSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    actions.submitAssignment(selected.id, note, files.map(f=>({name:typeof f==='string'?f:f.name,size:f.size||0})));
    setSubmitting(false);
    setSubmitOpen(false);
    toast.success('Assignment submitted', `“${selected.title}” was submitted successfully. Your extra time accommodation applied automatically.`);
    setTab('submitted');
  };

  if (!db) return null;

  return (
    <div>
      <PageHeader
        title="Assignments"
        description="Every assignment in one place, with due dates, your submissions and faculty feedback."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Assignments' }]}
        icon={BookOpenCheck}
        actions={<SpeakButton text={`You have ${all.filter((a) => a.status === 'Pending').length} pending assignments. ${all.filter((a) => a.status === 'Pending').map((a) => `${a.title} due ${a.due}`).join('. ')}`} />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <StatCard label="Pending" value={all.filter((a) => a.status === 'Pending').length} icon={Clock} tone="amber" hint="Awaiting submission" />
        <StatCard label="Submitted" value={all.filter((a) => a.status === 'Submitted').length} icon={Upload} tone="sky" hint="Under evaluation" />
        <StatCard label="Graded" value={graded.length} icon={Award} tone="green" hint="Feedback available" />
        <StatCard label="Average score" value={`${avg}%`} icon={CheckCircle2} tone="brand" hint={`Across ${graded.length} graded submissions`} />
      </div>

      <Card className="p-3 sm:p-4 mb-4">
        <div className="flex flex-col 2xl:flex-row gap-3 lg:items-center">
          <Tabs
            value={tab} onChange={setTab} className="shrink-0"
            tabs={[
              { value: 'pending', label: 'Pending', count: all.filter((a) => a.status === 'Pending').length },
              { value: 'submitted', label: 'Submitted', count: all.filter((a) => a.status === 'Submitted').length },
              { value: 'graded', label: 'Graded', count: graded.length },
              { value: 'all', label: 'All', count: all.length },
            ]}
          />
          <div className="flex flex-col sm:flex-row gap-2 2xl:ml-auto">
            <SearchInput value={q} onChange={setQ} placeholder="Search assignments…" className="sm:w-56" label="Search assignments" id="assign-search" />
            <select aria-label="Filter by subject" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="input sm:w-48 text-xs">
              <option value="all">All subjects</option>
              {db.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={BookOpenCheck} title="No assignments here" description="Try a different tab or clear the filters. New assignments appear as soon as faculty publish them." action={<button className="btn-secondary text-xs" onClick={() => { setQ(''); setTab('all'); setSubjectFilter('all'); }}>Reset filters</button>} /></Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-3.5">
          {filtered.map((a) => {
            const sub = subjects[a.subjectId];
            const days = Math.ceil((new Date(a.due) - new Date(todayISO())) / 86400000);
            const score = a.marks != null ? Math.round((a.marks / a.max) * 100) : null;
            return (
              <Card key={a.id} hover className="p-4 sm:p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="grid place-items-center h-9 w-9 rounded-lg shrink-0" style={{ backgroundColor: `${sub?.color}18`, color: sub?.color }}>
                      <FileText className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{a.title}</h2>
                      <p className="text-[11px] muted mt-0.5">{sub?.name} · {faculty[a.facultyId]?.name}</p>
                    </div>
                  </div>
                  <StatusBadge status={a.status} className="shrink-0" />
                </div>

                <p className="mt-3 text-xs muted line-clamp-2 leading-relaxed">{a.description}</p>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
                  <span className={cn('inline-flex items-center gap-1 font-semibold', a.status === 'Pending' && days <= 3 ? 'text-rose-600' : 'text-slate-600 dark:text-slate-300')}>
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> Due {fmtDate(a.due)}
                  </span>
                  {a.status === 'Pending' && (
                    <Badge tone={days <= 3 ? 'rose' : days <= 7 ? 'amber' : 'slate'}>
                      {days <= 0 ? 'Overdue' : days === 1 ? 'Tomorrow' : `${days} days left`}
                    </Badge>
                  )}
                  <span className="inline-flex items-center gap-1 muted"><Paperclip className="h-3.5 w-3.5" aria-hidden="true" />{a.format}</span>
                  <span className="ml-auto text-[10px] muted">Max {a.max} marks</span>
                </div>

                {score !== null && (
                  <div className="mt-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-2.5">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-slate-700 dark:text-slate-200">Scored {a.marks} / {a.max}</span>
                      <span className="font-bold text-emerald-700">{score}%</span>
                    </div>
                    <ProgressBar value={score} tone={score >= 75 ? 'green' : score >= 50 ? 'amber' : 'rose'} />
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center gap-2 flex-wrap">
                  <button onClick={() => setSelected(a)} className="btn-secondary text-xs py-1.5">View details</button>
                  {a.status === 'Pending' && <button onClick={() => startSubmit(a)} className="btn-primary text-xs py-1.5"><Upload className="h-3.5 w-3.5" aria-hidden="true" /> Submit work</button>}
                  {a.status === 'Graded' && <button onClick={() => setSelected(a)} className="btn-ghost text-xs py-1.5"><MessageSquare className="h-3.5 w-3.5" aria-hidden="true" /> Faculty feedback</button>}
                  <Link to="/messages" className="btn-ghost text-xs py-1.5 ml-auto">Ask faculty <ArrowRight className="h-3 w-3" aria-hidden="true" /></Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* details modal */}
      <Modal open={!!selected && !submitOpen} onClose={() => setSelected(null)} size="lg" title={selected?.title || ''} description={selected ? `${subjects[selected.subjectId]?.name} · due ${fmtDate(selected.due)}` : ''}
        footer={<><button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>{selected?.status === 'Pending' && <button className="btn-primary" onClick={() => startSubmit(selected)}>Submit work</button>}</>}
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Status</p><div className="mt-1"><StatusBadge status={selected.status} /></div></div>
              <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Weight</p><p className="mt-1 text-xs font-bold text-slate-800 dark:text-white">{selected.max} marks</p></div>
              <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Format</p><p className="mt-1 text-xs font-bold text-slate-800 dark:text-white">{selected.format}</p></div>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Brief</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{selected.description}</p>
            </div>
            {selected.marks != null && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-3">
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Feedback from {faculty[selected.facultyId]?.name}</p>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 mt-1 leading-relaxed">Well-structured submission. Your analysis of complexity is accurate; consider adding a diagram of the rotation cases. Score: {selected.marks}/{selected.max}.</p>
              </div>
            )}
            <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-3">
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Accommodations applied</p>
              <p className="text-[11px] muted mt-1">Extra time and a distraction-reduced submission window are automatically available for this assignment.</p>
            </div>
          </div>
        )}
      </Modal>

      {/* submit modal */}
      <Modal open={submitOpen} onClose={() => setSubmitOpen(false)} title="Submit assignment" description={selected?.title} size="md"
        footer={<><button className="btn-secondary" onClick={() => setSubmitOpen(false)} disabled={submitting}>Cancel</button><button form="submit-assignment" type="submit" className="btn-primary" disabled={submitting}>{submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : 'Confirm submission'}</button></>}
      >
        <form id="submit-assignment" onSubmit={doSubmit} className="space-y-4">
          <div>
            <label htmlFor="sub-file" className="label">Upload your work</label>
            <label htmlFor="sub-file" className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 bg-slate-50/60 dark:bg-white/5 p-6 cursor-pointer hover:border-navy-400 transition-colors">
              <Upload className="h-6 w-6 text-slate-600" aria-hidden="true" />
              <span className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-200">Choose a file or drag it here</span>
              <span className="text-[10px] muted mt-0.5">PDF, DOCX, ZIP or images · max 25 MB</span>
              <input id="sub-file" type="file" className="sr-only" multiple onChange={(e) => setFiles(Array.from(e.target.files).map((f) => f.name))} />
            </label>
            {files.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {files.map((f) => (
                  <li key={f} className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 px-2.5 py-2 text-xs">
                    <FileText className="h-3.5 w-3.5 text-slate-600 shrink-0" aria-hidden="true" />
                    <span className="truncate flex-1 text-slate-700 dark:text-slate-200">{f}</span>
                    <button type="button" onClick={() => setFiles(files.filter((x) => x !== f))} className="p-1 text-slate-600 hover:text-rose-600" aria-label={`Remove ${f}`}><X className="h-3.5 w-3.5" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label htmlFor="sub-note" className="label">Note for faculty (optional)</label>
            <textarea id="sub-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="input" placeholder="Anything the evaluator should know — e.g. alternative format used." />
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-[11px] text-emerald-800 dark:text-emerald-200">Your approved accommodations (extra time, distraction-reduced submission) are automatically applied — no need to mention them.</p>
          </div>
        </form>
      </Modal>
    </div>
  );
}
