import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Play, Pause, Square, Mic, MicOff, Volume2, Type, BookOpen, Captions, Download, Copy, Trash2, Headphones, Gauge, Keyboard, ArrowRight, Video, FileText, AlertCircle, Accessibility, Languages, Wand2, Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, CardHeader, Badge, Tabs } from '../../components/common/ui';
import { useA11y } from '../../context/AccessibilityContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/helpers';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const SAMPLES = [
  {
    label: 'Study notes',
    title: 'AVL trees — an accessible summary',
    text: 'An AVL tree is a self-balancing binary search tree. For every node, the height of the left and right subtrees may differ by at most one. When an insertion breaks this rule, the tree performs one of four rotations: left-left, right-right, left-right or right-left. Rotations preserve the in-order sequence of values, so search remains correct, and the tree height stays logarithmic. That means search, insert and delete all run in O of log n time, even in the worst case.',
  },
  {
    label: 'Exam notice',
    title: 'End-semester examination notice',
    text: 'End-semester examinations begin on 15 December. Students with approved accommodations should collect their hall tickets from the accessibility desk in Block C at least forty-eight hours before their first examination. Extra time is added automatically by the examination system. If you require a scribe, please confirm your assignment through the support portal before 10 December.',
  },
  {
    label: 'Campus update',
    title: 'Accessibility lab extended hours',
    text: 'The Accessibility Lab in Block C will remain open until 8 PM on all weekdays from 25 November to 20 December. Assistive technology specialists are available on call. The lab includes screen readers, braille displays, magnifiers, ergonomic workstations and a quiet reading room. Step-free access is available from the east entrance.',
  },
];

