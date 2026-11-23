import { launchBrowser, BASE as base } from './browser.mjs';
import fs from 'node:fs';
fs.mkdirSync('test-results',{recursive:true});
const browser=await launchBrowser();
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto(base);await page.waitForTimeout(800);
await page.screenshot({path:'test-results/landing.png',fullPage:true});
console.log('landing:',await page.title());
const paths={student:['/dashboard','/academics','/timetable','/attendance','/assignments','/examinations','/study-materials','/support','/support/track','/assistive-hub','/profile','/accessibility-settings','/messages','/notifications','/settings'],faculty:['/faculty','/faculty/students','/faculty/attendance','/faculty/assignments','/faculty/materials','/faculty/requests'],support:['/support-admin','/support-admin/requests','/support-admin/students','/support-admin/staff','/support-admin/resources','/support-admin/reports'],admin:['/admin','/admin/students','/admin/users','/admin/departments','/admin/courses','/admin/reports','/support-admin/requests']};
for(const [role,routes] of Object.entries(paths)){
  await page.evaluate(role=>{const db=JSON.parse(localStorage.getItem('ic_db_v1'));const user=db.users.find(u=>u.role===role);localStorage.setItem('ic_session_v1',JSON.stringify({userId:user.id,expiresAt:Date.now()+7200000}));},role);
  for(const path of routes){
    const count=errors.length;await page.goto(base+path);await page.locator('main h1').first().waitFor({timeout:15000});await page.waitForTimeout(100);
    console.log(role,path,errors.length===count?'OK':'ERROR', (await page.locator('h1').allTextContents()).join(' / '));
    if(path==='/dashboard')await page.screenshot({path:'test-results/dashboard.png',fullPage:true});
    if(path==='/admin')await page.screenshot({path:'test-results/admin.png',fullPage:true});
  }
}
console.log('ERRORS',JSON.stringify(errors,null,2));
await browser.close();
if(errors.length)process.exitCode=1;
