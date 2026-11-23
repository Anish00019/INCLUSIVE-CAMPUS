import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, TrendingUp, Award, BookOpen, Download, Target, CheckCircle2, ArrowRight,
  BarChart3, Layers, Info, Sparkles,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, CardHeader, StatCard, ProgressBar, Badge, Tabs, ProgressRing } from '../../components/common/ui';
import { PerformanceChart, PALETTE } from '../../components/charts';
import SpeakButton from '../../components/accessibility/SpeakButton';
import { useData } from '../../context/DataContext';
import { gradeFor, gradePoints } from '../../utils/helpers';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const MARKS = [
  { subjectId: 'sub_01', internal: 27, external: 58, max: 100 },
  { subjectId: 'sub_02', internal: 25, external: 55, max: 100 },
  { subjectId: 'sub_03', internal: 23, external: 48, max: 100 },
  { subjectId: 'sub_04', internal: 24, external: 51, max: 100 },
  { subjectId: 'sub_05', internal: 21, external: 44, max: 100 },
  { subjectId: 'sub_06', internal: 28, external: 61, max: 100 },
];

const SEMESTERS = [
  { sem: 1, gpa: 8.1, credits: 22 }, { sem: 2, gpa: 8.4, credits: 24 },
  { sem: 3, gpa: 8.0, credits: 23 }, { sem: 4, gpa: 8.6, credits: 24 },
  { sem: 5, gpa: 8.7, credits: 20 },
];

