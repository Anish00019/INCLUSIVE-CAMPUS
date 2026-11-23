import mongoose from 'mongoose';
import { encrypt, decrypt } from '../security.js';
const { Schema } = mongoose;
const ref = model => ({ type: Schema.Types.ObjectId, ref: model, required: true });
const text = { type: String, trim: true, maxlength: 500 };
const options = { timestamps: true, optimisticConcurrency: true, toJSON: { virtuals: true, transform(_doc, ret) { delete ret.__v; delete ret.passwordHash; return ret; } } };
function model(name, fields, indexes = []) {
  const schema = new Schema(fields, options);
  indexes.forEach(([keys, opts]) => schema.index(keys, opts));
  return mongoose.model(name, schema);
}
export const User = model('User', {
  name: { ...text, required: true, maxlength: 100 },
  email: { type: String, lowercase: true, trim: true, required: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['student', 'faculty', 'support', 'admin'], default: 'student' },
  active: { type: Boolean, default: true }, tokenVersion: { type: Number, default: 0 },
});
export const Department = model('Department', { name: { ...text, required: true }, code: { type: String, required: true, unique: true }, head: { type: Schema.Types.ObjectId, ref: 'User' } });
export const Course = model('Course', { name: { ...text, required: true }, code: { ...text, required: true, unique:true }, department: ref('Department'), credits: { type: Number, min: 1, max: 300 }, duration: { type: Number, min: 1, max: 8 } });
export const StudentProfile = model('StudentProfile', {
  user: { ...ref('User'), unique: true }, rollNo: { type: String, required: true, unique: true },
  department: ref('Department'), course: { type: Schema.Types.ObjectId, ref: 'Course' },
  year: { type: Number, min: 1, max: 8, default: 1 }, semester: { type: Number, min: 1, max: 16, default: 1 },
  phone: { type: String, maxlength: 30 },
  // Encrypted at rest; never returned by generic academic record endpoints.
  accessibilityNotes: { type: String, select: false, set: encrypt, get: decrypt },
  accommodations: [{ type: String, maxlength: 300 }],
  shareAccommodations: { type: Boolean, default: false },
}, [[{ department: 1, year: 1 }, {}]]);
export const FacultyProfile = model('FacultyProfile', { user: { ...ref('User'), unique: true }, department: ref('Department'), designation: text, assignedStudents: [{ type: Schema.Types.ObjectId, ref: 'StudentProfile' }] });
export const Subject = model('Subject', { name: { ...text, required: true }, code: { ...text, required: true, unique:true }, course: ref('Course'), faculty: ref('User'), semester: { type: Number, min: 1, max: 16 }, credits: { type: Number, min: 1, max: 20 } });
export const Attendance = model('Attendance', { student: ref('StudentProfile'), subject: ref('Subject'), date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }, status: { type: String, enum: ['Present', 'Absent', 'Excused'], required: true }, recordedBy: ref('User') }, [[{ student: 1, subject: 1, date: 1 }, { unique: true }]]);
export const Assignment = model('Assignment', { title: { ...text, required: true }, description: { type: String, maxlength: 10000 }, subject: ref('Subject'), createdBy: ref('User'), due: { type: Date, required: true }, maxMarks: { type: Number, min: 1, max: 1000, required: true }, submissions: [{ student: ref('StudentProfile'), text: { type: String, maxlength: 20000 }, submittedAt: Date, marks: { type: Number, min: 0 }, feedback: { type: String, maxlength: 5000 } }] });
export const Examination = model('Examination', { subject: ref('Subject'), date: { type: Date, required: true }, hall: text, start: text, durationMinutes: { type: Number, min: 1, max: 600 }, type: { type: String, enum: ['Mid-semester', 'End-semester', 'Practical'] } });
export const StudyMaterial = model('StudyMaterial', { title: { ...text, required: true }, subject: ref('Subject'), uploadedBy: ref('User'), type: { type: String, enum: ['Notes', 'Video', 'Audio', 'Document', 'Slides'] }, content: { type: String, maxlength: 100000 }, transcript: { type: String, maxlength: 100000 }, captions: { type: String, maxlength: 100000 } });
export const STATUSES = ['Submitted', 'Under Review', 'Approved', 'In Progress', 'Completed', 'Rejected'];
export const CATEGORIES = ['Assistive Technology', 'Examination Accommodations', 'Accessible Classroom', 'Learning Materials', 'Mobility Assistance', 'Note-taking Assistance', 'Communication Support', 'Other'];
const documentSchema = new Schema({ name: { type: String, required: true, maxlength: 200 }, mime: { type: String, enum: ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'] }, encryptedData: { type: String, select: false }, size: Number });
export const SupportRequest = model('SupportRequest', {
  student: ref('StudentProfile'), category: { type: String, enum: CATEGORIES, required: true },
  description: { type: String, required: true, set: encrypt, get: decrypt, select: false },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: STATUSES, default: 'Submitted' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  documents: [documentSchema],
  timeline: [{ status: { type: String, enum: STATUSES }, note: { type: String, maxlength: 3000 }, by: ref('User'), at: { type: Date, default: Date.now } }],
}, [[{ student: 1, createdAt: -1 }, {}], [{ status: 1 }, {}]]);
export const Message = model('Message', { sender: ref('User'), recipient: ref('User'), text: { type: String, required: true, maxlength: 10000 }, readAt: Date }, [[{ sender: 1, recipient: 1, createdAt: -1 }, {}]]);
export const Notification = model('Notification', { user: ref('User'), title: { ...text, required: true }, body: { type: String, maxlength: 3000 }, link: { type: String, maxlength: 300 }, read: { type: Boolean, default: false } }, [[{ user: 1, createdAt: -1 }, {}]]);
export const AccessibilityPreference = model('AccessibilityPreference', { user: { ...ref('User'), unique: true }, fontScale: { type: Number, min: 0.85, max: 1.5, default: 1 }, theme: { type: String, enum: ['light', 'dark'], default: 'light' }, highContrast: Boolean, dyslexic: Boolean, highlightLinks: Boolean, reduceMotion: Boolean, readingMode: Boolean, visualAlerts: Boolean });
export const AuditLog = model('AuditLog', { actor: ref('User'), action: { ...text, required: true }, resource: text });
