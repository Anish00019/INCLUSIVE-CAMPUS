import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { rateLimit } from 'express-rate-limit';
import * as M from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncRoute as run, HttpError, issueToken, encrypt, decrypt } from '../security.js';

const router = Router();
const id = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid record identifier');
const passwordSchema = z.string().min(10).max(72).refine(value=>Buffer.byteLength(value,'utf8')<=72,'Password must not exceed 72 UTF-8 bytes.');
const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value=>!Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10)===value,'Invalid calendar date');
const str = (min = 1, max = 500) => z.string().trim().min(min).max(max);
const object = fields => z.object(fields).strict();
const parse = (schema, data) => schema.parse(data);
const same = (a, b) => String(a) === String(b);
const publicUser = u => ({ id: u.id, name: u.name, email: u.email, role: u.role });
const log = (user, action, resource) => M.AuditLog.create({ actor: user._id, action, resource: String(resource) });
const find = async (Model, recordId) => {
  parse(id, recordId);
  const row = await Model.findById(recordId);
  if (!row) throw new HttpError(404, 'Record not found.');
  return row;
};
const studentFor = async user => {
  const student = await M.StudentProfile.findOne({ user: user._id });
  if (!student) throw new HttpError(404, 'Student profile not found. Contact the registrar.');
  return student;
};
// Faculty are restricted to their own subjects. Students are restricted to their enrolled course.
async function subjectAccess(user, subjectId) {
  const subject = await find(M.Subject, subjectId);
  if (user.role === 'faculty' && !same(subject.faculty, user._id)) throw new HttpError(403, 'Subject is not assigned to you.');
  if (user.role === 'student') {
    const student = await studentFor(user);
    if (!student.course || !same(student.course, subject.course)) throw new HttpError(403, 'You are not enrolled in this course.');
  }
  return subject;
}
async function facultyRoster(user) {
  const faculty = await M.FacultyProfile.findOne({ user: user._id });
  return faculty?.assignedStudents || [];
}
const authLimits = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false });
router.post('/auth/register', authLimits, run(async (req, res) => {
  // Public registration can NEVER provision a privileged account.
  const body = parse(object({ name: str(2, 100), email: z.string().email().max(254).transform(s => s.toLowerCase()), password: passwordSchema, department: id, course: id.optional() }), req.body);
  if (!await M.Department.exists({ _id: body.department })) throw new HttpError(400, 'Unknown department.');
  if (body.course && !await M.Course.exists({_id:body.course,department:body.department})) throw new HttpError(400,'Course does not belong to this department.');
  if (await M.User.exists({ email: body.email })) throw new HttpError(409, 'An account with this email already exists.');
  const user = await M.User.create({ name: body.name, email: body.email, passwordHash: await bcrypt.hash(body.password, 12), role: 'student' });
  try {
    await M.StudentProfile.create({ user: user._id, department: body.department, course: body.course, rollNo: `NEW-${user.id.slice(-8).toUpperCase()}` });
  } catch (error) { await M.User.deleteOne({ _id: user._id }); throw error; }
  res.status(201).json({ user: publicUser(user), token: issueToken(user) });
}));
router.post('/auth/login', authLimits, run(async (req, res) => {
  const body = parse(object({ email: z.string().email().max(254).transform(s => s.toLowerCase()), password: z.string().min(1).max(128) }), req.body);
  const user = await M.User.findOne({ email: body.email }).select('+passwordHash');
  // Constant bcrypt work even for unknown accounts.
  const valid = await bcrypt.compare(body.password, user?.passwordHash || '$2b$12$C6UzMDM.H6dfI/f/IKcEe.8y8iTXq5L/qlvxCdo.aL2e3k3BMwFP6');
  if (!user?.active || !valid) throw new HttpError(401, 'Incorrect email or password.');
  res.json({ user: publicUser(user), token: issueToken(user) });
}));
router.use(authenticate);
router.get('/auth/me', (req, res) => res.json({ user: publicUser(req.user) }));
router.post('/auth/logout', run(async (req, res) => { await M.User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } }); res.sendStatus(204); }));
router.patch('/auth/me', run(async (req, res) => {
  const body = parse(object({ name: str(2, 100) }), req.body);
  req.user.name = body.name; await req.user.save(); res.json({ user: publicUser(req.user) });
}));
router.post('/auth/password', authLimits, run(async (req, res) => {
  const body = parse(object({ currentPassword: z.string().max(128), password: passwordSchema }), req.body);
  const user = await M.User.findById(req.user._id).select('+passwordHash');
  if (!await bcrypt.compare(body.currentPassword, user.passwordHash)) throw new HttpError(401, 'Current password is incorrect.');
  user.passwordHash = await bcrypt.hash(body.password, 12); user.tokenVersion += 1; await user.save(); res.sendStatus(204);
}));

