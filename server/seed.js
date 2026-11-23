import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { validateEnvironment } from './security.js';
import * as M from './models/index.js';
validateEnvironment();
if (process.env.NODE_ENV === 'production') throw new Error('Demo seeding is disabled in production.');
if (!process.env.SEED_PASSWORD || process.env.SEED_PASSWORD.length < 10) throw new Error('Set SEED_PASSWORD to at least 10 characters for local demo accounts.');
await mongoose.connect(process.env.MONGODB_URI);
try {
  const department=await M.Department.findOneAndUpdate({code:'CSE'},{$setOnInsert:{name:'Computer Science & Engineering',code:'CSE'}},{upsert:true,new:true});
  const course=await M.Course.findOneAndUpdate({code:'BT-CSE'},{$setOnInsert:{name:'B.Tech Computer Science',code:'BT-CSE',department:department._id,duration:4,credits:160}},{upsert:true,new:true});
  const users={};
  for(const [role,name] of [['student','Aarav Sharma'],['faculty','Dr. Meera Iyer'],['support','Rohan Verma'],['admin','Dr. Kavita Menon']]) {
    users[role]=await M.User.findOneAndUpdate({email:`${role}@campus.edu`},{$setOnInsert:{name,email:`${role}@campus.edu`,role,passwordHash:await bcrypt.hash(process.env.SEED_PASSWORD,12)}},{upsert:true,new:true});
  }
  const student=await M.StudentProfile.findOneAndUpdate({user:users.student._id},{$setOnInsert:{user:users.student._id,department:department._id,course:course._id,rollNo:'CSE26-014',year:3,semester:5,accommodations:['Digital textbooks','Extra 30 minutes in examinations'],shareAccommodations:true}},{upsert:true,new:true});
  await M.FacultyProfile.findOneAndUpdate({user:users.faculty._id},{$setOnInsert:{user:users.faculty._id,department:department._id,designation:'Associate Professor',assignedStudents:[student._id]}},{upsert:true});
  const subject=await M.Subject.findOneAndUpdate({code:'CSE301'},{$setOnInsert:{name:'Data Structures',code:'CSE301',faculty:users.faculty._id,course:course._id,credits:4,semester:5}},{upsert:true,new:true});
  await M.StudyMaterial.findOneAndUpdate({title:'Introduction to accessible data structures'},{$setOnInsert:{title:'Introduction to accessible data structures',subject:subject._id,uploadedBy:users.faculty._id,type:'Notes',content:'A data structure organises information so it can be accessed and updated efficiently. An array stores elements in order. A linked list connects nodes with references. A tree represents hierarchical relationships.'}},{upsert:true});
  console.log('Local demo accounts and academic relationships created. Existing records were not overwritten.');
} finally { await mongoose.disconnect(); }
