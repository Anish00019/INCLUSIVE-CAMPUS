import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, Download, User, Video, Coffee, ChevronRight, CalendarPlus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, CardHeader, Badge, EmptyState, LoadingScreen } from '../../components/common/ui';
import SpeakButton from '../../components/accessibility/SpeakButton';
import { useData } from '../../context/DataContext';
import { dayName, cn } from '../../utils/helpers';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Timetable() {
  useDocumentTitle('Timetable');
  const { db } = useData();
  const today = dayName();
  const [day, setDay] = useState(DAYS.includes(today) ? today : 'Monday');

  const subjects = useMemo(() => Object.fromEntries((db?.subjects || []).map((s) => [s.id, s])), [db]);
  const faculty = useMemo(() => Object.fromEntries((db?.faculty || []).map((f) => [f.id, f])), [db]);
  const sessions = db?.timetable?.[day] || [];

  const downloadIcs = () => {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Inclusive Campus//Timetable//EN'];
    Object.entries(db.timetable).forEach(([d, list]) => list.forEach((c, i) => {
      const sub = subjects[c.subjectId];
      const next = new Date();
      const diff = (DAYS.indexOf(d) - DAYS.indexOf(today) + 7) % 7;
      next.setDate(next.getDate() + diff);
      const [h, m] = c.time.split(' – ')[0].split(':').map(Number);
      const start = new Date(next); start.setHours(h, m, 0, 0);
      const end = new Date(start); end.setMinutes(end.getMinutes() + 55);
      const fmt = (dt) => dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      lines.push('BEGIN:VEVENT', `UID:${d}-${i}-${sub?.code}@inclusivecampus`, `DTSTAMP:${fmt(new Date())}`, `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`, `SUMMARY:${sub?.name} (${sub?.code})`, `LOCATION:${c.room}`, `DESCRIPTION:${c.type} session with ${faculty[sub?.facultyId]?.name || 'faculty'}`, 'END:VEVENT');
    }));
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'inclusive-campus-timetable.ics'; a.click();
    URL.revokeObjectURL(url);
  };

  const totalSessions = Object.values(db?.timetable || {}).reduce((n, l) => n + l.length, 0);
  const text = sessions.map((c) => `${subjects[c.subjectId]?.name} at ${c.time} in ${c.room}`).join('. ');

  if(!db)return <LoadingScreen label="Loading your timetable…"/>;

  return (
    <div>
      <PageHeader
        title="Timetable"
        description="Your weekly class schedule with room details, faculty and accessible alternatives for every session."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Timetable' }]}
        icon={CalendarDays}
        actions={
          <>
            <SpeakButton text={`Your ${day} timetable. ${text || 'No classes scheduled.'}`} />
            <button onClick={downloadIcs} className="btn-secondary text-sm"><Download className="h-4 w-4" aria-hidden="true" /> Export calendar</button>
          </>
        }
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4">
          {/* day tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Day of week">
            {DAYS.map((d) => (
              <button
                key={d} role="tab" aria-selected={day === d} onClick={() => setDay(d)}
                className={cn('flex-1 min-w-[92px] rounded-xl border px-3 py-2.5 text-center transition-colors',
                  day === d ? 'bg-navy-800 text-white border-navy-800 shadow-sm' : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300')}
              >
                <span className="block text-xs font-bold">{d.slice(0, 3)}</span>
                <span className={cn('block text-[10px]', day === d ? 'text-white/70' : 'text-slate-600')}>
                  {(db.timetable[d] || []).length} class{(db.timetable[d] || []).length === 1 ? '' : 'es'}
                </span>
                {d === today && <span className={cn('mt-1 inline-block h-1 w-1 rounded-full', day === d ? 'bg-emerald-300' : 'bg-emerald-500')} aria-label="Today" />}
              </button>
            ))}
          </div>

          <Card>
            <CardHeader
              title={`${day}${day === today ? ' · Today' : ''}`}
              subtitle={`${sessions.length} session${sessions.length === 1 ? '' : 's'}`}
              icon={CalendarDays}
              action={<Badge tone="blue">Week {Math.ceil((new Date().getDate()) / 7)}</Badge>}
            />
            {sessions.length === 0 ? (
              <EmptyState icon={Coffee} title="No classes scheduled" description={day === 'Saturday' ? 'Weekends are free. Catch up on recorded lectures or revise with the reading tools.' : 'Enjoy the break — your next session will appear here.'} action={<Link to="/study-materials" className="btn-secondary text-xs">Browse study materials</Link>} />
            ) : (
              <ol className="px-4 pb-4 space-y-2.5">
                {sessions.map((c, i) => {
                  const sub = subjects[c.subjectId];
                  const fac = faculty[sub?.facultyId];
                  return (
                    <li key={`${day}-${i}`} className="relative flex gap-3">
                      <div className="flex flex-col items-center pt-1">
                        <span className="grid place-items-center h-10 w-10 rounded-xl text-[11px] font-extrabold text-white shrink-0" style={{ backgroundColor: '#1e40af' }} aria-hidden="true">{sub?.code?.slice(-2)}</span>
                        {i < sessions.length - 1 && <span className="w-px flex-1 bg-slate-200 dark:bg-white/15 my-1" aria-hidden="true" />}
                      </div>
                      <div className="flex-1 min-w-0 rounded-xl border border-slate-200/80 dark:border-white/10 p-3.5 hover:border-slate-300 dark:hover:border-white/20 transition-colors">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{sub?.name}</p>
                            <p className="text-[11px] muted mt-0.5">{sub?.code} · {sub?.credits} credits</p>
                          </div>
                          <Badge tone={c.type === 'Lab' ? 'violet' : 'blue'}>{c.type}</Badge>
                        </div>
                        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                          <span className="inline-flex items-center gap-1.5 font-semibold"><Clock className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />{c.time}</span>
                          <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />{c.room}</span>
                          <span className="inline-flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />{fac?.name}</span>
                        </div>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          <Link to="/messages" className="text-[10px] font-bold text-navy-700 dark:text-brand-300 inline-flex items-center gap-1 hover:underline">Contact faculty <ChevronRight className="h-3 w-3" aria-hidden="true" /></Link>
                          <span className="text-slate-300" aria-hidden="true">·</span>
                          <Link to="/study-materials" className="text-[10px] font-bold text-navy-700 dark:text-brand-300 inline-flex items-center gap-1 hover:underline"><Video className="h-3 w-3" aria-hidden="true" /> Session materials</Link>
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
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Week at a glance</h2>
            <ul className="mt-3 space-y-2">
              {DAYS.map((d) => (
                <li key={d} className="flex items-center gap-2">
                  <span className={cn('w-9 text-[10px] font-bold uppercase', d === today ? 'text-navy-800 dark:text-white' : 'text-slate-600')}>{d.slice(0, 3)}</span>
                  <div className="flex gap-1 flex-1">
                    {(db.timetable[d] || []).map((c, i) => (
                      <span key={i} className="h-2 flex-1 rounded-full" style={{ backgroundColor: subjects[c.subjectId]?.color }} title={`${subjects[c.subjectId]?.name} · ${c.time}`} aria-hidden="true" />
                    ))}
                    {Array.from({ length: Math.max(0, 4 - (db.timetable[d] || []).length) }).map((_, i) => <span key={`e${i}`} className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-white/10" aria-hidden="true" />)}
                  </div>
                  <span className="text-[10px] muted w-8 text-right">{(db.timetable[d] || []).length}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10px] muted">{totalSessions} sessions across the week</p>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><CalendarPlus className="h-4 w-4 text-navy-700 dark:text-brand-300" aria-hidden="true" /> Accessibility in class</h2>
            <ul className="mt-2.5 space-y-2 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              <li>• Front-row seating is reserved for you in A-201 and Lab 1.</li>
              <li>• Live captions are enabled in all Block A smart classrooms.</li>
              <li>• Step-free routes to Lab 1 and Project Lab are available via Block B.</li>
              <li>• Recorded sessions are published within 24 hours.</li>
            </ul>
            <Link to="/support?new=1&category=Accessible%20Classroom" className="btn-secondary text-xs w-full mt-3">Report a room issue</Link>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-navy-800 to-brand-700 text-white">
            <h2 className="text-sm font-bold">Need a different format?</h2>
            <p className="text-[11px] text-white/75 mt-1 leading-relaxed">Request captioned recordings, a note-taker or an interpreter for any session.</p>
            <Link to="/support?new=1" className="btn bg-white text-navy-900 hover:bg-slate-100 text-xs mt-3 w-full">Request support</Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
