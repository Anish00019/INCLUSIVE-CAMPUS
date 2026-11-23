import { useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/helpers';

const SIZES = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export default function Modal({ open, onClose, title, description, children, footer, size = 'md', labelledBy }) {
  const panelRef = useRef(null);
  const titleId=useId();
  const closeRef=useRef(onClose);
  closeRef.current=onClose;
  const lastFocus = useRef(null);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      const focusable = panelRef.current?.querySelector('[data-autofocus], input, textarea, select, button');
      focusable?.focus?.();
    }, 60);

    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closeRef.current?.(); }
      if (e.key === 'Tab') {
        const nodes = [...(panelRef.current?.querySelectorAll('a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), [tabindex]:not([tabindex="-1"])') || [])].filter(el=>!el.classList.contains('sr-only') && !el.hidden);
        if (!nodes?.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      clearTimeout(t);
      lastFocus.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-navy-950/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={labelledBy || titleId}
        className={cn('relative w-full bg-white dark:bg-navy-900 rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in max-h-[92vh] flex flex-col border border-slate-200 dark:border-white/10', SIZES[size])}
      >
        <div className="flex items-start justify-between gap-4 p-5 pb-3 border-b border-slate-100 dark:border-white/10">
          <div>
            <h2 id={labelledBy || titleId} className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
            {description && <p className="text-xs muted mt-1 max-w-prose">{description}</p>}
          </div>
          <button onClick={onClose} className="btn-icon shrink-0" aria-label="Close dialog"><X className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} /></button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
        {footer && <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
}
