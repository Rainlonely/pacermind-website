/* Shared, same-origin localization. No user content is sent for translation. */
(() => {
  'use strict';
  const languages = {'en':'English','zh-Hans':'简体中文','zh-Hant':'繁體中文','ja':'日本語','ko':'한국어','de':'Deutsch','fr':'Français','pt':'Português'};
  const regions = {INT:['International','en','us'],CN:['Mainland China','zh-Hans','cn'],TW:['Taiwan','zh-Hant','tw'],HK:['Hong Kong','zh-Hant','hk'],JP:['Japan','ja','jp'],KR:['South Korea','ko','kr'],DE:['Germany','de','de'],FR:['France','fr','fr'],BR:['Brazil','pt','br'],PT:['Portugal','pt','pt'],US:['United States','en','us'],GB:['United Kingdom','en','gb']};
  const normalize = value => String(value || '').trim().replace(/<br\s*\/?>/gi,'<br>').replace(/\s+/g,' ');
  const storage = {get(key){try{return localStorage.getItem(key)}catch{return null}},set(key,value){try{localStorage.setItem(key,value)}catch{}},remove(key){try{localStorage.removeItem(key)}catch{}}};
  function language(value) {
    const v=String(value || '').toLowerCase();
    if (/^zh(?:-|$)/.test(v)) return /hant|tw|hk|mo/.test(v)?'zh-Hant':'zh-Hans';
    return Object.keys(languages).find(k=>k===v.split('-')[0]) || null;
  }
  const browserLanguage = () => (navigator.languages || [navigator.language]).map(language).find(Boolean) || 'en';
  const browserRegion = () => {
    for(const l of navigator.languages || [navigator.language]) {
      try {const r = new Intl.Locale(l).region;if(regions[r]) return r;} catch{}
    }
    return 'INT';
  };
  let preference;
  try{preference=JSON.parse(storage.get('pacermind-locale-v1'))}catch{}
  if(!languages[preference?.language] || !regions[preference?.region]) preference=null;
  const legacy=language(storage.get('pacermind-lang'));
  let lang=preference?.language || legacy || browserLanguage();
  let region=preference?.region || browserRegion();
  let manual=!!preference || !!legacy, generation=0;
  const catalogs=new Map(), pending=new Map();
  async function load(code) {
    if(catalogs.has(code)) return;
    if(!pending.has(code)) pending.set(code,(async()=>{
      const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),2500);
      try {
        const r=await fetch(`assets/locales/${code}.json`,{signal:controller.signal});
        if(!r.ok) throw Error('locale');
        const json=await r.json();
        catalogs.set(code,new Map(Object.entries(json).map(([k,v])=>[normalize(k),v])));
      } finally {clearTimeout(timer);pending.delete(code)}
    })());
    return pending.get(code);
  }
  function text(en,cn,code=lang){return catalogs.get(code)?.get(normalize(en)) || (code==='zh-Hans'&&cn?cn:en)}
  function persist(){storage.set('pacermind-locale-v1',JSON.stringify({language:lang,region}));storage.set('pacermind-lang',lang==='zh-Hans'?'zh':lang)}
  function refresh(){
    document.documentElement.lang=lang;
    for(const control of document.querySelectorAll('[data-locale-language],[data-locale-header]')){control.value=lang;control.setAttribute('aria-label',text('Language'))}
    for(const select of document.querySelectorAll('[data-locale-region]')) {
      select.value=region;
      for(const option of select.options)option.textContent=text(regions[option.value][0]);
    }
    for(const el of document.querySelectorAll('[data-locale-text]'))el.textContent=text(el.dataset.localeText);
    for(const a of document.querySelectorAll('a[href*="apps.apple.com/"]'))a.href=`https://apps.apple.com/${regions[region][2]}/app/pacermind/id6754869376`;
  }
  async function select(nextLang,nextRegion=region,save=true) {
    if(!languages[nextLang]||!regions[nextRegion])return false;
    const id=++generation;
    if(save) manual=true;
    try{await load(nextLang)}catch{return false}
    if(id!==generation || (!save && manual))return false;
    lang=nextLang;region=nextRegion;if(save)persist();refresh();
    document.dispatchEvent(new CustomEvent('pm:locale',{detail:{lang,region}}));return true;
  }
  async function detect(){
    const id=generation;
    const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),1200);
    try{
      const response=await fetch('api/region',{cache:'no-store',credentials:'omit',signal:controller.signal});
      if(!response.ok) return;
      const data=await response.json();
      if(manual || generation!==id || !regions[data.country]) return;
      await select(regions[data.country][1],data.country,false);
    }catch{}finally{clearTimeout(timer)}
  }
  function mount(){
    for(const host of document.querySelectorAll('[data-language-switch]')) {
      const control=document.createElement('select');control.dataset.localeHeader='';control.setAttribute('aria-label','Language');
      for(const [code,name] of Object.entries(languages))control.add(new Option(name,code));
      control.addEventListener('change',async e=>{if(!await select(e.target.value))refresh()});
      host.replaceChildren(control);
    }
    const footer=document.querySelector('footer');
    if(footer){
      const box=document.createElement('div');box.className='container locale-settings';
      box.innerHTML='<label><span data-locale-text="Country / region">Country / region</span><select data-locale-region></select></label><label><span data-locale-text="Language">Language</span><select data-locale-language></select></label><button type="button" data-locale-auto data-locale-text="Use automatic settings">Use automatic settings</button><p data-locale-text="Your choice is saved in this browser.">Your choice is saved in this browser.</p>';
      for(const [code,[name]] of Object.entries(regions))box.querySelector('[data-locale-region]').add(new Option(name,code));
      for(const [code,name] of Object.entries(languages))box.querySelector('[data-locale-language]').add(new Option(name,code));
      footer.append(box);
      box.querySelector('[data-locale-language]').addEventListener('change',async e=>{if(!await select(e.target.value))refresh()});
      box.querySelector('[data-locale-region]').addEventListener('change',async e=>{const r=e.target.value;if(!await select(regions[r][1],r))refresh()});
      box.querySelector('[data-locale-auto]').addEventListener('click',async()=>{
        storage.remove('pacermind-locale-v1');storage.remove('pacermind-lang');manual=false;
        await select(browserLanguage(),browserRegion(),false);await detect();
      });
    }
    // Never let a late IP result replace a form or the visitor's explicit choice.
    document.addEventListener('input',()=>{manual=true});
    refresh();
  }
  const api=window.PM_I18N={languages,regions,text,select,refresh,normalize,language,get lang(){return lang},get region(){return region},get locale(){return lang==='pt'?(region==='PT'?'pt-PT':'pt-BR'):lang},ready:null};
  document.documentElement.lang=lang;
  mount();
  api.ready=(async()=>{const id=generation;try{await load(lang)}catch{if(id===generation)lang='en'}if(id!==generation)return;refresh();document.dispatchEvent(new CustomEvent('pm:locale',{detail:{lang,region}}));if(!manual)await detect()})();
})();