export default function Academics() {
  useDocumentTitle('Academic Overview');
  const { db, me } = useData();
  const [tab, setTab] = useState('marks');

  const subjects = useMemo(() => Object.fromEntries((db?.subjects || []).map((s) => [s.id, s])), [db]);
  const faculty = useMemo(() => Object.fromEntries((db?.faculty || []).map((f) => [f.id, f])), [db]);
  const student = me?.student;

  const rows = MARKS.map((m) => {
    const total = m.internal + m.external;
    return { ...m, subject: subjects[m.subjectId], total, grade: gradeFor(total), points: gradePoints(gradeFor(total)) };
  });
  const weighted = rows.reduce((s, r) => s + r.points * (r.subject?.credits || 0), 0);
  const credits = rows.reduce((s, r) => s + (r.subject?.credits || 0), 0);
  const gpa = (weighted / credits).toFixed(2);
  const best = rows.slice().sort((a, b) => b.total - a.total)[0];
  const weakest = rows.slice().sort((a, b) => a.total - b.total)[0];
  const totalCredits = SEMESTERS.reduce((s, x) => s + x.credits, 0);

  const downloadTranscript = () => {
    const text = [
      'INCLUSIVE CAMPUS — ACADEMIC TRANSCRIPT (UNOFFICIAL)',
      `Student: ${student?.name} · ${student?.rollNo}`,
      `Department: ${student?.department} · Semester ${student?.semester}`,
      '',
      'Subject                Credits  Internal  External  Total  Grade',
      ...rows.map((r) => `${(r.subject?.name || '').padEnd(22).slice(0, 22)} ${String(r.subject?.credits).padStart(7)} ${String(r.internal).padStart(9)} ${String(r.external).padStart(9)} ${String(r.total).padStart(6)}  ${r.grade}`),
      '',
      `Semester GPA: ${gpa}`,
      `Cumulative credits earned: ${totalCredits}`,
    ].join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `transcript-${student?.rollNo || 'student'}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (!db) return null;

  return (
    <div>
      <PageHeader
        title="Academic Overview"
        description="Marks, grades, credit progress and performance trends for the current semester."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Academics' }]}
        icon={GraduationCap}
        actions={
          <>
            <SpeakButton text={`Your semester GPA is ${gpa} out of 10. Your strongest subject is ${best?.subject?.name} with ${best?.total} marks. Your focus area is ${weakest?.subject?.name} with ${weakest?.total} marks.`} />
            <button onClick={downloadTranscript} className="btn-secondary text-sm"><Download className="h-4 w-4" aria-hidden="true" /> Transcript</button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <StatCard label="Semester GPA" value={gpa} suffix="/ 10" icon={Award} tone="brand" delta={3} hint="Improving over last semester" />
        <StatCard label="Credits earned" value={totalCredits} suffix={`/ 120`} icon={Layers} tone="navy" hint="Across 5 semesters" />
        <StatCard label="Subjects" value={rows.length} icon={BookOpen} tone="sky" hint="23 credits this semester" />
        <StatCard label="Attendance" value={`${student?.attendance}%`} icon={CheckCircle2} tone="green" hint="Eligible for examinations" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader
              title="Performance trend" subtitle="GPA compared with the class average" icon={TrendingUp}
              action={<Badge tone="green">+0.6 since July</Badge>}
            />
            <div className="px-3 pb-4"><PerformanceChart data={db.performance} height={250} /></div>
          </Card>

          <Card>
            <CardHeader
              title="Subject performance" subtitle="Internal + external assessment" icon={BarChart3}
              action={<Tabs size="sm" value={tab} onChange={setTab} tabs={[{ value: 'marks', label: 'Marks' }, { value: 'progress', label: 'Progress' }]} />}
            />
            {tab === 'marks' ? (
              <div className="overflow-x-auto pb-2">
                <table className="w-full min-w-[620px]">
                  <caption className="sr-only">Subject-wise marks, grades and credit points for semester {student?.semester}</caption>
                  <thead className="bg-slate-50/80 dark:bg-white/5 border-y border-slate-100 dark:border-white/10">
                    <tr>
                      <th scope="col" className="table-th">Subject</th>
                      <th scope="col" className="table-th">Internal</th>
                      <th scope="col" className="table-th">External</th>
                      <th scope="col" className="table-th">Total</th>
                      <th scope="col" className="table-th">Grade</th>
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
                              <p className="text-[10px] muted">{r.subject?.code} · {r.subject?.credits} credits · {faculty[r.subject?.facultyId]?.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-td">{r.internal}<span className="text-[10px] muted">/30</span></td>
                        <td className="table-td">{r.external}<span className="text-[10px] muted">/70</span></td>
                        <td className="table-td"><span className="font-bold text-slate-900 dark:text-white">{r.total}</span><span className="text-[10px] muted">/100</span></td>
                        <td className="table-td"><Badge tone={r.total >= 85 ? 'green' : r.total >= 70 ? 'blue' : r.total >= 55 ? 'amber' : 'rose'}>{r.grade}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 pb-5 space-y-3.5">
                {rows.map((r) => (
                  <div key={r.subjectId}>
                    <ProgressBar label={`${r.subject?.name} · ${r.grade}`} value={r.total} tone={r.total >= 85 ? 'green' : r.total >= 70 ? 'navy' : r.total >= 55 ? 'amber' : 'rose'} showValue />
                    <p className="text-[10px] muted mt-1">Grade point {r.points} · {r.subject?.credits} credits</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Semester history" subtitle="GPA progression" icon={Layers} />
            <div className="px-4 pb-5">
              <div className="flex items-end gap-2 sm:gap-4 h-40">
                {SEMESTERS.map((s, i) => (
                  <div key={s.sem} className="flex-1 flex flex-col items-center justify-end gap-1.5">
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{s.gpa}</span>
                    <div className="w-full rounded-t-lg transition-all" style={{ height: `${(s.gpa / 10) * 100}%`, backgroundColor: PALETTE[i % PALETTE.length], opacity: s.sem === 5 ? 1 : 0.55 }} aria-hidden="true" />
                    <span className="text-[10px] muted">Sem {s.sem}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] muted mt-3 flex items-start gap-1.5"><Info className="h-3 w-3 shrink-0 mt-0.5" aria-hidden="true" /> Internal assessments are weighted at 30% and end-semester examinations at 70%, as per the 2021 regulation.</p>
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-4 text-center">
            <CardHeader title="Credit progress" subtitle="120 credits required for graduation" className="px-1 pt-1 text-left" />
            <div className="flex justify-center my-1">
              <ProgressRing value={(totalCredits / 120) * 100} size={112} stroke={9} tone="#7c3aed">
                <div className="text-center">
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white">{totalCredits}</p>
                  <p className="text-[9px] uppercase tracking-wide muted">credits</p>
                </div>
              </ProgressRing>
            </div>
            <p className="text-[11px] muted">You are on track to graduate in May 2027.</p>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Target className="h-4 w-4 text-emerald-700" aria-hidden="true" /> Strengths & focus</h2>
            <div className="mt-3 space-y-3">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Strongest</p>
                <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">{best?.subject?.name}</p>
                <p className="text-[10px] text-emerald-800 dark:text-emerald-200">{best?.total}/100 · Grade {best?.grade}</p>
              </div>
              <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">Focus area</p>
                <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">{weakest?.subject?.name}</p>
                <p className="text-[10px] text-amber-800 dark:text-amber-200">{weakest?.total}/100 · Grade {weakest?.grade}</p>
              </div>
            </div>
            <Link to="/study-materials" className="btn-secondary text-xs w-full mt-3">Find support materials <ArrowRight className="h-3 w-3" aria-hidden="true" /></Link>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-brand-600" aria-hidden="true" /> Accessible assessment</h2>
            <p className="text-[11px] muted mt-1.5 leading-relaxed">Your approved accommodations — extra time, digital papers and scribe support — are applied to every internal and external assessment automatically.</p>
            <Link to="/support/track" className="text-[11px] font-bold text-navy-700 dark:text-brand-300 hover:underline mt-2 inline-flex items-center gap-1">View accommodations <ArrowRight className="h-3 w-3" aria-hidden="true" /></Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
