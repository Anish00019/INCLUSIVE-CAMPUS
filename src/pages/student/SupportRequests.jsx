import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  LifeBuoy, Plus, Laptop, FileCheck2, DoorOpen, BookOpen, Accessibility, PencilLine,
  MessageSquare, HelpCircle, Clock, CheckCircle2, ShieldCheck, ArrowRight, Phone, Mail, Inbox,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, StatCard, EmptyState, Badge } from '../../components/common/ui';
import RequestCard from '../../components/dashboard/RequestCard';
import RequestForm from '../../components/forms/RequestForm';
import { useData } from '../../context/DataContext';
import { REQUEST_CATEGORIES, cn } from '../../utils/helpers';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const CATEGORY_META = {
  'Assistive Technology': { icon: Laptop, desc: 'Screen readers, magnifiers, licences, devices', tone: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
  'Examination Accommodations': { icon: FileCheck2, desc: 'Extra time, scribe, separate room, papers', tone: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300' },
  'Accessible Classroom': { icon: DoorOpen, desc: 'Seating, room changes, ramps, acoustics', tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  'Learning Materials': { icon: BookOpen, desc: 'Braille, DAISY, large print, transcripts', tone: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  'Mobility Assistance': { icon: Accessibility, desc: 'Transport, escorts, accessible facilities', tone: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300' },
  'Note-taking Assistance': { icon: PencilLine, desc: 'Volunteer note-takers, recorded lectures', tone: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' },
  'Communication Support': { icon: MessageSquare, desc: 'Interpreters, captions, live transcription', tone: 'bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300' },
  Other: { icon: HelpCircle, desc: 'Anything else — tell us how we can help', tone: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200' },
};

export default function SupportRequests() {
  useDocumentTitle('Support Requests');
  const { myRequests } = useData();
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(REQUEST_CATEGORIES[0]);

  useEffect(() => {
    if (params.get('new')) {
      setCategory(params.get('category') || REQUEST_CATEGORIES[0]);
      setOpen(true);
      const next = new URLSearchParams(params);
      next.delete('new'); next.delete('category');
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  const openForm = (cat) => { setCategory(cat); setOpen(true); };

  const counts = {
    active: myRequests.filter((r) => ['Submitted', 'Under Review'].includes(r.status)).length,
    approved: myRequests.filter((r) => ['Approved', 'In Progress'].includes(r.status)).length,
    done: myRequests.filter((r) => r.status === 'Completed').length,
  };

  return (
    <div>
      <PageHeader
        title="Accessibility Support Requests"
        description="Request assistive technology, exam accommodations, accessible classrooms and more. Every request is tracked transparently."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Support Requests' }]}
        icon={LifeBuoy}
        actions={
          <>
            <Link to="/support/track" className="btn-secondary text-sm"><Inbox className="h-4 w-4" aria-hidden="true" /> Track requests</Link>
            <button onClick={() => openForm(REQUEST_CATEGORIES[0])} className="btn-primary text-sm"><Plus className="h-4 w-4" aria-hidden="true" /> New request</button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <StatCard label="Awaiting review" value={counts.active} icon={Clock} tone="amber" hint="Submitted or under review" />
        <StatCard label="Approved / active" value={counts.approved} icon={CheckCircle2} tone="green" hint="Support being delivered" />
        <StatCard label="Completed" value={counts.done} icon={FileCheck2} tone="brand" hint="Resolved this year" />
        <StatCard label="Total requests" value={myRequests.length} icon={LifeBuoy} tone="navy" hint="Across this academic year" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5 bg-gradient-to-br from-navy-50 to-brand-50/60 dark:from-white/5 dark:to-brand-500/10 border-navy-100 dark:border-white/10">
            <div className="flex items-start gap-3">
              <span className="grid place-items-center h-10 w-10 rounded-xl bg-navy-800 text-white shrink-0"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></span>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">How requests work</h2>
                <ol className="mt-2 grid sm:grid-cols-3 gap-3">
                  {[
                    ['1. Submit', 'Describe what you need and attach evidence if available.'],
                    ['2. Review', 'The support office verifies eligibility within a working day.'],
                    ['3. Delivered', 'Staff are assigned and you track every update here.'],
                  ].map(([t, d]) => (
                    <li key={t} className="rounded-lg bg-white/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 p-2.5">
                      <p className="text-[11px] font-bold text-navy-800 dark:text-white">{t}</p>
                      <p className="text-[10px] muted mt-0.5 leading-relaxed">{d}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Card>

          <section aria-labelledby="categories">
            <div className="flex items-center justify-between mb-2.5">
              <h2 id="categories" className="text-sm font-bold text-slate-900 dark:text-white">Choose a category to start</h2>
              <span className="text-[11px] muted">8 categories</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {REQUEST_CATEGORIES.map((c) => {
                const Meta = CATEGORY_META[c] || CATEGORY_META.Other;
                return (
                  <button key={c} onClick={() => openForm(c)} className="card card-hover p-3.5 flex items-start gap-3 text-left">
                    <span className={cn('grid place-items-center h-9 w-9 rounded-lg shrink-0', Meta.tone)}><Meta.icon className="h-4 w-4" aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-slate-800 dark:text-white">{c}</span>
                      <span className="block text-[10px] muted mt-0.5 leading-snug">{Meta.desc}</span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 shrink-0 mt-1" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="my-requests">
            <div className="flex items-center justify-between mb-2.5">
              <h2 id="my-requests" className="text-sm font-bold text-slate-900 dark:text-white">Your recent requests</h2>
              <Link to="/support/track" className="text-[11px] font-bold text-navy-700 dark:text-brand-300 hover:underline">View all with timeline</Link>
            </div>
            {myRequests.length === 0 ? (
              <Card>
                <EmptyState icon={LifeBuoy} title="No support requests yet" description="Start with a category above. Most requests receive a decision within one working day." action={<button onClick={() => openForm(REQUEST_CATEGORIES[0])} className="btn-primary text-xs"><Plus className="h-3.5 w-3.5" /> Create your first request</button>} />
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {myRequests.slice(0, 4).map((r) => <RequestCard key={r.id} request={r} />)}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Support office</h2>
            <p className="text-[11px] muted mt-1">Block C, Room 004 · Ground floor, step-free access</p>
            <ul className="mt-3 space-y-2.5 text-xs">
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" /><a href="tel:+918045551234" className="font-semibold text-slate-700 dark:text-slate-200 hover:underline">+91 80 4555 1234</a></li>
              <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" /><a href="mailto:access@campus.edu" className="font-semibold text-slate-700 dark:text-slate-200 hover:underline">access@campus.edu</a></li>
              <li className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" /><span className="muted">Mon–Fri · 9:00–17:00</span></li>
            </ul>
            <div className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-2.5">
              <p className="text-[10px] text-amber-800 dark:text-amber-200 leading-relaxed"><strong>Urgent barrier?</strong> Call the accessibility helpline or mark your request as Urgent — we triage these first.</p>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Available accommodations</h2>
            <p className="text-[11px] muted mt-1">Common supports you can request.</p>
            <ul className="mt-3 space-y-1.5">
              {['Extra time in examinations', 'Scribe or reader support', 'Sign language interpretation', 'Captioned and transcribed media', 'Accessible seating & lab benches', 'Note-taking and recordings', 'Screen reader licences', 'Alternative assessment formats'].map((a) => (
                <li key={a} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300"><CheckCircle2 className="h-3 w-3 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />{a}</li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Your privacy</h2>
            <p className="text-[11px] muted mt-1 leading-relaxed">Requests and any documents you upload are visible only to the Disability Support Office and staff assigned to your case. Faculty see approved accommodations only.</p>
            <Badge tone="green" className="mt-2.5"><ShieldCheck className="h-3 w-3" aria-hidden="true" /> Role-based access enforced</Badge>
          </Card>
        </aside>
      </div>

      <RequestForm open={open} onClose={() => setOpen(false)} defaultCategory={category} />
    </div>
  );
}