router.get('/students', authorize('student', 'faculty', 'support', 'admin'), run(async (req, res) => {
  const filter = {};
  if (req.user.role === 'student') filter.user = req.user._id;
  if (req.user.role === 'faculty') filter._id = { $in: await facultyRoster(req.user) };
  if (req.query.department) filter.department = parse(id, req.query.department);
  // Default projection omits diagnosis and accommodations. Faculty only receive consented accommodations.
  const rows = await M.StudentProfile.find(filter).populate('user', 'name email').select('-accommodations -phone').limit(200).lean();
  if (['student', 'support', 'faculty'].includes(req.user.role)) {
    const accommodations = await M.StudentProfile.find(filter).select('accommodations shareAccommodations').lean();
    rows.forEach(row => { const profile = accommodations.find(a => same(a._id, row._id)); if (req.user.role !== 'faculty' || profile?.shareAccommodations) row.accommodations = profile?.accommodations || []; });
  }
  res.json(rows);
}));
router.get('/students/:id/accessibility', run(async (req, res) => {
  const student = await find(M.StudentProfile, req.params.id);
  if (!student || (req.user.role !== 'support' && !(req.user.role === 'student' && same(student.user, req.user._id)))) throw new HttpError(403, 'Confidential support profile.');
  const record = await M.StudentProfile.findById(student._id).select('+accessibilityNotes');
  await log(req.user, 'read-accessibility-profile', student.id);
  res.json({ id: record.id, accommodations: record.accommodations, accessibilityNotes: record.accessibilityNotes || '' });
}));
router.patch('/students/:id/accessibility', authorize('support'), run(async (req, res) => {
  const body = parse(object({ accommodations: z.array(str(1, 300)).max(30), accessibilityNotes: z.string().max(10000).optional() }), req.body);
  const student = await find(M.StudentProfile, req.params.id);
  Object.assign(student, body); await student.save(); await log(req.user, 'update-accessibility-profile', student.id); res.sendStatus(204);
}));
router.patch('/students/me/sharing', authorize('student'), run(async (req,res)=>{
  const body=parse(object({shareAccommodations:z.boolean()}),req.body); const student=await studentFor(req.user); student.shareAccommodations=body.shareAccommodations;await student.save();res.sendStatus(204);
}));
router.patch('/students/:id', authorize('admin'), run(async (req, res) => {
  const body = parse(object({ department: id.optional(), course: id.optional(), year: z.number().int().min(1).max(8).optional(), semester: z.number().int().min(1).max(16).optional(), rollNo: str(1, 40).optional() }), req.body);
  const student = await find(M.StudentProfile, req.params.id); await validateReferences('students',{...student.toObject(),...body});Object.assign(student, body); await student.save(); await log(req.user, 'update-academic-profile', student.id); res.json({ id: student.id, rollNo: student.rollNo });
}));

async function validateReferences(path, body) {
  if(body.department && !await M.Department.exists({_id:body.department}))throw new HttpError(400,'Unknown department.');
  if(body.course && !await M.Course.exists({_id:body.course,...(body.department?{department:body.department}:{})}))throw new HttpError(400,'Unknown course or mismatched department.');
  if(body.faculty && !await M.User.exists({_id:body.faculty,role:'faculty',active:true}))throw new HttpError(400,'Faculty must be an active faculty account.');
  if(body.head && !await M.User.exists({_id:body.head,role:{$in:['faculty','admin']},active:true}))throw new HttpError(400,'Department head must be an active faculty or administrator.');
  if(body.subject && !await M.Subject.exists({_id:body.subject}))throw new HttpError(400,'Unknown subject.');
  if(path==='examinations' && body.subject && body.date && await M.Examination.exists({subject:body.subject,date:body.date,...(body._id?{_id:{$ne:body._id}}:{})}))throw new HttpError(409,'An examination already exists for this subject at this date.');
}

