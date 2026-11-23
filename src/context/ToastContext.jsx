import { createContext, useCallback, useContext, useState, useMemo, useRef, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from 'lucide-react';
import { cn } from '../utils/helpers';

const ToastContext = createContext(null);

const ICONS = { success: CheckCircle2, error: XCircle, info: Info, warning: AlertTriangle };
const TONES = {
  success: 'border-emerald-200 bg-white text-emerald-700 dark:bg-navy-900 dark:border-emerald-500/30',
  error: 'border-rose-200 bg-white text-rose-700 dark:bg-navy-900 dark:border-rose-500/30',
  info: 'border-sky-200 bg-white text-sky-700 dark:bg-navy-900 dark:border-sky-500/30',
  warning: 'border-amber-200 bg-white text-amber-700 dark:bg-navy-900 dark:border-amber-500/30',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers=useRef(new Set());
  useEffect(()=>()=>{timers.current.forEach(clearTimeout);timers.current.clear();},[]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback((type, title, message = '', timeout = 4500) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((t) => [...t.slice(-3), { id, type, title, message }]);
    if (timeout) {const timer=setTimeout(()=>{dismiss(id);timers.current.delete(timer);},timeout);timers.current.add(timer);}
    return id;
  }, [dismiss]);

  useEffect(()=>{const warn=()=>push('error','Preference not saved','Browser storage is unavailable or full. No saved-setting confirmation was issued.');window.addEventListener('ic:storage-error',warn);return ()=>window.removeEventListener('ic:storage-error',warn);},[push]);

  const toast = useMemo(()=>({
    success: (t, m) => push('success', t, m),
    error: (t, m) => push('error', t, m),
    info: (t, m) => push('info', t, m),
    warning: (t, m) => push('warning', t, m),
  }),[push]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="fixed z-[100] bottom-4 right-4 left-4 sm:left-auto sm:w-[380px] flex flex-col gap-2">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          return (
            <div key={t.id} role="status" className={cn('animate-in flex items-start gap-3 rounded-xl border p-3.5 shadow-lg', TONES[t.type])}>
              <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.message && <p className="text-xs mt-0.5 text-slate-600 dark:text-slate-300">{t.message}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/10" aria-label="Dismiss notification">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
