import { Link } from 'react-router-dom';
import {
  CalendarDays, ClipboardCheck, BookOpenCheck, LifeBuoy, ArrowRight, Plus, Library,
  MessagesSquare, AlertTriangle, Sparkles, GraduationCap, Clock, CheckCircle2, ShieldCheck,
  ChevronRight, Bell, FileText, Sun, TrendingUp, MapPin, Video,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card, CardHeader, ProgressRing, Badge, EmptyState, Skeleton } from '../../components/common/ui';
import { PerformanceChart } from '../../components/charts';
import SpeakButton from '../../components/accessibility/SpeakButton';
import { MiniRequestRow } from '../../components/dashboard/RequestCard';
import { dayName, fmtShort, timeAgo, cn, todayISO } from '../../utils/helpers';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const QUICK_ACTIONS = [
  { label: 'Request support', desc: 'Accessibility assistance', to: '/support?new=1', icon: LifeBuoy, tone: 'bg-navy-800 text-white' },
  { label: 'View timetable', desc: 'This week’s classes', to: '/timetable', icon: CalendarDays, tone: 'bg-white text-navy-800' },
  { label: 'Study materials', desc: 'Notes, video, audio', to: '/study-materials', icon: Library, tone: 'bg-white text-navy-800' },
  { label: 'Contact faculty', desc: 'Send a message', to: '/messages', icon: MessagesSquare, tone: 'bg-white text-navy-800' },
  { label: 'Report an issue', desc: 'Barrier on campus', to: '/support?new=1&category=Other', icon: AlertTriangle, tone: 'bg-white text-rose-600' },
];

function profileCompletion(student) {
  const checks = [
    [!!student.name, 15], [!!student.email, 15], [!!student.phone, 15],
    [student.accommodations?.length > 0, 20], [student.disability !== 'Not disclosed', 20], [!!student.mentor, 15],
  ];
  return Math.round(checks.reduce((sum, [ok, w]) => sum + (ok ? w : 0), 0));
}

