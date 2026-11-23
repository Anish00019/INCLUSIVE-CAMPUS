import { Link } from 'react-router-dom';
import { Accessibility, ShieldCheck, Check, Keyboard, MonitorSmartphone, RotateCcw, Sparkles, Info, Headphones } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { Card, CardHeader, Badge } from '../components/common/ui';
import A11yControls from '../components/accessibility/A11yControls';
import { useA11y } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function AccessibilitySettings() {
  useDocumentTitle('Accessibility Settings');
  const { prefs, reset, speechSupported } = useA11y();
  const toast = useToast();

  const activeCount = [
    prefs.theme === 'dark', prefs.highContrast, prefs.dyslexic, prefs.highlightLinks, prefs.reduceMotion,
    prefs.readingMode, prefs.fontScale !== 1, !prefs.captionsOn ? false : true,
  ].filter(Boolean).length;

  return (
    <div>
      <PageHeader
        title="Accessibility Settings"
        description="Every preference applies instantly across the platform and is saved for your next visit."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Accessibility Settings' }]}
        icon={Accessibility}
        actions={
          <button onClick={() => { reset(); toast.success('Settings reset', 'All preferences are back to their defaults.'); }} className="btn-secondary text-sm">
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset all
          </button>
        }
      />

      <div className="grid lg:grid-cols-[420px_1fr] gap-4">
        <Card className="p-4 sm:p-5 self-start">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Your preferences</h2>
              <p className="text-[11px] muted">Saved automatically on this device</p>
            </div>
            <Badge tone="green"><Check className="h-2.5 w-2.5" aria-hidden="true" /> Applied</Badge>
          </div>
          <A11yControls />
        </Card>

        <div className="space-y-4">
          {/* preview */}
          <Card>
            <CardHeader
              title="Live preview" subtitle="Exactly how content will appear" icon={Sparkles}
              action={<Badge tone="blue">{activeCount} active adjustments</Badge>}
            />
            <div className="px-5 pb-5">
              <div className="rounded-xl border border-slate-200 dark:border-white/10 p-4 reading-target">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Inclusive design is not a feature — it is the baseline.</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Adjustable text size, strong contrast and generous spacing help every learner. You can change these settings at any time and they will follow you across your dashboard, timetable, assignments and support requests.
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Need a document in another format? Visit the <Link to="/assistive-hub" className="font-semibold text-navy-700 dark:text-brand-300 underline underline-offset-2">Assistive Learning Hub</Link> or raise a <Link to="/support?new=1" className="font-semibold text-navy-700 dark:text-brand-300 underline underline-offset-2">support request</Link>.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn-primary text-xs">Primary action</button>
                  <button className="btn-secondary text-xs">Secondary action</button>
                  <span className="badge bg-emerald-50 text-emerald-700 border-emerald-200">Approved</span>
                </div>
              </div>
              <p className="text-[10px] muted mt-2 flex items-center gap-1.5"><MonitorSmartphone className="h-3 w-3" aria-hidden="true" /> Try toggling the options on the left — this preview updates immediately.</p>
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Keyboard className="h-4 w-4 text-navy-700 dark:text-brand-300" aria-hidden="true" /> Keyboard navigation</h2>
              <ul className="mt-2.5 space-y-1.5 text-[11px]">
                {[['Tab / Shift+Tab', 'Move forward or back'], ['Enter / Space', 'Activate a control'], ['Alt + A', 'Open accessibility panel'], ['Alt + + / −', 'Change text size'], ['Ctrl / ⌘ + K', 'Global search'], ['Esc', 'Close dialogs and menus']].map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between gap-2"><kbd className="rounded border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">{k}</kbd><span className="muted text-right">{v}</span></li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Headphones className="h-4 w-4 text-brand-600" aria-hidden="true" /> Assistive capabilities</h2>
              <ul className="mt-2.5 space-y-2">
                {[
                  ['Text to speech', speechSupported ? 'Supported' : 'Not supported', speechSupported],
                  ['Speech to text', 'Chrome / Edge', true],
                  ['Captions & transcripts', 'Sample media', true],
                  ['Screen-reader landmarks', 'Enabled', true],
                  ['Reduced motion', prefs.reduceMotion ? 'On' : 'Available', true],
                ].map(([label, value, ok]) => (
                  <li key={label} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-slate-700 dark:text-slate-200">{label}</span>
                    <Badge tone={ok ? 'green' : 'amber'}>{value}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card>
            <CardHeader title="Accessibility statement" subtitle="Designed toward WCAG 2.2 AA — not a certification" icon={ShieldCheck} />
            <div className="px-5 pb-5 space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                This platform targets WCAG 2.2 Level AA. It provides semantic landmarks, visible focus indicators, keyboard-operable controls, text alternatives for images, captions and transcripts for media, and respects the operating system's reduced-motion preference.
              </p>
              <div className="grid sm:grid-cols-3 gap-2">
                {['Perceivable', 'Operable', 'Understandable'].map((p) => (
                  <div key={p} className="rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-2.5">
                    <p className="text-[11px] font-bold text-slate-800 dark:text-white flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-700" aria-hidden="true" /> {p}</p>
                    <p className="text-[10px] muted mt-1.5">Included in our design and testing goals</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] muted flex items-start gap-1.5"><Info className="h-3 w-3 shrink-0 mt-0.5" aria-hidden="true" /> Found a barrier? <Link to="/support?new=1&category=Other" className="font-bold text-navy-700 dark:text-brand-300 underline underline-offset-2">Report an accessibility issue</Link> and the support office will respond within one working day.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
