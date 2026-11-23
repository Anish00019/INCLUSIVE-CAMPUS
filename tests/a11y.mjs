import { launchBrowser, setRole, BASE } from './browser.mjs';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
const browser=await launchBrowser();const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();
await setRole(page,'student');
const results=[];
for(const route of ['/','/dashboard','/accessibility-settings','/support','/messages','/assistive-hub']){
  await page.goto(BASE+route);await page.locator('h1').first().waitFor();await page.waitForTimeout(300);
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  results.push({route,violations:result.violations});
  console.log(route,JSON.stringify(result.violations.map(v=>({id:v.id,impact:v.impact,count:v.nodes.length,example:v.nodes[0]?.html.slice(0,250)}))));
}
fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/a11y.json',JSON.stringify(results,null,2));
await browser.close();if(results.some(r=>r.violations.length))process.exitCode=1;
