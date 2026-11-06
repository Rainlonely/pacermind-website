/* Localized promotional images; original screenshots remain the fallback. */
(() => {
  const images=[...document.querySelectorAll('.iphone-preview-strip img')];
  if(!images.length)return;
  const original=images.map(img=>({src:img.src,srcset:img.srcset,alt:img.alt,lang:img.lang,href:img.closest('a').href}));
  let manifest=null;
  function update(){
    const lang=window.PM_I18N?.lang || 'en';
    const files=manifest?.languages?.[lang];
    images.forEach((img,i)=>{
      const file=files?.[i];const old=original[i];
      img.src=file?.small || old.src;
      img.srcset=file ? `${file.small} 450w, ${file.large} 900w` : old.srcset;
      img.alt=file?.title || old.alt;img.lang=file ? lang : old.lang;
      img.closest('a').href=file?.large || old.href;
    });
  }
  document.addEventListener('pm:locale',update);
  fetch('assets/data/preview-localizations.json').then(r=>{if(!r.ok)throw Error('manifest');return r.json()}).then(data=>{manifest=data;update()}).catch(()=>{});
})();
