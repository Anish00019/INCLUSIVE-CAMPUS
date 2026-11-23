import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CornerDownLeft, FileText, LifeBuoy, Users, BookOpen, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { SEARCH_PAGES } from '../../utils/navigation';
import { cn } from '../../utils/helpers';

const TYPE_META = {
  page: { icon: ArrowRight, label: 'Page', to: (r) => r.to },
  student: { icon: Users, label: 'Student', to: (r) => r.to || '/admin/students' },
  material: { icon: BookOpen, label: 'Study material', to: () => '/study-materials' },
  assignment: { icon: FileText, label: 'Assignment', to: () => '/assignments' },
  request: { icon: LifeBuoy, label: 'Support request', to: (r) => r.to || '/support/track' },
};

export default function GlobalSearch({ open, onClose }) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { db, me } = useData();
  const { role } = useAuth();

  useEffect(() => { if (open) { setQ(''); setActive(0); const previous=document.activeElement; const t=setTimeout(() => inputRef.current?.focus(),60); return ()=>{clearTimeout(t);previous?.focus();}; } }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const out = [];
    SEARCH_PAGES.filter((p) => p.roles.includes(role)).forEach((p) => {
      if (!term || `${p.label} ${p.keywords}`.toLowerCase().includes(term)) out.push({ id: `p-${p.to}`, title: p.label, subtitle: 'Navigate to page', type: 'page', to: p.to });
    });
    if (term && db) {
      if (['support', 'admin', 'faculty'].includes(role)) {
        db.students.filter(s=>role!=='faculty'||s.department===me?.faculty?.department).filter((s) => `${s.name} ${s.rollNo} ${s.department}`.toLowerCase().includes(term)).slice(0, 3)
          .forEach((s) => out.push({ id: s.id, title: s.name, subtitle: `${s.rollNo} · ${s.department}`, type: 'student', to: role === 'faculty' ? '/faculty/students' : role === 'support' ? '/support-admin/students' : '/admin/students' }));
      }
      if (role === 'student') {
        db.studyMaterials.filter((m) => m.title.toLowerCase().includes(term)).slice(0, 2)
          .forEach((m) => out.push({ id: m.id, title: m.title, subtitle: `${m.type} · ${m.format}`, type: 'material' }));
        db.assignments.filter((a) => a.title.toLowerCase().includes(term)).slice(0, 2)
          .forEach((a) => out.push({ id: a.id, title: a.title, subtitle: `Due ${a.due} · ${a.status}`, type: 'assignment' }));
      }
      const reqScope = role === 'student' ? db.supportRequests.filter(r=>r.studentId===me?.student?.id) : role==='faculty'?db.supportRequests.filter(r=>db.students.some(s=>s.id===r.studentId&&s.department===me?.faculty?.department)):db.supportRequests;
      reqScope.filter((r) => `${r.id} ${r.subject} ${r.category}`.toLowerCase().includes(term)).slice(0, 3)
        .forEach((r) => out.push({ id: r.id, title: ['faculty','admin'].includes(role)?'Support coordination case':r.subject, subtitle: `${r.id} · ${r.status}`, type: 'request', to: role === 'student' ? '/support/track' : role === 'faculty' ? '/faculty/requests' : '/support-admin/requests' }));
    }
    return out.slice(0, 9);
  }, [q, db, role, me]);

  useEffect(() => { setActive(0); }, [q]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if(e.key==='Tab') {
        const nodes=[...inputRef.current.closest('[role=dialog]').querySelectorAll('input,button')];
        const first=nodes[0],last=nodes[nodes.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
      }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.max(0,Math.min(results.length - 1, a + 1))); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
      if (e.key === 'Enter' && results[active]) {
        e.preventDefault();
        navigate(TYPE_META[results[active].type].to(results[active]));
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, results, active, navigate, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-start justify-center p-4 pt-[10vh]">
      <div className="absolute inset-0 bg-navy-950/50" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label="Search Inclusive Campus" className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-navy-900 shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in">
        <div className="flex items-center gap-2 px-4 border-b border-slate-100 dark:border-white/10">
          <Search className="h-4 w-4 text-slate-600" aria-hidden="true" />
          <input
            ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search pages, students, materials, requests…" aria-label="Search"
            className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-slate-400 dark:text-white"
          />
          <kbd className="hidden sm:inline rounded border border-slate-200 dark:border-white/20 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">ESC</kbd>
        </div>
        <div className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 && <p className="px-3 py-8 text-center text-sm muted">No results for “{q}”. Try a student name, subject or request ID.</p>}
          {results.map((r, i) => {
            const Meta = TYPE_META[r.type];
            return (
              <button
                key={r.id}
                onMouseEnter={() => setActive(i)}
                onClick={() => { navigate(Meta.to(r)); onClose(); }}
                className={cn('w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left', active === i ? 'bg-navy-50 dark:bg-white/10' : 'hover:bg-slate-50 dark:hover:bg-white/5')}
              >
                <span className="grid place-items-center h-8 w-8 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 shrink-0"><Meta.icon className="h-4 w-4" aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800 dark:text-white truncate">{r.title}</span>
                  <span className="block text-[11px] muted truncate">{r.subtitle}</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-600 hidden sm:block">{Meta.label}</span>
                {active === i && <CornerDownLeft className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        <div className="border-t border-slate-100 dark:border-white/10 px-4 py-2 text-[11px] muted flex items-center justify-between">
          <span>↑↓ to navigate · Enter to open</span>
          <span>{results.length} result{results.length === 1 ? '' : 's'}</span>
        </div>
      </div>
    </div>
  );
}
