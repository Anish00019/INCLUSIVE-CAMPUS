import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { encrypt, decrypt, validateEnvironment, issueToken, verifyToken } from '../server/security.js';
import { authorize } from '../server/middleware/auth.js';
import { createApp } from '../server/app.js';
import * as M from '../server/models/index.js';
process.env.JWT_SECRET=crypto.randomBytes(48).toString('hex');
process.env.DATA_ENCRYPTION_KEY=crypto.randomBytes(32).toString('hex');
let server,base;
before(async()=>{server=createApp().listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));base=`http://127.0.0.1:${server.address().port}`;});
after(()=>new Promise(resolve=>server.close(resolve)));

test('AES-GCM hides sensitive content and authenticates its ciphertext',()=>{
  const plain='Confidential accommodation request';const one=encrypt(plain),two=encrypt(plain);
  assert.notEqual(one,two);assert.ok(!one.includes(plain));assert.equal(decrypt(one),plain);
  const [iv,tag,body]=one.split('.');const bytes=Buffer.from(body,'base64');bytes[0]^=1;
  assert.throws(()=>decrypt([iv,tag,bytes.toString('base64')].join('.')));
});
test('JWTs expire, specify issuer and audience, and reject wrong algorithms',()=>{
  const user={_id:'507f1f77bcf86cd799439011',tokenVersion:2};const token=issueToken(user);const payload=verifyToken(token);
  assert.equal(payload.sub,user._id);assert.equal(payload.v,2);assert.equal(payload.exp-payload.iat,7200);
  assert.throws(()=>verifyToken(jwt.sign({sub:user._id},process.env.JWT_SECRET,{issuer:'attacker'})));
  assert.throws(()=>verifyToken(jwt.sign({sub:user._id},process.env.JWT_SECRET,{algorithm:'HS384'})));
});
test('startup requires independent strong authentication and encryption keys',()=>{
  assert.throws(()=>validateEnvironment({}));
  assert.throws(()=>validateEnvironment({MONGODB_URI:'mongodb://test',JWT_SECRET:'weak',DATA_ENCRYPTION_KEY:'x'}));
  assert.doesNotThrow(()=>validateEnvironment({MONGODB_URI:'mongodb://test',JWT_SECRET:'x'.repeat(32),DATA_ENCRYPTION_KEY:'a'.repeat(64)}));
});
test('role checks deny student, faculty and college admin access to support-only operations',()=>{
  for(const role of ['student','faculty','admin'])authorize('support')({user:{role}}, {}, error=>assert.equal(error.status,403));
  authorize('support')({user:{role:'support'}},{},error=>assert.equal(error,undefined));
});
test('all required data collections are modelled with validation',()=>{
  for(const name of ['User','StudentProfile','FacultyProfile','Department','Course','Subject','Attendance','Assignment','Examination','StudyMaterial','SupportRequest','Message','Notification','AccessibilityPreference'])assert.ok(M[name]?.schema);
  assert.equal(M.User.schema.path('passwordHash').options.select,false);
  assert.equal(M.StudentProfile.schema.path('accessibilityNotes').options.select,false);
  assert.equal(M.SupportRequest.schema.path('description').options.select,false);
  assert.ok(M.Attendance.schema.indexes().some(([,opts])=>opts.unique));
});
test('API reports unavailable database truthfully and sets security headers',async()=>{
  const res=await fetch(base+'/api/health');assert.equal(res.status,503);assert.equal((await res.json()).status,'database-unavailable');assert.equal(res.headers.get('cache-control'),'no-store');assert.equal(res.headers.get('x-content-type-options'),'nosniff');assert.equal(res.headers.get('x-powered-by'),null);
});
test('protected routes reject missing, forged and expired credentials before database access',async()=>{
  for(const path of ['/students','/support-requests','/messages','/reports','/notifications','/users','/study-materials','/attendance','/accessibility-preferences']){
    const res=await fetch(base+'/api'+path);assert.equal(res.status,401,path);
  }
  const res=await fetch(base+'/api/students',{headers:{Authorization:'Bearer fake.jwt.token'}});assert.equal(res.status,401);
});
test('public registration rejects role escalation and malformed records before database access',async()=>{
  const res=await fetch(base+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Example',email:'user@example.edu',password:'strong-password',department:'507f1f77bcf86cd799439011',role:'admin'})});assert.equal(res.status,400);assert.equal((await res.json()).error,'Invalid input.');
  const bad=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:{$ne:null},password:'123'})});assert.equal(bad.status,400);
});
