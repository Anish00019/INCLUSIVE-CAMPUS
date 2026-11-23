import { Check, Circle, Clock } from 'lucide-react';
import { cn, fmtDate } from '../../utils/helpers';

const ORDER = ['Submitted', 'Under Review', 'Approved', 'In Progress', 'Completed'];

export default function Timeline({ events = [], currentStatus }) {
  const rejected = currentStatus === 'Rejected';
  return (
    <ol className="relative space-y-0">
      {events.map((e, i) => {
        const last = i === events.length - 1;
        const failed = e.status === 'Rejected';
        return (
          <li key={`${e.status}-${i}`} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && <span className={cn('absolute left-[11px] top-6 bottom-0 w-px', failed ? 'bg-rose-200' : 'bg-slate-200 dark:bg-white/15')} aria-hidden="true" />}
            <span
              className={cn('relative z-10 grid place-items-center h-[22px] w-[22px] rounded-full border-2 shrink-0',
                failed ? 'bg-rose-500 border-rose-500 text-white'
                  : last ? 'bg-navy-800 border-navy-800 text-white'
                    : 'bg-white dark:bg-navy-900 border-emerald-500 text-emerald-700')}
            >
              {failed ? <Circle className="h-2.5 w-2.5" /> : last ? <Clock className="h-3 w-3" /> : <Check className="h-3 w-3" />}
            </span>
            <div className="min-w-0 pt-0.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <p className={cn('text-sm font-bold', failed ? 'text-rose-600' : 'text-slate-800 dark:text-white')}>{e.status}</p>
                <p className="text-[11px] muted">{fmtDate(e.at)} · {new Date(e.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              {e.note && <p className="text-xs muted mt-0.5 leading-relaxed">{e.note}</p>}
            </div>
          </li>
        );
      })}
      {rejected && events[events.length - 1]?.status !== 'Rejected' && (
        <li className="flex gap-3">
          <span className="grid place-items-center h-[22px] w-[22px] rounded-full bg-rose-500 text-white shrink-0"><Circle className="h-2.5 w-2.5" /></span>
          <p className="text-sm font-bold text-rose-600 pt-0.5">Rejected</p>
        </li>
      )}
    </ol>
  );
}

export function StatusStepper({ status }) {
  const idx = ORDER.indexOf(status);
  const rejected = status === 'Rejected';
  return (
    <div className="flex items-center gap-1" aria-label={`Status: ${status}`}>
      {ORDER.map((s, i) => {
        const done = !rejected && i <= idx;
        return (
          <div key={s} className="flex-1 min-w-0">
            <div className={cn('h-1.5 rounded-full', done ? 'bg-navy-700' : 'bg-slate-200 dark:bg-white/15')} />
            <p className={cn('hidden sm:block text-[10px] mt-1 truncate', done ? 'font-semibold text-navy-800 dark:text-white' : 'text-slate-600')}>{s}</p>
          </div>
        );
      })}
      {rejected && <span className="text-[10px] font-bold text-rose-600 ml-1">Rejected</span>}
    </div>
  );
}
