import { useMemo, useState } from 'react';
import { FolderUp, Plus, FileText, Video, Headphones, Presentation, Captions, Download, ShieldCheck, Sparkles, Loader2, Upload } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, StatCard, Badge, EmptyState } from '../../components/common/ui';
import SearchInput from '../../components/common/SearchInput';
import Modal from '../../components/common/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { fmtDate, cn } from '../../utils/helpers';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const TYPE_ICON = { Notes: FileText, Video: Video, Slides: Presentation, Document: FileText, Template: FileText, Audio: Headphones };

export default function FacultyMaterials() {
  useDocumentTitle('Study Materials');
  const { db, me, actions } = useData();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', subjectId: '', type: 'Notes', description: '', captions: false, transcript: true, size: '1.4 MB' });

  const profile = me?.faculty;
  const mySubjects = useMemo(() => (db?.subjects || []).filter((s) => s.facultyId === profile?.id || profile?.subjects?.includes(s.name)), [db, profile]);
  const mySubjectIds = mySubjects.map((s) => s.id);
  const materials = (db?.studyMaterials || []).filter((m) => mySubjectIds.includes(m.subjectId) || m.uploadedBy === profile?.id);
  const filtered = materials.filter((m) => !q.trim() || `${m.title} ${m.description}`.toLowerCase().includes(q.toLowerCase()));

  const captionedCount = materials.filter((m) => m.captions).length;

  const upload = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subjectId) { toast.error('Missing details', 'Title and subject are required.'); return; }
    setSaving(true);
    try {
      actions.addMaterial({
        ...(form.id ? {id:form.id}:{}), title: form.title.trim(), subjectId: form.subjectId, type: form.type, description: form.description || 'No description provided.',
        uploadedBy: profile.id, captions: form.captions, transcript: form.transcript, format: `${form.type === 'Video' ? 'MP4' : 'PDF'} · ${form.size}`, size: form.size, readingTime: 15,
      });
      setSaving(false);
      setOpen(false);
      setForm({ title: '', subjectId: '', type: 'Notes', description: '', captions: false, transcript: true, size: '1.4 MB' });
      toast.success('Material metadata published','This demo does not upload file bytes. Students see the saved listing and sample reader.');
    }catch(error){toast.error('Material not published',error.message);}finally{setSaving(false);}
  };

  if (!db) return null;

  return (
    <div>
      <PageHeader
        title="Study Materials"
        description="Upload notes, slides and recorded lectures with captions and transcripts so every student can access them."
        breadcrumbs={[{ label: 'Faculty Dashboard', to: '/faculty' }, { label: 'Study Materials' }]}
        icon={FolderUp}
        actions={<button onClick={() => setOpen(true)} className="btn-primary text-sm"><Plus className="h-4 w-4" aria-hidden="true" /> Upload material</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
        <StatCard label="Your materials" value={materials.length} icon={FolderUp} tone="navy" hint={mySubjects.map((s) => s.code).join(' · ')} />
        <StatCard label="With captions" value={captionedCount} icon={Captions} tone="brand" hint="Accessible to deaf students" />
        <StatCard label="With transcripts" value={materials.filter((m) => m.transcript).length} icon={FileText} tone="green" hint="Read-aloud ready" />
        <StatCard label="Total downloads" value={materials.reduce((n, m) => n + (m.downloads || 0), 0)} icon={Download} tone="sky" hint="All students" />
      </div>

      <div className="rounded-xl border border-brand-200 bg-brand-50/60 dark:bg-brand-500/10 dark:border-brand-500/30 p-3.5 flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <Sparkles className="h-4 w-4 text-brand-700 dark:text-brand-300 shrink-0" aria-hidden="true" />
        <p className="text-[11px] text-brand-900 dark:text-brand-200 flex-1"><strong>Accessibility tip:</strong> always tick “Add captions” for video and “Include transcript” for any recording. Students with hearing impairments rely on these, and read-aloud tools use the transcript.</p>
        <button onClick={() => { setForm((f) => ({ ...f, type: 'Video', captions: true, transcript: true })); setOpen(true); }} className="btn-secondary text-xs shrink-0">Upload captioned video</button>
      </div>

      <Card className="p-3 sm:p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <SearchInput value={q} onChange={setQ} placeholder="Search your materials…" className="flex-1" label="Search materials" id="fac-mat-search" />
          <span className="text-[11px] muted">{filtered.length} of {materials.length} resources</span>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={FolderUp} title="No materials" description="Upload your first accessible resource." action={<button onClick={() => setOpen(true)} className="btn-primary text-xs"><Upload className="h-3.5 w-3.5" /> Upload material</button>} /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filtered.map((m) => {
            const Icon = TYPE_ICON[m.type] || FileText;
            const sub = db.subjects.find((s) => s.id === m.subjectId);
            return (
              <Card key={m.id} hover className="p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <span className="grid place-items-center h-10 w-10 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300 shrink-0"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {m.captions && <Badge tone="violet"><Captions className="h-2.5 w-2.5" aria-hidden="true" /> Captions</Badge>}
                    {m.transcript && <Badge tone="green">Transcript</Badge>}
                  </div>
                </div>
                <h2 className="mt-3 text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">{m.title}</h2>
                <p className="text-[11px] muted mt-1">{sub?.name} · {m.type}</p>
                <p className="text-xs muted mt-2 line-clamp-2 leading-relaxed flex-1">{m.description}</p>
                <div className="mt-3 flex items-center gap-3 text-[10px] muted">
                  <span>{m.format}</span>
                  <span className="inline-flex items-center gap-1"><Download className="h-3 w-3" aria-hidden="true" />{m.downloads}</span>
                  <span className="ml-auto">{fmtDate(m.date)}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10 flex gap-1.5">
                  <button onClick={() => toast.success('Accessibility check', m.captions || m.transcript ? 'This resource includes an accessible alternative.' : 'Consider adding a transcript so students can read this material aloud.')} className="btn-secondary text-[10px] py-1.5 flex-1">Check accessibility</button>
                  <button onClick={() => {setForm({...m});setOpen(true);}} className="btn-ghost text-[10px] py-1.5">Edit</button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} size="lg" title="Upload study material" description="Published to the selected subject immediately."
        footer={<><button className="btn-secondary" onClick={() => setOpen(false)} disabled={saving}>Cancel</button><button form="upload-material" type="submit" className="btn-primary" disabled={saving}>{saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</> : 'Publish material'}</button></>}
      >
        <form id="upload-material" onSubmit={upload} className="space-y-4">
          <div>
            <label htmlFor="um-title" className="label">Title</label>
            <input id="um-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="e.g. Unit 4 — Graph Algorithms (captioned)" required />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="um-subject" className="label">Subject</label>
              <select id="um-subject" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} className="input" required>
                <option value="">Select subject…</option>
                {mySubjects.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="um-type" className="label">Resource type</label>
              <select id="um-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
                {['Notes', 'Slides', 'Video', 'Audio', 'Document', 'Template'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="um-desc" className="label">Description</label>
            <textarea id="um-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" placeholder="What does this resource cover?" />
          </div>
          <div>
            <label htmlFor="um-file" className="label">File</label>
            <label htmlFor="um-file" className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 bg-slate-50/60 dark:bg-white/5 p-5 cursor-pointer hover:border-brand-400">
              <Upload className="h-5 w-5 text-slate-600" aria-hidden="true" />
              <span className="mt-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">Choose a file to upload</span>
              <span className="text-[10px] muted mt-0.5">PDF, DOCX, PPTX, MP4 or MP3 · max 500 MB</span>
              <input id="um-file" type="file" className="sr-only" onChange={(e) => { if (e.target.files[0]) { setForm({ ...form, title: form.title || e.target.files[0].name.replace(/\.[^.]+$/, '') }); toast.info('File attached', e.target.files[0].name); } }} />
            </label>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            <label className={cn('flex items-start gap-2 rounded-xl border p-3 cursor-pointer', form.captions ? 'border-brand-400 bg-brand-50/60 dark:bg-brand-500/10' : 'border-slate-200 dark:border-white/15')}>
              <input type="checkbox" checked={form.captions} onChange={(e) => setForm({ ...form, captions: e.target.checked })} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-navy-700" />
              <span><span className="block text-[11px] font-bold text-slate-800 dark:text-white">Add captions</span><span className="block text-[10px] muted mt-0.5">Required for video and audio</span></span>
            </label>
            <label className={cn('flex items-start gap-2 rounded-xl border p-3 cursor-pointer', form.transcript ? 'border-brand-400 bg-brand-50/60 dark:bg-brand-500/10' : 'border-slate-200 dark:border-white/15')}>
              <input type="checkbox" checked={form.transcript} onChange={(e) => setForm({ ...form, transcript: e.target.checked })} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-navy-700" />
              <span><span className="block text-[11px] font-bold text-slate-800 dark:text-white">Include transcript</span><span className="block text-[10px] muted mt-0.5">Enables read-aloud and search</span></span>
            </label>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-2.5">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-[10px] muted leading-relaxed">This demo stores file metadata only. A production deployment must scan uploads and review document accessibility. Add a text description above so screen-reader users can search this resource.</p>
          </div>
        </form>
      </Modal>
    </div>
  );
}
