/* Local-only localization acceptance, with mocked country lookup and synthetic data. */
const {chromium}=require(process.env.PACERMIND_PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.PACERMIND_PREVIEW_URL || 'http://127.0.0.1:4173/';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PACERMIND_CHROMIUM,headless:true});
 const errors=[];let checks=0;
 async function context(locale='en-US',country=null){
  const c=await browser.newContext({locale,viewport:{width:390,height:844},reducedMotion:'reduce'});
  await c.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
  await c.route('**/api/region',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({country})}));
  c.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));return c;
 }
 const ctx=await context();const p=await ctx.newPage();
 for(const page of ['index.html','privacy.html','support.html','planner.html','notes.html']){
  await p.goto(base+page);await p.evaluate(()=>window.PM_I18N.ready);
  for(const language of ['en','zh-Hans','zh-Hant','ja','ko','de','fr','pt']){
   await p.locator('[data-locale-language]').selectOption(language);
   await p.waitForFunction(l=>document.documentElement.lang===l,language);
   await p.waitForTimeout(35);
   assert.equal(await p.locator('[data-locale-language]').inputValue(),language);
   const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
   assert.equal(overflow,false,`${page}/${language} horizontal overflow`);
   if(page==='index.html'){
    const title=await p.locator('[data-i18n="hero.title"]').innerText();
    if(language!=='en')assert.ok(!title.includes('Every route'),language+' untranslated hero');
    const manifest=JSON.parse(fs.readFileSync('assets/data/preview-localizations.json','utf8'));
    const expected=manifest.languages[language]?.[0]?.small || 'assets/images/iphone-20261009/01-city-map-450.webp';
    await p.waitForFunction(path=>document.querySelector('.iphone-preview-strip img').src.endsWith(path),expected);
    assert.equal(await p.locator('.iphone-preview-strip img').count(),9);
   }
   if(page==='privacy.html'){
    const text=await p.locator('[data-i18n="privacy.section5.text"]').innerText();
    if(language!=='en')assert.ok(!text.startsWith('Only after'),language+' untranslated privacy');
    assert.equal(await p.locator('[data-i18n="privacy.region.text"]').count(),1);
   }
   if(page==='planner.html'){
    await p.locator('[name="title"]').fill('My original 日本語 plan');
    await p.locator('[name="goal"]').fill('Keep this original text');
   }
   checks++;
  }
 }
 await p.goto(base+'planner.html');await p.evaluate(()=>window.PM_I18N.ready);
 assert.equal(await p.locator('[name="title"]').inputValue(),'My original 日本語 plan');
 await p.locator('[data-locale-region]').selectOption('JP');await p.waitForFunction(()=>document.documentElement.lang==='ja');
 await p.locator('[data-locale-language]').selectOption('fr');await p.waitForFunction(()=>document.documentElement.lang==='fr');
 await p.reload();await p.evaluate(()=>window.PM_I18N.ready);
 assert.equal(await p.locator('[data-locale-region]').inputValue(),'JP');assert.equal(await p.locator('[data-locale-language]').inputValue(),'fr');
 assert.equal(await p.locator('[name="title"]').inputValue(),'My original 日本語 plan');checks++;
 for(const [locale,country,want] of [['en-US','JP','ja'],['zh-TW',null,'zh-Hant'],['zh-HK',null,'zh-Hant'],['pt-PT',null,'pt'],['ja-JP','DE','de']]){
  const c=await context(locale,country),q=await c.newPage();await q.goto(base);await q.evaluate(()=>window.PM_I18N.ready);
  assert.equal(await q.locator('html').getAttribute('lang'),want);await c.close();checks++;
 }
 // A saved choice must prevent country lookup from replacing it.
 const saved=await context('en-US','JP');await saved.addInitScript(()=>{try{localStorage.setItem('pacermind-locale-v1',JSON.stringify({language:'ko',region:'KR'}))}catch{}});
 const q=await saved.newPage();await q.goto(base);await q.evaluate(()=>window.PM_I18N.ready);
 assert.equal(await q.locator('html').getAttribute('lang'),'ko');
 assert.ok((await q.locator('a[href*="apps.apple.com/"]').first().getAttribute('href')).includes('/kr/'));checks++;
 // Privacy mode (storage denied), lookup errors, and late locale failures remain usable.
 const denied=await context('fr-FR');await denied.addInitScript(()=>{Storage.prototype.getItem=Storage.prototype.setItem=()=>{throw Error('denied')}});
 const d=await denied.newPage();await d.goto(base+'privacy.html');await d.evaluate(()=>window.PM_I18N.ready);assert.equal(await d.locator('html').getAttribute('lang'),'fr');checks++;
 // A late failed initial catalog cannot override a successful manual selection.
 const late=await context('fr-FR');
 await late.route('**/assets/locales/fr.json',async r=>{await new Promise(resolve=>setTimeout(resolve,450));await r.abort()});
 const lp=await late.newPage();await lp.goto(base,{waitUntil:'domcontentloaded'});
 await lp.evaluate(()=>window.PM_I18N.select('ko','KR'));
 await lp.evaluate(()=>window.PM_I18N.ready);
 assert.equal(await lp.locator('html').getAttribute('lang'),'ko');checks++;
 // Typing while an IP-selected catalog downloads cancels the automatic change.
 const race=await context('en-US','DE');
 await race.route('**/assets/locales/de.json',async r=>{await new Promise(resolve=>setTimeout(resolve,450));await r.continue()});
 const rp=await race.newPage();const requested=rp.waitForRequest('**/assets/locales/de.json');
 await rp.goto(base,{waitUntil:'domcontentloaded'});await requested;
 await rp.evaluate(()=>{const input=document.createElement('input');document.body.append(input);input.value='unfinished';input.dispatchEvent(new Event('input',{bubbles:true}))});
 await rp.evaluate(()=>window.PM_I18N.ready);
 assert.equal(await rp.locator('html').getAttribute('lang'),'en');checks++;
 await p.goto(base+'index.html');await p.evaluate(()=>window.PM_I18N.ready);
 await p.locator('[data-locale-region]').selectOption('DE');await p.waitForFunction(()=>document.documentElement.lang==='de');
 await p.screenshot({path:'/tmp/pacermind-i18n-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);
 await browser.close();console.log(`PASS ${checks} localization cases, no page errors`);
})().catch(e=>{console.error(e);process.exit(1)});
