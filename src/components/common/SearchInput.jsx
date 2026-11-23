import { Search, X } from 'lucide-react';
import { cn } from '../../utils/helpers';

export default function SearchInput({ value, onChange, placeholder = 'Search…', className, label, id = 'search-input', onKeyDown }) {
  return (
    <div className={cn('relative min-w-0', className)}>
      <label htmlFor={id} className="sr-only">{label || placeholder}</label>
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
      <input
        id={id} type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        onKeyDown={onKeyDown} className="input pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden" autoComplete="off"
      />
      {value && (
        <button type="button" onClick={() => onChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10" aria-label="Clear search">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
