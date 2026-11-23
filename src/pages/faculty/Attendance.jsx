import { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, CheckCircle2, XCircle, Save, Users, Calendar, ShieldCheck, History, Loader2, Info } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, CardHeader, Avatar, Badge, StatCard, EmptyState } from '../../components/common/ui';
import SearchInput from '../../components/common/SearchInput';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { cn, fmtDate, todayISO } from '../../utils/helpers';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function FacultyAttendance() {
  useDocumentTitle('Attendance Management');
  const { db, me, actions } = useData();
  const toast = useToast();
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState(todayISO());
  const [marks, setMarks] = useState({});
  const [q, setQ] = useState('');
  const [saving, setSaving] = useState(false);

  const profile = me?.faculty;
  const mySubjects = useMemo(() => (db?.subjects || []).filter((s) => s.facultyId === profile?.id || profile?.subjects?.includes(s.name)), [db, profile]);
  useEffect(() => { if (!subjectId && mySubjects.length) setSubjectId(mySubjects[0].id); }, [mySubjects, subjectId]);

  const roster = useMemo(() => (db?.students || []).filter((s) => mySubjects.length === 0 || s.department === profile?.department), [db, mySubjects, profile]);
  useEffect(() => {
    const initial = {};
    const existing=db?.attendanceSessions?.find(s=>s.subjectId===subjectId&&s.date===date);
    roster.forEach((s) => { initial[s.id] = existing?.marks?.[s.id] || 'present'; });
    setMarks(initial);
  }, [roster, subjectId, date, db?.attendanceSessions]);

  const filtered = roster.filter((s) => `${s.name} ${s.rollNo}`.toLowerCase().includes(q.toLowerCase()));
  const present = Object.values(marks).filter((v) => v === 'present').length;
  const absent = Object.values(marks).filter((v) => v === 'absent').length;
  const sessions = (db?.attendanceSessions || []).slice(0, 6);

  const setAll = (v) => { const next = {}; roster.forEach((s) => { next[s.id] = v; }); setMarks(next); };

  const save = async () => {
    setSaving(true);
    try {actions.recordAttendance({ subjectId, date, marks, by: profile?.name });
    setSaving(false);
    toast.success('Attendance saved', `${present} present, ${absent} absent · ${new Date(date).toLocaleDateString('en-IN')}.`);
    }catch(error){toast.error('Attendance not saved',error.message);}finally{setSaving(false);}
  };

  if (!db) return null;

  return (
    <div>
      <PageHeader
        title="Attendance Management"
        description="Mark attendance for your classes. Accessibility-related absences are flagged automatically for the support office."
        breadcrumbs={[{ label: 'Faculty Dashboard', to: '/faculty' }, { label: 'Attendance' }]}
        icon={ClipboardCheck}
        actions={<button onClick={save} disabled={saving || !subjectId} className="btn-primary text-sm">{saving ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Saving…</> : <><Save className="h-4 w-4" aria-hidden="true" /> Save attendance</>}</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
        <StatCard label="In this class" value={roster.length} icon={Users} tone="navy" hint={profile?.department} />
        <StatCard label="Present" value={present} icon={CheckCircle2} tone="green" hint="Marked present" />
        <StatCard label="Absent" value={absent} icon={XCircle} tone="rose" hint="Marked absent" />
        <StatCard label="Sessions saved" value={(db.attendanceSessions || []).length} icon={History} tone="brand" hint="This demo device" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader title="Class details" subtitle="Choose the subject and date you are marking" icon={Calendar} />
            <div className="px-5 pb-5 grid sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="att-subject" className="label">Subject</label>
                <select id="att-subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="input">
                  {mySubjects.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="att-date" className="label">Date</label>
                <input id="att-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 border-b border-slate-100 dark:border-white/10">
              <div className="flex-1">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Student roster</h2>
                <p className="text-[11px] muted">{filtered.length} students · {roster.length} total</p>
              </div>
              <SearchInput value={q} onChange={setQ} placeholder="Find a student…" className="sm:w-48" label="Search roster" id="att-search" />
              <div className="flex gap-1.5">
                <button onClick={() => setAll('present')} className="btn-secondary text-[10px] py-1.5">All present</button>
                <button onClick={() => setAll('absent')} className="btn-secondary text-[10px] py-1.5">All absent</button>
              </div>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-white/10 max-h-[52vh] overflow-y-auto">
              {filtered.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                  <Avatar name={s.name} color={s.avatarColor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      {s.name}
                      {s.accommodations?.length > 0 && <ShieldCheck className="h-3 w-3 text-brand-500" aria-label="Has approved accommodations" />}
                    </p>
                    <p className="text-[10px] muted">{s.rollNo} · {s.attendance}% overall</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0" role="radiogroup" aria-label={`Attendance for ${s.name}`}>
                    <button
                      role="radio" aria-checked={marks[s.id] === 'present'} onClick={() => setMarks({ ...marks, [s.id]: 'present' })}
                      className={cn('rounded-lg border px-2.5 py-1.5 text-[10px] font-bold inline-flex items-center gap-1 transition-colors',
                        marks[s.id] === 'present' ? 'bg-emerald-700 text-white border-emerald-700' : 'border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:border-emerald-300')}
                    ><CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Present</button>
                    <button
                      role="radio" aria-checked={marks[s.id] === 'absent'} onClick={() => setMarks({ ...marks, [s.id]: 'absent' })}
                      className={cn('rounded-lg border px-2.5 py-1.5 text-[10px] font-bold inline-flex items-center gap-1 transition-colors',
                        marks[s.id] === 'absent' ? 'bg-rose-600 text-white border-rose-600' : 'border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:border-rose-300')}
                    ><XCircle className="h-3 w-3" aria-hidden="true" /> Absent</button>
                  </div>
                </li>
              ))}
            </ul>
            {filtered.length === 0 && <EmptyState icon={Users} title="No students found" description="Try a different name or roll number." />}
            <div className="p-4 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-50/60 dark:bg-white/5">
              <p className="text-[11px] muted flex-1 flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Absences for students with approved accommodations are reviewed by the support office, not penalised here.</p>
              <button onClick={save} disabled={saving} className="btn-primary text-xs shrink-0">{saving ? 'Saving…' : 'Save attendance'}</button>
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader title="Session history" subtitle="Most recent saves" icon={History} />
            {sessions.length === 0 ? (
              <EmptyState icon={History} title="No sessions yet" description="Saved attendance will appear here." />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-white/10">
                {sessions.map((s) => (
                  <li key={s.id} className="px-4 py-3">
                    <p className="text-[11px] font-bold text-slate-800 dark:text-white">{db.subjects.find((x) => x.id === s.subjectId)?.code} · {fmtDate(s.date)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge tone="green">{s.present} present</Badge>
                      <Badge tone="rose">{s.absent} absent</Badge>
                      <span className="text-[9px] muted ml-auto">{s.total} students</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Info className="h-4 w-4 text-slate-600" aria-hidden="true" /> Marking guidance</h2>
            <ul className="mt-2 space-y-2 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              <li>• Mark attendance during the first ten minutes of class.</li>
              <li>• Students using remote access count as present.</li>
              <li>• Do not record medical reasons here — the support office handles those records.</li>
              <li>• Corrections are logged with your name and timestamp.</li>
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}
