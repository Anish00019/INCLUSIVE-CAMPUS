import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Library, Download, Video, FileText, Headphones, Presentation, FileType2, Layers, Captions, BookOpen, Clock, Play, Pause, Volume2, Sparkles, Eye } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, Badge, EmptyState } from '../../components/common/ui';
import SearchInput from '../../components/common/SearchInput';
import Modal from '../../components/common/Modal';
import { useData } from '../../context/DataContext';
import { useA11y } from '../../context/AccessibilityContext';
import { useToast } from '../../context/ToastContext';
import { cn, fmtDate } from '../../utils/helpers';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const TYPE_ICON = { Notes: FileText, Video: Video, Slides: Presentation, Document: FileType2, Template: Layers, Audio: Headphones };
const TYPE_TONE = {
  Notes: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  Video: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  Slides: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  Document: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  Template: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  Audio: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
};

const SAMPLE_CONTENT = `Balanced binary search trees keep their height logarithmic so that search, insert and delete all run in O(log n).

An AVL tree is a self-balancing binary search tree where the heights of the two child subtrees of any node differ by at most one. When an insertion or deletion violates this invariant, the tree performs one of four rotations: left-left, right-right, left-right, or right-left.

Each rotation preserves the in-order traversal of the tree, which means the ordering property remains intact. The cost of rebalancing is O(1) pointer changes per rotation, and at most O(log n) rotations are needed per deletion.

Key takeaways: balance factor equals height(left) minus height(right). Values must be −1, 0 or 1. Rotations restore balance locally and keep the tree efficient.`;

