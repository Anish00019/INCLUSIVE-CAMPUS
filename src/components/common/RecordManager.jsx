import { csvCell } from '../../utils/validation';
import { useState } from 'react';
import { Plus, Pencil, Download, Search, ShieldCheck } from 'lucide-react';
import { Card, EmptyState, Badge, Avatar } from './ui';
import PageHeader from './PageHeader';
import SearchInput from './SearchInput';
import Modal from './Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';

// Declarative directory editor: all changes pass through the demo service seam.
export default function RecordManager({ title, description, icon, collection, columns, fields, defaults = {}, privateView = false, allowCreate = true }) {
  useDocumentTitle(title);
  const { db, actions } = useData();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [department, setDepartment] = useState('all');
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState('');
  if (!db) return null;
  const rows = (db[collection] || []).filter(r => columns.some(c=>String(r[c.key] ?? '').toLowerCase().includes(q.toLowerCase())) && (department==='all' || r.department===department));
  const edit = row => { setForm(row ? {...row} : {...defaults}); setErrors(''); };
  const save = e => {
    e.preventDefault();
    if (fields.some(f=>f.required && !String(form[f.key]??'').trim())) {setErrors('Please complete all required fields.'); return;}
    const payload = Object.fromEntries(fields.map(f=>[f.key,f.type==='number'?Number(form[f.key] || 0):f.type==='list'?String(form[f.key] || '').split(';').map(x=>x.trim()).filter(Boolean):form[f.key]??'']));
    try {actions.saveRecord(collection, {...defaults, ...form, ...payload}); setForm(null); toast.success('Record saved', 'Changes are saved on this device.');}
    catch(error){setErrors(error.message);}
  };
  const exportRows = () => {
    const csv = [columns.map(c=>c.label).join(','),...rows.map(r=>columns.map(c=>csvCell(r[c.key])).join(','))].join('\n');
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download=`${collection}.csv`; a.click(); URL.revokeObjectURL(a.href); toast.success('Filtered records exported');
  };
  return <div><PageHeader title={title} description={description} icon={icon} actions={<><button className="btn-secondary" onClick={exportRows}><Download className="h-4 w-4"/> Export CSV</button>{allowCreate && <button className="btn-primary" onClick={()=>edit(null)}><Plus className="h-4 w-4"/> Add record</button>}</>}/>
    <div className="grid sm:grid-cols-3 gap-3 mb-5"><Card className="p-5"><p className="text-xs muted">Total records</p><p className="text-3xl font-extrabold mt-2">{db[collection]?.length || 0}</p></Card><Card className="p-5"><p className="text-xs muted">Matching your filters</p><p className="text-3xl font-extrabold mt-2">{rows.length}</p></Card><Card className="p-5 flex items-center gap-3"><ShieldCheck className="h-9 w-9 text-emerald-700"/><div><p className="text-sm font-bold">{privateView?'Restricted workspace':'Privacy-conscious records'}</p><p className="text-xs muted mt-1">{privateView?'Authorised support staff only':'No diagnoses or medical documents'}</p></div></Card></div>
    <Card className="p-4 mb-4 flex flex-col sm:flex-row gap-3"><SearchInput value={q} onChange={setQ} placeholder={`Search ${title.toLowerCase()}…`} className="flex-1" label={`Search ${title}`}/>{fields.some(f=>f.key==='department') && <select className="input sm:w-48" aria-label="Filter department" value={department} onChange={e=>setDepartment(e.target.value)}><option value="all">All departments</option>{db.departments.map(d=><option key={d.id} value={d.code}>{d.code}</option>)}</select>}</Card>
    <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[680px]"><caption className="sr-only">{title} directory</caption><thead className="bg-slate-50 dark:bg-white/5"><tr>{columns.map(c=><th scope="col" className="table-th" key={c.key}>{c.label}</th>)}<th scope="col" className="table-th">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-white/10">{rows.map(r=><tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-white/5">{columns.map((c,i)=><td key={c.key} className="table-td">{c.badge?<Badge tone="blue">{r[c.key]}</Badge>:i===0?<div className="flex items-center gap-2"><Avatar name={r[c.key]} size="sm"/><span className="font-semibold">{r[c.key]}</span></div>:Array.isArray(r[c.key])?r[c.key].join(' · ') || 'None':r[c.key]??'—'}</td>)}<td className="table-td"><button className="btn-secondary text-xs" onClick={()=>edit({...r,...Object.fromEntries(fields.filter(f=>f.type==='list').map(f=>[f.key,(r[f.key]||[]).join('; ')]))})}><Pencil className="h-3 w-3"/> Edit</button></td></tr>)}</tbody></table></div>{!rows.length&&<EmptyState icon={Search} title="No records found" description="Try a different search or add a new record."/>}<p className="px-5 py-3 border-t dark:border-white/10 text-xs muted">Showing {rows.length} records · Changes persist locally in demo mode</p></Card>
    <Modal open={!!form} onClose={()=>setForm(null)} title={form?.id?'Edit record':'Add record'} description={privateView?'Confidential support profile. Collect only information needed to deliver accommodations.':'Keep institutional records accurate and up to date.'} footer={<><button className="btn-secondary" onClick={()=>setForm(null)}>Cancel</button><button form="record-form" type="submit" className="btn-primary">Save record</button></>}>
      {form&&<form id="record-form" onSubmit={save} className="space-y-4">{errors&&<p role="alert" className="text-sm text-rose-600">{errors}</p>}{fields.map(f=><div key={f.key}><label htmlFor={`record-${f.key}`} className="label">{f.label}{f.required?' *':''}</label>{f.options?<select id={`record-${f.key}`} className="input" value={form[f.key]??''} onChange={e=>setForm({...form,[f.key]:e.target.value})} required={f.required}><option value="">Select…</option>{(f.options==='departments'?db.departments.map(d=>d.code):f.options).map(v=><option key={v}>{v}</option>)}</select>:<input id={`record-${f.key}`} className="input" type={f.type==='list'?'text':f.type || 'text'} maxLength={f.type==='list'?3000:254} step={f.key==='gpa'?'0.1':f.type==='number'?'1':undefined} min={f.min} max={f.max} value={form[f.key]??''} required={f.required} onChange={e=>setForm({...form,[f.key]:e.target.value})}/ >}{f.type==='list'&&<p className="text-[11px] muted mt-1">Separate items with semicolons.</p>}</div>)}</form>}
    </Modal>
  </div>;
}