export default function StudentDashboard() {
  useDocumentTitle('Student Dashboard');
  const { db, loading, me, myRequests, notifications, actions } = useData();

  if (loading || !db) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
        <div className="grid lg:grid-cols-3 gap-4"><Skeleton className="h-80 lg:col-span-2 rounded-2xl" /><Skeleton className="h-80 rounded-2xl" /></div>
      </div>
    );
  }

  const student = me?.student;
  if (!student) return <EmptyState icon={GraduationCap} title="Student profile not found" description="Contact your administrator to link your student record." />;

  const today = dayName();
  const classes = db.timetable[today] || [];
  const subjectsById = Object.fromEntries(db.subjects.map((s) => [s.id, s]));
  const attendancePct = student.attendance;
  const upcoming = db.assignments.filter((a) => a.status === 'Pending').sort((a, b) => a.due.localeCompare(b.due)).slice(0, 4);
  const openRequests = myRequests.filter((r) => !['Completed', 'Rejected'].includes(r.status));
  const completion = profileCompletion(student);
  const unread = notifications.filter((n) => !n.read).length;
  const nextExam = db.examinations.slice().sort((a, b) => a.date.localeCompare(b.date))[0];

  return (
    <div className="space-y-5">
      {/* WELCOME */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-brand-800 text-white p-5 sm:p-7">
        <div className="absolute inset-0 opacity-[0.08] grid-bg" aria-hidden="true" />
        <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-brand-500/30 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-200">
              <Sun className="h-3.5 w-3.5" aria-hidden="true" /> {today}, {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome back, {student.name.split(' ')[0]}</h1>
            <p className="mt-1.5 text-sm text-white/70">
              {student.rollNo} · Semester {student.semester} · {db.departments.find((d) => d.code === student.department)?.name || student.department}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-2.5 py-1 text-[11px] font-semibold"><ShieldCheck className="h-3 w-3 text-emerald-300" aria-hidden="true" /> {student.accommodations.length} active accommodations</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-2.5 py-1 text-[11px] font-semibold"><Bell className="h-3 w-3 text-amber-300" aria-hidden="true" /> {unread} unread updates</span>
              <SpeakButton
                variant="solid" compact
                className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20"
                text={`Welcome back ${student.name}. You are in semester ${student.semester} of ${student.department}. Your attendance is ${attendancePct} percent. You have ${upcoming.length} pending assignments and ${openRequests.length} open support requests.`}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white/[0.07] border border-white/15 p-4 shrink-0">
            <ProgressRing value={completion} size={78} stroke={7} tone="#a78bfa" track="rgba(255,255,255,.18)">
              <span className="text-base font-extrabold">{completion}%</span>
            </ProgressRing>
            <div>
              <p className="text-xs font-bold">Profile completion</p>
              <p className="text-[11px] text-white/60 mt-0.5 max-w-[150px] leading-relaxed">Add your phone and review accommodations to reach 100%.</p>
              <Link to="/profile" className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-brand-200 hover:underline">Complete profile <ArrowRight className="h-3 w-3" aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section aria-labelledby="quick-actions">
        <h2 id="quick-actions" className="sr-only">Quick actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.label} to={a.to} className={cn('group card card-hover p-3.5 flex flex-col gap-2 border-slate-200/80', a.tone.includes('navy-800') && 'bg-navy-800 border-navy-800 text-white')}>
              <span className={cn('grid place-items-center h-8 w-8 rounded-lg', a.tone.includes('navy-800') ? 'bg-white/15 text-white' : 'bg-slate-100 dark:bg-white/10', a.tone.includes('rose') && 'bg-rose-50 dark:bg-rose-500/15')}>
                <a.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xs font-bold leading-tight">{a.label}</span>
                <span className={cn('block text-[10px] mt-0.5', a.tone.includes('navy-800') ? 'text-white/60' : 'muted')}>{a.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section aria-label="Key statistics" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { label: 'Attendance', value: `${attendancePct}%`, sub: 'Minimum required 75%', icon: ClipboardCheck, to: '/attendance', iconClass: attendancePct >= 75 ? 'text-emerald-700' : 'text-rose-600' },
          { label: 'Assignments due', value: upcoming.length, sub: upcoming[0] ? `Next: ${fmtShort(upcoming[0].due)}` : 'All caught up', icon: BookOpenCheck, to: '/assignments', iconClass: 'text-amber-700' },
          { label: 'Open requests', value: openRequests.length, sub: openRequests[0]?.status || 'No open cases', icon: LifeBuoy, to: '/support/track', iconClass: 'text-sky-600' },
          { label: 'Current GPA', value: student.gpa.toFixed(1), sub: 'Class average 7.9', icon: TrendingUp, to: '/academics', iconClass: 'text-brand-600' },
        ].map((s) => (
          <Link key={s.label} to={s.to} className="card card-hover p-4 group">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">{s.label}</p>
              <s.icon className={cn('h-4 w-4', s.iconClass)} aria-hidden="true" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-[11px] muted mt-0.5 truncate">{s.sub}</p>
          </Link>
        ))}
      </section>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-4">
          {/* performance */}
          <Card>
            <CardHeader
              title="Academic progress" subtitle="Your GPA against the class average" icon={TrendingUp}
              action={<Link to="/academics" className="text-[11px] font-bold text-navy-700 dark:text-brand-300 hover:underline whitespace-nowrap">Details</Link>}
            />
            <div className="px-3 pb-4"><PerformanceChart data={db.performance} height={230} /></div>
          </Card>

          {/* assignments */}
          <Card>
            <CardHeader
              title="Upcoming assignments" subtitle={`${upcoming.length} pending`} icon={FileText}
              action={<Link to="/assignments" className="text-[11px] font-bold text-navy-700 dark:text-brand-300 hover:underline">View all</Link>}
            />
            {upcoming.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="Nothing due" description="All assignments are submitted." />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-white/10">
                {upcoming.map((a) => {
                  const sub = subjectsById[a.subjectId];
                  const days = Math.ceil((new Date(a.due) - new Date(todayISO())) / 86400000);
                  return (
                    <li key={a.id}>
                      <Link to="/assignments" className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-white/5">
                        <span className="grid place-items-center h-9 w-9 rounded-lg shrink-0" style={{ backgroundColor: `${sub?.color}18`, color: sub?.color }}>
                          <FileText className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-bold text-slate-800 dark:text-white truncate">{a.title}</span>
                          <span className="block text-[11px] muted truncate">{sub?.name} · {sub?.code}</span>
                        </span>
                        <span className="text-right shrink-0">
                          <span className={cn('block text-[11px] font-bold', days <= 2 ? 'text-rose-600' : days <= 5 ? 'text-amber-700' : 'text-slate-600 dark:text-slate-300')}>
                            {days <= 0 ? 'Due today' : `${days} day${days > 1 ? 's' : ''} left`}
                          </span>
                          <span className="block text-[10px] muted">{fmtShort(a.due)}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* timetable today */}
          <Card>
            <CardHeader
              title={`Today’s timetable · ${today}`} subtitle={`${classes.length} session${classes.length === 1 ? '' : 's'} scheduled`} icon={CalendarDays}
              action={<Link to="/timetable" className="text-[11px] font-bold text-navy-700 dark:text-brand-300 hover:underline">Full week</Link>}
            />
            {classes.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No classes today" description="Enjoy the break — or catch up on recorded lectures." action={<Link to="/study-materials" className="btn-secondary text-xs">Browse materials</Link>} />
            ) : (
              <ul className="px-4 pb-4 space-y-2">
                {classes.map((c, i) => {
                  const sub = subjectsById[c.subjectId];
                  return (
                    <li key={`${c.time}-${i}`} className="flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-white/10 p-3 hover:border-slate-300 dark:hover:border-white/20 transition-colors">
                      <span className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: sub?.color }} aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{sub?.name}</p>
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
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          {/* accommodations */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-5 py-4 text-white">
              <div className="flex items-center justify-between">
                <span className="grid place-items-center h-8 w-8 rounded-lg bg-white/15"><Sparkles className="h-4 w-4" aria-hidden="true" /></span>
                <Link to="/support/track" className="text-[10px] font-bold text-white/80 hover:text-white">Manage</Link>
              </div>
              <p className="mt-2.5 text-sm font-bold">Your accommodations</p>
              <p className="text-[11px] text-white/70">Approved for this semester</p>
            </div>
            <ul className="p-4 space-y-2">
              {student.accommodations.length ? student.accommodations.map((a) => (
                <li key={a} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />{a}
                </li>
              )) : <li className="text-xs muted">No accommodations recorded yet. Submit a support request to get started.</li>}
            </ul>
            <div className="px-4 pb-4">
              <div className="rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-2.5">
                <p className="text-[10px] muted leading-relaxed flex items-start gap-1.5"><ShieldCheck className="h-3 w-3 mt-0.5 shrink-0" aria-hidden="true" /> Visible to faculty and the support office only. Your diagnosis is never shown to classmates.</p>
              </div>
            </div>
          </Card>

          {/* support */}
          <Card>
            <CardHeader title="Support requests" subtitle="Recent activity" icon={LifeBuoy} action={<Link to="/support" className="text-[11px] font-bold text-navy-700 dark:text-brand-300 hover:underline">New</Link>} />
            {myRequests.length === 0 ? (
              <EmptyState icon={LifeBuoy} title="No requests yet" description="Request an accommodation and track it here." action={<Link to="/support?new=1" className="btn-primary text-xs"><Plus className="h-3.5 w-3.5" /> New request</Link>} />
            ) : (
              <div className="pb-1">{myRequests.slice(0, 3).map((r) => <MiniRequestRow key={r.id} request={r} />)}
                <Link to="/support/track" className="flex items-center justify-center gap-1 py-2.5 text-[11px] font-bold text-navy-700 dark:text-brand-300 hover:bg-slate-50 dark:hover:bg-white/5">All requests <ChevronRight className="h-3 w-3" aria-hidden="true" /></Link>
              </div>
            )}
          </Card>

          {/* exam */}
          {nextExam && (
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 shrink-0"><GraduationCap className="h-5 w-5" aria-hidden="true" /></span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Next examination</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">{subjectsById[nextExam.subjectId]?.name}</p>
                  <p className="text-[11px] muted mt-0.5">{fmtShort(nextExam.date)} · {nextExam.time} · {nextExam.room}</p>
                  <Link to="/examinations" className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-navy-700 dark:text-brand-300 hover:underline">Exam schedule <ArrowRight className="h-3 w-3" aria-hidden="true" /></Link>
                </div>
              </div>
            </Card>
          )}

          {/* notifications */}
          <Card>
            <CardHeader title="Recent updates" subtitle={`${unread} unread`} icon={Bell} action={<Link to="/notifications" className="text-[11px] font-bold text-navy-700 dark:text-brand-300 hover:underline">All</Link>} />
            <ul className="px-4 pb-4 space-y-2">
              {notifications.slice(0, 3).map((n) => (
                <li key={n.id}>
                  <Link to={n.link || '/notifications'} onClick={() => actions.markRead(n.id)} className="block rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-white/5">
                    <p className="text-[11px] font-bold text-slate-800 dark:text-white leading-snug flex items-start gap-1.5">
                      {!n.read && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" aria-label="Unread" />}{n.title}
                    </p>
                    <p className="text-[10px] muted mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-slate-600 mt-1">{timeAgo(n.time)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* assistive CTA */}
      <section className="card overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-gradient-to-r from-slate-50 to-brand-50/60 dark:from-white/5 dark:to-brand-500/10">
          <span className="grid place-items-center h-11 w-11 rounded-xl bg-brand-600 text-white shrink-0"><Sparkles className="h-5 w-5" aria-hidden="true" /></span>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Make any page work the way you learn best</p>
            <p className="text-xs muted mt-0.5">The Assistive Learning Hub includes a text-to-speech reader, simplified reading mode, captioned media and downloadable notes.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => window.dispatchEvent(new Event('ic:open-a11y'))} className="btn-secondary text-xs">Accessibility toolbar</button>
            <Link to="/assistive-hub" className="btn-accent text-xs"><Video className="h-3.5 w-3.5" aria-hidden="true" /> Open hub</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