export default function StudyMaterials() {
  useDocumentTitle('Study Materials');
  const { db } = useData();
  const { speak, stop } = useA11y();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [preview, setPreview] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [simplified, setSimplified] = useState(false);
  const [playing, setPlaying] = useState(false);

  const subjects = useMemo(() => Object.fromEntries((db?.subjects || []).map((s) => [s.id, s])), [db]);
  const faculty = useMemo(() => Object.fromEntries((db?.faculty || []).map((f) => [f.id, f])), [db]);
  const materials = db?.studyMaterials || [];
  const types = ['all', 'Notes', 'Video', 'Audio', 'Slides', 'Document', 'Template'];

  const filtered = materials.filter((m) => {
    if (type !== 'all' && m.type !== type) return false;
    if (subjectFilter !== 'all' && m.subjectId !== subjectFilter) return false;
    if (q.trim()) {
      const t = q.toLowerCase();
      return `${m.title} ${m.description} ${subjects[m.subjectId]?.name}`.toLowerCase().includes(t);
    }
    return true;
  });

  const download = (m) => {
    const content = [
      m.title, ''.padEnd(m.title.length, '='), '',
      `Subject: ${subjects[m.subjectId]?.name} (${subjects[m.subjectId]?.code})`,
      `Type: ${m.type} · ${m.format}`,
      `Uploaded by: ${faculty[m.uploadedBy]?.name} on ${fmtDate(m.date)}`,
      '', 'SUMMARY', m.description, '', 'ACCESSIBLE NOTES', SAMPLE_CONTENT, '',
      'Transcript and captions are available in the Assistive Learning Hub.',
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${m.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('Download ready', 'An accessible text version of this material was downloaded.');
  };

  const togglePlay = () => {
    if (playing) { stop(); setPlaying(false); return; }
    const ok = speak(`${preview.title}. ${preview.description}. ${SAMPLE_CONTENT}`);
    setPlaying(ok);
  };

  if (!db) return null;

  return (
    <div>
      <PageHeader
        title="Study Materials"
        description="Notes, slides, captioned videos and audio summaries — available in multiple accessible formats."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Study Materials' }]}
        icon={Library}
        actions={<button onClick={() => window.dispatchEvent(new Event('ic:open-a11y'))} className="btn-secondary text-sm"><Eye className="h-4 w-4" aria-hidden="true" /> Reading settings</button>}
      />

      <Card className="p-3 sm:p-4 mb-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <SearchInput value={q} onChange={setQ} placeholder="Search notes, videos, subjects…" className="flex-1" label="Search study materials" id="materials-search" />
            <select aria-label="Filter by subject" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="input sm:w-56 text-xs">
              <option value="all">All subjects</option>
              {db.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {types.map((t) => (
              <button key={t} onClick={() => setType(t)} aria-pressed={type === t}
                className={cn('rounded-full border px-3 py-1.5 text-[11px] font-bold whitespace-nowrap transition-colors',
                  type === t ? 'bg-navy-800 text-white border-navy-800' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/15 hover:border-slate-300')}>
                {t === 'all' ? `All (${materials.length})` : t}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50/60 dark:bg-brand-500/10 dark:border-brand-500/30 p-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
        <Sparkles className="h-4 w-4 text-brand-700 dark:text-brand-300 shrink-0" aria-hidden="true" />
        <p className="text-[11px] text-brand-900 dark:text-brand-200 flex-1">Every resource below can be read aloud, viewed in simplified reading mode, or downloaded as accessible text. Look for the <strong>captions</strong> and <strong>transcript</strong> badges.</p>
        <Link to="/assistive-hub" className="btn-secondary text-xs shrink-0">Open Assistive Hub</Link>
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Library} title="No materials found" description="Try another search term, subject or format." action={<button className="btn-secondary text-xs" onClick={() => { setQ(''); setType('all'); setSubjectFilter('all'); }}>Clear filters</button>} /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filtered.map((m) => {
            const Icon = TYPE_ICON[m.type] || FileText;
            const sub = subjects[m.subjectId];
            return (
              <Card key={m.id} hover className="p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <span className={cn('grid place-items-center h-10 w-10 rounded-xl shrink-0', TYPE_TONE[m.type])}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {m.captions && <Badge tone="violet"><Captions className="h-2.5 w-2.5" aria-hidden="true" /> Captions</Badge>}
                    {m.transcript && <Badge tone="green">Transcript</Badge>}
                  </div>
                </div>
                <h2 className="mt-3 text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">{m.title}</h2>
                <p className="text-[11px] muted mt-1">{sub?.name} · {m.type}</p>
                <p className="text-xs muted mt-2 line-clamp-2 leading-relaxed flex-1">{m.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] muted">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden="true" />{m.readingTime} min</span>
                  <span>{m.size}</span>
                  <span className="inline-flex items-center gap-1"><Download className="h-3 w-3" aria-hidden="true" />{m.downloads}</span>
                  <span className="ml-auto">{fmtDate(m.date)}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center gap-2">
                  <button onClick={() => { setPreview(m); setShowTranscript(false); setSimplified(false); setPlaying(false); }} className="btn-primary text-xs py-1.5 flex-1"><BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> Open</button>
                  <button onClick={() => download(m)} className="btn-secondary text-xs py-1.5 px-2.5" aria-label={`Download ${m.title}`}><Download className="h-3.5 w-3.5" aria-hidden="true" /></button>
                  <button
                    onClick={() => speak(`${m.title}. ${m.description}`)}
                    className="btn-secondary text-xs py-1.5 px-2.5" aria-label={`Listen to ${m.title}`}
                  ><Headphones className="h-3.5 w-3.5" aria-hidden="true" /></button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!preview} onClose={() => { stop(); setPlaying(false); setPreview(null); }} size="lg"
        title={preview?.title || ''}
        description={preview ? `${subjects[preview.subjectId]?.name} · ${preview.type} · ${preview.format}` : ''}
        footer={
          <>
            <button className="btn-secondary" onClick={() => { stop(); setPlaying(false); setPreview(null); }}>Close</button>
            <button className="btn-primary" onClick={() => preview && download(preview)}><Download className="h-4 w-4" aria-hidden="true" /> Download accessible text</button>
          </>
        }
      >
        {preview && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={togglePlay} className="btn-accent text-xs">
                {playing ? <><Pause className="h-3.5 w-3.5" aria-hidden="true" /> Pause reading</> : <><Play className="h-3.5 w-3.5" aria-hidden="true" /> Read aloud</>}
              </button>
              {preview.captions && <Badge tone="violet"><Captions className="h-3 w-3" aria-hidden="true" /> Human-reviewed captions</Badge>}
              {preview.transcript && <button onClick={() => setShowTranscript((s) => !s)} className="btn-secondary text-xs py-1.5">{showTranscript ? 'Hide' : 'Show'} transcript</button>}
              <button onClick={() => setSimplified((s) => !s)} aria-pressed={simplified} className={cn('btn-secondary text-xs py-1.5', simplified && '!bg-navy-800 !text-white !border-navy-800')}>
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Simplified reading
              </button>
            </div>

            {preview.type === 'Video' && (
              <div className="relative rounded-xl bg-navy-950 aspect-video grid place-items-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 grid-bg" aria-hidden="true" />
                <div className="relative text-center px-6">
                  <span className="mx-auto grid place-items-center h-14 w-14 rounded-full bg-white/15 text-white"><Play className="h-6 w-6 ml-0.5" aria-hidden="true" /></span>
                  <p className="mt-3 text-xs font-bold text-white">Captioned lecture preview</p>
                  <p className="text-[10px] text-white/60 mt-0.5">Captions and audio description are enabled by default.</p>
                </div>
                <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-black/70 px-3 py-2 text-center">
                  <p className="text-[11px] text-white leading-snug">“…the balance factor must stay between minus one and plus one…”</p>
                </div>
              </div>
            )}

            {preview.type === 'Audio' && (
              <div className="rounded-xl bg-gradient-to-r from-rose-50 to-brand-50 dark:from-rose-500/10 dark:to-brand-500/10 border border-slate-200 dark:border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center h-10 w-10 rounded-full bg-rose-500 text-white"><Volume2 className="h-5 w-5" aria-hidden="true" /></span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Audio summary · {preview.readingTime} min</p>
                    <div className="mt-1.5 h-1.5 rounded-full bg-white/60 dark:bg-white/15 overflow-hidden"><div className={cn('h-full rounded-full bg-rose-500 transition-all', playing ? 'w-1/3' : 'w-0')} /></div>
                  </div>
                  <button onClick={togglePlay} className="p-2 rounded-full bg-white dark:bg-white/10 shadow-sm" aria-label={playing ? 'Pause audio' : 'Play audio'}>
                    {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className={cn('rounded-xl border border-slate-200 dark:border-white/10 p-4 reading-target', simplified && 'bg-amber-50/40 dark:bg-amber-500/5')}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{simplified ? 'Simplified summary' : 'Overview'}</h4>
                {simplified && <Badge tone="amber">Plain language</Badge>}
              </div>
              {simplified ? (
                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200 leading-loose">
                  <p><strong>What it is:</strong> An AVL tree is a sorted tree that keeps itself balanced.</p>
                  <p><strong>Why it matters:</strong> Balancing keeps searching fast, even with many items.</p>
                  <p><strong>How it stays balanced:</strong> When one side gets too tall, the tree rotates nodes until both sides are similar in height.</p>
                  <p><strong>Remember:</strong> The balance factor must be −1, 0 or 1 for every node.</p>
                </div>
              ) : (
                <div className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p>{preview.description}</p>
                  {SAMPLE_CONTENT.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>
              )}
            </div>

            {showTranscript && (
              <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Full transcript</h4>
                  <button onClick={() => speak(SAMPLE_CONTENT)} className="text-[10px] font-bold text-navy-700 dark:text-brand-300 inline-flex items-center gap-1"><Headphones className="h-3 w-3" aria-hidden="true" /> Listen</button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{SAMPLE_CONTENT}</p>
              </div>
            )}

            <div className="flex items-start gap-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-2.5">
              <Sparkles className="h-3.5 w-3.5 text-slate-600 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-[10px] muted leading-relaxed">Need this in Braille, DAISY audio or large print? Request an alternative format from the support office.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
