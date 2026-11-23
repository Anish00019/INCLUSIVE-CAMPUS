import { chromium } from '@playwright/test';
import packagedChromium from '@sparticuz/chromium';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
export async function launchBrowser() {
  // The npm-packaged headless browser keeps CI runnable where browser CDNs are blocked.
  // Standard workstations can instead set CHROMIUM_EXECUTABLE_PATH.
  const env={...process.env};
  if(process.platform==='linux'){
    const root=path.resolve(path.dirname(require.resolve('@sparticuz/chromium')), '..');
    const libDir=path.join(os.tmpdir(),'ic-browser-libs');fs.mkdirSync(libDir,{recursive:true});
    const tar=path.join(libDir,'al2023.tar');
    fs.writeFileSync(tar,zlib.brotliDecompressSync(fs.readFileSync(path.join(root,'bin/al2023.tar.br'))));
    execFileSync('tar',['-xf',tar,'-C',libDir]);
    env.LD_LIBRARY_PATH=path.join(libDir,'lib')+(env.LD_LIBRARY_PATH?':'+env.LD_LIBRARY_PATH:'');
  }
  return chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH || await packagedChromium.executablePath(),args:packagedChromium.args,headless:true,env});
}
export const BASE=process.env.TEST_BASE_URL || 'http://localhost:5173';
export async function setRole(page,role){
  await page.goto(BASE);
  await page.waitForFunction(()=>!!localStorage.getItem('ic_db_v1'));
  await page.evaluate(role=>{const db=JSON.parse(localStorage.getItem('ic_db_v1'));const user=db.users.find(u=>u.role===role);localStorage.setItem('ic_session_v1',JSON.stringify({userId:user.id,expiresAt:Date.now()+7200000}));},role);
}
