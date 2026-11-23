import { authApi } from '../services/api';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Mail, Phone, Building2, GraduationCap, ShieldCheck, Pencil, Save, X, Download,
  KeyRound, Trash2, Accessibility, Sparkles, BadgeCheck, Lock, EyeOff, CheckCircle2, ArrowRight,
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { Card, CardHeader, Avatar, Badge, ProgressBar } from '../components/common/ui';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useA11y } from '../context/AccessibilityContext';
import { useToast } from '../context/ToastContext';
import { departments } from '../services/mockData';
import { fmtDate } from '../utils/helpers';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Profile() {
  useDocumentTitle('My Profile');
  const { user, role, updateUser } = useAuth();
  const { me, myRequests } = useData();
  const { prefs } = useA11y();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: me?.student?.phone || '', department: me?.student?.department || '' });
  const [showSensitive, setShowSensitive] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [passwords, setPasswords] = useState({current:'',next:'',confirm:''});
  const [pwError,setPwError]=useState('');
  const [pwSaving,setPwSaving]=useState(false);
  const closePassword=()=>{setPwOpen(false);setPwError('');setPasswords({current:'',next:'',confirm:''});};
  const changePassword = async () => {
    setPwError('');
    if (passwords.next !== passwords.confirm) {setPwError('Passwords do not match');return;}
    setPwSaving(true);
    try {await authApi.changePassword(user.id, passwords.current, passwords.next);setPwOpen(false);setPasswords({current:'',next:'',confirm:''});toast.success('Password updated','Use your new password at the next sign-in.');}
    catch(error){setPwError(error.message);}finally{setPwSaving(false);}
  };

  const student = me?.student;
  const facultyProfile = me?.faculty;

  const save = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    try {
      updateUser({ name: form.name.trim(), email: form.email, phone: form.phone, department: form.department });
      setEditing(false); toast.success('Profile updated', 'Your changes are saved.');
    } catch(error) { toast.error('Profile not saved',error.message); }
  };

  const downloadData = () => {
    const payload = {
      account: { name: user?.name, email: user?.email, role },
      studentProfile: student ? { ...student, disability: student.disability } : null,
      accommodations: student?.accommodations || [],
      accessibilityPreferences: prefs,
      supportRequests: role === 'student' ? myRequests : [],
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'my-inclusive-campus-data.json';
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('Data exported', 'A JSON copy of your record was downloaded.');
  };

  const completion = student ? Math.min(100, Math.round(([student.name, student.email, student.phone, student.accommodations?.length, student.disability !== 'Not disclosed'].filter(Boolean).length / 5) * 100)) : 100;

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="Manage your personal details, accessibility information and account security."
        breadcrumbs={[{ label: 'Dashboard', to: role === 'student' ? '/dashboard' : '/profile' }, { label: 'Profile' }]}
        icon={User}
        actions={editing ? (
          <>
            <button className="btn-secondary text-sm" onClick={() => {setForm({name:user.name,email:user.email,phone:me?.student?.phone||'',department:me?.student?.department||''});setEditing(false);}}><X className="h-4 w-4" aria-hidden="true" /> Cancel</button>
            <button className="btn-primary text-sm" form="profile-form" type="submit"><Save className="h-4 w-4" aria-hidden="true" /> Save changes</button>
          </>
        ) : (
          <button className="btn-primary text-sm" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" aria-hidden="true" /> Edit profile</button>
        )}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-navy-800 via-navy-700 to-brand-700 relative">
              <div className="absolute inset-0 opacity-20 grid-bg" aria-hidden="true" />
            </div>
            <div className="px-5 pb-5 -mt-10">
              <Avatar name={user?.name} color={user?.avatarColor} size="xl" className="ring-4 ring-white dark:ring-navy-900" />
              <h2 className="mt-3 text-base font-extrabold text-slate-900 dark:text-white">{user?.name}</h2>
              <p className="text-xs muted">{user?.title || ROLE_LABELS[role]}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tone="blue">{ROLE_LABELS[role]}</Badge>
                {student && <Badge tone="green"><BadgeCheck className="h-2.5 w-2.5" aria-hidden="true" /> Verified student</Badge>}
              </div>
              {student && (
                <div className="mt-4">
                  <ProgressBar label="Profile completion" value={completion} tone="brand" showValue />
                  {completion < 100 && <p className="text-[10px] muted mt-1.5">Add a phone number to complete your record.</p>}
                </div>
              )}
              <dl className="mt-4 space-y-2.5 text-xs">
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-600 shrink-0" aria-hidden="true" /><dt className="sr-only">Email</dt><dd className="text-slate-700 dark:text-slate-200 truncate">{user?.email}</dd></div>
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-600 shrink-0" aria-hidden="true" /><dt className="sr-only">Phone</dt><dd className="text-slate-700 dark:text-slate-200">{student?.phone || 'Not added'}</dd></div>
                <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-slate-600 shrink-0" aria-hidden="true" /><dt className="sr-only">Department</dt><dd className="text-slate-700 dark:text-slate-200">{student?.department || facultyProfile?.department || 'Institution administration'}</dd></div>
                {student && <div className="flex items-center gap-2"><GraduationCap className="h-3.5 w-3.5 text-slate-600 shrink-0" aria-hidden="true" /><dt className="sr-only">Semester</dt><dd className="text-slate-700 dark:text-slate-200">Semester {student.semester} · {student.rollNo}</dd></div>}
              </dl>
            </div>
          </Card>

          {student && (
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">GPA</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{student.gpa.toFixed(1)}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Attendance</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{student.attendance}%</p>
              </Card>
            </div>
          )}

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-700" aria-hidden="true" /> Account security</h2>
            <div className="mt-3 space-y-2">
              <button onClick={() => setPwOpen(true)} className="w-full flex items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-white/10 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5">
                <span className="inline-flex items-center gap-2"><KeyRound className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" /> Change password</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
              </button>
              <button onClick={downloadData} className="w-full flex items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-white/10 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5">
                <span className="inline-flex items-center gap-2"><Download className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" /> Download my data</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
              </button>
              <button onClick={() => setDeleteOpen(true)} className="w-full flex items-center justify-between gap-2 rounded-lg border border-rose-200 dark:border-rose-500/30 px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                <span className="inline-flex items-center gap-2"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Request account deletion</span>
                <ArrowRight className="h-3.5 w-3.5 text-rose-300" aria-hidden="true" />
              </button>
            </div>
            <p className="text-[10px] muted mt-3 leading-relaxed">Demo sessions expire after two hours and are stored locally, without JWTs. The separate, unwired REST API uses short-lived JWT tokens.</p>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader title="Personal information" subtitle="Visible to you and authorised staff" icon={User} />
            <form id="profile-form" onSubmit={save} className="px-5 pb-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="p-name" className="label">Full name</label>
                  <input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" disabled={!editing} />
                </div>
                <div>
                  <label htmlFor="p-email" className="label">Email address</label>
                  <input id="p-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" disabled={!editing} />
                </div>
                <div>
                  <label htmlFor="p-phone" className="label">Phone number</label>
                  <input id="p-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+91 …" disabled={!editing} />
                </div>
                <div>
                  <label htmlFor="p-dept" className="label">Department</label>
                  <select id="p-dept" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input" disabled={!editing}>
                    <option value="">Not applicable</option>
                    {departments.map((d) => <option key={d.id} value={d.code}>{d.code} — {d.name}</option>)}
                  </select>
                </div>
              </div>
              {editing && <p className="text-[10px] muted mt-3">Changes are saved to your account immediately after you press “Save changes”.</p>}
            </form>
          </Card>

          {student && (
            <Card>
              <CardHeader
                title="Accessibility profile" subtitle="Sensitive — restricted to the Disability Support Office" icon={Accessibility}
                action={<Badge tone="violet"><Lock className="h-2.5 w-2.5" aria-hidden="true" /> Restricted</Badge>}
              />
              <div className="px-5 pb-5 space-y-4">
                <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50 dark:bg-white/5 px-3.5 py-2.5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Disclosed requirement</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">{showSensitive ? student.disability : '••••••••••••••••'}</p>
                    </div>
                    <button onClick={() => setShowSensitive((s) => !s)} className="btn-secondary text-[11px] py-1.5">
                      {showSensitive ? <><EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> Hide</> : <><EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> Reveal</>}
                    </button>
                  </div>
                  <p className="px-3.5 py-2.5 text-[10px] muted leading-relaxed">Only support administrators can view this. Faculty see approved accommodations, never your diagnosis.</p>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">Approved accommodations</p>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {(student.accommodations || []).map((a) => (
                      <li key={a} className="flex items-start gap-2 rounded-lg border border-slate-200 dark:border-white/10 px-3 py-2 text-[11px] text-slate-700 dark:text-slate-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />{a}
                      </li>
                    ))}
                    {(!student.accommodations || student.accommodations.length === 0) && <li className="text-[11px] muted">No accommodations recorded.</li>}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Link to="/support?new=1" className="btn-secondary text-xs">Request a change</Link>
                  <Link to="/accessibility-settings" className="btn-primary text-xs"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Accessibility preferences</Link>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title="Your accessibility preferences" subtitle="Saved automatically on this device" icon={Sparkles}
              action={<Link to="/accessibility-settings" className="text-[11px] font-bold text-navy-700 dark:text-brand-300 hover:underline">Edit</Link>} />
            <div className="px-5 pb-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                ['Text size', `${Math.round(prefs.fontScale * 100)}%`],
                ['Theme', prefs.theme === 'dark' ? 'Dark' : 'Light'],
                ['Contrast', prefs.highContrast ? 'High' : 'Standard'],
                ['Dyslexia font', prefs.dyslexic ? 'On' : 'Off'],
              ].map(([l, v]) => (
                <div key={l} className="rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-2.5">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-600">{l}</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent activity" subtitle="Your last actions on the platform" icon={BadgeCheck} />
            <ul className="px-5 pb-5 space-y-2.5">
              {(myRequests.slice(0, 3)).map((r) => (
                <li key={r.id} className="flex items-center gap-3 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" aria-hidden="true" />
                  <span className="flex-1 text-slate-700 dark:text-slate-200 truncate">{r.subject}</span>
                  <span className="text-[10px] muted shrink-0">{fmtDate(r.updatedAt)}</span>
                </li>
              ))}
              {myRequests.length === 0 && <li className="text-xs muted">No recent activity.</li>}
            </ul>
          </Card>
        </div>
      </div>

      <Modal open={pwOpen} onClose={closePassword} title="Change password" size="sm"
        footer={<><button className="btn-secondary" onClick={closePassword}>Cancel</button><button className="btn-primary" disabled={pwSaving} onClick={changePassword}>{pwSaving?'Updating…':'Update password'}</button></>}
      >
        <div className="space-y-3">
          {pwError&&<p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{pwError}</p>}
          <div><label htmlFor="cur-pw" className="label">Current password</label><input id="cur-pw" type="password" value={passwords.current} onChange={e=>setPasswords({...passwords,current:e.target.value})} className="input" placeholder="••••••••" /></div>
          <div><label htmlFor="new-pw" className="label">New password</label><input id="new-pw" type="password" value={passwords.next} onChange={e=>setPasswords({...passwords,next:e.target.value})} className="input" placeholder="At least 8 characters" /></div>
          <div><label htmlFor="conf-pw" className="label">Confirm new password</label><input id="conf-pw" type="password" value={passwords.confirm} onChange={e=>setPasswords({...passwords,confirm:e.target.value})} className="input" placeholder="Repeat new password" /></div>
          <p className="text-[10px] muted">Passwords are hashed with bcrypt in the production backend. This demo stores only local mock credentials.</p>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen} onClose={() => setDeleteOpen(false)}
        onConfirm={() => { localStorage.setItem('ic_deletion_request_'+user.id, JSON.stringify({requestedAt:new Date().toISOString(),status:'Pending verification'})); setDeleteOpen(false); toast.info('Demo deletion request saved', 'Request stored on this device. No data has been deleted.'); }}
        title="Request account deletion?" confirmLabel="Submit request"
        description="This demo saves a deletion-request marker on this device only. No data is deleted or sent to campus staff, and no verification workflow is connected. Contact your institution to exercise real data-deletion rights."
      />
    </div>
  );
}
