import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Accessibility, ArrowLeft, ArrowRight, Check, Eye, EyeOff, GraduationCap, Loader2, Lock, Mail, ShieldCheck, User, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth, ROLE_HOME } from '../../context/AuthContext';
import { useA11y } from '../../context/AccessibilityContext';
import { useToast } from '../../context/ToastContext';
import { departments } from '../../services/mockData';
import { cn } from '../../utils/helpers';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const ROLE_OPTIONS = [
  { id: 'student', label: 'Student', desc: 'Access your academics and support', icon: GraduationCap },

];

const A11Y_NEEDS = ['Visual impairment support', 'Hearing impairment support', 'Physical / mobility support', 'Learning disability support', 'Note-taking assistance', 'Examination accommodations'];

export default function Register() {
  useDocumentTitle('Create account');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ role: 'student', name: '', email: '', password: '', department: 'CSE', year: '1', needs: [], consent: false });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { set } = useA11y();
  const toast = useToast();
  const navigate = useNavigate();

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const strength = useMemo(() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }, [form.password]);
  const strengthLabel = ['Too short', 'Weak', 'Fair', 'Strong', 'Very strong'][strength];

  const next = () => {
    setError('');
    if (!form.name.trim()) return setError('Please enter your full name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Please enter a valid email address.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters long.');
    setStep(2);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.consent) return setError('Please accept the privacy notice to continue.');
    setLoading(true);
    try {
      const user = await register({
        name: form.name.trim(), email: form.email, password: form.password,
        role: form.role, department: form.department, year: form.year, needs: form.needs,
      });
      if (form.needs.length) set('visualAlerts', true);
      toast.success('Account created', 'Welcome to Inclusive Campus.');
      navigate(ROLE_HOME[user.role] || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      <div className="grid lg:grid-cols-[1fr_480px] min-h-screen">
        {/* form */}
        <div className="order-2 lg:order-1 flex flex-col px-4 sm:px-8 py-8 lg:py-10 max-w-2xl w-full mx-auto lg:mx-0 lg:ml-auto lg:mr-12">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy-800 dark:text-slate-400 dark:hover:text-white w-fit">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to home
          </Link>

          <div className="mt-6">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
              <span className={cn('rounded-full px-2.5 py-1', step >= 1 ? 'bg-navy-800 text-white' : 'bg-slate-200 text-slate-600')}>1 · Your details</span>
              <span className="h-px w-6 bg-slate-300 dark:bg-white/20" aria-hidden="true" />
              <span className={cn('rounded-full px-2.5 py-1', step === 2 ? 'bg-navy-800 text-white' : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-400')}>2 · Accessibility</span>
            </div>
            <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-900 dark:text-white">
              {step === 1 ? 'Create your account' : 'Set up your accessibility'}
            </h1>
            <p className="text-sm muted mt-1">
              {step === 1 ? 'Join Inclusive Campus in under a minute.' : 'Optional — you can change all of this later in settings.'}
            </p>
          </div>

          {error && (
            <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />{error}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
            {step === 1 && (
              <>
                <fieldset>
                  <legend className="label">Student registration · staff accounts are provisioned by the college</legend>
                  <div className="grid grid-cols-2 gap-2.5">
                    {ROLE_OPTIONS.map((r) => (
                      <button
                        type="button" key={r.id} onClick={() => setField('role', r.id)} aria-pressed={form.role === r.id}
                        className={cn('flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all',
                          form.role === r.id ? 'border-navy-700 bg-navy-50 ring-1 ring-navy-700/20 dark:bg-white/10 dark:border-white/40' : 'border-slate-200 bg-white hover:border-slate-300 dark:border-white/15 dark:bg-white/5')}
                      >
                        <r.icon className={cn('h-4 w-4 mt-0.5 shrink-0', form.role === r.id ? 'text-navy-700 dark:text-brand-300' : 'text-slate-600')} aria-hidden="true" />
                        <span>
                          <span className="block text-xs font-bold text-slate-800 dark:text-white">{r.label}</span>
                          <span className="block text-[10px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">{r.desc}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] muted">Faculty, support and administrator accounts are provisioned by your institution.</p>
                </fieldset>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="name" className="label">Full name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                      <input id="name" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Aarav Sharma" className="input pl-9" autoComplete="name" required />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="reg-email" className="label">College email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                      <input id="reg-email" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="you@campus.edu" className="input pl-9" autoComplete="email" required />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="reg-password" className="label">Create a password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                      <input id="reg-password" type={show ? 'text' : 'password'} value={form.password} onChange={(e) => setField('password', e.target.value)} placeholder="At least 8 characters" className="input pl-9 pr-10" autoComplete="new-password" required aria-describedby="pw-strength" />
                      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10" aria-label={show ? 'Hide password' : 'Show password'}>
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {form.password && (
                      <div id="pw-strength" className="mt-2 flex items-center gap-2">
                        <div className="flex gap-1 flex-1" aria-hidden="true">
                          {[1, 2, 3, 4].map((i) => <span key={i} className={cn('h-1.5 flex-1 rounded-full', strength >= i ? (strength <= 1 ? 'bg-rose-500' : strength === 2 ? 'bg-amber-500' : strength === 3 ? 'bg-sky-500' : 'bg-emerald-500') : 'bg-slate-200 dark:bg-white/15')} />)}
                        </div>
                        <span className="text-[10px] font-bold text-slate-600">{strengthLabel}</span>
                      </div>
                    )}
                  </div>
                  {form.role === 'student' && (
                    <>
                      <div>
                        <label htmlFor="dept" className="label">Department</label>
                        <select id="dept" value={form.department} onChange={(e) => setField('department', e.target.value)} className="input">
                          {departments.map((d) => <option key={d.id} value={d.code}>{d.code} — {d.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="year" className="label">Year of study</label>
                        <select id="year" value={form.year} onChange={(e) => setField('year', e.target.value)} className="input">
                          {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <button type="button" onClick={next} className="btn-primary w-full py-3">
                  Continue <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-3.5 dark:bg-brand-500/10 dark:border-brand-500/30">
                  <p className="text-xs font-bold text-brand-800 dark:text-brand-200 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> We only ask for what helps you</p>
                  <p className="text-[11px] text-brand-700/80 dark:text-brand-200/70 mt-1 leading-relaxed">This information is optional and visible only to the Disability Support Office. Faculty see approved accommodations, never your diagnosis.</p>
                </div>

                <fieldset>
                  <legend className="label">What support might you need? (optional)</legend>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {A11Y_NEEDS.map((n) => {
                      const checked = form.needs.includes(n);
                      return (
                        <label key={n} className={cn('flex items-start gap-2 rounded-xl border p-2.5 text-[11px] font-medium cursor-pointer transition-colors',
                          checked ? 'border-navy-700 bg-navy-50 dark:bg-white/10 dark:border-white/40' : 'border-slate-200 bg-white hover:border-slate-300 dark:border-white/15 dark:bg-white/5')}>
                          <input
                            type="checkbox" checked={checked} className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-navy-700 focus:ring-navy-500"
                            onChange={(e) => setField('needs', e.target.checked ? [...form.needs, n] : form.needs.filter((x) => x !== n))}
                          />
                          <span className="text-slate-700 dark:text-slate-200">{n}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 p-3.5">
                  <p className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5"><Accessibility className="h-3.5 w-3.5" aria-hidden="true" /> Accessibility preferences</p>
                  <p className="text-[11px] muted mt-0.5">Adjust these now, or any time from the floating accessibility toolbar.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => set('theme', 'dark')} className="btn-secondary text-xs py-1.5">Dark mode</button>
                    <button type="button" onClick={() => set('highContrast', true)} className="btn-secondary text-xs py-1.5">High contrast</button>
                    <button type="button" onClick={() => set('dyslexic', true)} className="btn-secondary text-xs py-1.5">Dyslexia font</button>
                    <button type="button" onClick={() => set('reduceMotion', true)} className="btn-secondary text-xs py-1.5">Reduce motion</button>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  <input type="checkbox" checked={form.consent} onChange={(e) => setField('consent', e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-navy-700 focus:ring-navy-500" />
                  <span>I agree to the <a href="/about#privacy" target="_blank" rel="noreferrer" className="font-bold text-brand-600 dark:text-brand-300 underline underline-offset-2">privacy notice</a> and understand this demo stores fictional information in my browser, not in a secure institutional system.</span>
                </label>

                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-3"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Creating…</> : <>Create account <Check className="h-4 w-4" aria-hidden="true" /></>}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="mt-6 text-center text-xs muted">Already have an account? <Link to="/login" className="font-bold text-brand-600 dark:text-brand-300 hover:underline">Sign in</Link></p>
        </div>

        {/* aside */}
        <aside className="order-1 lg:order-2 relative overflow-hidden bg-navy-900 text-white p-8 sm:p-10 flex flex-col justify-between">
          <div className="absolute inset-0 opacity-[0.08] grid-bg" aria-hidden="true" />
          <div className="absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" aria-hidden="true" />
          <Link to="/" className="relative flex items-center gap-2.5 w-fit lg:hidden">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-white text-navy-900"><Accessibility className="h-5 w-5" aria-hidden="true" /></span>
            <span className="text-sm font-extrabold">Inclusive Campus</span>
          </Link>
          <div className="relative mt-10 lg:mt-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-200">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" /> Privacy by design
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold leading-tight">Your needs, your control.</h2>
            <p className="mt-3 text-sm text-white/70 leading-relaxed">Disability information is treated as sensitive data. We collect the minimum necessary and you decide who sees what.</p>
            <ul className="mt-6 space-y-3">
              {['Role-based access to every record', 'Approved accommodations only for faculty', 'Full audit trail on support cases', 'Delete or update your data at any time'].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-xs text-white/80"><Check className="h-3.5 w-3.5 text-emerald-300 shrink-0 mt-0.5" aria-hidden="true" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="relative mt-10 hidden lg:block rounded-2xl border border-white/15 bg-white/[0.06] p-4">
            <p className="text-xs text-white/70 leading-relaxed">“Setting up took two minutes, and I never had to explain my dyslexia to a lecturer again.”</p>
            <p className="mt-2 text-[11px] font-bold text-brand-200">Kabir M. · CSE, Semester 5</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
