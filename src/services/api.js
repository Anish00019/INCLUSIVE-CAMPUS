import bcrypt from 'bcryptjs';
import { requireText, emailAddress, phoneNumber, numericRange, dateOnly } from '../utils/validation';
import { REQUEST_STATUSES, REQUEST_CATEGORIES } from '../utils/helpers';
/* ------------------------------------------------------------------
   MOCK API LAYER
   -----------------
   This file is the single seam between the UI and data.
   Functions expose the demo-facing data contract alongside the bundled
   Express + MongoDB backend (see /server). To go live, replace the
   function bodies with an adapter to fetch('/api/...'). MongoDB IDs,
   relationships and per-student submissions need explicit mapping.
-------------------------------------------------------------------*/
import * as seed from './mockData';
import { uid } from '../utils/helpers';

const KEY = 'ic_db_v1';
const SESSION = 'ic_session_v1';
const PREFS = 'ic_prefs_v1';

const wait = (ms = 280) => new Promise((r) => setTimeout(r, ms));

const DEMO_HASH = '$2b$10$C8phnywbol0qNgnwJWi1fuvxoShxuqeDJme3UD282bdFTh2gaIMMS';
const SESSION_LENGTH = 2 * 60 * 60 * 1000;
function session() {
  try {
    const raw = localStorage.getItem(SESSION); if (!raw) return null;
    const value = JSON.parse(raw);
    if (!value || typeof value.userId!=='string' || !value.userId || !Number.isFinite(value.expiresAt) || value.expiresAt <= Date.now()) { localStorage.removeItem(SESSION); return null; }
    return value;
  } catch (error) { console.warn('Invalid demo session removed:', error.name); localStorage.removeItem(SESSION); return null; }
}
const activeUserId = () => session()?.userId;
const visibleNotification = n => !n.forUserId || n.forUserId === activeUserId();
const saveSession = id => localStorage.setItem(SESSION, JSON.stringify({userId:id, expiresAt:Date.now()+SESSION_LENGTH}));
function passwordValue(password) {
  if (typeof password !== 'string' || password.length < 8 || new TextEncoder().encode(password).length > 72) throw new Error('Password must have at least 8 characters and at most 72 UTF-8 bytes.');
  return password;
}

function buildSeed() {
  return structuredClone({
    users: seed.DEMO_ACCOUNTS.map(({ password: _password, ...u }) => u),
    credentials: seed.DEMO_ACCOUNTS.map((u) => ({ email: u.email.toLowerCase(), passwordHash: DEMO_HASH, userId: u.id })),
    departments: seed.departments,
    faculty: seed.faculty,
    supportStaff: seed.supportStaff,
    students: seed.students,
    subjects: seed.subjects,
    timetable: seed.timetable,
    attendance: seed.attendance,
    attendanceTrend: seed.attendanceTrend,
    assignments: seed.assignments,
    examinations: seed.examinations,
    performance: seed.performance,
    studyMaterials: seed.studyMaterials,
    supportRequests: seed.supportRequests,
    notifications: seed.notifications,
    announcements: seed.announcements,
    messageThreads: seed.messageThreads,
    yearlyAnalytics: seed.yearlyAnalytics,
    departmentAnalytics: seed.departmentAnalytics,
    categoryAnalytics: seed.categoryAnalytics,
    courses: [
      {id:'course_cse', name:'B.Tech Computer Science', code:'BT-CSE', department:'CSE', duration:4, credits:160, status:'Active'},
      {id:'course_ece', name:'B.Tech Electronics & Communication', code:'BT-ECE', department:'ECE', duration:4, credits:160, status:'Active'},
      {id:'course_bba', name:'Bachelor of Business Administration', code:'BBA', department:'BBA', duration:3, credits:120, status:'Active'}
    ],
    resources: [
      {id:'res_01', name:'Screen reader workstations', location:'Block C · Accessibility Lab', category:'Assistive Technology', total:12, available:8, status:'Available'},
      {id:'res_02', name:'Portable hearing loops', location:'Support Office', category:'Communication Support', total:8, available:5, status:'Available'},
      {id:'res_03', name:'Braille displays', location:'Library · Accessible Reading Room', category:'Learning Materials', total:6, available:2, status:'Available'},
      {id:'res_04', name:'Ergonomic desks', location:'Block A · Ground floor', category:'Mobility Assistance', total:15, available:10, status:'Available'}
    ],
    reports: [],
    attendanceSessions: [],
  });
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.students)) {
        const data = { ...buildSeed(), ...parsed };
        // One-time migration from the earlier fictional plaintext demo credential format.
        data.credentials = data.credentials.map(c => c.password ? {email:c.email,userId:c.userId,passwordHash:bcrypt.hashSync(c.password,10)} : c);
        return data;
      }
      throw new Error('Invalid demo data shape');
    }
  } catch (error) { console.warn('Demo data could not be loaded; restoring fictional sample:', error.name); }
  const db = buildSeed();
  localStorage.setItem(KEY, JSON.stringify(db));
  return db;
}