const schemas = {
  departments: { Model: M.Department, schema: object({name:str(),code:str(1,20),head:id.optional()}) },
  courses: { Model: M.Course, schema: object({name:str(),code:str(1,30),department:id,credits:z.number().int().min(1).max(300),duration:z.number().int().min(1).max(8)}) },
  subjects: { Model: M.Subject, schema: object({name:str(),code:str(1,30),course:id,faculty:id,semester:z.number().int().min(1).max(16),credits:z.number().int().min(1).max(20)}) },
  examinations: { Model: M.Examination, schema: object({subject:id,date:z.string().datetime(),hall:str(),start:str(),durationMinutes:z.number().int().min(1).max(600),type:z.enum(['Mid-semester','End-semester','Practical'])}) },
};
for (const [path, { Model, schema }] of Object.entries(schemas)) {
  router.get(`/${path}`, run(async (req, res) => {
    const filter={};
    if(path==='subjects' && req.user.role==='student'){const student=await studentFor(req.user); filter.course=student.course || null;}
    if(path==='subjects' && req.user.role==='faculty')filter.faculty=req.user._id;
    if(path==='examinations' && ['student','faculty'].includes(req.user.role)){
      let scope={faculty:req.user._id}; if(req.user.role==='student'){const student=await studentFor(req.user);scope={course:student.course||null};}
      filter.subject={$in:await M.Subject.find(scope).distinct('_id')};
    }
    res.json(await Model.find(filter).limit(200));
  }));
  router.post(`/${path}`, authorize('admin'), run(async (req, res) => { const body=parse(schema,req.body);await validateReferences(path,body);const record=await Model.create(body);await log(req.user,`create-${path}`,record.id);res.status(201).json(record); }));
  router.patch(`/${path}/:id`, authorize('admin'), run(async (req, res) => {const row=await find(Model,req.params.id);const body=parse(schema.partial(),req.body);await validateReferences(path,{...row.toObject(),...body});Object.assign(row,body);await row.save();await log(req.user,`update-${path}`,row.id);res.json(row);}));
}
router.get('/users', authorize('admin'), run(async (_req, res) => res.json(await M.User.find().select('name email role active').limit(200))));
router.post('/users', authorize('admin'), run(async (req,res)=>{
  const body=parse(object({name:str(2,100),email:z.string().email().max(254).transform(s=>s.toLowerCase()),password:passwordSchema,role:z.enum(['student','faculty','support','admin'])}),req.body);
  const user=await M.User.create({name:body.name,email:body.email,role:body.role,passwordHash:await bcrypt.hash(body.password,12)});await log(req.user,'provision-user',user.id);res.status(201).json(publicUser(user));
}));
router.patch('/users/:id', authorize('admin'), run(async (req,res)=>{
  const body=parse(object({active:z.boolean().optional(),role:z.enum(['student','faculty','support','admin']).optional()}),req.body);
  if(same(req.user._id,req.params.id))throw new HttpError(400,'You cannot change your own role or deactivate your own account.');
  const user=await find(M.User,req.params.id);Object.assign(user,body);user.tokenVersion+=1;await user.save();await log(req.user,'change-user-access',user.id);res.json(publicUser(user));
}));

