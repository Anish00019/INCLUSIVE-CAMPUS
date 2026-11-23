// @vitest-environment node
// HTTP/middleware/authorisation tests with explicit model stubs, NOT MongoDB integration.
import {beforeEach,describe,it,expect,vi} from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import {createApp} from '../../server/app.js';
import * as M from '../../server/models/index.js';
import {issueToken,validateEnvironment} from '../../server/security.js';
const uid='507f1f77bcf86cd799439011',other='507f1f77bcf86cd799439012',sid='507f1f77bcf86cd799439013';
process.env.JWT_SECRET='qa-test-secret-'.repeat(5);process.env.DATA_ENCRYPTION_KEY='b'.repeat(64);
let user,app;
beforeEach(()=>{user=new M.User({_id:uid,name:'QA Tester',email:'qa@example.edu',role:'student',active:true,tokenVersion:0});vi.spyOn(M.User,'findById').mockImplementation(async id=>String(id)===uid?user:new M.User({_id:id,role:'support',name:'Team',email:'team@example.edu',active:true}));app=createApp();});
const auth=()=>({Authorization:`Bearer ${issueToken(user)}`});
describe('Supertest API boundaries (model stubs)',()=>{
  it('returns the authenticated public user without a password hash',async()=>{const res=await request(app).get('/api/auth/me').set(auth());expect(res.status).toBe(200);expect(res.body.user.role).toBe('student');expect(JSON.stringify(res.body)).not.toContain('passwordHash');});
  it('rejects an expired JWT',async()=>{const token=jwt.sign({sub:uid,v:0},process.env.JWT_SECRET,{expiresIn:-1,issuer:'inclusive-campus',audience:'campus-api'});expect((await request(app).get('/api/auth/me').set('Authorization',`Bearer ${token}`)).status).toBe(401);});
  it('rejects a revoked JWT',async()=>{const token=issueToken(user);user.tokenVersion=1;expect((await request(app).get('/api/auth/me').set('Authorization',`Bearer ${token}`)).status).toBe(401);});
  it('rejects inactive accounts',async()=>{user.active=false;expect((await request(app).get('/api/auth/me').set(auth())).status).toBe(401);});
  it('rejects malformed signed subject IDs without a database cast',async()=>{const token=jwt.sign({sub:'not-an-object-id',v:0},process.env.JWT_SECRET,{issuer:'inclusive-campus',audience:'campus-api'});expect((await request(app).get('/api/auth/me').set('Authorization',`Bearer ${token}`)).status).toBe(401);});
  it.each(['student','faculty','admin'])('%s cannot update confidential support requests',async role=>{user.role=role;expect((await request(app).patch(`/api/support-requests/${sid}`).set(auth()).send({status:'Approved',note:'Approved by test.'})).status).toBe(403);});
  it.each(['faculty','admin'])('%s cannot read confidential accessibility profiles',async role=>{user.role=role;vi.spyOn(M.StudentProfile,'findById').mockResolvedValue(new M.StudentProfile({_id:sid,user:other}));expect((await request(app).get(`/api/students/${sid}/accessibility`).set(auth())).status).toBe(403);});
  it('student cannot read another student accessibility profile',async()=>{vi.spyOn(M.StudentProfile,'findById').mockResolvedValue(new M.StudentProfile({_id:sid,user:other}));expect((await request(app).get(`/api/students/${sid}/accessibility`).set(auth())).status).toBe(403);});
  it.each(['student','faculty','admin'])('%s cannot download an unowned confidential document',async role=>{user.role=role;vi.spyOn(M.SupportRequest,'findById').mockResolvedValue(new M.SupportRequest({_id:sid,student:other}));vi.spyOn(M.StudentProfile,'findById').mockResolvedValue(new M.StudentProfile({_id:other,user:other}));expect((await request(app).get(`/api/support-requests/${sid}/documents/${other}`).set(auth())).status).toBe(403);});
  it('rejects forged owner/status in support submission',async()=>{expect((await request(app).post('/api/support-requests').set(auth()).send({student:other,status:'Approved',category:'Other',description:'A valid long description.'})).status).toBe(400);});
  it('rejects an empty message before looking up a recipient',async()=>{expect((await request(app).post('/api/messages').set(auth()).send({recipient:other,text:'  '})).status).toBe(400);});
  it('rejects a message over the maximum length',async()=>{expect((await request(app).post('/api/messages').set(auth()).send({recipient:other,text:'x'.repeat(10001)})).status).toBe(400);});
  it('rejects body-based NoSQL injection',async()=>{expect((await request(app).post('/api/auth/login').send({email:{$ne:null},password:'password'})).status).toBe(400);});
  it('rejects query-based NoSQL injection',async()=>{expect((await request(app).get('/api/students?department[$ne]=null').set(auth())).status).toBe(400);});
  it('recipient ownership is required to mark a message read',async()=>{vi.spyOn(M.Message,'findById').mockResolvedValue(new M.Message({_id:sid,sender:uid,recipient:other,text:'Private'}));expect((await request(app).patch(`/api/messages/${sid}/read`).set(auth())).status).toBe(403);});
  it('does not allow an administrator to deactivate their own account',async()=>{user.role='admin';expect((await request(app).patch(`/api/users/${uid}`).set(auth()).send({active:false})).status).toBe(400);});
  it('rejects invalid calendar dates in attendance',async()=>{user.role='faculty';expect((await request(app).post('/api/attendance').set(auth()).send({subject:sid,date:'2026-02-30',marks:[{student:other,status:'Present'}]})).status).toBe(400);});
  it('rejects duplicate students in one attendance session',async()=>{user.role='faculty';expect((await request(app).post('/api/attendance').set(auth()).send({subject:sid,date:'2026-11-22',marks:[{student:other,status:'Present'},{student:other,status:'Absent'}]})).status).toBe(400);});
  it('rejects UTF-8 passwords that bcrypt would silently truncate',async()=>{expect((await request(app).post('/api/auth/register').send({name:'QA Example',email:'qa@example.edu',password:'😀'.repeat(30),department:sid})).status).toBe(400);});
  it('requires independent encryption and authentication keys',()=>{expect(()=>validateEnvironment({MONGODB_URI:'mongodb://localhost/test',JWT_SECRET:'a'.repeat(64),DATA_ENCRYPTION_KEY:'a'.repeat(64)})).toThrow(/different/);});
  it('omits permissive cross-origin credentials and disables caching',async()=>{const res=await request(app).get('/api/health').set('Origin','https://attacker.example');expect(res.headers['access-control-allow-origin']).toBeUndefined();expect(res.headers['cache-control']).toBe('no-store');expect(res.headers['x-content-type-options']).toBe('nosniff');});
  it.each([
    ['empty','text/plain','',400],
    ['oversized','text/plain',Buffer.alloc(1000001,65).toString('base64'),400],
    ['forged PDF','application/pdf',Buffer.from('not a PDF').toString('base64'),400],
    ['forged PNG','image/png',Buffer.from('not a PNG').toString('base64'),400],
    ['binary text','text/plain',Buffer.from([0,1,2]).toString('base64'),400],
    ['unsupported','application/javascript',Buffer.from('alert(1)').toString('base64'),400],
  ])('rejects %s confidential document',async(_name,mime,data,status)=>{
    vi.spyOn(M.SupportRequest,'findById').mockResolvedValue(new M.SupportRequest({_id:sid,student:other}));
    vi.spyOn(M.StudentProfile,'findById').mockResolvedValue(new M.StudentProfile({_id:other,user:uid}));
    expect((await request(app).post(`/api/support-requests/${sid}/documents`).set(auth()).send({name:'evidence.txt',mime,data})).status).toBe(status);
  });
  it('rejects path traversal in attachment filenames',async()=>{
    vi.spyOn(M.SupportRequest,'findById').mockResolvedValue(new M.SupportRequest({_id:sid,student:other}));vi.spyOn(M.StudentProfile,'findById').mockResolvedValue(new M.StudentProfile({_id:other,user:uid}));
    expect((await request(app).post(`/api/support-requests/${sid}/documents`).set(auth()).send({name:'../../private.txt',mime:'text/plain',data:'dGVzdA=='})).status).toBe(400);
  });

});