let db = load();
let lastSaved = structuredClone(db);
const persist = () => {
  try { localStorage.setItem(KEY, JSON.stringify(db)); lastSaved = structuredClone(db); }
  catch { db = structuredClone(lastSaved); throw new Error('Changes could not be saved. Browser storage is unavailable or full.'); }
};

export const resetDemoData = () => {
  localStorage.removeItem(KEY);
  db = load();
  return db;
};

/* --------------------------- auth ---------------------------- */
export const authApi = {
  async login({ email, password }) {
    await wait(450);
    email = emailAddress(email);
    const cred = db.credentials.find((c) => c.email === email);
    if (!cred || !await bcrypt.compare(password || '', cred.passwordHash)) {
      const err = new Error('Incorrect email or password. Try the demo accounts listed below.');
      err.status = 401;
      throw err;
    }
    const user = db.users.find((u) => u.id === cred.userId);
    if (!user) throw new Error('Account is unavailable. Contact the college administrator.');
    saveSession(user.id);
    return { user };
  },
  async register({ name, email, password, role = 'student', department, year, needs = [] }) {
    await wait(550);
    name = requireText(name, 'Name', 2, 100); email = emailAddress(email); passwordValue(password);
    numericRange(Number(year || 1), 'Academic year', 1, 4, true);
    if (department && !db.departments.some(d=>d.code===department)) throw new Error('Unknown department.');
    if (role !== 'student') throw new Error('Staff accounts must be provisioned by the college administrator.');
    if (db.credentials.some((c) => c.email === email.trim().toLowerCase())) {
      const err = new Error('An account with this email already exists.');
      err.status = 409;
      throw err;
    }
    const id = uid('u');
    const user = { id, role, name, email: email.trim().toLowerCase(), title: role === 'student' ? `${department || 'B.Tech'} · Year ${year || 1}` : role, avatarColor: 'from-blue-500 to-indigo-600' };
    db.users.push(user);
    db.credentials.push({ email, passwordHash: await bcrypt.hash(password,10), userId: id });
    if (role === 'student') {
      db.students.push({ id: uid('st'), userId: id, name, email, rollNo: `NEW-${uid('roll').toUpperCase()}`, department: department || 'CSE', year: Number(year) || 1, semester: (Number(year) || 1) * 2 - 1, gpa: 0, attendance: 0, mentor: 'f_01', phone: '', pendingSupportNeeds: needs, disability: 'Not disclosed', accommodations: [], status: 'Review', joined: new Date().toISOString().slice(0, 10), avatarColor: user.avatarColor });
    }
    persist();
    saveSession(id);
    return { user };
  },
  async me() {
    await wait(120);
    const current = session();
    if (!current) return null;
    const { userId } = current;
    return db.users.find((u) => u.id === userId) || null;
  },
  logout() { localStorage.removeItem(SESSION); },
  async changePassword(userId, currentPassword, password) {
    const credential = db.credentials.find(c => c.userId === userId);
    if (!credential || !await bcrypt.compare(currentPassword || '', credential.passwordHash)) throw new Error('Current password is incorrect.');
    passwordValue(password);
    credential.passwordHash = await bcrypt.hash(password,10); persist();
  },
  updateProfile(userId, patch) {
    patch = {name:requireText(patch.name, 'Name', 2, 100), email:emailAddress(patch.email),phone:phoneNumber(patch.phone),department:patch.department};
    const i = db.users.findIndex((u) => u.id === userId);
    if(i<0)throw new Error('Account not found.');
    if (patch.email) {
      patch.email = patch.email.trim().toLowerCase();
      if (db.users.some(u => u.id !== userId && u.email === patch.email)) throw new Error('This email is already in use.');
      const credential = db.credentials.find(c => c.userId === userId);
      if (credential) credential.email = patch.email;
    }
    if (i > -1) db.users[i] = { ...db.users[i], ...patch };
    const stu = db.students.find((s) => s.userId === userId);
    if (stu) {
      if (patch.name) stu.name = patch.name;
      if (patch.email) stu.email = patch.email;
      if (patch.phone !== undefined) stu.phone = patch.phone;
      if (patch.department) stu.department = patch.department;
    }
    persist();
    return db.users[i];
  },
};

