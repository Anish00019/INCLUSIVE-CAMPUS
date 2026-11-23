import fs from 'node:fs';
import {launchBrowser,setRole,BASE} from './browser.mjs';
import AxeBuilder from '@axe-core/playwright';
export const routes={student:['/dashboard','/academics','/timetable','/attendance','/assignments','/examinations','/study-materials','/support','/support/track','/assistive-hub','/profile','/accessibility-settings','/messages','/notifications','/settings'],faculty:['/faculty','/faculty/students','/faculty/attendance','/faculty/assignments','/faculty/materials','/faculty/requests'],support:['/support-admin','/support-admin/requests','/support-admin/students','/support-admin/staff','/support-admin/resources','/support-admin/reports'],admin:['/admin','/admin/students','/admin/users','/admin/departments','/admin/courses','/admin/reports','/support-admin/requests']};
const browser=await launchBrowser();const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();page.setDefaultTimeout(12000);
const results={browser:browser.version(),base:BASE,viewports:[],axe:[],errors:[],warnings:[],network:[]};
page.on('pageerror',e=>results.errors.push({url:page.url(),message:e.message}));
page.on('console',m=>{if(['error','warning'].includes(m.type()))results.warnings.push({url:page.url(),type:m.type(),message:m.text()});});
page.on('response',r=>{if(r.status()>=400)results.network.push({url:r.url(),status:r.status()});});
try{
for(const [role,paths] of Object.entries(routes)){
 await setRole(page,role);
 for(const route of paths){
  await page.goto(BASE+route);await page.locator('main h1').first().waitFor();if(await page.getByRole('heading',{name:'We could not open this workspace',exact:true}).count())throw new Error('Application error boundary displayed on '+route);
  for(const width of [320,375,425,768,1024,1280,1440,1920]){
   await page.setViewportSize({width,height:1000});await page.waitForTimeout(50);
   const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
   results.viewports.push({role,route,width,pass:dimensions.scroll<=width+1,...dimensions});
  }
  await page.setViewportSize({width:1440,height:1000});
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  results.axe.push({role,route,theme:'light',violations:audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({html:n.html,target:n.target,summary:n.failureSummary}))}))});
  console.log(role,route,'overflow:',results.viewports.filter(v=>v.route===route&&!v.pass).map(v=>v.width),'axe:',audit.violations.map(v=>v.id));
 }
}
for(const theme of ['dark','contrast']){
 await setRole(page,'student');await page.evaluate(theme=>localStorage.setItem('ic_prefs_v1',JSON.stringify({theme:theme==='dark'?'dark':'light',highContrast:theme==='contrast'})),theme);
 for(const route of ['/dashboard','/accessibility-settings','/support','/messages','/assistive-hub']){
 await page.goto(BASE+route);await page.locator('main h1').first().waitFor();if(await page.getByRole('heading',{name:'We could not open this workspace',exact:true}).count())throw new Error('Application error boundary displayed on '+route);const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();results.axe.push({role:'student',route,theme,violations:audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({html:n.html,target:n.target,summary:n.failureSummary}))}))});console.log(theme,route,audit.violations.map(v=>v.id));
 }
}
}finally{fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/audit-matrix.json',JSON.stringify(results,null,2));await browser.close();}
console.log('SUMMARY',JSON.stringify({viewportChecks:results.viewports.length,overflow:results.viewports.filter(v=>!v.pass).length,axePages:results.axe.length,axeFailing:results.axe.filter(a=>a.violations.length).length,errors:results.errors.length,warnings:results.warnings.length,network:results.network.length}));
if(results.viewports.some(v=>!v.pass)||results.axe.some(a=>a.violations.length)||results.errors.length||results.warnings.some(w=>w.type==='error'))process.exitCode=1;
