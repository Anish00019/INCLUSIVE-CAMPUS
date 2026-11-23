import {
  AArrowUp, AArrowDown, Contrast, Moon, Sun, BookOpen, Link2, Sparkles, Captions,
  BellRing, Mic, RotateCcw, Type, Gauge, Keyboard,
} from 'lucide-react';
import { useA11y } from '../../context/AccessibilityContext';
import { cn } from '../../utils/helpers';

export function ToggleRow({ icon: Icon, title, description, checked, onChange, badge }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className={cn('grid place-items-center h-8 w-8 rounded-lg shrink-0 mt-0.5', checked ? 'bg-navy-800 text-white' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300')}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
          {badge && <span className="text-[10px] font-bold uppercase tracking-wide text-brand-600 dark:text-brand-300">{badge}</span>}
        </div>
        {description && <p className="text-xs muted mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <button
        type="button" role="switch" aria-checked={checked} aria-label={title}
        onClick={() => onChange(!checked)}
        className={cn('relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-navy-700' : 'bg-slate-300 dark:bg-white/20')}
      >
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-[22px]' : 'translate-x-0.5')} />
      </button>
    </div>
  );
}

function Chip({ active, onClick, children, icon: Icon, ariaLabel }) {
  return (
    <button
      type="button" onClick={onClick} aria-pressed={active} aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors',
        active ? 'bg-navy-800 text-white border-navy-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-white/5 dark:text-slate-300 dark:border-white/15'
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}{children}
    </button>
  );
}

export default function A11yControls({ compact }) {
  const { prefs, set, toggle, increaseFont, decreaseFont, reset } = useA11y();
  const scalePct = Math.round(prefs.fontScale * 100);

  return (
    <div className={cn('space-y-4', compact && 'space-y-3')}>
      {/* Font size */}
      <section aria-labelledby="a11y-font">
        <div className="flex items-center justify-between mb-2">
          <h4 id="a11y-font" className="text-xs font-bold uppercase tracking-wider text-slate-600">Text size</h4>
          <span className="text-xs font-bold text-navy-700 dark:text-brand-300" aria-live="polite">{scalePct}%</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={decreaseFont} disabled={prefs.fontScale <= 0.85} className="btn-secondary flex-1 py-2" aria-label="A− Decrease font size">
            <AArrowDown className="h-4 w-4" aria-hidden="true" /><span className="text-xs">A−</span>
          </button>
          <button type="button" onClick={() => set('fontScale', 1)} className="btn-secondary px-3 py-2 text-xs" aria-label="100% Reset font size to default">100%</button>
          <button type="button" onClick={increaseFont} disabled={prefs.fontScale >= 1.4} className="btn-secondary flex-1 py-2" aria-label="A+ Increase font size">
            <AArrowUp className="h-4 w-4" aria-hidden="true" /><span className="text-xs">A+</span>
          </button>
        </div>
      </section>

      {/* Theme */}
      <section aria-labelledby="a11y-theme">
        <h4 id="a11y-theme" className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Colour theme</h4>
        <div className="grid grid-cols-3 gap-2">
          <Chip active={prefs.theme === 'light' && !prefs.highContrast} onClick={() => { set('theme', 'light'); set('highContrast', false); }} icon={Sun}>Light</Chip>
          <Chip active={prefs.theme === 'dark' && !prefs.highContrast} onClick={() => { set('theme', 'dark'); set('highContrast', false); }} icon={Moon}>Dark</Chip>
          <Chip active={prefs.highContrast} onClick={() => set('highContrast', !prefs.highContrast)} icon={Contrast}>Contrast</Chip>
        </div>
      </section>

      <div className="h-px bg-slate-100 dark:bg-white/10" />

      <div className="divide-y divide-slate-100 dark:divide-white/10">
        <ToggleRow icon={Type} title="Dyslexia-friendly font" description="Switches to a highly legible typeface with wider spacing." checked={prefs.dyslexic} onChange={() => toggle('dyslexic')} />
        <ToggleRow icon={Link2} title="Highlight all links" description="Adds a visible background to every hyperlink on the page." checked={prefs.highlightLinks} onChange={() => toggle('highlightLinks')} />
        <ToggleRow icon={Sparkles} title="Reduce motion" description="Turns off animations and smooth scrolling." checked={prefs.reduceMotion} onChange={() => toggle('reduceMotion')} />
        <ToggleRow icon={BookOpen} title="Simplified reading mode" description="Wider line spacing and a comfortable measure for long text." checked={prefs.readingMode} onChange={() => toggle('readingMode')} />
        <ToggleRow icon={Captions} title="Captions by default" description="Show captions automatically on all video content." checked={prefs.captionsOn} onChange={() => toggle('captionsOn')} />
        <ToggleRow icon={BellRing} title="Visual notification alerts" description="Show a visible banner for audio alerts and announcements." checked={prefs.visualAlerts} onChange={() => toggle('visualAlerts')} />
        <ToggleRow icon={Mic} title="Voice navigation" description="Enable a microphone button. Say open dashboard, messages, profile or accessibility." badge={(window.SpeechRecognition || window.webkitSpeechRecognition) ? 'Supported' : 'Unavailable'} checked={prefs.voiceNav} onChange={() => toggle('voiceNav')} />
      </div>

      <section aria-labelledby="a11y-rate" className="pt-1">
        <div className="flex items-center justify-between mb-1.5">
          <h4 id="a11y-rate" className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5" aria-hidden="true" /> Speech rate</h4>
          <span className="text-xs font-bold text-navy-700 dark:text-brand-300">{prefs.speechRate.toFixed(1)}×</span>
        </div>
        <input
          type="range" min="0.6" max="1.6" step="0.1" value={prefs.speechRate}
          onChange={(e) => set('speechRate', Number(e.target.value))}
          aria-label="Text to speech rate" className="w-full accent-navy-700"
        />
      </section>

      <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-3">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"><Keyboard className="h-3.5 w-3.5" aria-hidden="true" /> Keyboard shortcuts</p>
        <ul className="mt-1.5 space-y-1 text-[11px] muted">
          <li><kbd className="font-sans font-bold">Alt + A</kbd> — open accessibility panel</li>
          <li><kbd className="font-sans font-bold">Alt + +</kbd> / <kbd className="font-sans font-bold">Alt + −</kbd> — text size</li>
          <li><kbd className="font-sans font-bold">Tab</kbd> — move through interactive elements</li>
        </ul>
      </div>

      <button type="button" onClick={reset} className="btn-secondary w-full text-xs">
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset all accessibility settings
      </button>
    </div>
  );
}
