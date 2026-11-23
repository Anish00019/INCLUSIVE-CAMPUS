import { cn, initials } from '../../utils/helpers';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

/* ---------------- Card ---------------- */
export function Card({ as: Tag = 'div', className, hover, children, ...rest }) {
  return (
    <Tag className={cn('card', hover && 'card-hover', className)} {...rest}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-3 px-5 pt-5 pb-3', className)}>
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-navy-50 text-navy-700 dark:bg-white/10 dark:text-brand-300 shrink-0">
            <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="section-title truncate">{title}</h3>
          {subtitle && <p className="text-xs muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ---------------- Badge ---------------- */
export function Badge({ children, className, tone = 'slate', dot }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-slate-200 dark:border-white/15',
    blue: 'bg-navy-50 text-navy-700 border-navy-200 dark:bg-navy-500/15 dark:text-navy-200 dark:border-navy-500/30',
    violet: 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/15 dark:text-brand-200 dark:border-brand-500/30',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
    sky: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30',
  };
  return (
    <span className={cn('badge', tones[tone] || tones.slate, className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }) {
  const styles = {
    Submitted: 'slate', 'Under Review': 'amber', Approved: 'green', 'In Progress': 'sky', Completed: 'violet', Rejected: 'rose',
    Active: 'green', Review: 'amber', Pending: 'amber', Graded: 'green', Present: 'green', Absent: 'rose',
  };
  return <Badge tone={styles[status] || 'slate'} dot className={className}>{status}</Badge>;
}

/* ---------------- Avatar ---------------- */
export function Avatar({ name = '', color = 'from-navy-600 to-brand-600', size = 'md', className, ring }) {
  const sizes = { xs: 'h-7 w-7 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base', xl: 'h-16 w-16 text-lg' };
  return (
    <span
      className={cn('inline-grid place-items-center rounded-full bg-gradient-to-br text-white font-bold shrink-0', color, sizes[size], ring && 'ring-2 ring-white dark:ring-navy-900', className)}
      aria-hidden="true"
    >
      {initials(name) || 'IC'}
    </span>
  );
}

/* ---------------- Progress ---------------- */
export function ProgressBar({ value = 0, tone = 'navy', className, label, showValue }) {
  const tones = { navy: 'bg-navy-700', brand: 'bg-brand-600', green: 'bg-emerald-500', amber: 'bg-amber-500', rose: 'bg-rose-500', sky: 'bg-sky-500' };
  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5 text-xs">
          <span className="font-medium text-slate-600 dark:text-slate-300">{label}</span>
          {showValue && <span className="font-bold text-slate-800 dark:text-slate-100">{Math.round(value)}%</span>}
        </div>
      )}
      <div
        className="h-2 w-full rounded-full bg-slate-150 bg-slate-200/80 dark:bg-white/10 overflow-hidden"
        role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} aria-label={label || 'Progress'}
      >
        <div className={cn('h-full rounded-full transition-all duration-500', tones[tone])} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}

export function ProgressRing({ value = 0, size = 88, stroke = 8, tone = '#1d4ed8', track = 'rgba(148,163,184,.25)', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c - (c * Math.min(100, value)) / 100} strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

/* ---------------- Stat card ---------------- */
export function StatCard({ label, value, suffix, icon: Icon, delta, tone = 'navy', hint, className, onClick }) {
  const tones = {
    navy: 'bg-navy-50 text-navy-700 dark:bg-navy-500/15 dark:text-navy-200',
    brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    sky: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  };
  const DeltaIcon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp onClick={onClick} className={cn('card p-3 sm:p-5 text-left w-full min-w-0', onClick && 'card-hover', className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 break-words text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">{label}</p>
        {Icon && <span className={cn('grid place-items-center h-9 w-9 rounded-xl shrink-0', tones[tone])}><Icon className="h-4 w-4" aria-hidden="true" /></span>}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <p className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{value}</p>
        {suffix && <span className="text-sm font-semibold text-slate-600 mb-1">{suffix}</span>}
        {delta !== undefined && (
          <span className={cn('ml-auto mb-1 inline-flex items-center gap-0.5 text-xs font-bold', delta > 0 ? 'text-emerald-700' : delta < 0 ? 'text-rose-600' : 'text-slate-600')}>
            <DeltaIcon className="h-3.5 w-3.5" aria-hidden="true" />{Math.abs(delta)}%
          </span>
        )}
      </div>
      {hint && <p className="text-xs muted mt-1.5">{hint}</p>}
    </Comp>
  );
}

/* ---------------- Empty / skeleton / spinner ---------------- */
export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center px-6 py-12', className)}>
      {Icon && <span className="grid place-items-center h-14 w-14 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-600 mb-4"><Icon className="h-6 w-6" aria-hidden="true" /></span>}
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
      {description && <p className="text-sm muted mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }) { return <div className={cn('skeleton', className)} aria-hidden="true" />; }

export function Spinner({ className, label = 'Loading' }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)} role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function LoadingScreen({ label = 'Preparing your accessible workspace…' }) {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="flex flex-col items-center gap-4">
        <span className="relative grid place-items-center h-14 w-14 rounded-2xl bg-navy-800 text-white shadow-lg">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        </span>
        <p className="text-sm font-medium muted" role="status">{label}</p>
      </div>
    </div>
  );
}

/* ---------------- Tabs ---------------- */
export function Tabs({ tabs, value, onChange, className, size = 'md' }) {
  return (
    <div role="tablist" aria-label="View options" className={cn('flex min-w-0 max-w-full items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5 overflow-x-auto', className)}>
      {tabs.map((t) => {
        const active = value === t.value;
        return (
          <button
            key={t.value} role="tab" aria-selected={active} tabIndex={active ? 0 : -1} onClick={() => onChange(t.value)}
            onKeyDown={e => {
              if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
              e.preventDefault();const index=tabs.findIndex(x=>x.value===t.value);
              const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
              onChange(tabs[next].value);e.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next]?.focus();
            }}
            className={cn(
              'rounded-lg font-semibold whitespace-nowrap transition-all',
              size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm',
              active ? 'bg-white text-navy-800 shadow-sm dark:bg-white/15 dark:text-white' : 'text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            )}
          >
            {t.label}
            {t.count !== undefined && <span className="ml-1.5 text-[11px]">({t.count})</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Misc ---------------- */
export function Divider({ className }) { return <div className={cn('h-px bg-slate-200/80 dark:bg-white/10', className)} role="separator" />; }

export function KeyHint({ children }) {
  return <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">{children}</kbd>;
}
