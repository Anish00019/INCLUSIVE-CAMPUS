import { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/helpers';

export default function Dropdown({ trigger, children, align = 'right', width = 'w-56', label = 'Menu', className, panelClassName }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const triggerRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const items=()=>[...(ref.current?.querySelectorAll('[role="menuitem"]:not([disabled])')||[])];
    items()[0]?.focus();
    const onDoc = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = e => {
      if(!ref.current?.contains(document.activeElement))return;
      if(e.key==='Escape'){e.preventDefault();setOpen(false);triggerRef.current?.focus();}
      if(e.key==='Tab')setOpen(false);
      if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
        e.preventDefault();const list=items();if(!list.length)return;
        const current=list.indexOf(document.activeElement);
        const next=e.key==='Home'?0:e.key==='End'?list.length-1:(current+(e.key==='ArrowDown'?1:-1)+list.length)%list.length;
        list[next]?.focus();
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  return (
    <div className={cn('relative', className)} ref={ref}>
      <button ref={triggerRef} type="button" onClick={() => setOpen(o=>!o)} onKeyDown={e=>{if(!open&&['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();setOpen(true);}}} aria-haspopup="menu" aria-expanded={open} title={label} className="rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">{trigger}</button>
      {open && <div role="menu" aria-label={label} className={cn('absolute z-50 mt-2 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-navy-900 shadow-xl p-1.5 animate-in',align==='right'?'right-0':'left-0',width,panelClassName)}><div onClick={()=>{setOpen(false);triggerRef.current?.focus();}}>{children}</div></div>}
    </div>
  );
}

export function MenuItem({ icon: Icon, children, onClick, danger, active, description }) {
  return <button type="button" role="menuitem" onClick={onClick} className={cn('w-full flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-left transition-colors',danger?'text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10':'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10',active&&'bg-navy-50 dark:bg-white/10 text-navy-800 dark:text-white')}>
    {Icon&&<Icon className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true"/>}<span className="min-w-0"><span className="block">{children}</span>{description&&<span className="block text-[11px] font-normal muted mt-0.5">{description}</span>}</span>
  </button>;
}
export function MenuLabel({ children }) {return <p className="px-2.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">{children}</p>;}
export function MenuSeparator(){return <div className="my-1 h-px bg-slate-100 dark:bg-white/10" role="separator"/>;}
