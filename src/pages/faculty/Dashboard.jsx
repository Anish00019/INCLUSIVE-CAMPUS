import { Link } from 'react-router-dom';
import { Users, ClipboardCheck, BookOpenCheck, FileText, Upload, CalendarDays, Clock, MapPin, ArrowRight, LifeBuoy, MessagesSquare, ShieldCheck, Sparkles, TrendingUp, CheckCircle2, BarChart3, FileUp, Plus } from 'lucide-react';

import { Card, CardHeader, StatCard, Badge, StatusBadge, Avatar, EmptyState } from '../../components/common/ui';
import { PerformanceChart, CategoryPieChart } from '../../components/charts';
import { useData } from '../../context/DataContext';
import { dayName, fmtShort, timeAgo, cn } from '../../utils/helpers';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function FacultyDashboard() {
  useDocumentTitle('Faculty Dashboard');
  const { db, me } = useData();
  const today = dayName();
  const profile = me?.faculty;

  if (!db || !profile) return null;

  const mySubjects = db.subjects.filter((s) => s.facultyId === profile.id || profile.subjects?.includes(s.name));
  const mySubjectIds = mySubjects.map((s) => s.id);
  const myStudents = db.students.filter((s) => mySubjects.length === 0 || s.department === profile.department);
  const myAssignments = db.assignments.filter((a) => mySubjectIds.includes(a.subjectId));
  const pendingGrading = myAssignments.filter((a) => a.status === 'Submitted');
  const classes = (db.timetable[today] || []).filter((c) => mySubjectIds.includes(c.subjectId));
  const requests = db.supportRequests.filter((r) => myStudents.some((s) => s.id === r.studentId));
  const openRequests = requests.filter((r) => !['Completed', 'Rejected'].includes(r.status));
  const flagged = myStudents.filter((s) => s.accommodations?.length > 0);
  const avgAttendance = Math.round(myStudents.reduce((n, s) => n + s.attendance, 0) / Math.max(1, myStudents.length));
  const materials = db.studyMaterials.filter((m) => mySubjectIds.includes(m.subjectId));

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-navy-800 to-navy-900 text-white p-5 sm:p-7">
        <div className="absolute inset-0 opacity-[0.07] grid-bg" aria-hidden="true" />
        <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200">{today} · Teaching overview</p>
            <h1 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight">Good morning, {profile.name.replace('Dr. ', '').replace('Prof. ', '').split(' ')[0]}</h1>
            <p className="mt-1 text-sm text-white">{profile.designation} · {profile.department} · {profile.office}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-2.5 py-1 text-[11px] font-semibold"><Users className="h-3 w-3 text-emerald-300" aria-hidden="true" /> {myStudents.length} assigned students</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-2.5 py-1 text-[11px] font-semibold"><LifeBuoy className="h-3 w-3 text-amber-300" aria-hidden="true" /> {openRequests.length} open support cases</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-2.5 py-1 text-[11px] font-semibold"><FileText className="h-3 w-3 text-sky-300" aria-hidden="true" /> {pendingGrading.length} to grade</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 shrink-0">
            {[
              { label: 'Classes today', value: classes.length, to: '/faculty/attendance' },
              { label: 'Materials', value: materials.length, to: '/faculty/materials' },
              { label: 'Avg attendance', value: `${avgAttendance}%`, to: '/faculty/students' },
            ].map((s) => (
              <Link key={s.label} to={s.to} className="rounded-xl bg-white/[0.08] border border-white/15 px-3 py-2.5 text-center hover:bg-white/[0.14] transition-colors">
                <p className="text-lg font-extrabold leading-none">{s.value}</p>
                <p className="text-[9px] uppercase tracking-wider text-white/60 mt-1">{s.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          { label: 'Mark attendance', desc: 'Today’s classes', to: '/faculty/attendance', icon: ClipboardCheck, primary: true },
          { label: 'Create assignment', desc: 'Publish to students', to: '/faculty/assignments', icon: Plus },
          { label: 'Upload material', desc: 'Add captions & notes', to: '/faculty/materials', icon: Upload },
          { label: 'Student support', desc: 'View accommodation flags', to: '/faculty/students', icon: Users },
        ].map((a) => (
          <Link key={a.label} to={a.to} className={cn('card card-hover p-3.5 flex items-center gap-3', a.primary && 'bg-emerald-700 border-emerald-700 text-white')}>
            <span className={cn('grid place-items-center h-9 w-9 rounded-lg shrink-0', a.primary ? 'bg-white/15 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300')}><a.icon className="h-4 w-4" aria-hidden="true" /></span>
            <span className="min-w-0">
              <span className="block text-xs font-bold leading-tight">{a.label}</span>
              <span className={cn('block text-[10px] mt-0.5', a.primary ? 'text-white' : 'muted')}>{a.desc}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard label="Assigned students" value={myStudents.length} icon={Users} tone="navy" hint={`${flagged.length} with accommodations`} />
        <StatCard label="Subjects taught" value={mySubjects.length} icon={BookOpenCheck} tone="brand" hint={mySubjects.map((s) => s.code).join(' · ') || '—'} />
        <StatCard label="Pending grading" value={pendingGrading.length} icon={FileText} tone="amber" hint="Submissions awaiting marks" />
        <StatCard label="Open support cases" value={openRequests.length} icon={LifeBuoy} tone="green" hint="Coordination with support office" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader title={`Today’s classes · ${today}`} subtitle={`${classes.length} session${classes.length === 1 ? '' : 's'} for your subjects`} icon={CalendarDays}
              action={<Link to="/faculty/attendance" className="text-[11px] font-bold text-navy-700 dark:text-brand-300 hover:underline">Mark attendance</Link>} />
            {classes.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No classes today" description="Check the full timetable or use this time to upload materials." action={<Link to="/faculty/materials" className="btn-secondary text-xs">Upload material</Link>} />
            ) : (
              <ul className="px-4 pb-4 space-y-2">
                {classes.map((c, i) => {
                  const sub = db.subjects.find((s) => s.id === c.subjectId);
                  return (
                    <li key={i} className="flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-white/10 p-3">
                      <span className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: sub?.color }} aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-white">{sub?.name}</p>
                        <p className="text-[11px] muted mt-0.5 flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden="true" />{c.time}</span>
                          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden="true" />{c.room}</span>
                        </p>
                      </div>
                      <Badge tone={c.type === 'Lab' ? 'violet' : 'slate'}>{c.type}</Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title="Students with approved accommodations" subtitle="Only what you need to deliver support — no diagnoses" icon={ShieldCheck}
              action={<Link to="/faculty/students" className="text-[11px] font-bold text-navy-700 dark:text-brand-300 hover:underline">All students</Link>} />
            {flagged.length === 0 ? (
              <EmptyState icon={ShieldCheck} title="No accommodation flags" description="Nothing to action right now." />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-white/10">
                {flagged.slice(0, 5).map((s) => (
                  <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar name={s.name} color={s.avatarColor} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{s.name}</p>
                      <p className="text-[10px] muted">{s.rollNo} · {s.department} · {s.year}rd year</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {s.accommodations.slice(0, 2).map((a) => <Badge key={a} tone="blue">{a}</Badge>)}
                        {s.accommodations.length > 2 && <Badge>+{s.accommodations.length - 2}</Badge>}
                      </div>
                    </div>
                    <Link to="/messages" className="btn-ghost text-[10px] shrink-0"><MessagesSquare className="h-3.5 w-3.5" aria-hidden="true" /> Message</Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="px-5 pb-4">
              <p className="flex items-start gap-1.5 text-[10px] muted"><ShieldCheck className="h-3 w-3 shrink-0 mt-0.5" aria-hidden="true" /> Disability details are restricted to the Disability Support Office. Accommodations shown are pre-approved for teaching.</p>
            </div>
          </Card>

          <Card>
            <CardHeader title="Submissions to grade" subtitle={`${pendingGrading.length} awaiting marks`} icon={FileText}
              action={<Link to="/faculty/assignments" className="text-[11px] font-bold text-navy-700 dark:text-brand-300 hover:underline">Open assignments</Link>} />
            {pendingGrading.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="All caught up" description="No submissions are waiting for marks." />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-white/10">
                {pendingGrading.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="grid place-items-center h-8 w-8 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 shrink-0"><FileText className="h-4 w-4" aria-hidden="true" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{a.title}</p>
                      <p className="text-[10px] muted">{db.subjects.find((s) => s.id === a.subjectId)?.code} · due {fmtShort(a.due)} · max {a.max}</p>
                    </div>
                    <Link to="/faculty/assignments" className="btn-secondary text-[10px] py-1.5 shrink-0">Grade</Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader title="Support request mix" subtitle="Across your students" icon={BarChart3} />
            <div className="px-2 pb-3"><CategoryPieChart data={db.categoryAnalytics.slice(0, 5)} height={210} innerRadius={46} outerRadius={72} /></div>
            <div className="px-4 pb-4">
              <Link to="/faculty/requests" className="btn-secondary text-xs w-full">Review support requests <ArrowRight className="h-3 w-3" aria-hidden="true" /></Link>
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent support cases" subtitle="Faculty-visible fields only" icon={LifeBuoy} />
            <ul className="divide-y divide-slate-100 dark:divide-white/10">
              {requests.slice(0, 4).map((r) => (
                <li key={r.id} className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-bold text-slate-800 dark:text-white truncate flex-1">{r.studentName}</p>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-[10px] muted mt-0.5 truncate">{r.category} · {timeAgo(r.updatedAt)}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Class performance" subtitle="Average GPA trend" icon={TrendingUp} />
            <div className="px-2 pb-4">
              <PerformanceChart data={db.performance.map((p) => ({ ...p, gpa: p.classAvg, classAvg: p.classAvg - 0.2 }))} height={190} />
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-emerald-700 to-navy-800 text-white">
            <h2 className="text-sm font-bold flex items-center gap-1.5"><Sparkles className="h-4 w-4" aria-hidden="true" /> Teach inclusively</h2>
            <p className="text-[11px] text-white/75 mt-1 leading-relaxed">Add captions when you upload recordings and share materials as accessible text. Students can then use read-aloud and simplified reading tools.</p>
            <Link to="/faculty/materials" className="btn bg-white text-navy-900 hover:bg-slate-100 text-xs mt-3 w-full"><FileUp className="h-3.5 w-3.5" aria-hidden="true" /> Upload accessible material</Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