/* --------------------------- data ---------------------------- */
export const dataApi = {
  async bootstrap() { await wait(150); return db; },

  studentFor(userId) { return db.students.find((s) => s.userId === userId); },
  facultyFor(userId) { return db.faculty.find((f) => f.userId === userId); },
  subject(id) { return db.subjects.find((s) => s.id === id); },
  facultyById(id) { return db.faculty.find((f) => f.id === id); },
  staffById(id) { return db.supportStaff.find((s) => s.id === id); },

  /* support requests */
  async createRequest(payload) {
    await wait(600);
    if ('status' in payload) throw new Error('Request status is assigned by the support office.');
    if (!db.students.some(s=>s.id===payload.studentId)) throw new Error('Student profile is missing.');
    if (!REQUEST_CATEGORIES.includes(payload.category)) throw new Error('Choose a valid request category.');
    requireText(payload.subject, 'Subject', 6, 110); requireText(payload.description, 'Description', 20, 800);
    if(db.supportRequests.some(r=>r.studentId===payload.studentId && r.subject===payload.subject && r.description===payload.description && !['Rejected','Completed'].includes(r.status)))throw new Error('An identical open request already exists. Track the existing request instead.');
    const id = `SR-${uid('request').toUpperCase()}`;
    const now = new Date().toISOString();
    const req = {
      id, createdAt: now, updatedAt: now, status: 'Submitted', assignedTo: null, documents: payload.documents || [],
      priority: payload.priority || 'Medium', timeline: [{ status: 'Submitted', at: now, note: 'Request submitted by student.' }],
      ...payload,
    };
    db.supportRequests.unshift(req);
    this.pushNotification({
      title: `Request ${id} received`, body: `We have received your ${payload.category.toLowerCase()} request. The support office will review it shortly.`,
      type: 'support', link: '/support/track', forUserId: db.students.find(s=>s.id===payload.studentId)?.userId,
    });
    persist();
    return req;
  },
  updateRequestStatus(requestId, status, note = '', assignedTo) {
    if (!REQUEST_STATUSES.includes(status))throw new Error('Invalid request status.');
    const req = db.supportRequests.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found.');
    const now = new Date().toISOString();
    req.status = status;
    req.updatedAt = now;
    if (assignedTo !== undefined) req.assignedTo = assignedTo;
    req.timeline.push({ status, at: now, note: note || `Status updated to ${status}.` });
    const stu = db.students.find((s) => s.id === req.studentId);
    if (stu?.userId) {
      db.notifications.unshift({ id: uid('n'), title: `Support request ${req.id} updated`, body: `Status changed to ${status}. ${note}`, time: now, createdAt: now, type: 'support', read: false, link: '/support/track', forUserId: stu.userId });
    }
    persist();
    return req;
  },
  assignStaff(requestId, staffId) {
    const req = db.supportRequests.find((r) => r.id === requestId);
    if (!req) return null;
    req.assignedTo = staffId;
    req.updatedAt = new Date().toISOString();
    req.timeline.push({ status: req.status, at: req.updatedAt, note: `Assigned to ${this.staffById(staffId)?.name || 'support staff'}.` });
    persist();
    return req;
  },

  remindAssignment(assignment) {
    this.pushNotification({ title: 'Assignment reminder', body: `${assignment.title} is due ${assignment.due}.`, type: 'assignment', link: '/assignments' });
  },
  /* notifications */
  pushNotification({ title, body, type = 'system', link = '/notifications', forUserId }) {
    const now = new Date().toISOString();
    db.notifications.unshift({ id: uid('n'), title, body, time: now, createdAt: now, type, read: false, link, forUserId });
    db.notifications = db.notifications.slice(0, 40);
    persist();
  },
  markNotificationRead(id) {
    const n = db.notifications.find((x) => x.id === id);
    if (n && visibleNotification(n)) { n.read = true; persist(); }
  },
  markAllRead() { db.notifications.filter(visibleNotification).forEach((n) => { n.read = true; }); persist(); },
  clearNotifications() { db.notifications = db.notifications.filter(n=>!visibleNotification(n)); persist(); },

  /* messages */
  sendMessage(threadId, text) {
    text = requireText(text,'Message',1,10000);
    const t = db.messageThreads.find((x) => x.id === threadId);
    if (!t) throw new Error('Conversation not found.');
    t.messages.push({ id: uid('m'), from: 'me', text, at: new Date().toISOString() });
    persist();
    return t;
  },
  markThreadRead(threadId) {
    const t = db.messageThreads.find((x) => x.id === threadId);
    if (t) { t.unread = 0; persist(); }
  },
  startThread({ with: name, withId, role, avatarColor }) {
    let t = db.messageThreads.find((x) => x.withId === withId);
    if (!t) {
      t = { id: uid('t'), with: name, withId, role, avatarColor: avatarColor || 'from-slate-500 to-slate-700', unread: 0, messages: [] };
      db.messageThreads.unshift(t);
      persist();
    }
    return t;
  },

  /* assignments & attendance (faculty actions) */
  createAssignment(payload) {
    const a = { id: uid('a'), status: 'Pending', marks: null, createdAt: new Date().toISOString(), ...payload };
    db.assignments.unshift(a);
    persist();
    return a;
  },
  gradeAssignment(id, marks, feedback = '') {
    const a = db.assignments.find((x) => x.id === id);
    if (a) { a.marks = Number(marks); a.feedback = feedback; a.status = 'Graded'; this.pushNotification({title:'Assignment graded',body:`${a.title}: ${a.marks}/${a.max}`,link:'/assignments',type:'assignment'}); persist(); }
    return a;
  },
  submitAssignment(id, note, documents) {
    const a = db.assignments.find((x) => x.id === id);
    if (a) { a.status = 'Submitted'; a.submissionNote = note || ''; a.submissionDocuments = documents || []; persist(); }
    return a;
  },
  recordAttendance({ subjectId, date, marks, by }) {
    dateOnly(date);
    if(!db.subjects.some(s=>s.id===subjectId))throw new Error('Choose a valid subject.');
    if(!Object.keys(marks).length || Object.values(marks).some(v=>!['present','absent'].includes(v)))throw new Error('Mark a valid roster.');
    const session = {
      id: uid('att'), subjectId, date,
      present: Object.values(marks).filter((v) => v === 'present').length,
      absent: Object.values(marks).filter((v) => v === 'absent').length,
      total: Object.keys(marks).length, marks, by, savedAt: new Date().toISOString(),
    };
    db.attendanceSessions ||= [];
    const previous = db.attendanceSessions.find(s => s.subjectId === subjectId && s.date === date);
    const row = db.attendance.find(a => a.subjectId === subjectId);
    if (row && marks.st_01) {
      if (!previous) row.held += 1;
      row.attended += (marks.st_01 === 'present' ? 1 : 0) - (previous?.marks?.st_01 === 'present' ? 1 : 0);
      row.percentage = Math.round(row.attended / row.held * 100);
    }
    db.students.forEach(student => {
      if (!marks[student.id]) return;
      student.attendanceHeld ??= 100;
      student.attendanceAttended ??= student.attendance;
      if (!previous) student.attendanceHeld += 1;
      student.attendanceAttended += (marks[student.id] === 'present' ? 1 : 0) - (previous?.marks?.[student.id] === 'present' ? 1 : 0);
      student.attendance = Math.round(student.attendanceAttended / student.attendanceHeld * 100);
    });
    db.attendanceSessions = db.attendanceSessions.filter(s => !(s.subjectId === subjectId && s.date === date));
    db.attendanceSessions.unshift(session);
    const primary=db.students.find(s=>s.id==='st_01');
    if(primary){const held=db.attendance.reduce((n,a)=>n+a.held,0);const attended=db.attendance.reduce((n,a)=>n+a.attended,0);primary.attendance=Math.round(attended/Math.max(1,held)*100);}
    // Do not discard correction keys: older sessions must remain idempotent.
    persist();
    return session;
  },
  markAttendance(subjectId, present) {
    const row = db.attendance.find((a) => a.subjectId === subjectId);
    if (row) {
      row.held += 1;
      if (present) row.attended += 1;
      row.percentage = Math.round((row.attended / row.held) * 100);
      persist();
    }
    return row;
  },

  /* study materials */
  addMaterial(payload) {
    const m = { id: uid('m'), date: new Date().toISOString().slice(0, 10), downloads: 0, captions: false, transcript: false, readingTime: 10, size: '1.0 MB', ...payload };
    const existing = db.studyMaterials.findIndex(x => x.id === m.id);
    if (existing >= 0) db.studyMaterials[existing] = m;
    else db.studyMaterials.unshift(m);
    persist();
    return m;
  },

  saveRecord(collection, payload) {
    const allowed = ['students', 'users', 'departments', 'courses', 'supportStaff', 'resources'];
    if (!allowed.includes(collection)) throw new Error('Invalid collection');
    payload = {...payload};
    payload.name = requireText(payload.name, 'Name', 2, 100);
    if(payload.email !== undefined)payload.email=emailAddress(payload.email);
    if(payload.phone !== undefined)phoneNumber(payload.phone);
    if (['students','users'].includes(collection) && db[collection].some(r=>r.id!==payload.id && r.email?.toLowerCase()===payload.email))throw new Error('Email is already in use.');
    if(collection==='students') {
      requireText(payload.rollNo,'Roll number',1,40);
      if(db.students.some(r=>r.id!==payload.id && r.rollNo.toLowerCase()===payload.rollNo.toLowerCase()))throw new Error('Roll number already exists.');
      for(const [key,min,max] of [['year',1,4],['semester',1,8],['gpa',0,10],['attendance',0,100]])numericRange(payload[key]??min,key,min,max,['year','semester'].includes(key));
    }
    if(payload.code && db[collection].some(r=>r.id!==payload.id && r.code?.toLowerCase()===payload.code.toLowerCase()))throw new Error('Code already exists.');
    if(collection==='resources' && Number(payload.available)>Number(payload.total))throw new Error('Available units cannot exceed total units.');
    const record = { ...payload, id: payload.id || uid(collection) };
    const index = db[collection].findIndex(r => r.id === record.id);
    if (index >= 0) db[collection][index] = record;
    else db[collection].push(record);
    persist(); return record;
  },

  /* settings */
  savePrefs(prefs) { localStorage.setItem(PREFS, JSON.stringify(prefs)); },
  loadPrefs() {
    try { return JSON.parse(localStorage.getItem(PREFS) || 'null'); } catch (error) { console.warn('Accessibility preferences could not be loaded:',error.name); return null; }
  },
  saveReport(report) {
    const r = { id: uid('r'), createdAt: new Date().toISOString(), ...report };
    db.reports.unshift(r);
    persist();
    return r;
  },
};

export default dataApi;
