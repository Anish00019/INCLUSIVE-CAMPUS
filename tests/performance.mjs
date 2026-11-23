import fs from 'node:fs';
import lighthouse from 'lighthouse';
import {throttling} from 'lighthouse/core/config/constants.js';
import {chromium as playwrightChromium} from '@playwright/test';
import {launchBrowser} from './browser.mjs';
const browser=await launchBrowser();const browserContext=await browser.newContext();const page=await browserContext.newPage();
try{
const cdp=await browserContext.newCDPSession(page);
// Use Lighthouse's supported DevTools connection via a separately exposed CDP endpoint.
console.log('Browser',browser.version());
const {default:chromium}=await import('@sparticuz/chromium');
await cdp.detach();await browser.close();
const {spawn}=await import('node:child_process');
const proc=spawn(await chromium.executablePath(),[...chromium.args,'--remote-debugging-port=9222','--remote-debugging-address=127.0.0.1'],{env:{...process.env,LD_LIBRARY_PATH:'/tmp/ic-browser-libs/lib'},stdio:'ignore'});
try{
await new Promise(resolve=>setTimeout(resolve,1500));
for(const formFactor of (process.env.PERF_ONLY==='dashboard'?[]:process.env.PERF_ONLY?[process.env.PERF_ONLY]:['mobile','desktop'])){
 const desktop=formFactor==='desktop';
 const result=await lighthouse(process.env.PERF_BASE_URL||'http://localhost:5174/',{port:9222,output:'json',onlyCategories:['performance','accessibility','best-practices','seo'],formFactor,throttling:desktop?throttling.desktopDense4G:throttling.mobileSlow4G,screenEmulation:{mobile:!desktop,width:desktop?1440:375,height:desktop?1000:812,deviceScaleFactor:1,disabled:false},throttlingMethod:'simulate',maxWaitForLoad:45000});
 if(result.lhr.categories.performance.score===null)process.exitCode=1;
 fs.writeFileSync(`test-results/lighthouse-${formFactor}.json`,JSON.stringify(result.lhr,null,2));console.log(formFactor,Object.fromEntries(Object.entries(result.lhr.categories).map(([k,v])=>[k,v.score===null?'unavailable':Math.round(v.score*100)])));
}
if(!process.env.PERF_ONLY||process.env.PERF_ONLY==='dashboard'){
const connection=await playwrightChromium.connectOverCDP('http://localhost:9222');
const dashboardPage=await connection.contexts()[0].newPage();const base=process.env.PERF_BASE_URL||'http://localhost:5174';
await dashboardPage.goto(base);await dashboardPage.waitForFunction(()=>!!localStorage.getItem('ic_db_v1'));
await dashboardPage.evaluate(()=>{const db=JSON.parse(localStorage.getItem('ic_db_v1'));const user=db.users.find(u=>u.role==='student');localStorage.setItem('ic_session_v1',JSON.stringify({userId:user.id,expiresAt:Date.now()+7200000}));});
await dashboardPage.close();
const result=await lighthouse(base.replace(/\/$/,'')+'/dashboard',{port:9222,output:'json',onlyCategories:['performance','accessibility','best-practices','seo'],disableStorageReset:true,formFactor:'desktop',throttling:throttling.desktopDense4G,screenEmulation:{mobile:false,width:1440,height:1000,deviceScaleFactor:1,disabled:false},throttlingMethod:'simulate',maxWaitForLoad:45000});
if(result.lhr.categories.performance.score===null)process.exitCode=1;
fs.writeFileSync('test-results/lighthouse-dashboard.json',JSON.stringify(result.lhr,null,2));console.log('dashboard desktop',result.lhr.finalDisplayedUrl,Object.fromEntries(Object.entries(result.lhr.categories).map(([k,v])=>[k,v.score===null?'unavailable':Math.round(v.score*100)])));

}
}finally{proc.kill('SIGTERM');}
}finally{if(browser.isConnected())await browser.close();}
