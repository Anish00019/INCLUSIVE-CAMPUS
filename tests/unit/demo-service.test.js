import {beforeEach,describe,it,expect,vi} from 'vitest';
let api,auth;
beforeEach(async()=>{vi.resetModules();localStorage.clear();const module=await import('../../src/services/api');api=module.default;auth=module.authApi;});
describe('demo data boundary regressions',()=>{
  it('rejects malformed registration in the service, not only the page',async()=>{
    await expect(auth.register({name:'',email:'invalid',password:'x'})).rejects.toThrow();
  });
  it('normalises registration email consistently',async()=>{
    await auth.register({name:'QA Example',email:' QA@example.edu ',password:'LongPassword42',department:'CSE',year:1});
    await expect(auth.login({email:'qa@example.edu',password:'LongPassword42'})).resolves.toHaveProperty('user.email','qa@example.edu');
  });
  it('never returns another student for an unknown account',()=>{expect(api.studentFor('missing')).toBeUndefined();expect(api.facultyFor('missing')).toBeUndefined();});
  it('does not repopulate an intentionally empty student directory',async()=>{
    const data=await api.bootstrap();data.students=[];localStorage.setItem('ic_db_v1',JSON.stringify(data));vi.resetModules();const reloaded=(await import('../../src/services/api')).default;expect((await reloaded.bootstrap()).students).toHaveLength(0);
  });
  it('rejects expired and malformed persisted sessions',async()=>{
    localStorage.setItem('ic_session_v1',JSON.stringify({userId:'u_stu_01',expiresAt:Date.now()-1000}));expect(await auth.me()).toBeNull();
    localStorage.setItem('ic_session_v1','{broken');await expect(auth.me()).resolves.toBeNull();
    for(const value of [null,{userId:'u_stu_01',expiresAt:'invalid'},{userId:42,expiresAt:Date.now()+10000}]){localStorage.setItem('ic_session_v1',JSON.stringify(value));await expect(auth.me()).resolves.toBeNull();}
  });
  it('rejects duplicate student roll numbers',async()=>{
    const data=await api.bootstrap();expect(()=>api.saveRecord('students',{...data.students[0],id:undefined})).toThrow(/already|duplicate/i);
  });
  it('rejects invalid student emails and numeric limits',()=>{
    expect(()=>api.saveRecord('students',{name:'QA',email:'not-email',rollNo:'QA-1',year:3,semester:5,gpa:8,attendance:90,department:'CSE'})).toThrow();
    expect(()=>api.saveRecord('students',{name:'QA',email:'qa@example.edu',rollNo:'QA-1',year:3,semester:5,gpa:11,attendance:110,department:'CSE'})).toThrow();
  });
  it('keeps notification mutations scoped to the signed-in account',async()=>{
    await auth.login({email:'student@campus.edu',password:'demo1234'});const data=await api.bootstrap();
    data.notifications.push({id:'private-other',forUserId:'other-user',read:false,title:'Private'});
    api.markAllRead();expect(data.notifications.find(n=>n.id==='private-other').read).toBe(false);
    api.clearNotifications();expect(data.notifications.some(n=>n.id==='private-other')).toBe(true);
  });
  it('does not persist invalid support status or forged submission status',async()=>{
    const data=await api.bootstrap();expect(()=>api.updateRequestStatus(data.supportRequests[0].id,'Made Up')).toThrow();
    await expect(api.createRequest({studentId:'st_01',category:'Other',subject:'Test request',description:'Long enough request description.',status:'Approved'})).rejects.toThrow();
  });
  it('rejects empty and oversized messages',async()=>{
    const data=await api.bootstrap();expect(()=>api.sendMessage(data.messageThreads[0].id,'  ')).toThrow();expect(()=>api.sendMessage(data.messageThreads[0].id,'x'.repeat(10001))).toThrow();
  });
  it('does not corrupt a saved record after a rejected storage write',async()=>{
    const data=await api.bootstrap();const initial=data.students[0].name;
    vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new DOMException('Full','QuotaExceededError');});
    expect(()=>api.saveRecord('students',{...data.students[0],name:'Unsaved name'})).toThrow();
    expect((await api.bootstrap()).students[0].name).toBe(initial);
  });
  it('attendance correction is idempotent and uses actual subject totals',async()=>{
    const data=await api.bootstrap();const row=data.attendance[0];const old={...row};
    api.recordAttendance({subjectId:row.subjectId,date:'2026-11-22',marks:{st_01:'absent'}});
    api.recordAttendance({subjectId:row.subjectId,date:'2026-11-22',marks:{st_01:'present'}});
    const current=(await api.bootstrap()).attendance[0];expect(current.held).toBe(old.held+1);expect(current.attended).toBe(old.attended+1);
    const totals=data.attendance.reduce((r,a)=>({held:r.held+a.held,attended:r.attended+a.attended}),{held:0,attended:0});
    expect(data.students[0].attendance).toBe(Math.round(totals.attended/totals.held*100));
  });
});
