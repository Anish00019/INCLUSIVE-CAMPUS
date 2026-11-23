import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, MapPin, Clock, Download, ShieldCheck, AlertTriangle, CheckCircle2, BadgeCheck, Armchair, FileText, ArrowRight } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, CardHeader, StatCard, Badge, EmptyState, Tabs } from '../../components/common/ui';
import SpeakButton from '../../components/accessibility/SpeakButton';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { fmtDate, todayISO } from '../../utils/helpers';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function Examinations() {
  useDocumentTitle('Examination Schedule');
  const { db, me } = useData();
  const toast = useToast();
  const [type, setType] = useState('all');

  const subjects = useMemo(() => Object.fromEntries((db?.subjects || []).map((s) => [s.id, s])), [db]);
  const exams = (db?.examinations || []).filter((e) => type === 'all' || e.type === type).sort((a, b) => a.date.localeCompare(b.date));
  const all = db?.examinations || [];
  const next = all.slice().sort((a, b) => a.date.localeCompare(b.date))[0];
  const daysToNext = next ? Math.max(0, Math.ceil((new Date(next.date) - new Date(todayISO())) / 86400000)) : 0;

  const downloadHallTicket = () => {
    const lines = [
      '═══════════════════════════════════════════════',
      '   INCLUSIVE CAMPUS — EXAMINATION HALL TICKET',
      '═══════════════════════════════════════════════',
      '',
      `Student        : ${me?.student?.name}`,
      `Roll number    : ${me?.student?.rollNo}`,
      `Department     : ${me?.student?.department} · Semester ${me?.student?.semester}`,
      '',
      'APPROVED ACCOMMODATIONS',
      ...(me?.student?.accommodations?.length ? me.student.accommodations.map((a) => `  • ${a}`) : ['  None recorded']),
      '',
      'EXAMINATION SCHEDULE',
      ...all.map((e) => `  ${fmtDate(e.date)}  ${e.time}  ${subjects[e.subjectId]?.name}  ${e.room}  Seat ${e.seat}`),
      '',
      `Generated: ${new Date().toLocaleString('en-IN')}`,
      'This is a system-generated demo document. Carry your college ID.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `hall-ticket-${me?.student?.rollNo}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('Hall ticket downloaded', 'Your approved accommodations are printed on the ticket.');
  };

  if (!db) return null;

  return (
    <div>
      <PageHeader
        title="Examination Schedule"
        description="Mid-semester and end-semester examinations with halls, seats and your approved accommodations shown up front."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Examinations' }]}
        icon={CalendarClock}
        actions={
          <>
            <SpeakButton text={`Your next examination is ${subjects[next?.subjectId]?.name} on ${next?.date} in ${next?.room}. ${next?.accommodations}.`} />
            <button onClick={downloadHallTicket} className="btn-primary text-sm"><Download className="h-4 w-4" aria-hidden="true" /> Hall ticket</button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <StatCard label="Next exam in" value={daysToNext} suffix="days" icon={CalendarClock} tone="amber" hint={next ? fmtDate(next.date) : '—'} />
        <StatCard label="Scheduled exams" value={all.length} icon={FileText} tone="navy" hint="This semester" />
        <StatCard label="Accommodations" value={me?.student?.accommodations?.length || 0} icon={ShieldCheck} tone="green" hint="Auto-applied to every exam" />
        <StatCard label="Exam hall" value={next?.room?.split(' ').slice(-1)[0] || '—'} icon={MapPin} tone="brand" hint="Accessible seating reserved" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {next && (
            <Card className="overflow-hidden border-navy-200 dark:border-navy-500/30">
              <div className="bg-gradient-to-r from-navy-800 to-brand-700 text-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-200">Next examination</p>
                    <h2 className="mt-1 text-lg font-extrabold">{subjects[next.subjectId]?.name}</h2>
                    <p className="text-xs text-white/70 mt-0.5">{next.type} · {subjects[next.subjectId]?.code}</p>
                  </div>
                  <div className="text-center rounded-xl bg-white/10 border border-white/20 px-4 py-2">
                    <p className="text-2xl font-extrabold leading-none">{daysToNext}</p>
                    <p className="text-[9px] uppercase tracking-wider text-white/70 mt-1">days left</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[['Date', fmtDate(next.date)], ['Time', next.time], ['Hall', next.room], ['Seat', next.seat]].map(([l, v]) => (
                    <div key={l} className="rounded-lg bg-white/10 px-2.5 py-2">
                      <p className="text-[9px] uppercase tracking-wider text-white/60">{l}</p>
                      <p className="text-[11px] font-bold mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 flex items-start gap-2.5 bg-emerald-50/70 dark:bg-emerald-500/10">
                <BadgeCheck className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200">Approved accommodations for this exam</p>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-200/80 mt-0.5">{next.accommodations}</p>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader
              title="Full examination schedule" subtitle={`${exams.length} examination${exams.length === 1 ? '' : 's'}`} icon={CalendarClock}
              action={<Tabs size="sm" value={type} onChange={setType} tabs={[{ value: 'all', label: 'All' }, { value: 'Mid Semester', label: 'Mid-sem' }, { value: 'End Semester', label: 'End-sem' }]} />}
            />
            {exams.length === 0 ? (
              <EmptyState icon={CalendarClock} title="No examinations" description="No exams match this filter." />
            ) : (
              <ol className="px-4 pb-4 space-y-2.5">
                {exams.map((e) => {
                  const sub = subjects[e.subjectId];
                  const days = Math.ceil((new Date(e.date) - new Date(todayISO())) / 86400000);
                  return (
                    <li key={e.id} className="rounded-xl border border-slate-200/80 dark:border-white/10 p-3.5 hover:border-slate-300 dark:hover:border-white/20 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-12 shrink-0 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 text-center py-1.5">
                          <p className="text-[9px] font-bold uppercase text-slate-600">{new Date(e.date).toLocaleDateString('en-IN', { month: 'short' })}</p>
                          <p className="text-base font-extrabold text-slate-800 dark:text-white leading-none">{new Date(e.date).getDate()}</p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{sub?.name}</p>
                            <Badge tone={e.type === 'Mid Semester' ? 'sky' : 'violet'}>{e.type}</Badge>
                            {days <= 14 && days >= 0 && <Badge tone={days <= 3 ? 'rose' : 'amber'}>in {days} day{days === 1 ? '' : 's'}</Badge>}
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] muted">
                            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{e.time}</span>
                            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{e.room}</span>
                            <span className="inline-flex items-center gap-1"><Armchair className="h-3.5 w-3.5" aria-hidden="true" />Seat {e.seat}</span>
                          </div>
                          <p className="mt-1.5 inline-flex items-start gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300"><ShieldCheck className="h-3 w-3 mt-0.5 shrink-0" aria-hidden="true" />{e.accommodations}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Before every exam</h2>
            <ul className="mt-2.5 space-y-2">
              {[
                'Carry your college ID card and hall ticket',
                'Arrive 15 minutes early for accessibility check-in',
                'Extra time is added automatically — no separate request needed',
                'Scribes and readers meet you at the hall entrance',
                'Water and medication breaks are permitted on request',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />{t}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-700" aria-hidden="true" /> Your accommodations</h2>
            <ul className="mt-2.5 space-y-1.5">
              {(me?.student?.accommodations || []).map((a) => (
                <li key={a} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300"><BadgeCheck className="h-3.5 w-3.5 text-navy-600 shrink-0 mt-0.5" aria-hidden="true" />{a}</li>
              ))}
            </ul>
            <div className="mt-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-2.5">
              <p className="text-[10px] muted leading-relaxed">Accommodations are approved by the Disability Support Office. Faculty and invigilators see only what is needed to deliver them.</p>
            </div>
            <Link to="/support?new=1&category=Examination%20Accommodations" className="btn-secondary text-xs w-full mt-3">Request a change <ArrowRight className="h-3 w-3" aria-hidden="true" /></Link>
          </Card>

          <Card className="p-5 bg-amber-50/70 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">Clash or barrier?</p>
                <p className="text-[11px] text-amber-800 dark:text-amber-200/70 mt-0.5 leading-relaxed">Report an inaccessible hall, broken lift or scheduling clash and we will resolve it before exam day.</p>
                <Link to="/support?new=1&category=Accessible%20Classroom" className="text-[11px] font-bold text-amber-900 dark:text-amber-200 underline underline-offset-2 mt-1.5 inline-block">Report an issue</Link>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
