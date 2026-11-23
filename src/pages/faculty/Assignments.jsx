import { useMemo, useState } from 'react';
import { BookOpenCheck, Plus, FileText, CalendarDays, Award, Users, CheckCircle2, ShieldCheck, MessageSquare } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, StatCard, Badge, StatusBadge, EmptyState, Tabs, Avatar, ProgressBar } from '../../components/common/ui';
import SearchInput from '../../components/common/SearchInput';
import Modal from '../../components/common/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { fmtDate } from '../../utils/helpers';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function FacultyAssignments() {
  useDocumentTitle('Assignments');
  const { db, me, actions } = useData();
  const toast = useToast();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [grading, setGrading] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submissionPreview, setSubmissionPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', subjectId: '', due: '', max: '20', description: '', format: 'PDF' });

  const profile = me?.faculty;
  const mySubjects = useMemo(() => (db?.subjects || []).filter((s) => s.facultyId === profile?.id || profile?.subjects?.includes(s.name)), [db, profile]);
  const mySubjectIds = mySubjects.map((s) => s.id);
  const assignments = (db?.assignments || []).filter((a) => mySubjectIds.includes(a.subjectId) || a.facultyId === profile?.id);

  const filtered = assignments
    .filter((a) => tab === 'all' || a.status === tab)
    .filter((a) => !q.trim() || a.title.toLowerCase().includes(q.toLowerCase()));

  const submitted = assignments.filter((a) => a.status === 'Submitted');
  const graded = assignments.filter((a) => a.status === 'Graded');
  const avg = graded.length ? Math.round(graded.reduce((s, a) => s + (a.marks / a.max) * 100, 0) / graded.length) : 0;

  const create = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subjectId || !form.due) { toast.error('Missing details', 'Title, subject and due date are required.'); return; }
    try {actions.createAssignment({
      title: form.title.trim(), subjectId: form.subjectId, facultyId: profile.id, due: form.due,
      max: Number(form.max) || 20, description: form.description || 'No description provided.', format: form.format,
    });
    setCreateOpen(false);
    setForm({ title: '', subjectId: '', due: '', max: '20', description: '', format: 'PDF' });
    toast.success('Assignment published', 'Students can now see it in the demo assignment list.');
    }catch(error){toast.error('Assignment not published',error.message);}
  };

  const saveGrade = () => {
    if (marks === '' || Number(marks) < 0 || Number(marks) > grading.max) { toast.error('Enter a valid mark', `Between 0 and ${grading.max}.`); return; }
    setSaving(true);
    try {actions.gradeAssignment(grading.id,marks,feedback);setGrading(null);setMarks('');toast.success('Marks saved','The student has been notified.');}
    catch(error){toast.error('Marks not saved',error.message);}finally{setSaving(false);}
  };

  if (!db) return null;

  return (
    <div>
      <PageHeader
        title="Assignments"
        description="Create assignments, review submissions and publish marks — with accessibility accommodations applied automatically."
        breadcrumbs={[{ label: 'Faculty Dashboard', to: '/faculty' }, { label: 'Assignments' }]}
        icon={BookOpenCheck}
        actions={<button onClick={() => setCreateOpen(true)} className="btn-primary text-sm"><Plus className="h-4 w-4" aria-hidden="true" /> Create assignment</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
        <StatCard label="Your assignments" value={assignments.length} icon={FileText} tone="navy" hint={mySubjects.map((s) => s.code).join(' · ')} />
        <StatCard label="Awaiting grading" value={submitted.length} icon={CalendarDays} tone="amber" hint="Submitted by students" />
        <StatCard label="Graded" value={graded.length} icon={Award} tone="green" hint="Marks published" />
        <StatCard label="Average score" value={`${avg}%`} icon={Users} tone="brand" hint="Across graded work" />
      </div>

      <Card className="p-3 sm:p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Tabs value={tab} onChange={setTab} tabs={[
            { value: 'all', label: 'All', count: assignments.length },
            { value: 'Pending', label: 'Open', count: assignments.filter((a) => a.status === 'Pending').length },
            { value: 'Submitted', label: 'To grade', count: submitted.length },
            { value: 'Graded', label: 'Graded', count: graded.length },
          ]} />
          <SearchInput value={q} onChange={setQ} placeholder="Search assignments…" className="sm:ml-auto sm:w-60" label="Search assignments" id="fac-assign-search" />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={BookOpenCheck} title="No assignments" description="Create your first assignment — it will appear instantly for students." action={<button onClick={() => setCreateOpen(true)} className="btn-primary text-xs"><Plus className="h-3.5 w-3.5" /> Create assignment</button>} /></Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-3.5">
          {filtered.map((a) => {
            const sub = db.subjects.find((s) => s.id === a.subjectId);
            const score = a.marks != null ? Math.round((a.marks / a.max) * 100) : null;
            return (
              <Card key={a.id} hover className="p-4 sm:p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="grid place-items-center h-9 w-9 rounded-lg shrink-0" style={{ backgroundColor: `${sub?.color}18`, color: sub?.color }}><FileText className="h-4 w-4" aria-hidden="true" /></span>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{a.title}</h2>
                      <p className="text-[11px] muted mt-0.5">{sub?.code} · due {fmtDate(a.due)} · max {a.max}</p>
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <p className="mt-2.5 text-xs muted line-clamp-2 leading-relaxed">{a.description}</p>
                {score !== null && (
                  <div className="mt-3">
                    <ProgressBar label={`Marks awarded · ${a.marks}/${a.max}`} value={score} tone={score >= 75 ? 'green' : 'amber'} showValue />
                  </div>
                )}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <Badge tone="slate">{a.format}</Badge>
                  <Badge tone="blue">{a.status === 'Submitted' ? '1 submission' : a.status === 'Graded' ? 'Graded' : 'Open for submissions'}</Badge>
                  <div className="ml-auto flex gap-1.5">
                    {a.status === 'Submitted' && <button onClick={() => { setGrading(a); setMarks(''); setFeedback(''); setSubmissionPreview(false); }} className="btn-primary text-[10px] py-1.5">Grade submission</button>}
                    {a.status === 'Graded' && <button onClick={() => { setGrading({ ...a, regrade: true }); setMarks(String(a.marks)); setFeedback(a.feedback||''); setSubmissionPreview(false); }} className="btn-secondary text-[10px] py-1.5">Edit marks</button>}
                    <button onClick={() => {actions.remindAssignment(a);toast.success('Reminder sent', 'A notification has been added to the student inbox.');}} className="btn-secondary text-[10px] py-1.5"><MessageSquare className="h-3 w-3" aria-hidden="true" /> Remind</button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} size="lg" title="Create assignment" description="Published immediately to every student in the selected subject."
        footer={<><button className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button><button form="create-assignment" type="submit" className="btn-primary">Publish assignment</button></>}
      >
        <form id="create-assignment" onSubmit={create} className="space-y-4">
          <div>
            <label htmlFor="ca-title" className="label">Assignment title</label>
            <input id="ca-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="e.g. Graph Traversal Worksheet" required />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label htmlFor="ca-subject" className="label">Subject</label>
              <select id="ca-subject" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} className="input" required>
                <option value="">Select subject…</option>
                {mySubjects.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="ca-max" className="label">Max marks</label>
              <input id="ca-max" type="number" min="5" max="100" value={form.max} onChange={(e) => setForm({ ...form, max: e.target.value })} className="input" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="ca-due" className="label">Due date</label>
              <input id="ca-due" type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} className="input" required />
            </div>
            <div>
              <label htmlFor="ca-format" className="label">Submission format</label>
              <select id="ca-format" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} className="input">
                {['PDF', 'DOCX', 'PDF + code', 'ZIP', 'Live demo'].map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="ca-desc" className="label">Description</label>
            <textarea id="ca-desc" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" placeholder="What should students do? Include any accessibility notes." />
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-[11px] text-emerald-900 dark:text-emerald-200">Approved accommodations (extra time, alternative formats) will be applied automatically to every student in this class.</p>
          </div>
        </form>
      </Modal>

      {/* grade modal */}
      <Modal open={!!grading} onClose={() => setGrading(null)} title={grading?.regrade ? 'Edit marks' : 'Grade submission'} description={grading?.title} size="md"
        footer={<><button className="btn-secondary" onClick={() => setGrading(null)}>Cancel</button><button className="btn-primary" onClick={saveGrade} disabled={saving}>{saving ? 'Saving…' : 'Publish marks'}</button></>}
      >
        {grading && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-white/10 p-3">
              <Avatar name={db.students.find((s) => s.id === 'st_01')?.name} color="from-blue-500 to-indigo-600" size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-white">{db.students.find((s) => s.id === 'st_01')?.name}</p>
                <p className="text-[10px] muted">{db.students.find((s) => s.id === 'st_01')?.rollNo} · submitted a PDF</p>
              </div>
              <button onClick={()=>setSubmissionPreview(v=>!v)} className="btn-secondary text-[10px] py-1.5"><FileText className="h-3 w-3" aria-hidden="true" /> View file</button>
            </div>
            <div>
              {submissionPreview&&<div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3 mb-3 text-xs"><h4 className="font-bold mb-2">Demo submission preview</h4><p className="muted">{grading.submissionNote || 'This sample submission demonstrates the approach described in the assignment. Binary file content is not retained in demo mode.'}</p></div>}
              <label htmlFor="grade-marks" className="label">Marks awarded (out of {grading.max})</label>
              <input id="grade-marks" type="number" min="0" max={grading.max} value={marks} onChange={(e) => setMarks(e.target.value)} className="input" placeholder={`0 – ${grading.max}`} />
            </div>
            <div>
              <label htmlFor="grade-feedback" className="label">Feedback (optional)</label>
              <textarea id="grade-feedback" value={feedback} onChange={e=>setFeedback(e.target.value)} rows={3} className="input" placeholder="Write constructive feedback the student can read aloud." />
            </div>
            <p className="flex items-start gap-1.5 text-[10px] muted"><CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5" aria-hidden="true" /> Marks and feedback are published to the student immediately and announced in their notifications.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
