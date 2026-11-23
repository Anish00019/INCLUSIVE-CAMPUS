import { useEffect, useRef, useState } from 'react';
import { Accessibility, X, Sun, Moon, AArrowUp, AArrowDown, Contrast, Check } from 'lucide-react';
import A11yControls from './A11yControls';
import { useA11y } from '../../context/AccessibilityContext';
import { cn } from '../../utils/helpers';

export default function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const { prefs, set, increaseFont, decreaseFont } = useA11y();
  const panelRef = useRef(null);
  const btnRef = useRef(null);

  /* Keyboard shortcuts */
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) { e.preventDefault(); setOpen((o) => !o); }
      if (e.altKey && (e.key === '+' || e.key === '=')) { e.preventDefault(); increaseFont(); }
      if (e.altKey && (e.key === '-' || e.key === '_')) { e.preventDefault(); decreaseFont(); }
    };
    const openEvent = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('ic:open-a11y', openEvent);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('ic:open-a11y', openEvent); };
  }, [increaseFont, decreaseFont]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => panelRef.current?.querySelector('button')?.focus(), 40);
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const quick = [
    { label: 'Decrease text size', icon: AArrowDown, onClick: decreaseFont },
    { label: 'Increase text size', icon: AArrowUp, onClick: increaseFont },
    { label: 'Toggle dark mode', icon: prefs.theme === 'dark' ? Sun : Moon, onClick: () => set('theme', prefs.theme === 'dark' ? 'light' : 'dark'), active: prefs.theme === 'dark' },
    { label: 'Toggle high contrast', icon: Contrast, onClick: () => set('highContrast', !prefs.highContrast), active: prefs.highContrast },
  ];

  return (
    <>
      {/* floating quick bar */}
      <div className="fixed z-[70] right-4 bottom-4 flex flex-col items-end gap-2 print:hidden">
        {open && (
          <div
            ref={panelRef} role="dialog" aria-label="Accessibility settings" aria-modal="false"
            className="w-[min(92vw,360px)] max-h-[76vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-navy-900 shadow-2xl animate-in"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-white/10 bg-white/95 dark:bg-navy-900/95 backdrop-blur px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid place-items-center h-8 w-8 rounded-lg bg-navy-800 text-white"><Accessibility className="h-4 w-4" aria-hidden="true" /></span>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Accessibility</p>
                  <p className="text-[11px] muted">Saved automatically</p>
                </div>
              </div>
              <button onClick={() => {setOpen(false);btnRef.current?.focus();}} className="btn-icon" aria-label="Close accessibility panel"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-1">
              <A11yControls compact />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-white/15 bg-white/95 dark:bg-navy-900/95 backdrop-blur shadow-xl p-1.5">
          <div className="hidden sm:flex items-center gap-0.5">
            {quick.map((q) => (
              <button
                key={q.label} type="button" onClick={q.onClick} aria-label={q.label} title={q.label}
                className={cn('grid place-items-center h-8 w-8 rounded-lg transition-colors', q.active ? 'bg-navy-800 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10')}
              >
                <q.icon className="h-4 w-4" aria-hidden="true" />
              </button>
            ))}
            <span className="w-px h-5 bg-slate-200 dark:bg-white/15 mx-1" aria-hidden="true" />
          </div>
          <button
            ref={btnRef} type="button" aria-label="Accessibility" onClick={() => setOpen((o) => !o)} aria-expanded={open}
            className="btn bg-navy-800 text-white hover:bg-navy-900 px-3 py-2 text-xs h-9"
          >
            <Accessibility className="h-4 w-4" aria-hidden="true" />
            <span className="hidden xs:inline sm:inline">Accessibility</span>
            {prefs.highContrast && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </>
  );
}
