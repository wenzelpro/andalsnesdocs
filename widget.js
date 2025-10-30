/*! Kraftfondet Trekkspill-widget (vanilla JS) */
(function(){
  const currentScript = document.currentScript;
  const inferScriptSrc = () => {
    if (currentScript?.src) return currentScript.src;
    const fallback = document.querySelector('script[src*="widget.js"]');
    if (fallback?.src) return fallback.src;
    return location.href;
  };
  const scriptSrc = inferScriptSrc();
  const STYLE_TAG_ID = 'kraftfondet-widget-styles';
  const CSS = `
.kf-wrap {
  --kf-primary: #377FCC;
  --kf-bg: #ffffff;
  --kf-fg: #111827;
  --kf-muted: #6b7280;
  --kf-border: #e5e7eb;
  --kf-surface: #f9fafb;
  --kf-surface-2: #f6f8fa;
  --kf-surface-3: #fcfcfd;
  --kf-focus: var(--kf-primary);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  color: var(--kf-fg);
  background: transparent;
  line-height: 1.45;
}
@media (prefers-color-scheme: dark) {
  .kf-wrap[data-theme="auto"] {
    --kf-bg: #0b0c0f;
    --kf-fg: #e5e7eb;
    --kf-muted: #9ca3af;
    --kf-border: #2b303b;
    --kf-surface: #111318;
    --kf-surface-2: #0f1116;
    --kf-surface-3: #131722;
  }
}
.kf-wrap[data-theme="light"] {
  --kf-bg: #ffffff;
  --kf-fg: #111827;
  --kf-muted: #6b7280;
  --kf-border: #e5e7eb;
  --kf-surface: #f9fafb;
  --kf-surface-2: #f6f8fa;
  --kf-surface-3: #fcfcfd;
}
.kf-wrap[data-theme="dark"] {
  --kf-bg: #0b0c0f;
  --kf-fg: #e5e7eb;
  --kf-muted: #9ca3af;
  --kf-border: #2b303b;
  --kf-surface: #111318;
  --kf-surface-2: #0f1116;
  --kf-surface-3: #131722;
}
.kf-wrap .kf-controls {
  display: flex;
  gap: .5rem;
  margin: .5rem 0 1rem;
}
.kf-wrap .kf-controls input[type="search"] {
  flex: 1;
  padding: .6rem .75rem;
  border: 1px solid var(--kf-border);
  border-radius: .6rem;
  background: var(--kf-bg);
  color: var(--kf-fg);
}
.kf-wrap .kf-accordion {
  margin-bottom: 2rem;
}
.kf-wrap .kf-section {
  border: 1px solid var(--kf-border);
  border-radius: .8rem;
  margin-bottom: 1rem;
  overflow: hidden;
  background: var(--kf-surface-3);
}
.kf-wrap .kf-section > .kf-section-title {
  background: var(--kf-surface);
  padding: .7rem .9rem;
  font-weight: 700;
  border-bottom: 1px solid var(--kf-border);
}
.kf-wrap .kf-item {
  border-top: 1px solid var(--kf-border);
}
.kf-wrap .kf-item:first-child {
  border-top: 0;
}
.kf-wrap .kf-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  text-align: left;
  padding: .9rem .9rem;
  background: var(--kf-bg);
  cursor: pointer;
  border: 0;
  font-size: 1rem;
}
.kf-wrap .kf-summary:focus {
  outline: 2px solid var(--kf-focus);
  outline-offset: 2px;
}
.kf-wrap .kf-summary .kf-title {
  font-weight: 700;
}
.kf-wrap .kf-summary .kf-meta {
  color: var(--kf-muted);
  font-size: .9rem;
  margin-top: .15rem;
}
.kf-wrap .kf-right {
  color: var(--kf-muted);
  font-size: .9rem;
  margin-left: 1rem;
  white-space: nowrap;
}
.kf-wrap .kf-panel {
  display: none;
  padding: .9rem .9rem;
  background: var(--kf-surface-3);
  border-top: 1px dashed var(--kf-border);
}
.kf-wrap .kf-panel.open {
  display: block;
}
.kf-wrap .kf-panel-meta {
  margin-top: .75rem;
  padding-top: .75rem;
  border-top: 1px solid var(--kf-border);
  color: var(--kf-muted);
  font-size: .9rem;
  display: flex;
  flex-direction: column;
  gap: .2rem;
}
.kf-wrap .kf-panel-meta strong {
  color: var(--kf-fg);
}
.kf-wrap .kf-empty {
  color: var(--kf-muted);
  font-style: italic;
  padding: .75rem;
}
.kf-wrap .kf-loader {
  padding: .75rem;
  color: var(--kf-muted);
}
.kf-wrap .kf-error {
  padding: .75rem;
  border: 1px solid #ef4444;
  background: #fee2e2;
  color: #7f1d1d;
  border-radius: .6rem;
}
.kf-wrap .kf-error .kf-retry {
  border: 0;
  background: var(--kf-primary);
  color: #fff;
  border-radius: .4rem;
  padding: .35rem .55rem;
  cursor: pointer;
}
`; 
  const DEFAULTS = {
    theme: 'auto',
    primary: '#377FCC',
    manifest: new URL('./kraftfondet/manifest.json', scriptSrc).toString()
  };

  const ensureStyles = () => {
    if (document.getElementById(STYLE_TAG_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_TAG_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  };

  const $ = (sel, el=document) => el.querySelector(sel);
  const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));
  const debounce = (fn, wait=200) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); }; };
  const slugify = (s) => (s||'').normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9\-_. ]+/g,' ').trim().replace(/\s+/g,'-').toLowerCase();
  const isRelevant = (e)=>{
    const t=(e?.sak?.type||'').toLowerCase(), v=(e?.vedtak?.vedtak||'').toLowerCase();
    return ['søknad','tilskudd','investeringstilskudd','bedriftsutviklingstilskudd','etableringstilskudd'].some(k=>t.includes(k))
        || ['innvilg','bevilg','tilskudd'].some(k=>v.includes(k));
  };
  const formatBudget = (arr)=> Array.isArray(arr)? arr.filter(p=>p?.tittel&&p?.verdi).slice(0,3).map(p=>`${p.tittel}: ${p.verdi}`).join(' · ') : '';
  const compareRef = (a,b)=>{
    const ra=a?.sak?.referanse||'', rb=b?.sak?.referanse||'';
    if(!ra&&!rb) return 0; if(!ra) return 1; if(!rb) return -1;
    const na=parseInt(ra.replace(/\D+/g,''),10), nb=parseInt(rb.replace(/\D+/g,''),10);
    if(Number.isFinite(na)&&Number.isFinite(nb)&&na!==nb) return na-nb;
    return ra.localeCompare(rb,'nb');
  };
  const parseDate = (value)=>{
    if(!value) return null;
    const trimmed=String(value).trim();
    if(!trimmed) return null;
    const direct=new Date(trimmed);
    if(!Number.isNaN(direct?.getTime?.())) return direct;
    const match=trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if(match){
      const [,dd,mm,yyyy]=match;
      const parsed=new Date(Number(yyyy), Number(mm)-1, Number(dd));
      if(!Number.isNaN(parsed?.getTime?.())) return parsed;
    }
    return null;
  };

  function setupRoot(){
    ensureStyles();
    let root=document.getElementById('kraftfondet-app');
    const created=!root;
    if(created){
      root=document.createElement('div');
      root.id='kraftfondet-app';
      if(currentScript?.parentNode){
        currentScript.parentNode.insertBefore(root, currentScript);
      }else{
        document.body.appendChild(root);
      }
    }
    root.classList.add('kf-wrap');
    const dataset=currentScript?.dataset||{};
    const ensureAttr=(attr,key,fallback)=>{
      if(!root.hasAttribute(attr)){
        if(dataset[key]) root.setAttribute(attr, dataset[key]);
        else if(typeof fallback==='string') root.setAttribute(attr, fallback);
      }
    };
    ensureAttr('data-theme','theme',DEFAULTS.theme);
    ensureAttr('data-primary','primary',DEFAULTS.primary);
    ensureAttr('data-manifest','manifest',DEFAULTS.manifest);

    let accordion=$('#kf-accordion', root);
    let searchInput=$('#kf-search', root);

    if(!accordion){
      if(root.innerHTML.trim()) root.innerHTML='';
      if(!searchInput){
        const controls=document.createElement('div');
        controls.className='kf-controls';
        searchInput=document.createElement('input');
        searchInput.id='kf-search';
        searchInput.type='search';
        searchInput.placeholder='Søk i saker (søker, referanse, tekst, vedtak) …';
        searchInput.setAttribute('aria-label','Søk i saker');
        controls.appendChild(searchInput);
        root.appendChild(controls);
      }
      accordion=document.createElement('div');
      accordion.id='kf-accordion';
      accordion.className='kf-accordion';
      accordion.setAttribute('aria-live','polite');
      const loader=document.createElement('div');
      loader.className='kf-loader';
      loader.textContent='Laster saker …';
      accordion.appendChild(loader);
      root.appendChild(accordion);
    }else if(!searchInput){
      const controls=document.createElement('div');
      controls.className='kf-controls';
      searchInput=document.createElement('input');
      searchInput.id='kf-search';
      searchInput.type='search';
      searchInput.placeholder='Søk i saker (søker, referanse, tekst, vedtak) …';
      searchInput.setAttribute('aria-label','Søk i saker');
      controls.appendChild(searchInput);
      root.insertBefore(controls, accordion);
    }

    return { root, accordion, searchInput };
  }

  async function run(){
    const { root, accordion, searchInput } = setupRoot();
    if(!accordion) return;

    let flat=[]; let focusables=[]; let allCases=[];

    root.setAttribute('data-theme', root.getAttribute('data-theme') || DEFAULTS.theme);
    root.style.setProperty('--kf-primary', root.getAttribute('data-primary') || DEFAULTS.primary);

    const manifestURL = root.getAttribute('data-manifest') || DEFAULTS.manifest;

    const clearAccordion=()=>{ if(!accordion) return; while(accordion.firstChild) accordion.removeChild(accordion.firstChild); };
    const addSection=(title)=>{ const s=document.createElement('section'); s.className='kf-section'; const h=document.createElement('div'); h.className='kf-section-title'; h.textContent=title||'Udatert'; s.appendChild(h); accordion.appendChild(s); return s; };
    const addItem=(section, entry)=>{
      const { id, seeker, type, dateString, reference, projectText, budgets, decisionText, meetingInfo } = entry;
      const item=document.createElement('div'); item.className='kf-item';
      const btn=document.createElement('button'); btn.className='kf-summary'; btn.type='button'; btn.setAttribute('aria-expanded','false');
      const left=document.createElement('div');
      const title=document.createElement('div'); title.className='kf-title';
      title.textContent=[seeker, type].filter(Boolean).join(' – ') || 'Ukjent sak';
      left.appendChild(title);
      const metaText=meetingInfo?.trim?.()||'';
      if(metaText){ const sub=document.createElement('div'); sub.className='kf-meta'; sub.textContent=metaText; left.appendChild(sub); }
      const right=document.createElement('div'); right.className='kf-right'; right.textContent=dateString||'';
      btn.appendChild(left); btn.appendChild(right);
      const panel=document.createElement('div'); panel.className='kf-panel'; panel.setAttribute('role','region');
      const metaLines=[];
      if(dateString) metaLines.push(`<div><strong>Dato:</strong> ${dateString}</div>`);
      if(reference) metaLines.push(`<div><strong>Referanse:</strong> ${reference}</div>`);
      panel.innerHTML=`${projectText?`<p><strong>Prosjekt:</strong> ${projectText}</p>`:''}${budgets?`<p><strong>Budsjett (utdrag):</strong> ${budgets}</p>`:''}<p><strong>Vedtak:</strong> ${decisionText||'—'}</p>${metaLines.length?`<div class="kf-panel-meta">${metaLines.join('')}</div>`:''}`;
      panel.id=id; btn.setAttribute('aria-controls', id);
      btn.addEventListener('click',()=>{
        const willOpen=!panel.classList.contains('open');
        flat.forEach(({panel:p, btn:b})=>{ if(p!==panel){ p.classList.remove('open'); b.setAttribute('aria-expanded','false'); } });
        if(willOpen){
          panel.classList.add('open');
          btn.setAttribute('aria-expanded','true');
          try{ panel.scrollIntoView({behavior:'smooth', block:'nearest'});}catch{}
          try{ history.replaceState(null,'',`#${id}`);}catch{}
        }else{
          panel.classList.remove('open');
          btn.setAttribute('aria-expanded','false');
          try{ history.replaceState(null,'', location.pathname + location.search); }catch{}
        }
      });
      item.appendChild(btn); item.appendChild(panel); section.appendChild(item);
      flat.push({btn, panel, id}); return item;
    };
    const render=(cases, q='')=>{
      clearAccordion(); flat=[]; let any=false; const usedIds=new Set();
      const normalizedQ=(q||'').toLowerCase();
      const filtered=!normalizedQ?cases:cases.filter(entry=> entry.haystack.includes(normalizedQ));
      const grouped=new Map();
      for(const entry of filtered){
        if(!grouped.has(entry.year)) grouped.set(entry.year, []);
        grouped.get(entry.year).push(entry);
      }
      const yearValue=(year)=> year==='Udatert' ? Number.NEGATIVE_INFINITY : Number(year)||Number.NEGATIVE_INFINITY;
      const years=Array.from(grouped.keys()).sort((a,b)=> yearValue(b)-yearValue(a));
      for(const year of years){
        const section=addSection(year);
        grouped.get(year).forEach(entry=>{
          let uniqueId=entry.id;
          if(usedIds.has(uniqueId)){
            let suffix=2;
            while(usedIds.has(`${entry.id}-${suffix}`)) suffix+=1;
            uniqueId=`${entry.id}-${suffix}`;
          }
          usedIds.add(uniqueId);
          addItem(section, { ...entry, id:uniqueId });
        });
        any=true;
      }
      if(!any){ const empty=document.createElement('div'); empty.className='kf-empty'; empty.textContent='Ingen saker matchet filtrene.'; accordion.appendChild(empty); }
      focusables = $$('.kf-summary', accordion);
      const currentHash=location.hash?location.hash.slice(1):'';
      if(currentHash){
        const match=flat.find(x=>x.id===currentHash);
        if(match){
          flat.forEach(({panel:p, btn:b})=>{ if(p!==match.panel){ p.classList.remove('open'); b.setAttribute('aria-expanded','false'); } });
          match.panel.classList.add('open');
          match.btn.setAttribute('aria-expanded','true');
        }
      }
    };

    accordion.addEventListener('keydown', (ev)=>{
      const idx = focusables.indexOf(document.activeElement); if(idx===-1) return;
      if(ev.key==='ArrowDown'){ ev.preventDefault(); (focusables[Math.min(idx+1, focusables.length-1)]||{}).focus?.(); }
      if(ev.key==='ArrowUp'){ ev.preventDefault(); (focusables[Math.max(idx-1, 0)]||{}).focus?.(); }
      if(ev.key==='Home'){ ev.preventDefault(); focusables[0]?.focus(); }
      if(ev.key==='End'){ ev.preventDefault(); focusables[focusables.length-1]?.focus(); }
    });

    async function fetchJSON(u){ const r=await fetch(u,{cache:'no-cache'}); if(!r.ok) throw new Error(`HTTP ${r.status} – ${u}`); return r.json(); }
    function showError(msg){ const box=document.createElement('div'); box.className='kf-error'; box.innerHTML=`<strong>Kunne ikke hente data.</strong><br><span class="kf-muted">${msg}</span> <button type="button" class="kf-retry" style="margin-left:.5rem;">Prøv igjen</button>`; clearAccordion(); accordion.appendChild(box); $('.kf-retry', box)?.addEventListener('click', ()=>load()); }

    async function load(){
      clearAccordion(); const loader=document.createElement('div'); loader.className='kf-loader'; loader.textContent='Laster saker …'; accordion.appendChild(loader);
      try{
        const manifest = await fetchJSON(manifestURL);
        if(!Array.isArray(manifest)) throw new Error('Ugyldig manifestformat (forventer en liste).');
        const meetings = await Promise.all(manifest.map(async m=>{
          try{ const rows = await fetchJSON(m.url); return { meta:m, rows: Array.isArray(rows)?rows:[] }; }
          catch(_){ return { meta:m, rows: [] }; }
        }));
        meetings.sort((a,b)=> String(a.meta?.dato||'').localeCompare(String(b.meta?.dato||'')));
        const cases=[];
        for(const m of meetings){
          const meetingTitle=m.meta?.tittel||'';
          const meetingDate=m.meta?.dato||'';
          const meetingInfo=[meetingTitle, meetingDate].filter(Boolean).join(' – ');
          for(const row of m.rows.filter(isRelevant)){
            const seeker=(row?.sak?.søker||'Ukjent søker').trim();
            const type=(row?.sak?.type||'').trim();
            const dateString=row?.sak?.dato||'';
            const dateValue=parseDate(dateString);
            const reference=(row?.sak?.referanse||'').trim();
            const year=dateValue? String(dateValue.getFullYear()) : 'Udatert';
            const budgets=formatBudget(row?.budsjett?.punkter);
            const projectText=row?.prosjektbeskrivelse?.tekst||'';
            const decisionText=row?.vedtak?.vedtak||'';
            const haystack=[seeker, type, reference, projectText, decisionText, meetingTitle, meetingDate, dateString].join(' ').toLowerCase();
            let baseId=slugify(`${dateString||''}-${reference||''}-${seeker||''}-${type||''}`);
            if(!baseId) baseId=slugify(`${year}-${reference||''}-${Math.random()}`);
            cases.push({ raw:row, seeker, type, reference, dateString, dateValue, year, budgets, projectText, decisionText, haystack, id:baseId, meetingInfo });
          }
        }
        cases.sort((a,b)=>{
          const ta = a.dateValue? a.dateValue.getTime(): Number.NEGATIVE_INFINITY;
          const tb = b.dateValue? b.dateValue.getTime(): Number.NEGATIVE_INFINITY;
          if(tb!==ta) return tb-ta;
          const refCmp=compareRef(a.raw, b.raw);
          if(refCmp!==0) return refCmp;
          return a.seeker.localeCompare(b.seeker,'nb');
        });
        allCases=cases;
        render(allCases, searchInput?.value||'');
        if(location.hash){
          const id=location.hash.slice(1); const match=flat.find(x=>x.id===id);
          if(match){
            flat.forEach(({panel:p, btn:b})=>{ if(p!==match.panel){ p.classList.remove('open'); b.setAttribute('aria-expanded','false'); } });
            match.panel.classList.add('open'); match.btn.setAttribute('aria-expanded','true');
            try{ document.getElementById(id).scrollIntoView({behavior:'smooth', block:'start'});}catch{}
          }
        }
      }catch(e){ showError(e.message); }
    }

    searchInput?.addEventListener('input', debounce(()=> render(allCases, searchInput.value||''), 150));

    load();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
