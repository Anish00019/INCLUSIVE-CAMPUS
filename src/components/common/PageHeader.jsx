import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/helpers';

export default function PageHeader({ title, description, breadcrumbs = [], actions, children, className, icon: Icon }) {
  return (
    <header className={cn('mb-6', className)}>
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2.5">
          <ol className="flex items-center flex-wrap gap-1 text-xs text-slate-600 dark:text-slate-400">
            <li>
              <Link to="/dashboard" className="inline-flex items-center gap-1 hover:text-navy-700 dark:hover:text-white rounded focus-visible:outline-offset-2">
                <Home className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only">Home</span>
              </Link>
            </li>
            {breadcrumbs.map((b, i) => (
              <li key={b.label} className="flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
                {b.to && i < breadcrumbs.length - 1 ? (
                  <Link to={b.to} className="hover:text-navy-700 dark:hover:text-white">{b.label}</Link>
                ) : (
                  <span aria-current="page" className="font-semibold text-slate-700 dark:text-slate-200">{b.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          {Icon && <span className="hidden sm:grid place-items-center h-11 w-11 rounded-2xl bg-navy-800 text-white shadow-sm shrink-0"><Icon className="h-5 w-5" aria-hidden="true" /></span>}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</h1>
            {description && <p className="text-sm muted mt-1 max-w-2xl">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {children}
    </header>
  );
}
