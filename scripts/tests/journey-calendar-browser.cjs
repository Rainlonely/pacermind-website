/* Synthetic calendar interaction regression; no external network or personal notes. */
const {chromium}=require(process.env.PACERMIND_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const base=process.env.PACERMIND_PREVIEW_URL||'http://127.0.0.1:4173/';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.PACERMIND_CHROMIUM,args:['--no-sandbox']});try{
for(const [touch,motion] of [[false,'reduce'],[true,'reduce'],[false,'no-preference']]){
 const ctx=await browser.newContext({viewport:{width:touch?390:1440,height:1000},reducedMotion:motion,locale:'zh-CN',hasTouch:touch,isMobile:touch});
 await ctx.addInitScript(()=>{localStorage.setItem('pacermind-lang','zh');localStorage.setItem('pacermind-intro-seen-v1','1')});
 const errors=[];let fullData=false;
 await ctx.route('**/*',r=>{
  const u=r.request().url();
  if(!u.startsWith(base))return r.abort();
  if(/\/journey\.json(?:\?|$)/.test(u))fullData=true;
  if(u.includes('/journal-index.json'))return r.fulfill({json:{version:1,months:[{month:'2024-02',url:'assets/data/journal/2024-02.json'}]}});
  if(u.includes('/journal/2024-02.json'))return r.fulfill({json:{version:1,month:'2024-02',runs:[29,27].map(day=>({date:`2024-02-${day}`,title:'Easy Run',distanceKm:5,note:`Original ${day}\n<script>unsafe()</script>`,coordinates:[[31,121],[31.01,121.01],[31.02,121]]}))}});
  return r.continue();
 });
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'#journey');
 const latest=p.locator('[data-memory-day="2024-02-29"]'), earlier=p.locator('[data-memory-day="2024-02-27"]');await latest.waitFor();
 await p.locator('.journey-map-column').scrollIntoViewIfNeeded();
 assert.equal(await latest.getAttribute('aria-pressed'),'true');
 const story=await p.locator('[data-journal-selection]').innerText();
 if(motion==='no-preference'){await p.waitForTimeout(250);assert.equal(await p.locator('[data-memory-play]').getAttribute('aria-pressed'),'true');assert.ok((await p.locator('[data-memory-bubble]').innerText()).includes('27'));await p.waitForTimeout(5400);assert.ok((await p.locator('[data-memory-bubble]').innerText()).includes('29'));assert.equal(await p.locator('[data-journal-selection]').innerText(),story);await p.keyboard.press('Escape');assert.equal(await p.locator('[data-memory-play]').getAttribute('aria-pressed'),'false');}
 if(!touch){await earlier.hover();await p.waitForTimeout(180);assert.ok((await p.locator('[data-memory-bubble]').innerText()).includes('27'));assert.equal(await p.locator('[data-journal-selection]').innerText(),story);}
 await earlier.click();assert.ok((await p.locator('[data-journal-selection]').innerText()).includes('27'));
 assert.ok((await p.locator('[data-run-list]').innerText()).includes('<script>unsafe()</script>'));
 assert.equal(await p.locator('[data-run-list] script').count(),0);
 assert.ok(await p.locator('[data-memory-bubble]').evaluate(e=>Number(getComputedStyle(e).opacity))>=.9);
 assert.ok(await p.locator('[data-memory-route] polyline').count()>0);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await latest.focus();assert.equal(await latest.getAttribute('aria-pressed'),'false');
 assert.ok((await p.locator('[data-memory-bubble]').innerText()).includes('29'));
 assert.equal(fullData,false);assert.deepEqual(errors,[]);await ctx.close();
 console.log('PASS calendar',touch?'touch':motion,'preview, pinning, escaped notes, visible bubble, leap date, lazy data');
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
