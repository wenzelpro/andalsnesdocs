
/*! Kraftfondet Trekkspill-widget (vanilla JS) */
(function(){
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
    const na=parseInt(ra.replace(/\\D+/g,''),10), nb=parseInt(rb.replace(/\\D+/g,''),10);
    if(Number.isFinite(na)&&Number.isFinite(nb)&&na!==nb) return na-nb;
    return ra.localeCompare(rb,'nb');
  };

  async function run(){
    const root = document.getElementById('kraftfondet-app') || (()=>{ const d=document.createElement('div'); d.id='kraftfondet-app'; document.body.appendChild(d); return d; })();
    const accordion = $('#kf-accordion', root);
    const searchInput = $('#kf-search', root);
    const btnExpand = $('#kf-expand', root);
    const btnCollapse = $('#kf-collapse', root);

    // theme/primary
    root.setAttribute('data-theme', root.getAttribute('data-theme') || 'auto');
    root.style.setProperty('--kf-primary', root.getAttribute('data-primary') || '#377FCC');

    const manifestURL = root.getAttribute('data-manifest') || 'https://andalsnesdocs.github.io/kraftfondet/manifest.json';

    let flat=[]; let focusables=[];
    const clearAccordion=()=>{ while(accordion.firstChild) accordion.removeChild(accordion.firstChild); };
    const addSection=(title)=>{ const s=document.createElement('section'); s.className='kf-section'; const h=document.createElement('div'); h.className='kf-section-title'; h.textContent=title||'Møte'; s.appendChild(h); accordion.appendChild(s); return s; };
    const addItem=(section, e)=>{
      const item=document.createElement('div'); item.className='kf-item';
      const btn=document.createElement('button'); btn.className='kf-summary'; btn.type='button'; btn.setAttribute('aria-expanded','false');
      const left=document.createElement('div');
      const title=document.createElement('div'); title.className='kf-title';
      const seeker=(e?.sak?.søker||'Ukjent søker').trim(); const ref=e?.sak?.referanse?` · ${e.sak.referanse}`:'';
      title.textContent=seeker+ref;
      const sub=document.createElement('div'); sub.className='kf-meta'; sub.textContent=e?.sak?.type||'';
      left.appendChild(title); left.appendChild(sub);
      const right=document.createElement('div'); right.className='kf-right'; right.textContent=e?.sak?.dato||'';
      btn.appendChild(left); btn.appendChild(right);
      const panel=document.createElement('div'); panel.className='kf-panel'; panel.setAttribute('role','region');
      const proj=e?.prosjektbeskrivelse?.tekst, bud=formatBudget(e?.budsjett?.punkter), ved=e?.vedtak?.vedtak;
      panel.innerHTML=`${proj?`<p><strong>Prosjekt:</strong> ${proj}</p>`:''}${bud?`<p><strong>Budsjett (utdrag):</strong> ${bud}</p>`:''}<p><strong>Vedtak:</strong> ${ved||'—'}</p>`;
      const id=slugify(`${e?.sak?.dato||''}-${e?.sak?.referanse||seeker}`); panel.id=id; btn.setAttribute('aria-controls', id);
      btn.addEventListener('click',()=>{ const open=panel.classList.toggle('open'); btn.setAttribute('aria-expanded', String(open)); if(open){ try{ panel.scrollIntoView({behavior:'smooth', block:'nearest'});}catch{}} if(open){ history.replaceState(null,'',`#${id}`);} });
      item.appendChild(btn); item.appendChild(panel); section.appendChild(item);
      flat.push({btn, panel, id}); return item;
    };
    const render=(meetings, q='')=>{
      clearAccordion(); flat=[]; let any=false;
      for(const m of meetings){
        const rel=m.rows.filter(isRelevant);
        if(!rel.length) continue;
        const filtered = !q ? rel : rel.filter(e=>{
          const hay=[e?.sak?.søker, e?.sak?.type, e?.sak?.referanse, e?.prosjektbeskrivelse?.tekst, e?.vedtak?.vedtak].join(' ').toLowerCase();
          return hay.includes(q.toLowerCase());
        });
        if(!filtered.length) continue;
        const section=addSection(m.meta.tittel||`Møte ${m.meta.dato||''}`);
        filtered.sort(compareRef).forEach(e=>addItem(section,e));
        any=true;
      }
      if(!any){ const empty=document.createElement('div'); empty.className='kf-empty'; empty.textContent='Ingen saker matchet filtrene.'; accordion.appendChild(empty); }
      focusables = $$('.kf-summary', accordion);
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
        render(meetings, searchInput?.value||'');
        if(location.hash){
          const id=location.hash.slice(1); const match=flat.find(x=>x.id===id);
          if(match){ match.panel.classList.add('open'); match.btn.setAttribute('aria-expanded','true'); try{ document.getElementById(id).scrollIntoView({behavior:'smooth', block:'start'});}catch{} }
        }
      }catch(e){ showError(e.message); }
    }

    searchInput?.addEventListener('input', debounce(()=>load(), 200));
    btnExpand?.addEventListener('click', ()=>{ $$('.kf-panel',accordion).forEach(p=>p.classList.add('open')); $$('.kf-summary',accordion).forEach(b=>b.setAttribute('aria-expanded','true')); });
    btnCollapse?.addEventListener('click', ()=>{ $$('.kf-panel',accordion).forEach(p=>p.classList.remove('open')); $$('.kf-summary',accordion).forEach(b=>b.setAttribute('aria-expanded','false')); });

    load();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
