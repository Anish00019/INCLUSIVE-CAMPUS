import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Accessibility, ArrowRight, Sparkles, ShieldCheck, Captions, Mic, BookOpen, Keyboard, LifeBuoy, GraduationCap, Users, Building2, HeartHandshake, Check, BarChart3, Menu, X, Sun, Moon, Contrast, Play, Quote, Star, Brain } from 'lucide-react';
import { useA11y } from '../context/AccessibilityContext';
import AccessibilityToolbar from '../components/accessibility/AccessibilityToolbar';
import { cn } from '../utils/helpers';
import useDocumentTitle from '../hooks/useDocumentTitle';

const FEATURES = [
  { icon: Accessibility, title: 'Accessibility toolbar', desc: 'Font scaling, high contrast, dyslexia-friendly type, reduced motion and link highlighting — all saved to your profile.', tone: 'bg-blue-50 text-blue-700' },
  { icon: Captions, title: 'Captions & transcripts', desc: 'Explore sample captioned lectures, written transcripts and accessible text alternatives.', tone: 'bg-violet-50 text-violet-700' },
  { icon: LifeBuoy, title: 'Support requests', desc: 'Raise accommodation requests, attach documents and follow a transparent status timeline.', tone: 'bg-emerald-50 text-emerald-700' },
  { icon: Brain, title: 'Assistive Learning Hub', desc: 'Text-to-speech reader, speech-to-text notes, simplified reading mode and downloadable formats.', tone: 'bg-amber-50 text-amber-700' },
  { icon: BarChart3, title: 'Institutional analytics', desc: 'Track support demand, approval rates and outcomes by department, year and status.', tone: 'bg-sky-50 text-sky-700' },
  { icon: ShieldCheck, title: 'Privacy by design', desc: 'Disability information is sensitive by default: role-based access, minimum necessary data, audit trails.', tone: 'bg-rose-50 text-rose-700' },
];

const ROLES = [
  { icon: GraduationCap, title: 'Students', desc: 'Learn independently with accessible timetables, materials, exams and assistive tools.', color: 'from-blue-600 to-indigo-700', points: ['Personalised accessible dashboard', 'Track every support request', 'Built-in reader and voice tools'] },
  { icon: Users, title: 'Faculty', desc: 'Teach inclusively with accommodations in context — never exposing private diagnoses.', color: 'from-emerald-600 to-teal-700', points: ['Class rosters with accommodation flags', 'One-click attendance & assignments', 'Captioned material uploads'] },
  { icon: HeartHandshake, title: 'Support teams', desc: 'Review, approve and assign requests with a full audit trail and workload balancing.', color: 'from-violet-600 to-purple-700', points: ['Case management workspace', 'Staff assignment & workload', 'Filtered support reporting'] },
  { icon: Building2, title: 'College administrators', desc: 'Understand demand across departments and demonstrate compliance with confidence.', color: 'from-amber-500 to-orange-600', points: ['Institution-wide analytics', 'Department and course management', 'Privacy-safe aggregate reporting'] },
];

const STUDENT_BENEFITS = ['Learn independently without repeatedly disclosing a diagnosis', 'Everything in one place — timetable, materials, exams, support', 'Assistive tools built in, not bolted on', 'Clear status on every accommodation request'];
const COLLEGE_BENEFITS = ['Demonstrate UGC/RPwD Act compliance with evidence', 'Reduce manual coordination between departments', 'Spot unmet support demand before it becomes attrition', 'Accessible by default — better for every student'];

const Logo = () => (
  <span className="flex items-center gap-2.5">
    <span className="grid place-items-center h-9 w-9 rounded-xl bg-navy-800 text-white shadow-sm">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 3v18M3 12h18" /><circle cx="12" cy="12" r="3.2" /></svg>
    </span>
    <span>
      <span className="block text-sm font-extrabold tracking-tight text-navy-900 dark:text-white leading-tight">Inclusive Campus</span>
      <span className="block text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-brand-300">Access for all</span>
    </span>
  </span>
);

function PublicNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { prefs, set } = useA11y();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#features', label: 'Platform' },
    { href: '#accessibility', label: 'Accessibility' },
    { href: '#roles', label: 'For every role' },
    { href: '#benefits', label: 'Benefits' },
  ];

  return (
    <header className={cn('sticky top-0 z-50 transition-all', scrolled ? 'bg-white/90 dark:bg-navy-950/90 backdrop-blur border-b border-slate-200/70 dark:border-white/10 shadow-sm' : 'bg-transparent')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/"><Logo /></Link>
          <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
            {links.map((l) => <a key={l.href} href={l.href} className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-navy-800 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10">{l.label}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => set('highContrast', !prefs.highContrast)} className="btn-icon hidden sm:grid" aria-label="Toggle high contrast" title="High contrast">
              <Contrast className="h-4 w-4" aria-hidden="true" />
            </button>
            <button onClick={() => set('theme', prefs.theme === 'dark' ? 'light' : 'dark')} className="btn-icon" aria-label={prefs.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {prefs.theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            </button>
            <Link to="/login" className="hidden sm:inline-flex btn-ghost text-sm">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm hidden sm:inline-flex">Get started <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <button className="md:hidden btn-icon" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu" aria-label="Toggle menu">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      {open && (
        <div id="mobile-menu" className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-navy-950 px-4 py-3 space-y-1 animate-in">
          {links.map((l) => <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10">{l.label}</a>)}
          <div className="pt-2 flex gap-2">
            <Link to="/login" className="btn-secondary flex-1 text-sm">Sign in</Link>
            <Link to="/register" className="btn-primary flex-1 text-sm">Get started</Link>
          </div>
        </div>
      )}
    </header>
  );
}

function DashboardPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 via-violet-500/10 to-transparent blur-2xl rounded-[2rem]" aria-hidden="true" />
      <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-white/5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-2 text-[10px] font-semibold text-slate-600">app.inclusivecampus.edu/dashboard</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Signed in</span>
        </div>
        <div className="grid grid-cols-[58px_1fr] sm:grid-cols-[150px_1fr]">
          <div className="border-r border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] p-2 sm:p-3 space-y-1.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={cn('flex items-center gap-2 rounded-lg px-2 py-1.5', i === 1 ? 'bg-navy-800 text-white' : 'text-slate-600')}>
                <span className={cn('h-3.5 w-3.5 rounded', i === 1 ? 'bg-white/90' : 'bg-slate-300 dark:bg-white/20')} />
                <span className={cn('hidden sm:block h-1.5 rounded-full', i === 1 ? 'bg-white/80 w-14' : 'bg-slate-200 dark:bg-white/15 w-10')} />
              </div>
            ))}
          </div>
          <div className="p-3 sm:p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] sm:text-xs font-extrabold text-slate-800 dark:text-white">Good morning, Aarav 👋</p>
                <p className="text-[9px] sm:text-[10px] text-slate-600">Semester 5 · Computer Science</p>
              </div>
              <span className="rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 border border-emerald-200">92% attendance</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[['Attendance', '92%', 'bg-sky-50 text-sky-700'], ['Assignments', '4 due', 'bg-amber-50 text-amber-700'], ['Open requests', '2', 'bg-violet-50 text-violet-700']].map(([l, v, cls]) => (
                <div key={l} className="rounded-xl border border-slate-100 dark:border-white/10 p-2 sm:p-2.5">
                  <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wide text-slate-600">{l}</p>
                  <p className={cn('mt-1 inline-block rounded-md px-1.5 py-0.5 text-[10px] sm:text-xs font-extrabold', cls)}>{v}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-white/10 p-2.5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-300">Academic progress</p>
                <p className="text-[8px] text-slate-600">GPA 8.7 ↑</p>
              </div>
              <div className="flex items-end gap-1.5 h-16" aria-hidden="true">
                {[38, 52, 46, 62, 58, 72, 68, 84, 79, 92].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-blue-500/30 to-blue-600" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              {[['AVL Tree Implementation', 'Due 25 Nov', 'bg-amber-500'], ['Support request SR-2041', 'In progress', 'bg-sky-500']].map(([t, s, dot]) => (
                <div key={t} className="flex items-center gap-2 rounded-lg border border-slate-100 dark:border-white/10 px-2 py-1.5">
                  <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-700 dark:text-slate-200 truncate flex-1">{t}</span>
                  <span className="text-[8px] sm:text-[9px] text-slate-600 shrink-0">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="sr-only">Preview of the Inclusive Campus student dashboard showing attendance, assignments, support requests and an academic progress chart.</p>

      {/* floating cards */}
      <div className="absolute -left-3 sm:-left-6 bottom-10 hidden sm:flex items-center gap-2 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/15 shadow-xl px-3 py-2.5">
        <span className="grid place-items-center h-8 w-8 rounded-lg bg-brand-50 text-brand-700"><Captions className="h-4 w-4" aria-hidden="true" /></span>
        <div><p className="text-[10px] font-extrabold text-slate-800 dark:text-white">Live captions on</p><p className="text-[9px] text-slate-600">Lecture 12 · verified</p></div>
      </div>
      <div className="absolute -right-2 sm:-right-4 top-16 hidden sm:flex items-center gap-2 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/15 shadow-xl px-3 py-2.5">
        <span className="grid place-items-center h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700"><ShieldCheck className="h-4 w-4" aria-hidden="true" /></span>
        <div><p className="text-[10px] font-extrabold text-slate-800 dark:text-white">Request approved</p><p className="text-[9px] text-slate-600">45 min extra time</p></div>
      </div>
    </div>
  );
}

export default function Landing() {
  useDocumentTitle('Education Without Barriers');
  return (
    <div className="bg-white dark:bg-navy-950 min-h-screen">
      <a href="#main" className="skip-link">Skip to main content</a>
      <PublicNav />

      <main id="main">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-60 dark:opacity-10" aria-hidden="true" />
          <div className="absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-blue-200/50 via-violet-200/40 to-transparent blur-3xl dark:from-blue-900/30 dark:via-violet-900/20" aria-hidden="true" />
          <div className="absolute -bottom-40 -left-20 h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-sky-200/40 to-transparent blur-3xl dark:from-sky-900/20" aria-hidden="true" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 lg:pt-20 lg:pb-24">
            <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-12 lg:gap-10 items-center">
              <div className="text-center lg:text-left">
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 dark:border-brand-500/30 bg-brand-50 dark:bg-brand-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-200">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Accessibility-first student platform
                </span>
                <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-navy-900 dark:text-white leading-[1.05]">
                  Education<br className="hidden sm:block" /> Without Barriers<span className="text-brand-600">.</span>
                </h1>
                <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  One inclusive platform connecting students, faculty, and support teams to make every learning experience accessible.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link to="/register" className="btn-primary py-3 px-5 text-sm shadow-lg shadow-navy-800/20">
                    Get started free <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <a href="#features" className="btn-secondary py-3 px-5 text-sm">
                    <Play className="h-4 w-4" aria-hidden="true" /> Explore platform
                  </a>
                </div>
                <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" /> WCAG 2.2 AA target</span>
                  <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" /> No credit card</span>
                  <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" /> Demo data included</span>
                </div>
                <div className="mt-8 flex items-center justify-center lg:justify-start gap-3">
                  <div className="flex -space-x-2" aria-hidden="true">
                    {['from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-600', 'from-violet-500 to-purple-600', 'from-amber-500 to-orange-600'].map((c, i) => (
                      <span key={i} className={cn('h-8 w-8 rounded-full bg-gradient-to-br ring-2 ring-white dark:ring-navy-950 grid place-items-center text-[10px] font-bold text-white', c)}>{['AS', 'IB', 'KM', 'DN'][i]}</span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 text-left">
                    <span className="font-bold text-slate-800 dark:text-white">1,458 students</span> supported across 5 departments
                  </p>
                </div>
              </div>

              <DashboardPreview />
            </div>
          </div>
        </section>

        {/* MARQUEE / TRUST */}
        <section aria-label="Platform capabilities" className="border-y border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
            <span>Screen-reader optimised</span><span aria-hidden="true">•</span>
            <span>Keyboard first</span><span aria-hidden="true">•</span>
            <span>Captioned media</span><span aria-hidden="true">•</span>
            <span>Dyslexia friendly</span><span aria-hidden="true">•</span>
            <span>Privacy by design</span>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">The platform</p>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-navy-900 dark:text-white">Everything a student needs, built accessible from the first pixel.</h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">Not a bolt-on accessibility menu. Inclusive Campus treats assistive technology, accommodations and academic workflows as one connected system.</p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <article key={f.title} className="card card-hover p-5">
                <span className={cn('grid place-items-center h-11 w-11 rounded-xl', f.tone)}><f.icon className="h-5 w-5" aria-hidden="true" /></span>
                <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="mt-1.5 text-xs sm:text-sm muted leading-relaxed">{f.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ACCESSIBILITY */}
        <section id="accessibility" className="relative overflow-hidden bg-navy-900 dark:bg-navy-950 text-white">
          <div className="absolute inset-0 opacity-[0.07] grid-bg" aria-hidden="true" />
          <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-300">Accessibility first</p>
              <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">Designed with disabled students, not just for them.</h2>
              <p className="mt-4 text-sm sm:text-base text-white/70 leading-relaxed max-w-xl">
                Visual, hearing, physical and learning needs are supported throughout the platform. Preferences persist across sessions and devices, and nothing about a diagnosis is shown to people who do not need it.
              </p>
              <div className="mt-7 grid sm:grid-cols-2 gap-3">
                {[
                  [Accessibility, 'Adjustable text & contrast'],
                  [Keyboard, 'Full keyboard navigation'],
                  [Mic, 'Speech input where supported'],
                  [BookOpen, 'Text-to-speech everywhere'],
                  [Captions, 'Captioned video + transcripts'],
                  [ShieldCheck, 'Role-based privacy controls'],
                ].map(([Icon, label]) => (
                  <div key={label} className="flex items-center gap-2.5 rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2.5">
                    <Icon className="h-4 w-4 text-brand-300 shrink-0" aria-hidden="true" />
                    <span className="text-xs font-semibold text-white/90">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur p-4 sm:p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="grid place-items-center h-8 w-8 rounded-lg bg-white text-navy-900"><Accessibility className="h-4 w-4" aria-hidden="true" /></span>
                    <div><p className="text-xs font-bold">Accessibility</p><p className="text-[10px] text-white/75">Saved instantly</p></div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-300">AA</span>
                </div>
                <div className="space-y-2.5">
                  <div className="rounded-xl bg-white/[0.07] p-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-white/80"><span>Text size</span><span className="text-brand-200">120%</span></div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/15"><div className="h-full w-[62%] rounded-full bg-brand-400" /></div>
                  </div>
                  {[['High contrast mode', true], ['Dyslexia-friendly font', false], ['Reduce motion', true], ['Highlight links', false], ['Captions by default', true]].map(([label, on]) => (
                    <div key={label} className="flex items-center justify-between rounded-xl bg-white/[0.05] px-3 py-2.5">
                      <span className="text-[11px] font-medium text-white/80">{label}</span>
                      <span className={cn('relative h-5 w-9 rounded-full', on ? 'bg-brand-500' : 'bg-white/20')} aria-hidden="true">
                        <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition', on ? 'translate-x-[18px]' : 'translate-x-0.5')} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <Quote className="h-4 w-4 text-brand-300 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-[11px] text-white/70 leading-relaxed">“I stopped having to explain my needs in every class. My accommodations follow me.” <span className="text-white/40">— Student pilot feedback</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* ROLES */}
        <section id="roles" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">Four connected workspaces</p>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-navy-900 dark:text-white">One platform. Every role in the loop.</h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">Each role sees exactly what it needs — and nothing more.</p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLES.map((r) => (
              <article key={r.title} className="card card-hover overflow-hidden flex flex-col">
                <div className={cn('bg-gradient-to-br p-5 text-white', r.color)}>
                  <r.icon className="h-6 w-6" aria-hidden="true" />
                  <h3 className="mt-3 text-base font-bold">{r.title}</h3>
                  <p className="mt-1 text-[11px] text-white/80 leading-relaxed">{r.desc}</p>
                </div>
                <ul className="p-4 space-y-2 flex-1">
                  {r.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                      <Check className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" /> {p}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* BENEFITS */}
        <section id="benefits" className="bg-slate-50 dark:bg-white/[0.02] border-y border-slate-100 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-10">
            {[{ title: 'For students', subtitle: 'Independence, not paperwork.', items: STUDENT_BENEFITS, icon: GraduationCap, tone: 'text-blue-600 bg-blue-50' },
              { title: 'For colleges', subtitle: 'Inclusion you can measure.', items: COLLEGE_BENEFITS, icon: Building2, tone: 'text-violet-600 bg-violet-50' }].map((b) => (
              <div key={b.title} className="card p-6">
                <span className={cn('grid place-items-center h-11 w-11 rounded-xl', b.tone)}><b.icon className="h-5 w-5" aria-hidden="true" /></span>
                <h3 className="mt-4 text-lg font-extrabold text-navy-900 dark:text-white">{b.title}</h3>
                <p className="text-xs font-semibold text-brand-600 dark:text-brand-300 mt-0.5">{b.subtitle}</p>
                <ul className="mt-4 space-y-3">
                  {b.items.map((i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                      <span className="grid place-items-center h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5"><Check className="h-3 w-3" aria-hidden="true" /></span>{i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-800 to-brand-700 p-8 sm:p-12 text-white text-center">
            <div className="absolute inset-0 opacity-10 grid-bg" aria-hidden="true" />
            <div className="relative">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-200">Start in under a minute</p>
              <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight">Make your campus accessible by default.</h2>
              <p className="mt-3 text-sm sm:text-base text-white/75 max-w-2xl mx-auto">Sign in with a demo account to explore all four role-based workspaces — no setup required.</p>
              <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
                <Link to="/register" className="btn bg-white text-navy-900 hover:bg-slate-100 px-5 py-3 text-sm font-bold">Create free account <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                <Link to="/login" className="btn border border-white/30 text-white hover:bg-white/10 px-5 py-3 text-sm font-bold">Explore demo accounts</Link>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-2 text-[10px] font-semibold text-white/60">
                {['student@campus.edu', 'faculty@campus.edu', 'support@campus.edu', 'admin@campus.edu'].map((e) => (
                  <span key={e} className="rounded-full border border-white/20 px-2.5 py-1">{e}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-3 text-xs muted max-w-xs leading-relaxed">A disability-inclusive student management platform for colleges and universities. Built accessibility-first.</p>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Accessibility-first design · Demo build
            </div>
          </div>
          {[
            { title: 'Platform', links: [['Student dashboard', '/login'], ['Faculty workspace', '/login'], ['Support office', '/login'], ['Administration', '/login']] },
            { title: 'Accessibility', links: [['Accessibility settings', '/login'], ['Assistive Learning Hub', '/login'], ['Support requests', '/login'], ['Accessibility statement', '/about#accessibility']] },
            { title: 'Company', links: [['About', '/about'], ['Privacy', '/about#privacy'], ['Security', '/about#security'], ['Contact', '/about#contact']] },
          ].map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map(([l, to]) => <li key={l}><Link to={to} className="text-xs text-slate-600 dark:text-slate-400 hover:text-navy-700 dark:hover:text-white">{l}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-600">
            <p>© 2026 Inclusive Campus. Demo build with local sample data.</p>
            <p className="flex items-center gap-1"><Star className="h-3 w-3" aria-hidden="true" /> Designed for every learner</p>
          </div>
        </div>
      </footer>

      <AccessibilityToolbar />
    </div>
  );
}
