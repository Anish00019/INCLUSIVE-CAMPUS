import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, TrendingUp, AlertTriangle, CheckCircle2, Calendar, Download, Info, ArrowRight } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, CardHeader, StatCard, ProgressBar, Badge, Tabs } from '../../components/common/ui';
import { AttendanceDonut, AttendanceTrendChart, SubjectBarChart } from '../../components/charts';
import SpeakButton from '../../components/accessibility/SpeakButton';
import { useData } from '../../context/DataContext';
import { cn, fmtShort } from '../../utils/helpers';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function Attendance() {
  useDocumentTitle('Attendance');
  const { db, me } = useData();
  const [view, setView] = useState('subjects');
  const [month, setMonth] = useState('all');

  const student = me?.student;
  const subjects = db?.subjects || [];
  const rows = (db?.attendance || []).map((a) => ({ ...a, subject: subjects.find((s) => s.id === a.subjectId) }));
  const totalHeld = rows.reduce((n, r) => n + r.held, 0);
  const totalAttended = rows.reduce((n, r) => n + r.attended, 0);
  const overall = Math.round((totalAttended / Math.max(1, totalHeld)) * 100);
  const low = rows.filter((r) => r.percentage < 80);

  const subjectNames = rows.map((r) => ({ name: r.subject?.code, percentage: r.percentage }));

  const history = [
    ...(db?.attendanceSessions || []).filter(s=>s.marks?.[student?.id]).map(s=>({date:s.date,subjectId:s.subjectId,status:s.marks[student.id]==='present'?'Present':'Absent',time:'Faculty record'})),
    { date: '2026-11-21', subjectId: 'sub_01', status: 'Present', time: '09:00' },
    { date: '2026-11-21', subjectId: 'sub_02', status: 'Present', time: '10:00' },
    { date: '2026-11-20', subjectId: 'sub_03', status: 'Absent', time: '09:00' },
    { date: '2026-11-20', subjectId: 'sub_04', status: 'Present', time: '10:00' },
    { date: '2026-11-19', subjectId: 'sub_05', status: 'Present', time: '11:15' },
    { date: '2026-11-18', subjectId: 'sub_01', status: 'Present', time: '09:00' },
    { date: '2026-11-18', subjectId: 'sub_03', status: 'Present', time: '10:00' },
    { date: '2026-11-17', subjectId: 'sub_02', status: 'Absent', time: '14:00' },
  ];

  const downloadReport = () => {
    const text = [
      'INCLUSIVE CAMPUS — ATTENDANCE REPORT',
      `Student: ${student?.name} (${student?.rollNo})`,
      `Semester ${student?.semester} · ${student?.department}`,
      `Generated: ${new Date().toLocaleString('en-IN')}`,
      '',
      `Overall attendance: ${overall}% (${totalAttended}/${totalHeld} sessions)`,
      '',
      'Subject-wise:',
      ...rows.map((r) => `  ${r.subject?.code} ${r.subject?.name}: ${r.percentage}% (${r.attended}/${r.held})`),
      '',
      'Add extra time or alternative arrangements were applied where approved.',
    ].join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `attendance-${student?.rollNo || 'student'}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (!db) return null;

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Track attendance subject-wise. Accommodation-related absences are recorded separately and never penalise you."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Attendance' }]}
        icon={ClipboardCheck}
        actions={
          <>
            <SpeakButton text={`Your overall attendance is ${overall} percent. You attended ${totalAttended} of ${totalHeld} sessions. ${low.length ? `${low.length} subjects are below 80 percent.` : 'All subjects are above 80 percent.'}`} />
            <button onClick={downloadReport} className="btn-secondary text-sm"><Download className="h-4 w-4" aria-hidden="true" /> Download report</button>
          </>
        }
      />

      {overall < 80 && (
        <div role="alert" className="mb-4 flex flex-col sm:flex-row items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:bg-amber-500/10 dark:border-amber-500/30">
          <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Some subjects are below the 80% threshold</p>
            <p className="text-xs text-amber-800/80 dark:text-amber-200/70 mt-0.5">If absences were caused by a disability or treatment, you can request condonation without disclosing medical details to faculty.</p>
          </div>
          <Link to="/support?new=1&category=Other" className="btn-secondary text-xs shrink-0">Request condonation</Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <StatCard label="Overall attendance" value={`${overall}%`} icon={ClipboardCheck} tone={overall >= 80 ? 'green' : 'amber'} hint={`${totalAttended} of ${totalHeld} sessions`} />
        <StatCard label="Sessions attended" value={totalAttended} icon={CheckCircle2} tone="navy" hint={`${totalHeld - totalAttended} missed`} />
        <StatCard label="Subjects below 80%" value={low.length} icon={AlertTriangle} tone={low.length ? 'rose' : 'green'} hint={low.length ? low.map((l) => l.subject?.code).join(', ') : 'All healthy'} />
        <StatCard label="This month" value={`${db.attendanceTrend[db.attendanceTrend.length - 1]?.percentage}%`} icon={TrendingUp} tone="brand" delta={2} hint="Compared to last month" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader
              title="Subject-wise attendance" subtitle="Minimum requirement: 75%" icon={ClipboardCheck}
              action={<Tabs size="sm" value={view} onChange={setView} tabs={[{ value: 'subjects', label: 'Table' }, { value: 'chart', label: 'Chart' }]} />}
            />
            {view === 'subjects' ? (
              <div className="overflow-x-auto pb-2">
                <table className="w-full min-w-[560px]">
                  <thead className="bg-slate-50/80 dark:bg-white/5 border-y border-slate-100 dark:border-white/10">
                    <tr>
                      <th scope="col" className="table-th">Subject</th>
                      <th scope="col" className="table-th">Attended</th>
                      <th scope="col" className="table-th">Held</th>
                      <th scope="col" className="table-th min-w-[160px]">Percentage</th>
                      <th scope="col" className="table-th">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                    {rows.map((r) => (
                      <tr key={r.subjectId} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.03]">
                        <td className="table-td">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: r.subject?.color }} aria-hidden="true" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{r.subject?.name}</p>
                              <p className="text-[10px] muted">{r.subject?.code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-td font-semibold">{r.attended}</td>
                        <td className="table-td">{r.held}</td>
                        <td className="table-td"><ProgressBar value={r.percentage} tone={r.percentage >= 85 ? 'green' : r.percentage >= 75 ? 'amber' : 'rose'} showValue /></td>
                        <td className="table-td">
                          <Badge tone={r.percentage >= 85 ? 'green' : r.percentage >= 75 ? 'amber' : 'rose'}>
                            {r.percentage >= 85 ? 'Good' : r.percentage >= 75 ? 'At risk' : 'Low'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-3 pb-5"><SubjectBarChart data={subjectNames} height={260} /></div>
            )}
            <div className="px-5 pb-4">
              <p className="flex items-start gap-1.5 text-[10px] muted"><Info className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" /> Medical and accommodation absences approved by the support office are excluded from this calculation.</p>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Recent attendance log" subtitle="Last 8 sessions" icon={Calendar}
              action={
                <select aria-label="Filter by month" value={month} onChange={(e) => setMonth(e.target.value)} className="input py-1.5 text-xs w-auto">
                  <option value="all">All months</option><option value="nov">November</option><option value="oct">October</option>
                </select>
              }
            />
            <ul className="divide-y divide-slate-100 dark:divide-white/10">
              {history.map((h, i) => {
                const sub = subjects.find((s) => s.id === h.subjectId);
                return (
                  <li key={i} className="flex items-center gap-3 px-5 py-3">
                    <span className={cn('grid place-items-center h-8 w-8 rounded-lg shrink-0', h.status === 'Present' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:text-rose-300 dark:bg-rose-500/15 dark:text-rose-300')}>
                      {h.status === 'Present' ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <AlertTriangle className="h-4 w-4" aria-hidden="true" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{sub?.name}</p>
                      <p className="text-[10px] muted">{fmtShort(h.date)} · {h.time} · {sub?.code}</p>
                    </div>
                    <Badge tone={h.status === 'Present' ? 'green' : 'rose'}>{h.status}</Badge>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-4">
            <CardHeader title="Overall" subtitle="This semester" className="px-1 pt-1" />
            <AttendanceDonut percentage={overall} height={180} />
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-slate-50 dark:bg-white/5 p-2"><p className="text-sm font-extrabold text-slate-900 dark:text-white">{totalHeld}</p><p className="text-[9px] muted uppercase tracking-wide">Held</p></div>
              <div className="rounded-lg bg-slate-50 dark:bg-white/5 p-2"><p className="text-sm font-extrabold text-emerald-700">{totalAttended}</p><p className="text-[9px] muted uppercase tracking-wide">Present</p></div>
              <div className="rounded-lg bg-slate-50 dark:bg-white/5 p-2"><p className="text-sm font-extrabold text-rose-700 dark:text-rose-300">{totalHeld - totalAttended}</p><p className="text-[9px] muted uppercase tracking-wide">Absent</p></div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Trend" subtitle="Monthly attendance" icon={TrendingUp} />
            <div className="px-2 pb-4"><AttendanceTrendChart data={db.attendanceTrend} height={190} /></div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Attendance policy</h2>
            <ul className="mt-2.5 space-y-2 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              <li className="flex gap-1.5"><span className="font-bold text-navy-700 dark:text-brand-300">75%</span> minimum required to appear for end-semester exams.</li>
              <li className="flex gap-1.5"><span className="font-bold text-navy-700 dark:text-brand-300">80%</span> recommended for lab-based courses.</li>
              <li>Disability-related absences may be condoned with support office approval.</li>
            </ul>
            <Link to="/support?new=1" className="btn-secondary text-xs w-full mt-3">Request attendance support <ArrowRight className="h-3 w-3" aria-hidden="true" /></Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
