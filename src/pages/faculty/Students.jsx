import { useMemo, useState } from 'react';
import { Users, ShieldCheck, ClipboardCheck, LifeBuoy, Mail, Download } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, Avatar, Badge, EmptyState, ProgressBar, StatCard } from '../../components/common/ui';
import SearchInput from '../../components/common/SearchInput';
import Modal from '../../components/common/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { fmtDate } from '../../utils/helpers';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function FacultyStudents() {
  useDocumentTitle('My Students');
  const { db, me } = useData();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('all');
  const [onlyAccommodations, setOnlyAccommodations] = useState(false);
  const [selected, setSelected] = useState(null);

  const profile = me?.faculty;
  const allStudents = useMemo(() => {
    if (!db) return [];
    const mySubjects = db.subjects.filter((s) => s.facultyId === profile?.id);
    if (mySubjects.length === 0) return db.students;
    return db.students.filter((s) => s.department === profile?.department);
  }, [db, profile]);

  const filtered = allStudents.filter((s) => {
    if (dept !== 'all' && s.department !== dept) return false;
    if (onlyAccommodations && !(s.accommodations?.length > 0)) return false;
    if (q.trim()) return `${s.name} ${s.rollNo} ${s.department} ${s.accommodations.join(' ')}`.toLowerCase().includes(q.toLowerCase());
    return true;
  });

  const withAcc = allStudents.filter((s) => s.accommodations?.length).length;
  const lowAttendance = allStudents.filter((s) => s.attendance < 80).length;

  const exportRoster = () => {
    const text = [
      'INCLUSIVE CAMPUS — FACULTY ROSTER (CONFIDENTIAL)',
      `Faculty: ${profile?.name} · ${profile?.department}`,
      'Note: accommodation data is confidential and must not be shared beyond teaching needs.',
      '',
      'Roll No     Name                  Dept  Attendance  Accommodations',
      ...filtered.map((s) => `${s.rollNo.padEnd(11)} ${s.name.padEnd(21)} ${s.department.padEnd(5)} ${String(s.attendance + '%').padStart(10)}  ${s.accommodations.join('; ') || '—'}`),
    ].join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'faculty-roster.txt'; a.click(); URL.revokeObjectURL(a.href);
    toast.success('Roster exported', 'Handle this file confidentially.');
  };

  const studentRequests = selected ? db.supportRequests.filter((r) => r.studentId === selected.id) : [];

  if (!db) return null;

  return (
    <div>
      <PageHeader
        title="My Students"
        description="Your assigned students with the accommodation information you need to teach inclusively."
        breadcrumbs={[{ label: 'Faculty Dashboard', to: '/faculty' }, { label: 'My Students' }]}
        icon={Users}
        actions={<button onClick={exportRoster} className="btn-secondary text-sm"><Download className="h-4 w-4" aria-hidden="true" /> Export roster</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
        <StatCard label="Total students" value={allStudents.length} icon={Users} tone="navy" hint={profile?.department} />
        <StatCard label="With accommodations" value={withAcc} icon={ShieldCheck} tone="brand" hint="Approved by support office" />
        <StatCard label="Below 80% attendance" value={lowAttendance} icon={ClipboardCheck} tone={lowAttendance ? 'amber' : 'green'} hint="May need follow-up" />
        <StatCard label="Support cases" value={db.supportRequests.filter((r) => allStudents.some((s) => s.id === r.studentId)).length} icon={LifeBuoy} tone="sky" hint="Visible summary only" />
      </div>

      <Card className="p-3 sm:p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <SearchInput value={q} onChange={setQ} placeholder="Search by name, roll number or accommodation…" className="flex-1" label="Search students" id="fac-search" />
          <select aria-label="Filter by department" value={dept} onChange={(e) => setDept(e.target.value)} className="input sm:w-44 text-xs">
            <option value="all">All departments</option>
            {db.departments.map((d) => <option key={d.id} value={d.code}>{d.code}</option>)}
          </select>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/15 px-3 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer whitespace-nowrap">
            <input type="checkbox" checked={onlyAccommodations} onChange={(e) => setOnlyAccommodations(e.target.checked)} className="h-3.5 w-3.5 rounded border-slate-300 text-navy-700" />
            Accommodations only
          </label>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No students match" description="Adjust your search or clear the filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <caption className="sr-only">Assigned students, attendance and approved accommodations. Sensitive disability details are not shown.</caption>
              <thead className="bg-slate-50/80 dark:bg-white/5 border-b border-slate-100 dark:border-white/10">
                <tr>
                  <th scope="col" className="table-th">Student</th>
                  <th scope="col" className="table-th">Department</th>
                  <th scope="col" className="table-th">Attendance</th>
                  <th scope="col" className="table-th">Approved accommodations</th>
                  <th scope="col" className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03]">
                    <td className="table-td">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={s.name} color={s.avatarColor} size="sm" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-white">{s.name}</p>
                          <p className="text-[10px] muted">{s.rollNo} · Year {s.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td"><Badge tone="blue">{s.department}</Badge></td>
                    <td className="table-td min-w-[140px]">
                      <ProgressBar value={s.attendance} tone={s.attendance >= 85 ? 'green' : s.attendance >= 75 ? 'amber' : 'rose'} showValue />
                    </td>
                    <td className="table-td">
                      <div className="flex flex-wrap gap-1 max-w-[260px]">
                        {s.accommodations?.length ? s.accommodations.slice(0, 2).map((a) => <Badge key={a} tone="slate">{a}</Badge>) : <span className="text-[10px] muted">None</span>}
                        {s.accommodations?.length > 2 && <Badge tone="slate">+{s.accommodations.length - 2}</Badge>}
                      </div>
                    </td>
                    <td className="table-td text-right">
                      <button onClick={() => setSelected(s)} className="btn-secondary text-[10px] py-1.5 px-2.5">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-white/5">
          <p className="flex items-start gap-1.5 text-[10px] muted"><ShieldCheck className="h-3 w-3 shrink-0 mt-0.5" aria-hidden="true" /> Disability diagnoses and medical documents are restricted to the Disability Support Office. You see only approved teaching accommodations.</p>
        </div>
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} size="md" title={selected?.name || ''} description={selected ? `${selected.rollNo} · ${selected.department} · Semester ${selected.semester}` : ''}
        footer={<><a href={`mailto:${selected?.email}`} className="btn-secondary"><Mail className="h-4 w-4" aria-hidden="true" /> Email</a><button className="btn-primary" onClick={() => setSelected(null)}>Close</button></>}
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={selected.name} color={selected.avatarColor} size="lg" />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{selected.name}</p>
                <p className="text-[11px] muted">{selected.email}</p>
                <div className="mt-1 flex gap-1.5"><Badge tone={selected.status === 'Active' ? 'green' : 'amber'}>{selected.status}</Badge><Badge tone="blue">{selected.department}</Badge></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[['GPA', selected.gpa.toFixed(1)], ['Attendance', `${selected.attendance}%`], ['Year', selected.year]].map(([l, v]) => (
                <div key={l} className="rounded-xl border border-slate-200 dark:border-white/10 p-2.5 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">{l}</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">{v}</p>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Approved accommodations</h4>
              <ul className="space-y-1.5">
                {selected.accommodations?.length ? selected.accommodations.map((a) => (
                  <li key={a} className="flex items-start gap-2 rounded-lx rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-2.5 py-2 text-[11px] text-emerald-900 dark:text-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" />{a}
                  </li>
                )) : <li className="text-[11px] muted">No accommodations recorded.</li>}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Support cases (summary)</h4>
              {studentRequests.length === 0 ? <p className="text-[11px] muted">No support cases for this student.</p> : (
                <ul className="space-y-1.5">
                  {studentRequests.map((r) => (
                    <li key={r.id} className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 px-2.5 py-2">
                      <span className="text-[10px] muted">{r.id}</span>
                      <span className="text-[11px] text-slate-700 dark:text-slate-200 truncate flex-1">{r.category}</span>
                      <Badge tone={r.status === 'Completed' ? 'green' : r.status === 'Rejected' ? 'rose' : 'amber'}>{r.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-[10px] muted mt-2">Case details are restricted. Contact the Disability Support Office if you need context to deliver a specific accommodation.</p>
            </div>

            <div className="rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-2.5">
              <p className="text-[10px] muted leading-relaxed flex items-start gap-1.5"><ShieldCheck className="h-3 w-3 shrink-0 mt-0.5" aria-hidden="true" /> Joined {fmtDate(selected.joined)}. The separate REST API logs access to confidential support profiles.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
