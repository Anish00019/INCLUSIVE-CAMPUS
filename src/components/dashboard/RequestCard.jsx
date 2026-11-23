import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, FileText, Paperclip, UserCheck } from 'lucide-react';
import { StatusBadge, Badge, Card } from '../common/ui';
import { fmtDate, timeAgo, PRIORITY_STYLES, cn } from '../../utils/helpers';
import { useData } from '../../context/DataContext';
import { StatusStepper } from './Timeline';

export default function RequestCard({ request, href = '/support/track', compact }) {
  const { db } = useData();
  const staff = db?.supportStaff.find((s) => s.id === request.assignedTo);

  return (
    <Card hover className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">{request.id}</span>
              <Badge className={PRIORITY_STYLES[request.priority] || PRIORITY_STYLES.Medium}>{request.priority}</Badge>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">{request.subject}</h3>
            <p className="text-xs muted mt-0.5">{request.category}</p>
          </div>
          <StatusBadge status={request.status} className="shrink-0" />
        </div>

        {!compact && (
          <>
            <p className="text-xs muted mt-3 line-clamp-2 leading-relaxed">{request.description}</p>
            <div className="mt-3">
              <StatusStepper status={request.status} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] muted">
              <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" aria-hidden="true" /> {fmtDate(request.createdAt)}</span>
              {staff && <span className="inline-flex items-center gap-1"><UserCheck className="h-3.5 w-3.5" aria-hidden="true" /> {staff.name}</span>}
              {request.documents?.length > 0 && <span className="inline-flex items-center gap-1"><Paperclip className="h-3.5 w-3.5" aria-hidden="true" /> {request.documents.length} file{request.documents.length > 1 ? 's' : ''}</span>}
              <span className="ml-auto">Updated {timeAgo(request.updatedAt)}</span>
            </div>
          </>
        )}
      </div>
      <Link to={href} className={cn('flex items-center justify-between gap-2 border-t border-slate-100 dark:border-white/10 px-5 py-2.5 text-xs font-bold text-navy-700 dark:text-brand-300 hover:bg-slate-50 dark:hover:bg-white/5')}>
        View details & timeline <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </Card>
  );
}

export function MiniRequestRow({ request }) {
  return (
    <Link to="/support/track" className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-white/5 border-b border-slate-50 dark:border-white/5 last:border-0">
      <span className="grid place-items-center h-8 w-8 rounded-lg bg-navy-50 text-navy-700 dark:bg-white/10 dark:text-white shrink-0"><FileText className="h-4 w-4" aria-hidden="true" /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold text-slate-800 dark:text-white truncate">{request.subject}</span>
        <span className="block text-[11px] muted">{request.category} · {timeAgo(request.updatedAt)}</span>
      </span>
      <StatusBadge status={request.status} />
    </Link>
  );
}
