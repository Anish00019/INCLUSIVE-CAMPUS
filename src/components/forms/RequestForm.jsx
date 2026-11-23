import { validateAttachments } from '../../utils/validation';
import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, CloudUpload, FileText, Loader2, ShieldCheck, Trash2, X } from 'lucide-react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { REQUEST_CATEGORIES, ACCEPTED_FILES, fileSize } from '../../utils/helpers';

const PRIORITIES = [
  { value: 'Low', label: 'Low', desc: 'General enquiry, no time pressure' },
  { value: 'Medium', label: 'Medium', desc: 'Needed within a few weeks' },
  { value: 'High', label: 'High', desc: 'Needed this month' },
];

export default function RequestForm({ open, onClose, defaultCategory }) {
  const { actions, me } = useData();
  const toast = useToast();
  const [form, setForm] = useState({ category: REQUEST_CATEGORIES[0], subject: '', description: '', priority: 'Medium', documents: [] });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm((f) => ({ ...f, category: defaultCategory && REQUEST_CATEGORIES.includes(defaultCategory) ? defaultCategory : REQUEST_CATEGORIES[0], subject: '', description: '', priority: 'Medium', documents: [] }));
      setError(''); setCreated(null);
    }
  }, [open, defaultCategory]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addFiles = (files) => {
    try {
      const list=validateAttachments(files);
      if(form.documents.length+list.length>3)throw new Error('Attach at most 3 documents.');
      set('documents',[...form.documents,...list.map(f=>({name:f.name,size:fileSize(f.size)}))]);setError('');
    } catch(error){setError(error.message);}
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.subject.trim().length < 6) { setError('Please add a short subject (at least 6 characters).'); return; }
    if (form.description.trim().length < 20) { setError('Please describe your requirements in at least 20 characters so the support office can help quickly.'); return; }

    setSaving(true);
    try {
      const req = await actions.submitRequest({
        ...form,
        studentId: me?.student?.id,
        studentName: me?.student?.name || me?.name,
      });
      setCreated(req);
      toast.success('Support request submitted', `${req.id} is now with the Disability Support Office.`);
    } catch(error) {
      setError(error.message || 'We could not submit your request. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open} onClose={onClose} size="lg"
      title={created ? 'Request submitted' : 'Request accessibility support'}
      description={created ? undefined : 'Share what you need. Only the Disability Support Office can view the details.'}
      footer={created ? (
        <button className="btn-primary" onClick={onClose}>Done</button>
      ) : (
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" form="request-form" className="btn-primary" disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Submitting…</> : 'Submit request'}
          </button>
        </>
      )}
    >
      {created ? (
        <div className="text-center py-4">
          <span className="mx-auto grid place-items-center h-14 w-14 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15"><CheckCircle2 className="h-7 w-7" aria-hidden="true" /></span>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">Thank you — we have your request</h3>
          <p className="text-sm muted mt-1 max-w-sm	mx-auto">Reference <strong className="text-slate-800 dark:text-white">{created.id}</strong>. The Disability Support Office responds within one working day.</p>
          <div className="mt-4 mx-auto max-w-sm rounded-xl border border-slate-200 dark:border-white/10 p-3 text-left">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">What happens next</p>
            <ol className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-decimal list-inside">
              <li>A support administrator reviews the request.</li>
              <li>You may be asked for supporting documents.</li>
              <li>Once approved, staff are assigned and you are notified.</li>
            </ol>
          </div>
        </div>
      ) : (
        <form id="request-form" onSubmit={submit} className="space-y-4" noValidate>
          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />{error}
            </div>
          )}

          <div>
            <label htmlFor="req-category" className="label">Type of assistance needed</label>
            <select id="req-category" value={form.category} onChange={(e) => set('category', e.target.value)} className="input">
              {REQUEST_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="req-subject" className="label">Short subject</label>
            <input id="req-subject" value={form.subject} onChange={(e) => set('subject', e.target.value)} placeholder="e.g. Extra time for end-semester examinations" className="input" maxLength={110} required />
          </div>

          <div>
            <label htmlFor="req-description" className="label">Describe your requirements</label>
            <textarea
              id="req-description" value={form.description} onChange={(e) => set('description', e.target.value)} rows={4}
              placeholder="Explain what you need, for which course or exam, and any dates that matter." className="input resize-y min-h-[96px]" maxLength={800} required
              aria-describedby="req-desc-hint"
            />
            <div className="flex justify-between mt-1">
              <p id="req-desc-hint" className="text-[10px] muted">Do not include medical details you are not comfortable sharing.</p>
              <p className="text-[10px] text-slate-600">{form.description.length}/800</p>
            </div>
          </div>

          <fieldset>
            <legend className="label">Priority</legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRIORITIES.map((p) => (
                <button
                  type="button" key={p.value} onClick={() => set('priority', p.value)} aria-pressed={form.priority === p.value}
                  className={`rounded-xl border p-2.5 text-left transition-colors ${form.priority === p.value ? 'border-navy-700 bg-navy-50 dark:bg-white/10 dark:border-white/40' : 'border-slate-200 hover:border-slate-300 dark:border-white/15'}`}
                >
                  <span className="block text-[11px] font-bold text-slate-800 dark:text-white">{p.label}</span>
                  <span className="block text-[10px] muted mt-0.5 leading-snug">{p.desc}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <span className="label">Supporting documents <span className="font-normal text-slate-600">(optional, max 3)</span></span>
            <div
              className="rounded-xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-50/60 dark:bg-white/5 p-4 text-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
            >
              <CloudUpload className="mx-auto h-6 w-6 text-slate-600" aria-hidden="true" />
              <p className="mt-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">Drag files here or choose from your device</p>
              <p className="text-[10px] muted mt-0.5">PDF, DOC, DOCX, TXT or image · up to 5 MB each · metadata only in this demo</p>
              <input ref={fileRef} type="file" multiple accept={ACCEPTED_FILES} className="sr-only" id="req-files" aria-label="Supporting documents" onChange={(e) => addFiles(e.target.files)} />
              <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary text-xs mt-2.5">Choose files</button>
            </div>
            {form.documents.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {form.documents.map((d, i) => (
                  <li key={`${d.name}-${i}`} className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 px-2.5 py-2 text-xs">
                    <FileText className="h-3.5 w-3.5 text-slate-600 shrink-0" aria-hidden="true" />
                    <span className="truncate flex-1 text-slate-700 dark:text-slate-200">{d.name}</span>
                    <span className="text-[10px] muted shrink-0">{d.size}</span>
                    <button type="button" onClick={() => set('documents', form.documents.filter((_, idx) => idx !== i))} className="p-1 rounded text-slate-600 hover:text-rose-600" aria-label={`Remove ${d.name}`}><Trash2 className="h-3.5 w-3.5" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-3">
            <ShieldCheck className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-[11px] muted leading-relaxed">Your request is visible only to authorised Disability Support staff and the administrators involved in fulfilling it. Faculty see approved accommodations, not this description.</p>
          </div>
        </form>
      )}
    </Modal>
  );
}

export function InlineAlert({ children, onClose }) {
  return (
    <div role="status" className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-800 dark:bg-sky-500/10 dark:border-sky-500/30 dark:text-sky-200">
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1">{children}</div>
      {onClose && <button onClick={onClose} aria-label="Dismiss" className="p-1 rounded hover:bg-sky-100 dark:hover:bg-white/10"><X className="h-3.5 w-3.5" /></button>}
    </div>
  );
}
