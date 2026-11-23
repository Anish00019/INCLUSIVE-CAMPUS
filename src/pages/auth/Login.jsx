import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Accessibility, GraduationCap, HeartHandshake, Building2, AlertCircle, Check, Loader2 } from 'lucide-react';
import { useAuth, ROLE_HOME } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DEMO_ACCOUNTS } from '../../services/mockData';
import { cn } from '../../utils/helpers';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const ROLE_ICONS = { student: GraduationCap, faculty: Accessibility, support: HeartHandshake, admin: Building2 };

export default function Login() {
  useDocumentTitle('Sign in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter both your email address and password.'); return; }
    setLoading(true);
    try {
      const user = await login({ email, password });
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`, 'Your accessible workspace is ready.');
      navigate(location.state?.from && location.state.from !== '/login' ? location.state.from : ROLE_HOME[user.role] || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    toast.info('Demo credentials filled', 'Press “Sign in” to continue.');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-navy-950">
      {/* left panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-navy-900 text-white p-10 xl:p-14">
        <div className="absolute inset-0 opacity-[0.08] grid-bg" aria-hidden="true" />
        <div className="absolute -left-20 top-1/3 h-80 w-80 rounded-full bg-brand-500/25 blur-3xl" aria-hidden="true" />
        <Link to="/" className="relative flex items-center gap-2.5 w-fit">
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-white text-navy-900">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 3v18M3 12h18" /><circle cx="12" cy="12" r="3.2" /></svg>
          </span>
          <span>
            <span className="block text-sm font-extrabold tracking-tight leading-tight">Inclusive Campus</span>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-brand-300">Access for all</span>
          </span>
        </Link>

        <div className="relative max-w-md">
          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight">Education without barriers starts with one sign-in.</h1>
          <p className="mt-4 text-sm text-white/70 leading-relaxed">Your accessibility preferences, accommodations and support requests follow you across every page.</p>
          <ul className="mt-8 space-y-3">
            {['Preferences saved to your profile', 'Accommodations visible only to authorised staff', 'Keyboard and screen-reader first design'].map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm text-white/85">
                <span className="grid place-items-center h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-300 shrink-0"><Check className="h-3.5 w-3.5" aria-hidden="true" /></span>{t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-2xl border border-white/15 bg-white/[0.06] p-4">
          <p className="text-xs text-white/75 leading-relaxed">“Before this, I emailed four different offices every semester. Now my accommodations are simply there.”</p>
          <p className="mt-2 text-[11px] font-bold text-brand-200">Ananya R. · BBA, Semester 5</p>
        </div>
      </div>

      {/* right form */}
      <div className="flex flex-col">
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/10">
          <Link to="/" className="text-sm font-extrabold text-navy-900 dark:text-white">Inclusive Campus</Link>
          <Link to="/register" className="text-xs font-bold text-brand-600 dark:text-brand-300">Create account</Link>
        </div>
        <div className="flex-1 grid place-items-center px-4 sm:px-8 py-10">
          <div className="w-full max-w-md">
            <a href="#login-form" className="skip-link">Skip to form</a>
            <div className="mb-7">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30">
                <ShieldCheck className="h-3 w-3" aria-hidden="true" /> Secure sign-in
              </span>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-navy-900 dark:text-white">Welcome back</h2>
              <p className="text-sm muted mt-1">Sign in to your accessible workspace.</p>
            </div>

            {error && (
              <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />{error}
              </div>
            )}

            <form id="login-form" onSubmit={submit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="label">College email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                  <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@campus.edu" className="input pl-9" required aria-describedby="email-hint" />
                </div>
                <p id="email-hint" className="sr-only">Use one of the demo accounts listed below or your registered college email.</p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="label">Password</label>
                  <button type="button" onClick={() => toast.info('Demo build', 'Password reset is disabled in this prototype. Use demo1234 for demo accounts.')} className="text-[11px] font-bold text-brand-600 dark:text-brand-300 hover:underline mb-1.5">Forgot password?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                  <input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input pl-9 pr-10" required />
                  <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10" aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 select-none">
                <input type="checkbox" checked readOnly aria-label="Demo session expires after two hours" className="h-4 w-4 rounded border-slate-300 text-navy-700 focus:ring-navy-500" /> Demo session lasts up to 2 hours
              </label>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Signing in…</> : <>Sign in <ArrowRight className="h-4 w-4" aria-hidden="true" /></>}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200 dark:bg-white/15" /><span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Demo accounts</span><span className="h-px flex-1 bg-slate-200 dark:bg-white/15" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((a) => {
                const Icon = ROLE_ICONS[a.role];
                const selected = email === a.email;
                return (
                  <button
                    key={a.role} type="button" onClick={() => fillDemoCredentials(a)}
                    className={cn('flex items-start gap-2 rounded-xl border p-2.5 text-left transition-colors', selected ? 'border-navy-700 bg-navy-50 dark:bg-white/10 dark:border-white/30' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-white/15 dark:hover:bg-white/5')}
                  >
                    <Icon className="h-4 w-4 text-navy-700 dark:text-brand-300 shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block text-[11px] font-bold text-slate-800 dark:text-white capitalize">{a.role === 'support' ? 'Support admin' : a.role}</span>
                      <span className="block text-[10px] text-slate-600 dark:text-slate-400 truncate">{a.email}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-center text-[10px] muted">All demo accounts use the password <code className="font-bold text-slate-600 dark:text-slate-300">demo1234</code></p>

            <p className="mt-6 text-center text-xs muted">
              New to Inclusive Campus? <Link to="/register" className="font-bold text-brand-600 dark:text-brand-300 hover:underline">Create an account</Link>
            </p>
            <p className="mt-4 text-center text-[10px] text-slate-600">
              <Link to="/" className="hover:underline">← Back to home</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