router.get('/support-requests', run(async (req, res) => {
  const filter = {};
  if (req.user.role === 'student') filter.student = (await studentFor(req.user))._id;
  if (req.user.role === 'faculty') filter.student = { $in: await facultyRoster(req.user) };
  if (req.query.status) filter.status = parse(z.enum(M.STATUSES), req.query.status);
  let query = M.SupportRequest.find(filter).sort({ createdAt: -1 }).limit(200);
  if (['support', 'student'].includes(req.user.role)) query = query.select('+description');
  const rows = await query;
  res.json(rows.map(row => {
    const out = row.toJSON();
    if (['support', 'student'].includes(req.user.role)) out.description = row.description;
    else { delete out.documents; out.timeline=out.timeline.map(e=>({status:e.status,at:e.at})); }
    return out;
  }));
}));
router.post('/support-requests', authorize('student'), run(async (req, res) => {
  const body = parse(object({ category: z.enum(M.CATEGORIES), description: str(10, 10000), priority: z.enum(['Low', 'Medium', 'High']).default('Medium') }), req.body);
  const student = await studentFor(req.user);
  const record = await M.SupportRequest.create({ ...body, student: student._id, timeline: [{ status: 'Submitted', note: 'Request submitted.', by: req.user._id }] });
  await log(req.user, 'create-support-request', record.id);
  res.status(201).json({ id: record.id, status: record.status });
}));
router.patch('/support-requests/:id', authorize('support'), run(async (req, res) => {
  const body = parse(object({ status: z.enum(M.STATUSES), note: str(3, 3000), assignedTo: id.nullable().optional() }), req.body);
  const record = await find(M.SupportRequest, req.params.id);
  if (body.assignedTo && !await M.User.exists({ _id: body.assignedTo, role: 'support', active: true })) throw new HttpError(400, 'Assignee must be an active support team member.');
  record.status = body.status;
  if (body.assignedTo !== undefined) record.assignedTo = body.assignedTo;
  record.timeline.push({ status: body.status, note: body.note, by: req.user._id });
  await record.save();
  const student = await M.StudentProfile.findById(record.student);
  await M.Notification.create({ user: student.user, title: 'Support request updated', body: `Status: ${body.status}. Open your request to read the update.`, link: '/support/track' });
  await log(req.user, 'update-support-request', record.id); res.json({ id: record.id, status: record.status });
}));
async function documentAccess(req) {
  const record = await find(M.SupportRequest, req.params.id);
  const student = await M.StudentProfile.findById(record.student);
  if (!student || (req.user.role !== 'support' && !(req.user.role === 'student' && same(student.user, req.user._id)))) throw new HttpError(403, 'Documents are confidential.');
  return record;
}
router.post('/support-requests/:id/documents', authorize('student', 'support'), run(async (req,res)=>{
  const record=await documentAccess(req);
  const body=parse(object({name:str(1,200).refine(s=>![...s].some(c=>c.charCodeAt(0)<32||c==='/'||c==='\\'),'Unsafe filename'),mime:z.enum(['application/pdf','image/png','image/jpeg','text/plain']),data:z.string().max(1400000).regex(/^[A-Za-z0-9+/]*={0,2}$/)}),req.body);
  const bytes=Buffer.from(body.data,'base64');
  if(!bytes.length || bytes.length>1000000)throw new HttpError(400,'Documents must be between 1 byte and 1 MB.');
  // Validate signatures; this is not a substitute for deployment malware scanning.
  const hex=bytes.subarray(0,8).toString('hex');
  if((body.mime==='application/pdf'&&!bytes.subarray(0,5).equals(Buffer.from('%PDF-'))) || (body.mime==='image/png'&&hex!=='89504e470d0a1a0a') || (body.mime==='image/jpeg'&&!hex.startsWith('ffd8ff')) || (body.mime==='text/plain'&&bytes.includes(0)))throw new HttpError(400,'File content does not match its declared type.');
  if(record.documents.length>=3)throw new HttpError(400,'Maximum three documents per request.');
  record.documents.push({name:body.name,mime:body.mime,size:bytes.length,encryptedData:encrypt(body.data)});await record.save();await log(req.user,'upload-confidential-document',record.id);res.status(201).json({documents:record.documents.map(d=>({id:d.id,name:d.name,mime:d.mime,size:d.size}))});
}));
router.get('/support-requests/:id/documents/:documentId', run(async(req,res)=>{
  await documentAccess(req);parse(id,req.params.documentId);
  const record=await M.SupportRequest.findById(req.params.id).select('+documents.encryptedData');
  const doc=record.documents.id(req.params.documentId);if(!doc)throw new HttpError(404,'Document not found.');
  await log(req.user,'download-confidential-document',`${record.id}/${doc.id}`);
  res.set({'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename="document-${doc.id}"`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).send(Buffer.from(decrypt(doc.encryptedData),'base64'));
}));

router.get('/attendance', authorize('student','faculty','admin'), run(async(req,res)=>{
  const filter={};
  if(req.user.role==='student')filter.student=(await studentFor(req.user))._id;
  if(req.user.role==='faculty')filter.subject={$in:await M.Subject.find({faculty:req.user._id}).distinct('_id')};
  res.json(await M.Attendance.find(filter).sort({date:-1}).limit(500));
}));
router.post('/attendance', authorize('faculty'), run(async(req,res)=>{
  const body=parse(object({subject:id,date:calendarDate,marks:z.array(object({student:id,status:z.enum(['Present','Absent','Excused'])})).min(1).max(200)}),req.body);
  if(new Set(body.marks.map(m=>m.student)).size!==body.marks.length)throw new HttpError(400,'Duplicate student in attendance marks.');
  const subject = await subjectAccess(req.user,body.subject);
  const enrolled=await M.StudentProfile.countDocuments({_id:{$in:body.marks.map(m=>m.student)},course:subject.course});
  if(enrolled!==body.marks.length)throw new HttpError(400,'Attendance roster includes a student outside this course.');
  const assigned=await facultyRoster(req.user);
  if(body.marks.some(m=>!assigned.some(s=>same(s,m.student))))throw new HttpError(403,'Attendance includes a student not assigned to you.');
  await M.Attendance.bulkWrite(body.marks.map(m=>({updateOne:{filter:{subject:body.subject,date:body.date,student:m.student},update:{$set:{status:m.status,recordedBy:req.user._id}},upsert:true}})));
  await log(req.user,'record-attendance',body.subject);res.json({saved:body.marks.length});
}));
router.get('/assignments', authorize('student','faculty','admin'), run(async(req,res)=>{
  let subjects;
  if(req.user.role==='faculty')subjects=await M.Subject.find({faculty:req.user._id}).distinct('_id');
  if(req.user.role==='student'){const student=await studentFor(req.user);subjects=await M.Subject.find({course:student.course||null}).distinct('_id');}
  const assignments=await M.Assignment.find(subjects?{subject:{$in:subjects}}:{}).limit(200).lean();
  if(req.user.role==='student'){const student=await studentFor(req.user);assignments.forEach(a=>{a.submissions=a.submissions.filter(s=>same(s.student,student._id));});}
  res.json(assignments);
}));
router.post('/assignments', authorize('faculty'), run(async(req,res)=>{
  const body=parse(object({title:str(),description:z.string().max(10000),subject:id,due:z.string().datetime(),maxMarks:z.number().int().min(1).max(1000)}),req.body);await subjectAccess(req.user,body.subject);res.status(201).json(await M.Assignment.create({...body,createdBy:req.user._id}));
}));
router.post('/assignments/:id/submit', authorize('student'), run(async(req,res)=>{
  const body=parse(object({text:str(1,20000)}),req.body);const a=await find(M.Assignment,req.params.id);await subjectAccess(req.user,String(a.subject));const s=await studentFor(req.user);
  if(a.submissions.some(x=>same(x.student,s._id)))throw new HttpError(409,'You have already submitted this assignment.');
  const result=await M.Assignment.updateOne({_id:a._id,'submissions.student':{$ne:s._id}},{$push:{submissions:{student:s._id,text:body.text,submittedAt:new Date()}}},{runValidators:true});if(!result.modifiedCount)throw new HttpError(409,'You have already submitted this assignment.');res.sendStatus(204);
}));
router.patch('/assignments/:id/grade', authorize('faculty'), run(async(req,res)=>{
  const body=parse(object({student:id,marks:z.number().min(0),feedback:z.string().max(5000).default('')}),req.body);const a=await find(M.Assignment,req.params.id);await subjectAccess(req.user,String(a.subject));
  if(body.marks>a.maxMarks)throw new HttpError(400,'Marks exceed maximum.');const sub=a.submissions.find(s=>same(s.student,body.student));if(!sub)throw new HttpError(404,'Submission not found.');
  sub.marks=body.marks;sub.feedback=body.feedback;await a.save();const student=await M.StudentProfile.findById(body.student);await M.Notification.create({user:student.user,title:'Assignment graded',body:`${a.title}: ${body.marks}/${a.maxMarks}`,link:'/assignments'});res.sendStatus(204);
}));
router.get('/study-materials', authorize('student','faculty','admin'), run(async(req,res)=>{
  let filter={};if(req.user.role==='faculty')filter.subject={$in:await M.Subject.find({faculty:req.user._id}).distinct('_id')};
  if(req.user.role==='student'){const student=await studentFor(req.user);filter.subject={$in:await M.Subject.find({course:student.course||null}).distinct('_id')};}
  res.json(await M.StudyMaterial.find(filter).limit(200));
}));
router.post('/study-materials', authorize('faculty'), run(async(req,res)=>{
  const body=parse(object({title:str(),subject:id,type:z.enum(['Notes','Video','Audio','Document','Slides']),content:z.string().max(100000),transcript:z.string().max(100000).optional(),captions:z.string().max(100000).optional()}),req.body);await subjectAccess(req.user,body.subject);
  if(['Video','Audio'].includes(body.type)&&!body.transcript?.trim())throw new HttpError(400,'Recorded media must include a transcript.');
  res.status(201).json(await M.StudyMaterial.create({...body,uploadedBy:req.user._id}));
}));
router.get('/messages', run(async(req,res)=>res.json(await M.Message.find({$or:[{sender:req.user._id},{recipient:req.user._id}]}).sort({createdAt:-1}).limit(200))));
router.post('/messages', run(async(req,res)=>{
  const body=parse(object({recipient:id,text:str(1,10000)}),req.body);const recipient=await find(M.User,body.recipient);
  if(!recipient.active)throw new HttpError(400,'Recipient is inactive.');
  if(req.user.role==='student'&& !['faculty','support'].includes(recipient.role))throw new HttpError(403,'Students may message faculty or support staff.');
  if(req.user.role==='faculty'&&recipient.role==='student'){const roster=await facultyRoster(req.user);if(!await M.StudentProfile.exists({_id:{$in:roster},user:recipient._id}))throw new HttpError(403,'Student is not assigned to you.');}
  res.status(201).json(await M.Message.create({...body,sender:req.user._id}));
}));
router.patch('/messages/:id/read', run(async(req,res)=>{const m=await find(M.Message,req.params.id);if(!same(m.recipient,req.user._id))throw new HttpError(403,'Not your message.');m.readAt=new Date();await m.save();res.sendStatus(204);}));
router.get('/notifications', run(async(req,res)=>res.json(await M.Notification.find({user:req.user._id}).sort({createdAt:-1}).limit(100))));
router.patch('/notifications/read', run(async(req,res)=>{const body=parse(object({id:id.optional()}),req.body);await M.Notification.updateMany({user:req.user._id,...(body.id?{_id:body.id}:{})},{$set:{read:true}});res.sendStatus(204);}));
router.delete('/notifications', run(async(req,res)=>{await M.Notification.deleteMany({user:req.user._id});res.sendStatus(204);}));
const preferencesSchema=object({fontScale:z.number().min(0.85).max(1.5).optional(),theme:z.enum(['light','dark']).optional(),highContrast:z.boolean().optional(),dyslexic:z.boolean().optional(),highlightLinks:z.boolean().optional(),reduceMotion:z.boolean().optional(),readingMode:z.boolean().optional(),visualAlerts:z.boolean().optional()});
router.get('/accessibility-preferences', run(async(req,res)=>res.json(await M.AccessibilityPreference.findOne({user:req.user._id})||{})));
router.put('/accessibility-preferences', run(async(req,res)=>res.json(await M.AccessibilityPreference.findOneAndUpdate({user:req.user._id},{$set:parse(preferencesSchema,req.body)},{new:true,upsert:true,runValidators:true}))));
router.get('/reports', authorize('support','admin'), run(async(req,res)=>{
  const studentFilter={};if(req.query.department)studentFilter.department=parse(id,req.query.department);if(req.query.year)studentFilter.year=parse(z.coerce.number().int().min(1).max(8),req.query.year);
  const students=await M.StudentProfile.find(studentFilter).select('_id department year');const filter={student:{$in:students.map(s=>s._id)}};if(req.query.status)filter.status=parse(z.enum(M.STATUSES),req.query.status);
  const requests=await M.SupportRequest.find(filter).select('category status student').lean();
  res.json({students:students.length,studentsRequestingSupport:new Set(requests.map(r=>String(r.student))).size,requests:requests.length,byStatus:M.STATUSES.map(status=>({status,count:requests.filter(r=>r.status===status).length})),byCategory:M.CATEGORIES.map(category=>({category,count:requests.filter(r=>r.category===category).length}))});
}));
router.get('/audit-logs', authorize('admin'), run(async(_req,res)=>res.json(await M.AuditLog.find().sort({createdAt:-1}).limit(200))));
export default router;