function SpeechToText() {
  const toast = useToast();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-IN';
    rec.onresult = (e) => {
      let finalText = '';
      let interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t + ' ';
        else interimText += t;
      }
      if (finalText) setTranscript((prev) => (prev + ' ' + finalText).trim());
      setInterim(interimText);
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed') toast.error('Microphone blocked', 'Allow microphone access in your browser to use speech-to-text.');
      else if(e.error!=='aborted')toast.error('Dictation interrupted',`Speech recognition reported: ${e.error}. You can still type your notes.`);
      setListening(false);
    };
    rec.onend = () => { setListening(false); setInterim(''); };
    recognitionRef.current = rec;
    return () => { try { rec.stop(); } catch(error) {console.warn('Speech recognition cleanup failed:',error.name);} };
  }, [toast]);

  const toggle = () => {
    if (!recognitionRef.current) return;
    if (listening) { recognitionRef.current.stop(); setListening(false); }
    else {
      try { recognitionRef.current.start(); setListening(true); setInterim(''); }
      catch(error) {setListening(false);toast.error('Dictation could not start',error.message);}
    }
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(transcript); toast.success('Copied to clipboard'); }
    catch { toast.error('Could not copy', 'Select the text and copy manually.'); }
  };

  return (
    <Card>
      <CardHeader title="Speech to text notes" subtitle="Dictate notes hands-free — useful for physical disabilities and RSI" icon={Mic} />
      <div className="px-5 pb-5 space-y-3">
        {!supported ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/30 p-4">
            <p className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5"><AlertCircle className="h-4 w-4" aria-hidden="true" /> Speech recognition is not available in this browser</p>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-200/70 mt-1">Try the latest version of Chrome or Edge. You can still type notes or paste text into the reader.</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-slate-200 dark:border-white/10 p-3.5">
            <button
              onClick={toggle}
              className={cn('btn text-sm px-4 py-2.5 shrink-0', listening ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-navy-800 text-white hover:bg-navy-900')}
              aria-pressed={listening}
            >
              {listening ? <><MicOff className="h-4 w-4" aria-hidden="true" /> Stop listening</> : <><Mic className="h-4 w-4" aria-hidden="true" /> Start dictation</>}
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {listening ? 'Listening… speak clearly in English (India)' : 'Microphone is idle'}
              </p>
              <div className="mt-1.5 flex items-end gap-0.5 h-6" aria-hidden="true">
                {Array.from({ length: 24 }).map((_, i) => (
                  <span key={i} className={cn('w-1 rounded-full bg-navy-600/70 transition-all', listening ? 'animate-pulse' : 'opacity-30')} style={{ height: `${6 + ((i * 7) % 20)}px`, animationDelay: `${i * 60}ms` }} />
                ))}
              </div>
            </div>
            <span className="text-[10px] muted shrink-0">Processed in your browser</span>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="stt-output" className="label mb-0">Your dictated notes</label>
            <div className="flex gap-1">
              <button onClick={copy} disabled={!transcript} className="btn-ghost text-[11px] px-2 py-1"><Copy className="h-3.5 w-3.5" aria-hidden="true" /> Copy</button>
              <button onClick={() => setTranscript('')} disabled={!transcript} className="btn-ghost text-[11px] px-2 py-1"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Clear</button>
            </div>
          </div>
          <textarea
            id="stt-output" value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={5}
            placeholder="Start dictation and your words will appear here. You can edit them freely."
            className="input resize-y leading-relaxed" aria-live="polite"
          />
          {interim && <p className="text-[11px] text-brand-600 dark:text-brand-300 mt-1 italic" aria-live="polite">“{interim}”</p>}
        </div>
      </div>
    </Card>
  );
}

export default function AssistiveHub() {
  useDocumentTitle('Assistive Learning Hub');
  const { prefs, set, toggle, speak, stop, speaking, speechSupported } = useA11y();
  const { db } = useData();
  const toast = useToast();
  const [sample, setSample] = useState(SAMPLES[0]);
  const [text, setText] = useState(SAMPLES[0].text);
  const [playing, setPlaying] = useState(false);
  const [tab, setTab] = useState('reader');
  const [saved, setSaved] = useState('');

  useEffect(() => () => stop(), [stop]);

  useEffect(() => {
    if (!speaking) setPlaying(false);
  }, [speaking]);

  const play = (t = text) => {
    if (!speechSupported) { toast.error('Speech not supported', 'Your browser does not support speech synthesis. Try Chrome or Edge.'); return; }
    if (playing) { stop(); setPlaying(false); return; }
    speak(t);
    setPlaying(true);
    toast.info('Reading aloud', 'Use the Stop button or press Escape in the toolbar to stop.');
  };

  const downloadText = () => {
    const blob = new Blob([`${sample.title}\n${''.padEnd(sample.title.length, '=')}\n\n${text}`], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'accessible-reading-notes.txt';
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('Notes downloaded');
  };

  const saveNote = () => {
    setSaved(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    toast.success('Saved to your reading session', 'This text stays in the reader while you browse other tools.');
  };

  const materials = db?.studyMaterials || [];
  const captioned = materials.filter((m) => m.captions);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 180));

  return (
    <div>
      <PageHeader
        title="Assistive Learning Hub"
        description="A calm, accessible workspace with text-to-speech, speech-to-text, captioned media and simplified reading."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Assistive Learning Hub' }]}
        icon={Sparkles}
        actions={
          <>
            <button onClick={() => toggle('readingMode')} aria-pressed={prefs.readingMode} className={cn('btn-secondary text-sm', prefs.readingMode && '!bg-navy-800 !text-white !border-navy-800')}>
              <BookOpen className="h-4 w-4" aria-hidden="true" /> {prefs.readingMode ? 'Reading mode on' : 'Simplified reading'}
            </button>
            <button onClick={() => window.dispatchEvent(new Event('ic:open-a11y'))} className="btn-primary text-sm"><Accessibility className="h-4 w-4" aria-hidden="true" /> All settings</button>
          </>
        }
      />

      {/* quick tools */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
        {[
          { label: 'Text size', value: `${Math.round(prefs.fontScale * 100)}%`, icon: Type, active: prefs.fontScale > 1, onClick: () => set('fontScale', prefs.fontScale >= 1.4 ? 0.9 : +(prefs.fontScale + 0.1).toFixed(2)) },
          { label: 'Dyslexia font', value: prefs.dyslexic ? 'On' : 'Off', icon: Type, active: prefs.dyslexic, onClick: () => toggle('dyslexic') },
          { label: 'High contrast', value: prefs.highContrast ? 'On' : 'Off', icon: Accessibility, active: prefs.highContrast, onClick: () => toggle('highContrast') },
          { label: 'Captions', value: prefs.captionsOn ? 'On' : 'Off', icon: Captions, active: prefs.captionsOn, onClick: () => toggle('captionsOn') },
        ].map((t) => (
          <button key={t.label} onClick={t.onClick} aria-pressed={t.active}
            className={cn('card p-3.5 text-left transition-colors', t.active ? 'border-brand-400 bg-brand-50/60 dark:bg-brand-500/10 dark:border-brand-500/40' : 'hover:border-slate-300 dark:hover:border-white/25')}>
            <div className="flex items-center justify-between">
              <t.icon className={cn('h-4 w-4', t.active ? 'text-brand-700 dark:text-brand-300' : 'text-slate-600')} aria-hidden="true" />
              <span className={cn('text-[10px] font-bold', t.active ? 'text-brand-700 dark:text-brand-300' : 'muted')}>{t.value}</span>
            </div>
            <p className="mt-2 text-xs font-bold text-slate-800 dark:text-white">{t.label}</p>
          </button>
        ))}
      </div>

      <Tabs
        className="mb-4 w-fit" value={tab} onChange={setTab}
        tabs={[{ value: 'reader', label: 'Reader' }, { value: 'dictate', label: 'Dictation' }, { value: 'media', label: 'Media & notes' }]}
      />

      {tab === 'reader' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader
                title="Text-to-speech reader" subtitle="Paste any text, or choose a sample to listen to" icon={Headphones}
                action={<Badge tone={speechSupported ? 'green' : 'rose'} dot>{speechSupported ? 'Voice ready' : 'Unavailable'}</Badge>}
              />
              <div className="px-5 pb-5 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLES.map((s) => (
                    <button key={s.label} onClick={() => { setSample(s); setText(s.text); stop(); }}
                      className={cn('rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors',
                        sample.label === s.label ? 'bg-navy-800 text-white border-navy-800' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:border-slate-300')}>
                      {s.label}
                    </button>
                  ))}
                  <button onClick={() => { setSample({ label: 'Custom', title: 'My custom text' }); setText(''); }} className="rounded-full border border-dashed border-slate-300 dark:border-white/25 px-3 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400">Paste your own</button>
                </div>

                <div>
                  <label htmlFor="tts-text" className="label">Text to read aloud</label>
                  <textarea
                    id="tts-text" value={text} onChange={(e) => setText(e.target.value)} rows={9}
                    placeholder="Paste lecture notes, an assignment brief or any text here…"
                    className="input resize-y leading-relaxed reading-target"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5">
                    <p className="text-[10px] muted">{words} words · about {minutes} min at 1× speed</p>
                    <p className="text-[10px] muted">Nothing leaves your browser</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-2.5">
                  <button onClick={() => play()} className={cn('btn text-sm px-4 py-2.5', playing ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-navy-800 text-white hover:bg-navy-900')} disabled={!text.trim()}>
                    {playing ? <><Pause className="h-4 w-4" aria-hidden="true" /> Pause</> : <><Play className="h-4 w-4" aria-hidden="true" /> Read aloud</>}
                  </button>
                  <button onClick={() => { stop(); setPlaying(false); }} className="btn-secondary text-sm py-2.5" aria-label="Stop reading"><Square className="h-4 w-4" aria-hidden="true" /> Stop</button>
                  <div className="flex items-center gap-2 ml-auto">
                    <Gauge className="h-4 w-4 text-slate-600" aria-hidden="true" />
                    <label htmlFor="hub-rate" className="text-[10px] font-bold text-slate-600">Speed</label>
                    <input id="hub-rate" type="range" min="0.6" max="1.6" step="0.1" value={prefs.speechRate} onChange={(e) => set('speechRate', Number(e.target.value))} className="w-24 accent-navy-700" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 w-8">{prefs.speechRate}×</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button onClick={saveNote} className="btn-secondary text-xs"><Save className="h-3.5 w-3.5" aria-hidden="true" /> Save session {saved && <span className="text-emerald-700">· {saved}</span>}</button>
                  <button onClick={downloadText} disabled={!text.trim()} className="btn-secondary text-xs"><Download className="h-3.5 w-3.5" aria-hidden="true" /> Download text</button>
                  <button onClick={() => setText('')} disabled={!text} className="btn-ghost text-xs"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Clear</button>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader title="Reading comfort" subtitle="Fine-tune how text appears" icon={Type} />
              <div className="px-5 pb-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="hub-font" className="text-xs font-semibold text-slate-600 dark:text-slate-300">Text size</label>
                    <span className="text-[10px] font-bold text-navy-700 dark:text-brand-300">{Math.round(prefs.fontScale * 100)}%</span>
                  </div>
                  <input id="hub-font" type="range" min="0.85" max="1.4" step="0.05" value={prefs.fontScale} onChange={(e) => set('fontScale', Number(e.target.value))} className="w-full accent-navy-700" />
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    ['Dyslexia-friendly font', 'dyslexic'],
                    ['Simplified reading mode', 'readingMode'],
                    ['Highlight links', 'highlightLinks'],
                    ['Reduce motion', 'reduceMotion'],
                  ].map(([label, key]) => (
                    <label key={key} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-white/10 px-3 py-2.5 cursor-pointer">
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{label}</span>
                      <input type="checkbox" checked={prefs[key]} onChange={() => toggle(key)} className="h-4 w-4 rounded border-slate-300 text-navy-700 focus:ring-navy-500" />
                    </label>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card className="p-5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Preview</h2>
              <p className="text-[11px] muted mt-0.5">This is how your reading pane renders.</p>
              <div className="mt-3 rounded-xl border border-slate-200 dark:border-white/10 p-3.5 reading-target max-h-56 overflow-y-auto">
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{text ? text.slice(0, 320) + (text.length > 320 ? '…' : '') : 'Your text will appear here in the same style used across the platform.'}</p>
              </div>
              <button onClick={() => play(text.slice(0, 300))} className="btn-secondary text-xs w-full mt-3"><Volume2 className="h-3.5 w-3.5" aria-hidden="true" /> Preview first paragraph</button>
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Keyboard className="h-4 w-4 text-slate-600" aria-hidden="true" /> Keyboard shortcuts</h2>
              <ul className="mt-2.5 space-y-1.5 text-[11px]">
                {[['Alt + A', 'Accessibility panel'], ['Alt + +', 'Increase text size'], ['Alt + −', 'Decrease text size'], ['⌘ / Ctrl + K', 'Search anything'], ['Tab', 'Move between controls']].map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between gap-2">
                    <kbd className="rounded border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">{k}</kbd>
                    <span className="muted text-right">{v}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-navy-800 to-brand-700 text-white">
              <h2 className="text-sm font-bold flex items-center gap-1.5"><Wand2 className="h-4 w-4" aria-hidden="true" /> Need another format?</h2>
              <p className="text-[11px] text-white/75 mt-1 leading-relaxed">Braille, DAISY audio, large print or sign-interpreted recordings — request any format from the support office.</p>
              <Link to="/support?new=1&category=Learning%20Materials" className="btn bg-white text-navy-900 hover:bg-slate-100 text-xs mt-3 w-full">Request a format <ArrowRight className="h-3 w-3" aria-hidden="true" /></Link>
            </Card>
          </aside>
        </div>
      )}

      {tab === 'dictate' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <SpeechToText />
            <Card>
              <CardHeader title="Voice commands" subtitle="Speak naturally — these phrases work in the editor" icon={Languages} />
              <div className="px-5 pb-5 grid sm:grid-cols-2 gap-2">
                {['“Copy my notes”', '“Clear the transcript”', '“Read my notes aloud”', '“Open study materials”'].map((c) => (
                  <div key={c} className="rounded-lg border border-slate-200 dark:border-white/10 px-3 py-2 text-[11px] text-slate-600 dark:text-slate-300">{c}</div>
                ))}
              </div>
            </Card>
          </div>
          <aside className="space-y-4">
            <Card className="p-5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Mic className="h-4 w-4 text-brand-600" aria-hidden="true" /> Who this helps</h2>
              <ul className="mt-2.5 space-y-2 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <li>• Students with repetitive strain injuries or limited hand mobility</li>
                <li>• Anyone who thinks faster by speaking than typing</li>
                <li>• Capturing lecture ideas quickly during discussion</li>
              </ul>
              <p className="mt-3 text-[10px] muted leading-relaxed flex items-start gap-1.5"><AlertCircle className="h-3 w-3 shrink-0 mt-0.5" aria-hidden="true" /> Audio is transcribed by your browser’s speech service. Nothing is stored on our servers.</p>
            </Card>
          </aside>
        </div>
      )}

      {tab === 'media' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-violet-200 bg-violet-50/60 dark:bg-violet-500/10 dark:border-violet-500/30 p-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
            <Captions className="h-4 w-4 text-violet-700 dark:text-violet-300 shrink-0" aria-hidden="true" />
            <p className="text-[11px] text-violet-900 dark:text-violet-200 flex-1"><strong>{captioned.length} captioned resources</strong> are available. Demo media includes sample captions and downloadable text. These previews do not contain uploaded video files.</p>
            <Link to="/study-materials" className="btn-secondary text-xs shrink-0">Browse all materials</Link>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {captioned.map((m) => (
              <Card key={m.id} hover className="p-4 flex flex-col">
                <div className="relative rounded-xl bg-navy-950 aspect-video grid place-items-center overflow-hidden mb-3">
                  <div className="absolute inset-0 opacity-20 grid-bg" aria-hidden="true" />
                  <span className="relative grid place-items-center h-11 w-11 rounded-full bg-white/15 text-white"><Video className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white">CC</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">{m.title}</h3>
                <p className="text-[10px] muted mt-1">{m.format} · {m.readingTime} min</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge tone="violet">Captions</Badge>
                  {m.transcript && <Badge tone="green">Transcript</Badge>}
                </div>
                <Link to="/study-materials" className="btn-secondary text-xs mt-3 w-full">Open in materials</Link>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader title="Downloadable accessible notes" subtitle="Text versions of the current unit" icon={FileText} />
            <ul className="divide-y divide-slate-100 dark:divide-white/10">
              {materials.slice(0, 4).map((m) => (
                <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="grid place-items-center h-8 w-8 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 shrink-0"><FileText className="h-4 w-4" aria-hidden="true" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{m.title}</p>
                    <p className="text-[10px] muted">{m.type} · {m.size} · transcript {m.transcript ? 'available' : 'on request'}</p>
                  </div>
                  <button onClick={() => {
                    const blob = new Blob([`${m.title}\n\n${m.description}\n\nAccessible version generated by Inclusive Campus.`], { type: 'text/plain' });
                    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'accessible-note.txt'; a.click(); URL.revokeObjectURL(a.href);
                    toast.success('Note downloaded');
                  }} className="btn-secondary text-[11px] py-1.5"><Download className="h-3 w-3" aria-hidden="true" /> Download</button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
