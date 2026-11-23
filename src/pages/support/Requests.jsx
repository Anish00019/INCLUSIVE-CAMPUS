import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LifeBuoy, Clock, CheckCircle2, Users, Download, ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, StatCard, StatusBadge, Badge, EmptyState } from '../../components/common/ui';
import SearchInput from '../../components/common/SearchInput';
import Modal from '../../components/common/Modal';
import Timeline from '../../components/dashboard/Timeline';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { REQUEST_STATUSES, fmtDate } from '../../utils/helpers';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function Requests() {
  useDocumentTitle('Support Management');
  const { db, actions } = useData();
  const { role } = useAuth();
  const toast = useToast();
  const [params] = useSearchParams();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState(params.get('status') || 'all');
  const [dept, setDept] = useState('all');
  const [selected, setSelected] = useState(null);
  const [next, setNext] = useState('');
  const [staff, setStaff] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  if (!db) return null;
  const requests = db.supportRequests.filter(r => (status === 'all' || r.status === status) && (dept === 'all' || db.students.find(s => s.id === r.studentId)?.department === dept) && `${r.id} ${r.studentName} ${r.category}`.toLowerCase().includes(q.toLowerCase()));
  const open = r => { setSelected(r); setNext(r.status); setStaff(r.assignedTo || ''); setNote(''); };
  const save = async () => {
    if (!note.trim()) { toast.error('Please add a decision note'); return; }
    setSaving(true);
    try {await actions.updateStatus(selected.id, next, note.trim(), staff || null);
      setSelected(null);toast.success('Case updated','The student has received a notification.');
    }catch(error){toast.error('Case not saved',error.message);}finally{setSaving(false);}
  };
  const exportList = () => {
    const text = ['Reference,Category,Status,Priority,Created', ...requests.map(r => `${r.id},${r.category},${r.status},${r.priority},${r.createdAt}`)].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], {type:'text/csv'})); a.download='support-summary.csv'; a.click(); URL.revokeObjectURL(a.href);
  };
  return <div>
    <PageHeader title="Support Management" description="A thoughtful response makes all the difference. Review, coordinate and follow through on every request." icon={LifeBuoy} breadcrumbs={[{label:'Support overview',to:'/support-admin'},{label:'Requests'}]} actions={<button className="btn-secondary" onClick={exportList}><Download className="h-4 w-4"/> Export summary</button>}/>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      <StatCard label="All requests" value={db.supportRequests.length} icon={LifeBuoy}/>
      <StatCard label="Awaiting review" value={db.supportRequests.filter(r=>['Submitted','Under Review'].includes(r.status)).length} icon={Clock} tone="amber"/>
      <StatCard label="Active accommodations" value={db.supportRequests.filter(r=>['Approved','In Progress'].includes(r.status)).length} icon={Users} tone="brand"/>
      <StatCard label="Resolved" value={db.supportRequests.filter(r=>r.status==='Completed').length} icon={CheckCircle2} tone="green"/>
    </div>
    <Card className="p-4 mb-4 flex flex-col sm:flex-row gap-3">
      <SearchInput value={q} onChange={setQ} placeholder="Search reference, student or category…" className="flex-1" label="Search requests"/>
      <select className="input sm:w-44" aria-label="Request status" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All statuses</option>{REQUEST_STATUSES.map(s=><option key={s}>{s}</option>)}</select>
      <select className="input sm:w-44" aria-label="Department" value={dept} onChange={e=>setDept(e.target.value)}><option value="all">All departments</option>{db.departments.map(d=><option key={d.id} value={d.code}>{d.code}</option>)}</select>
    </Card>
    <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[740px]"><caption className="sr-only">Accessibility requests</caption><thead><tr>{['Request / student','Category','Priority','Status','Assigned to',''].map((h,i)=><th className="table-th" key={i} scope="col">{h || 'Action'}</th>)}</tr></thead><tbody className="divide-y dark:divide-white/10">{requests.map(r=><tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-white/5"><td className="table-td"><button className="text-xs font-bold text-navy-700 dark:text-brand-300 hover:underline" onClick={()=>open(r)}>{r.id}</button><p className="text-xs mt-1">{r.studentName}</p><p className="text-[10px] muted">{fmtDate(r.createdAt)}</p></td><td className="table-td">{r.category}</td><td className="table-td"><Badge tone={r.priority==='High'?'rose':'amber'}>{r.priority}</Badge></td><td className="table-td"><StatusBadge status={r.status}/></td><td className="table-td">{db.supportStaff.find(s=>s.id===r.assignedTo)?.name || 'Unassigned'}</td><td className="table-td"><button className="btn-secondary text-xs" onClick={()=>open(r)}>Review</button></td></tr>)}</tbody></table></div>{!requests.length && <EmptyState icon={LifeBuoy} title="No requests match" description="Try another status, department or search."/>}</Card>
    <p className="text-[11px] muted flex items-center gap-2 mt-4"><ShieldCheck className="h-4 w-4"/> {role==='support'?'Confidential case workspace. Only access records needed for your work.':'Institutional coordination view. Medical descriptions and attachments are restricted to support staff.'}</p>
    <Modal open={!!selected} onClose={()=>setSelected(null)} title={selected ? `${selected.id} · ${selected.studentName}` : ''} description={role==='support'?selected?.category:'Read-only coordination view. Only Disability Support staff can update cases.'} size="lg" footer={<><button className="btn-secondary" onClick={()=>setSelected(null)}>Cancel</button><button className="btn-primary" disabled={saving || role!=='support'} onClick={save}>{saving?'Saving…':'Save update & notify student'}</button></>}>
      {selected && <div className="space-y-5">
        <div className="flex gap-2"><StatusBadge status={selected.status}/><Badge>{selected.priority} priority</Badge></div>
        <section><h3 className="label">Request details</h3><p className="text-sm leading-relaxed muted rounded-xl bg-slate-50 dark:bg-white/5 p-4">{role==='support'?selected.description:'Detailed disability information is restricted to the Disability Support Office.'}</p></section>
        {role==='support' && selected.documents?.length>0 && <section><h3 className="label">Supporting documents (demo metadata)</h3><ul className="text-xs muted space-y-2">{selected.documents.map((d,i)=><li key={i}>{typeof d==='string'?d:d.name} — stored as metadata only in this demo</li>)}</ul></section>}
        <div className="grid sm:grid-cols-2 gap-3"><div><label className="label" htmlFor="case-status">Update status</label><select id="case-status" className="input" value={next} onChange={e=>setNext(e.target.value)}>{REQUEST_STATUSES.map(s=><option key={s}>{s}</option>)}</select></div><div><label className="label" htmlFor="case-staff">Assign support staff</label><select id="case-staff" className="input" value={staff} onChange={e=>setStaff(e.target.value)}><option value="">Unassigned</option>{db.supportStaff.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div></div>
        <div><label htmlFor="case-note" className="label">Decision / update note <span className="text-rose-600">*</span></label><textarea id="case-note" className="input" rows={3} value={note} onChange={e=>setNote(e.target.value)} placeholder="Explain the next step clearly. This note is shared with the student."/></div>
        <section><h3 className="label mb-3">Request history</h3><Timeline events={role==='support'?selected.timeline:selected.timeline.map(e=>({...e,note:`Status: ${e.status}`}))} currentStatus={selected.status}/></section>
      </div>}
    </Modal>
  </div>;
}
