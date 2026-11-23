import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, Bell, Lock, Globe, Database, RotateCcw, ShieldCheck, Accessibility, Check, Info, Trash2, MessageSquare, BellRing, FileText, ExternalLink, Sparkles } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { Card, CardHeader, Badge, Divider } from '../components/common/ui';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { cn } from '../utils/helpers';
import useDocumentTitle from '../hooks/useDocumentTitle';

function Row({ title, description, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-slate-800 dark:text-white">{title}</p>
        {description && <p className="text-[11px] muted mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Switch({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={cn('relative h-6 w-11 rounded-full transition-colors', checked ? 'bg-navy-700' : 'bg-slate-300 dark:bg-white/20')}>
      <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-[22px]' : 'translate-x-0.5')} />
    </button>
  );
}

export default function Settings() {
  useDocumentTitle('Settings');
  const { user, role } = useAuth();
  const { actions } = useData();
  const toast = useToast();
  const [saved, setSaved] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [prefs, setPrefs] = useLocalStorage('ic_app_settings', {
    language: 'en-IN', timezone: 'Asia/Kolkata', dateFormat: 'DD MMM YYYY', weekStart: 'Monday',
    emailAlerts: true, pushAlerts: true, smsAlerts: false, weeklyDigest: true,
    shareAccommodations: true, anonymousAnalytics: true, showProfileToPeers: false, allowSupportContact: true,
  });

  const timer=useRef();
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  const set = (k,v) => {const success=setPrefs(p=>({...p,[k]:v}));setSaved(success);clearTimeout(timer.current);if(success)timer.current=setTimeout(()=>setSaved(false),1800);};

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Control your account preferences, notifications and privacy. Accessibility options live in their own dedicated section."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Settings' }]}
        icon={SettingsIcon}
        actions={
          <>
            {saved && <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700"><Check className="h-3.5 w-3.5" aria-hidden="true" /> Saved automatically</span>}
            <Link to="/accessibility-settings" className="btn-primary text-sm"><Accessibility className="h-4 w-4" aria-hidden="true" /> Accessibility settings</Link>
          </>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader title="General preferences" subtitle="How dates, times and language appear" icon={Globe} />
            <div className="px-5 pb-4 divide-y divide-slate-100 dark:divide-white/10">
              <Row title="Language" description="Regional preference is saved locally; this demo interface is English.">
                <select aria-label="Language" value={prefs.language} onChange={(e) => set('language', e.target.value)} className="input py-2 text-xs w-full sm:w-48">
                  <option value="en-IN">English (India)</option>
                  <option value="en-GB">English (UK)</option>

                </select>
              </Row>
              <Row title="Time zone" description="Preference saved for API integration. Demo class times are IST.">
                <select aria-label="Time zone" value={prefs.timezone} onChange={(e) => set('timezone', e.target.value)} className="input py-2 text-xs w-full sm:w-48">
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </Row>
              <Row title="Date format">
                <select aria-label="Date format" value={prefs.dateFormat} onChange={(e) => set('dateFormat', e.target.value)} className="input py-2 text-xs w-full sm:w-48">
                  <option value="DD MMM YYYY">22 Nov 2026</option>
                  <option value="DD/MM/YYYY">22/11/2026</option>
                  <option value="YYYY-MM-DD">2026-11-22</option>
                </select>
              </Row>
              <Row title="Week starts on">
                <select aria-label="Week start" value={prefs.weekStart} onChange={(e) => set('weekStart', e.target.value)} className="input py-2 text-xs w-full sm:w-48">
                  <option value="Monday">Monday</option><option value="Sunday">Sunday</option>
                </select>
              </Row>
            </div>
          </Card>

          <Card>
            <CardHeader title="Notifications" subtitle="Choose how you want to be reminded" icon={Bell} />
            <div className="px-5 pb-4 divide-y divide-slate-100 dark:divide-white/10">
              <Row title="Email alerts" description="Preference only. Email delivery requires an external provider.">
                <Switch label="Email alerts" checked={prefs.emailAlerts} onChange={(v) => set('emailAlerts', v)} />
              </Row>
              <Row title="In-app notifications" description="Preference saved for integration; core in-app updates remain visible in this demo.">
                <Switch label="In-app notifications" checked={prefs.pushAlerts} onChange={(v) => set('pushAlerts', v)} />
              </Row>
              <Row title="SMS alerts" description="Preference only. No SMS service is connected in demo mode.">
                <Switch label="SMS alerts" checked={prefs.smsAlerts} onChange={(v) => set('smsAlerts', v)} />
              </Row>
              <Row title="Weekly digest" description="Preference only. No email service is connected in demo mode.">
                <Switch label="Weekly digest" checked={prefs.weeklyDigest} onChange={(v) => set('weeklyDigest', v)} />
              </Row>
            </div>
            <div className="px-5 pb-5">
              <div className="flex items-start gap-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-3">
                <BellRing className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-[11px] muted leading-relaxed">Prefer visual alerts? Turn on “Visual notification alerts” in accessibility settings — the platform will always show a badge instead of relying on sound.</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Privacy & data sharing" subtitle="Local demo preferences — not an access-control boundary" icon={Lock} />
            <div className="px-5 pb-4 divide-y divide-slate-100 dark:divide-white/10">
              <Row title="Share approved accommodations with faculty" description="Preference saved only. This demo does not enforce sharing consent; the separate REST API does.">
                <Switch label="Share accommodations with faculty" checked={prefs.shareAccommodations} onChange={(v) => set('shareAccommodations', v)} />
              </Row>
              <Row title="Anonymous usage analytics" description="Preference saved only; this demo does not transmit usage analytics.">
                <Switch label="Anonymous analytics" checked={prefs.anonymousAnalytics} onChange={(v) => set('anonymousAnalytics', v)} />
              </Row>
              <Row title="Show my profile to classmates" description="Off by default. Your accessibility details are never visible to peers.">
                <Switch label="Show profile to peers" checked={prefs.showProfileToPeers} onChange={(v) => set('showProfileToPeers', v)} />
              </Row>
              <Row title="Allow the support office to contact me" description="Required for accommodation coordination.">
                <Switch label="Allow support contact" checked={prefs.allowSupportContact} onChange={(v) => set('allowSupportContact', v)} />
              </Row>
            </div>
            <div className="px-5 pb-5 flex flex-wrap gap-2">
              <Link to="/profile" className="btn-secondary text-xs"><FileText className="h-3.5 w-3.5" aria-hidden="true" /> Download my data</Link>
              <Link to="/support?new=1&category=Other" className="btn-secondary text-xs"><MessageSquare className="h-3.5 w-3.5" aria-hidden="true" /> Contact data protection officer</Link>
            </div>
          </Card>

          <Card className="border-rose-200 dark:border-rose-500/30">
            <CardHeader title="Demo data" subtitle="This prototype stores everything in your browser" icon={Database} />
            <div className="px-5 pb-5">
              <p className="text-[11px] muted leading-relaxed">Resetting restores the original sample students, requests, messages and notifications. Any requests you created or messages you sent in this demo will be removed.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => setResetOpen(true)} className="btn-danger text-xs"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset demo data</button>
                <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="btn-secondary text-xs text-rose-600"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Clear local storage & sign out</button>
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Signed in as</h2>
            <p className="mt-2 text-xs font-bold text-slate-800 dark:text-white">{user?.name}</p>
            <p className="text-[11px] muted">{user?.email}</p>
            <Badge tone="blue" className="mt-2">{ROLE_LABELS[role]}</Badge>
            <Divider className="my-3" />
            <p className="text-[10px] muted leading-relaxed">Account provisioning and role changes are handled by the college administrator.</p>
            <Link to="/profile" className="btn-secondary text-xs w-full mt-3">Manage profile</Link>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-700" aria-hidden="true" /> Security</h2>
            <ul className="mt-2.5 space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" /> Demo session (browser storage)</li>
              <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" /> Role-scoped demo navigation</li>
              <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" /> Bcrypt hashing in separate REST API</li>
              <li className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" /> Do not enter real medical data</li>
            </ul>
            <Link to="/profile" className="btn-secondary text-xs w-full mt-3">Change password</Link>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-brand-600" aria-hidden="true" /> About this build</h2>
            <dl className="mt-2.5 space-y-2 text-[11px]">
              {[['Version', '1.0.0 demo'], ['Goal', 'WCAG 2.2 AA'], ['Frontend', 'React + Vite'], ['Backend', 'Express + MongoDB'], ['Data', 'Local mock + localStorage']].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-2"><dt className="muted">{k}</dt><dd className="font-semibold text-slate-700 dark:text-slate-200 text-right">{v}</dd></div>
              ))}
            </dl>
            <p className="text-[10px] muted mt-3 flex items-start gap-1.5"><Info className="h-3 w-3 shrink-0 mt-0.5" aria-hidden="true" /> Backend routes are included in <code className="font-bold">/server</code> and can be run with MongoDB.</p>
            <a href="https://github.com/Anish00019/INCLUSIVE-CAMPUS#backend" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-navy-700 dark:text-brand-300 inline-flex items-center gap-1 mt-2">Backend documentation <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" /></a>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={resetOpen} onClose={() => setResetOpen(false)}
        onConfirm={() => { actions.reset(); setResetOpen(false); toast.success('Demo data restored', 'All sample records are back to their original state.'); }}
        title="Reset all demo data?" confirmLabel="Reset demo data"
        description="This restores the original sample students, support requests, messages and notifications, and removes anything you created during this session."
      />
    </div>
  );
}
