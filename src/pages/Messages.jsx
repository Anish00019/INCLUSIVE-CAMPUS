import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessagesSquare, Send, Paperclip, Plus, ArrowLeft, Phone, Video, ShieldCheck, Info, CheckCheck, ChevronRight, Megaphone, LifeBuoy } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { Card, Avatar, EmptyState } from '../components/common/ui';
import SearchInput from '../components/common/SearchInput';
import Modal from '../components/common/Modal';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { timeAgo, cn, fmtDate } from '../utils/helpers';
import useDocumentTitle from '../hooks/useDocumentTitle';

const QUICK_REPLIES = ['Thank you, noted.', 'Could we schedule a meeting?', 'Please share the materials in an accessible format.', 'I have attached the requested document.'];

export default function Messages() {
  useDocumentTitle('Messages');
  const { db, actions } = useData();
  const { role } = useAuth();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [mobileChat, setMobileChat] = useState(false);
  const bottomRef = useRef(null);

  const threads = useMemo(()=>db?.messageThreads || [],[db]);
  useEffect(() => {
    if (!activeId && threads.length) setActiveId(threads[0].id);
  }, [threads, activeId]);

  const active = threads.find((t) => t.id === activeId);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [active?.messages?.length, activeId]);

  const filtered = useMemo(() => {
    if (!q.trim()) return threads;
    const t = q.toLowerCase();
    return threads.filter((th) => `${th.with} ${th.role} ${th.messages.map((m) => m.text).join(' ')}`.toLowerCase().includes(t));
  }, [threads, q]);

  const send = (e) => {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    try {actions.sendMessage(active.id, draft.trim());setDraft('');toast.success('Message saved', `Added to the demo conversation with ${active.with}.`);}
    catch(error){toast.error('Message not sent',error.message);}
  };

  const contacts = useMemo(() => {
    if (!db) return [];
    if (role === 'student') {
      return [
        ...db.faculty.map((f) => ({ id: f.id, name: f.name, role: `${f.designation} · ${f.department}`, color: 'from-emerald-500 to-teal-600' })),
        ...db.supportStaff.slice(0, 2).map((s) => ({ id: s.id, name: s.name, role: s.role, color: 'from-violet-500 to-purple-600' })),
      ];
    }
    if (role === 'faculty') {
      return db.students.slice(0, 8).map((s) => ({ id: s.id, name: s.name, role: `${s.rollNo} · ${s.department}`, color: 'from-blue-500 to-indigo-600' }));
    }
    return [...db.faculty, ...db.students.slice(0, 5)].map((p) => ({ id: p.id, name: p.name, role: p.designation || `${p.rollNo} · ${p.department}`, color: 'from-slate-500 to-slate-700' }));
  }, [db, role]);

  const startThread = () => {
    if (!recipient) { toast.error('Choose a recipient'); return; }
    const c = contacts.find((x) => x.id === recipient);
    if (!c) return;
    const t = actions.startThread({ with: c.name, withId: c.id, role: c.role, avatarColor: c.color });
    setActiveId(t.id);
    setNewOpen(false);
    setMobileChat(true);
    toast.success('Conversation opened', `You can now message ${c.name}.`);
  };

  const announcements = db?.announcements || [];

  if (!db) return null;

  return (
    <div>
      <PageHeader
        title="Messages"
        description="Accessible, text-based conversations with faculty and the support team — with read receipts and no audio required."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Messages' }]}
        icon={MessagesSquare}
        actions={<button onClick={() => setNewOpen(true)} className="btn-primary text-sm"><Plus className="h-4 w-4" aria-hidden="true" /> New message</button>}
      />

      <div className="grid lg:grid-cols-[320px_1fr_290px] gap-4">
        {/* thread list */}
        <Card className={cn('overflow-hidden flex-col', mobileChat ? 'hidden lg:flex' : 'flex')}>
          <div className="p-3 border-b border-slate-100 dark:border-white/10">
            <SearchInput value={q} onChange={setQ} placeholder="Search conversations…" label="Search messages" id="msg-search" />
          </div>
          <div className="flex-1 overflow-y-auto max-h-[62vh]">
            {filtered.length === 0 ? (
              <EmptyState icon={MessagesSquare} title="No conversations" description="Start a new message to reach faculty or support staff." />
            ) : filtered.map((t) => {
              const last = t.messages[t.messages.length - 1];
              return (
                <button
                  key={t.id} onClick={() => { setActiveId(t.id); setMobileChat(true); actions.markThreadRead(t.id); }}
                  className={cn('w-full text-left flex gap-3 px-3 py-3 border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors',
                    activeId === t.id && 'bg-navy-50/70 dark:bg-white/[0.07] border-l-2 border-l-navy-700')}
                >
                  <Avatar name={t.with} color={t.avatarColor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate flex-1">{t.with}</p>
                      <span className="text-[9px] text-slate-600 shrink-0">{last ? timeAgo(last.at) : ''}</span>
                    </div>
                    <p className="text-[10px] muted truncate">{t.role}</p>
                    <p className="text-[11px] muted truncate mt-0.5">{last?.from === 'me' ? 'You: ' : ''}{last?.text || 'No messages yet'}</p>
                  </div>
                  {t.unread > 0 && <span className="mt-1 h-2 w-2 rounded-full bg-brand-500 shrink-0" aria-label={`${t.unread} unread`} />}
                </button>
              );
            })}
          </div>
          <div className="p-3 border-t border-slate-100 dark:border-white/10">
            <button onClick={() => setNewOpen(true)} className="btn-secondary w-full text-xs"><Plus className="h-3.5 w-3.5" aria-hidden="true" /> New conversation</button>
          </div>
        </Card>

        {/* chat */}
        <Card className={cn('overflow-hidden flex-col', mobileChat ? 'flex' : 'hidden lg:flex')}>
          {active ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-white/10">
                <button onClick={() => setMobileChat(false)} className="btn-icon lg:hidden" aria-label="Back to conversations"><ArrowLeft className="h-4 w-4" /></button>
                <Avatar name={active.with} color={active.avatarColor} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{active.with}</p>
                  <p className="text-[10px] muted truncate">{active.role}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 px-2 py-1 text-[9px] font-bold"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online</span>
                  <button className="btn-icon" aria-label="Start voice call (demo)" onClick={() => toast.info('Voice calls unavailable', 'Text-based communication is always available.')}><Phone className="h-4 w-4" /></button>
                  <button className="btn-icon" aria-label="Start video call (demo)" onClick={() => toast.info('Video calls unavailable', 'Use captioned meetings from the Assistive Learning Hub.')}><Video className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-h-[46vh] min-h-[280px] bg-slate-50/50 dark:bg-white/[0.02]" aria-live="polite">
                {active.messages.length === 0 && (
                  <div className="h-full grid place-items-center text-center">
                    <div>
                      <MessagesSquare className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
                      <p className="text-xs muted mt-2">No messages yet. Say hello to {active.with.split(' ')[0]}.</p>
                    </div>
                  </div>
                )}
                {active.messages.map((m, i) => {
                  const mine = m.from === 'me';
                  const showDay = i === 0 || fmtDate(active.messages[i - 1].at) !== fmtDate(m.at);
                  return (
                    <div key={m.id}>
                      {showDay && <p className="text-center text-[9px] font-bold uppercase tracking-wider text-slate-600 my-2">{fmtDate(m.at)}</p>}
                      <div className={cn('flex gap-2', mine ? 'justify-end' : 'justify-start')}>
                        {!mine && <Avatar name={active.with} color={active.avatarColor} size="xs" className="mt-auto" />}
                        <div className={cn('max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm',
                          mine ? 'bg-navy-800 text-white rounded-br-md' : 'bg-white dark:bg-navy-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 rounded-bl-md')}>
                          <p>{m.text}</p>
                          <p className={cn('mt-1 text-[9px] flex items-center gap-1 justify-end', mine ? 'text-white/75' : 'text-slate-600 dark:!text-slate-200')}>
                            {new Date(m.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            {mine && <CheckCheck className="h-3 w-3" aria-label="Read" />}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="border-t border-slate-100 dark:border-white/10 p-3">
                <div className="flex gap-1.5 overflow-x-auto pb-2">
                  {QUICK_REPLIES.map((r) => (
                    <button key={r} onClick={() => setDraft(r)} className="rounded-full border border-slate-200 dark:border-white/15 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap hover:border-navy-300 hover:bg-slate-50 dark:hover:bg-white/10">{r}</button>
                  ))}
                </div>
                <form onSubmit={send} className="flex items-end gap-2">
                  <button type="button" className="btn-icon shrink-0" aria-label="Attach a file" onClick={() => toast.info('Demo attachment limitation','Binary attachments are not supported in messages. Use the support request document picker to attach demo metadata.')}><Paperclip className="h-4 w-4" /></button>
                  <div className="flex-1">
                    <label htmlFor="msg-input" className="sr-only">Write a message</label>
                    <textarea
                      id="msg-input" maxLength={10000} value={draft} onChange={(e) => setDraft(e.target.value)} rows={1}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e); } }}
                      placeholder="Write a message… (Enter to send, Shift+Enter for a new line)"
                      className="input resize-none py-2.5 max-h-24"
                    />
                  </div>
                  <button type="submit" disabled={!draft.trim()} className="btn-primary px-3 py-2.5 shrink-0" aria-label="Send message"><Send className="h-4 w-4" /></button>
                </form>
                <p className="text-[9px] muted mt-1.5 flex items-center gap-1"><ShieldCheck className="h-2.5 w-2.5" aria-hidden="true" /> Conversations are text-based by default — never audio-only.</p>
              </div>
            </>
          ) : (
            <EmptyState icon={MessagesSquare} title="Select a conversation" description="Choose someone from the list to start messaging." className="py-24" />
          )}
        </Card>

        {/* right rail */}
        <aside className="space-y-4 hidden lg:block">
          <Card>
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Megaphone className="h-4 w-4 text-amber-500" aria-hidden="true" /> Announcements</h2>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-white/10">
              {announcements.map((a) => (
                <li key={a.id} className="px-4 py-3">
                  <p className="text-[11px] font-bold text-slate-800 dark:text-white leading-snug">{a.title}</p>
                  <p className="text-[10px] muted mt-1 line-clamp-2 leading-relaxed">{a.body}</p>
                  <p className="text-[9px] text-slate-600 mt-1">{a.author} · {fmtDate(a.date)}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><LifeBuoy className="h-4 w-4 text-brand-600" aria-hidden="true" /> Need support?</h2>
            <p className="text-[11px] muted mt-1 leading-relaxed">The Disability Support Office replies to messages within one working day.</p>
            <Link to={role === 'student' ? '/support?new=1' : '/support-admin/requests'} className="btn-secondary text-xs w-full mt-2.5">Open a support request <ChevronRight className="h-3 w-3" aria-hidden="true" /></Link>
            <div className="mt-3 rounded-lg bg-slate-50 dark:bg-white/5 p-2.5">
              <p className="text-[10px] muted leading-relaxed flex items-start gap-1.5"><Info className="h-3 w-3 shrink-0 mt-0.5" aria-hidden="true" /> Prefer written communication? All updates are delivered as text and can be read aloud from any page.</p>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Your contacts</h2>
            <ul className="mt-2.5 space-y-2">
              {contacts.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <button onClick={() => { const t = actions.startThread({ with: c.name, withId: c.id, role: c.role, avatarColor: c.color }); setActiveId(t.id); toast.success('Conversation opened'); }} className="w-full flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-50 dark:hover:bg-white/5 text-left">
                    <Avatar name={c.name} color={c.color} size="xs" />
                    <span className="min-w-0 flex-1"><span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">{c.name}</span><span className="block text-[9px] muted truncate">{c.role}</span></span>
                    <ChevronRight className="h-3 w-3 text-slate-300" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>

      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="New message" description="Choose a recipient to start a conversation." size="sm"
        footer={<><button className="btn-secondary" onClick={() => setNewOpen(false)}>Cancel</button><button className="btn-primary" onClick={startThread} disabled={!recipient}>Start conversation</button></>}
      >
        <div>
          <label htmlFor="recipient" className="label">Recipient</label>
          <select id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="input">
            <option value="">Select a person…</option>
            {contacts.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.role}</option>)}
          </select>
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-2.5">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-[10px] muted leading-relaxed">Messages are text-based so they can be read with a screen reader or translated. Nothing is shared publicly.</p>
        </div>
      </Modal>
    </div>
  );
}
