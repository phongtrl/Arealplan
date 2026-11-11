window.EconomyUI = (() => {
  const M = window.EconomyModel;
  const host = document.querySelector('#economy-content');
  const drafts = new Map();
  let selectedId = null;
  const q = selector => host.querySelector(selector);
  const current = () => P?.liste.find(project=>project.id===selectedId);
  const locked = project => isClosed(project) || project.arkivert;
  const clone = value => JSON.parse(JSON.stringify(value));
  function fromSaved(project) {
    let value=M.empty();
    if (project.economy) {try {value=M.validate(project.economy);}catch(error){return {invalidSaved:true,budget:'',reserve:'0',notes:'',items:[]};}}
    return {budget:M.input(value.budgetOre),reserve:M.input(value.reserveBp),notes:value.notes,items:value.items.map(item=>({id:item.id,label:item.label,kind:item.kind,hours:M.input(item.hours100),rate:M.input(item.rateOre),amount:M.input(item.amountOre),spent:M.input(item.spentOre)}))};
  }
  function pruneDrafts() {if(P)for(const id of drafts.keys())if(!P.liste.some(project=>project.id===id))drafts.delete(id);}
  function draftFor(project) {return drafts.get(project.id) || fromSaved(project);}
  function input(label,name,value,extra='') {return `<label>${label}<input type="text" inputmode="decimal" name="${name}" value="${esc(value)}" maxlength="24" autocomplete="off" ${extra}></label>`;}
  function read() {
    return {budget:q('[name=budget]').value,reserve:q('[name=reserve]').value,notes:q('[name=economy-notes]').value,items:[...host.querySelectorAll('.economy-item')].map(row=>({id:row.dataset.item,label:row.querySelector('[name=item-label]').value,kind:row.querySelector('[name=item-kind]').value,hours:row.querySelector('[name=item-hours]')?.value??'',rate:row.querySelector('[name=item-rate]')?.value??'',amount:row.querySelector('[name=item-amount]')?.value??'',spent:row.querySelector('[name=item-spent]').value}))};
  }
  function canonical(raw) {
    const field = (value,label,max) => {try{return M.parse(value,max);}catch(error){throw new Error(label+': '+error.message);}};
    const value = {schema:1,budgetOre:field(raw.budget,'Totalramme'),reserveBp:field(raw.reserve,'Reserve',10000)??0,notes:raw.notes,items:raw.items.map((item,index)=>({id:item.id,label:item.label.trim()||'Kostnadspost '+(index+1),kind:item.kind,hours100:item.kind==='time'?field(item.hours,'Timer i post '+(index+1),1000000):null,rateOre:item.kind==='time'?field(item.rate,'Timesats i post '+(index+1)):null,amountOre:item.kind==='fixed'?field(item.amount,'Beløp i post '+(index+1)):null,spentOre:field(item.spent,'Forbruk i post '+(index+1))}))};
    return M.validate(value);
  }
  function summary(raw) {
    const target=q('#economy-summary');
    let value;
    try{value=canonical(raw);}catch(error){target.innerHTML=`<p class="economy-message error">${esc(error.message)}</p>`;host.querySelectorAll('.economy-item-total').forEach(item=>item.textContent='Kontroller tallfeltene før summen kan beregnes.');return;}
    const t=M.totals(value), over=t.marginOre!==null&&t.marginOre<0;
    target.innerHTML=`<div class="economy-metrics"><div><span>Totalramme</span><strong>${M.format(value.budgetOre)}</strong></div><div><span>Planlagte kostnader</span><strong>${M.format(t.plannedOre)}</strong></div><div><span>Reserve</span><strong>${M.format(t.reserveOre)}</strong></div><div class="${over?'economy-over':''}"><span>${over?'Over rammen':'Margin mot rammen'}</span><strong>${M.format(t.marginOre===null?null:Math.abs(t.marginOre))}</strong></div></div><div class="economy-allocation">${value.budgetOre!==null?`<p>${t.incomplete?'Foreløpig disponering':'Plan + reserve'}: <b>${M.format(t.allocatedOre)}</b> av ${M.format(value.budgetOre)}</p><div class="economy-meter" role="progressbar" aria-label="Planlagte kostnader og reserve mot totalramme" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value.budgetOre>0?Math.min(100,Math.round(t.allocatedOre/value.budgetOre*100)):(t.allocatedOre>0?100:0)}" aria-valuetext="${esc(M.format(t.allocatedOre)+' av '+M.format(value.budgetOre))}"><span style="width:${value.budgetOre>0?Math.min(100,t.allocatedOre/value.budgetOre*100):t.allocatedOre>0?100:0}%" class="${over?'over':''}"></span></div>`:'<p>Sett en totalramme for å se reserve og tilgjengelig margin.</p>'}<p>${t.incomplete?`${t.incomplete} kostnadsposter mangler anslag og er ikke med i planlagt sum. `:''}Registrert forbruk: <b>${t.spentCount?M.format(t.spentOre):'Ikke registrert'}</b>. Forbruk vises separat og legges ikke oppå planlagte kostnader.</p></div>`;
    if(value.budgetOre!==null && t.spentOre>value.budgetOre) target.insertAdjacentHTML('beforeend',`<p class="economy-message error">Registrert forbruk overskrider totalrammen med ${M.format(t.spentOre-value.budgetOre)}.</p>`);
    for(const item of value.items){const row=host.querySelector(`[data-item="${CSS.escape(item.id)}"] .economy-item-total`);if(row)row.textContent=t.planned(item)===null?'Planlagt sum: Beløp mangler':'Planlagt sum: '+M.format(t.planned(item));}
    host.dataset.overBudget=over;
  }
  function markDraft() {
    const project=current();if (!project || locked(project)) return;
    drafts.set(project.id,read());
    q('#economy-save-status').textContent='Ulagrede endringer';
    q('#economy-discard').hidden=false;
    q('#economy-form').dataset.unsaved='true';
    summary(drafts.get(project.id));
  }
  function render({followActive=false,projectId=null}={}) {
    if (!P) return;
    pruneDrafts();
    if (projectId) selectedId=projectId;
    else if (followActive && cur()) selectedId=cur().id;
    if (!current()) selectedId=cur()?.id || P.liste.find(project=>!project.arkivert)?.id || P.liste[0]?.id || null;
    const project=current();
    if (!project) {host.innerHTML='<section class="economy-empty"><h3>Opprett et prosjekt først</h3><p>Økonomiske rammer lagres per prosjekt. Opprett et prosjekt eller importer en delt prosjektfil for å komme i gang.</p><a href="#prosjekter">Gå til Mine prosjekter →</a></section>';return;}
    const raw=draftFor(project), readOnly=locked(project), dirty=drafts.has(project.id);
    host.innerHTML=`<div class="economy-project-selector"><label for="economy-project">Prosjekt</label><select id="economy-project" aria-label="Velg prosjekt for økonomi">${P.liste.map(item=>`<option value="${esc(item.id)}"${item.id===project.id?' selected':''}>${esc(projectTitle(item))}${item.arkivert?' · Arkiv':isClosed(item)?' · Avsluttet':''}${drafts.has(item.id)?' · Ulagret utkast':''}</option>`).join('')}</select></div><div class="economy-project-heading"><h3>${esc(projectTitle(project))}</h3>${projectStamps(project,D.plantyper.find(p=>p.id===project.plan))}<p>Alle beløp i NOK, ekskl. mva. Rammen gjelder planarbeidet – ikke byggekostnaden.</p></div>${readOnly?'<p class="economy-message">Prosjektet er avsluttet. Økonomien vises som lesekopi. Gjenåpne prosjektet i Mine prosjekter for å endre tallene.</p>':''}${raw.invalidSaved?'<p class="economy-message error">Lagret økonomi kunne ikke leses. Den er ikke overskrevet. Eksporter prosjektet før du gjør endringer.</p>':''}${[...drafts.keys()].some(id=>id!==project.id)?'<p class="economy-message">Du har ulagrede økonomiutkast i andre prosjekter. De er merket i prosjektvelgeren; velg prosjektet for å lagre eller forkaste utkastet.</p>':''}<div id="economy-summary" aria-label="Økonomisk oversikt"></div><form id="economy-form" data-unsaved="${dirty}" novalidate><fieldset ${readOnly||raw.invalidSaved?'disabled':''}><legend class="economy-section-title">Økonomiske rammer</legend><div class="economy-frame-fields">${input('Totalramme (kr)','budget',raw.budget,'placeholder="F.eks. 250000"')}${input('Reserve (%)','reserve',raw.reserve,'aria-describedby="reserve-help"')}</div><p id="reserve-help" class="economy-hint">Reserven beregnes av totalrammen og inngår i disponert beløp. Bruk 0 hvis du ikke vil sette av reserve.</p><div class="economy-cost-heading"><h3>Kostnadsposter</h3><button type="button" id="economy-add"${raw.items.length>=100?' disabled':''}>+ Legg til post</button></div><p class="economy-hint">Bruk for eksempel planarbeid, GIS, fagutredninger, gebyrer eller andre prosjektkostnader. Timer × timesats beregnes automatisk.</p><div class="economy-items">${raw.items.length?raw.items.map((item,index)=>`<section class="economy-item" data-item="${esc(item.id)}"><div class="economy-item-heading"><h4>Post ${String(index+1).padStart(2,'0')}</h4><button type="button" data-economy-remove="${esc(item.id)}" aria-label="Fjern kostnadspost ${index+1}" title="Fjern post"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"/></svg></button></div><div class="economy-item-fields"><label class="economy-label-field">Ressurs eller kostnad<input name="item-label" maxlength="120" value="${esc(item.label)}" placeholder="F.eks. Geoteknisk vurdering"></label><label>Beregningsmåte<select name="item-kind"><option value="time"${item.kind==='time'?' selected':''}>Timer × timesats</option><option value="fixed"${item.kind==='fixed'?' selected':''}>Fast beløp</option></select></label>${item.kind==='time'?input('Timer','item-hours',item.hours)+input('Timesats (kr/time)','item-rate',item.rate):input('Planlagt beløp (kr)','item-amount',item.amount)}${input('Registrert forbruk (kr)','item-spent',item.spent,'placeholder="Valgfritt"')}</div><p class="economy-item-total"></p></section>`).join(''):'<p class="economy-no-items">Ingen kostnadsposter ennå. Du kan lagre rammen alene og fylle ut kostnadene senere.</p>'}</div><label class="economy-notes-label">Forutsetninger og avgrensninger<textarea name="economy-notes" maxlength="2000" rows="3" placeholder="Hva dekker rammen? Noter prisgrunnlag, avklaringer og eventuelle unntak.">${esc(raw.notes)}</textarea></label></fieldset><p id="economy-error" class="economy-message error" role="alert" hidden></p><div class="economy-save-bar"><p id="economy-save-status" role="status">${dirty?'Ulagrede endringer':project.economy?.updatedAt?'Sist lagret '+esc(fmtD(project.economy.updatedAt)):'Ingen økonomi lagret ennå'}</p><div><button type="button" id="economy-discard"${dirty?'':' hidden'}>Forkast endringer</button><button type="submit" class="pri"${readOnly||raw.invalidSaved?' disabled':''}>Lagre økonomi</button></div></div></form>`;
    if (!raw.invalidSaved) summary(raw);
  }
  function completeEdit() {document.dispatchEvent(new Event('app-edit-complete'));}
  host.addEventListener('input',event=>{if(event.target.closest('#economy-form'))markDraft();});
  host.addEventListener('change',event=>{
    if (event.target.id==='economy-project') {const id=event.target.value;psave();if(!locked(P.liste.find(p=>p.id===id)))popen(id);render({projectId:id});return;}
    if(event.target.name==='item-kind'){markDraft();const id=event.target.closest('.economy-item').dataset.item;render();host.querySelector(`[data-item="${CSS.escape(id)}"] input`)?.focus();}
  });
  host.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.id==='economy-discard'){drafts.delete(selectedId);render();completeEdit();return;}
    if(button.id==='economy-add'){
      markDraft();const raw=drafts.get(selectedId);if(!raw||raw.items.length>=100)return;
      const id=nyId();raw.items.push({id,label:'',kind:'time',hours:'',rate:'',amount:'',spent:''});render();host.querySelector(`[data-item="${CSS.escape(id)}"] input`)?.focus();return;
    }
    if(button.dataset.economyRemove){markDraft();const raw=drafts.get(selectedId);if(!raw)return;raw.items=raw.items.filter(item=>item.id!==button.dataset.economyRemove);render();q('#economy-add')?.focus();}
  });
  host.addEventListener('submit',event=>{
    if(event.target.id!=='economy-form')return;event.preventDefault();
    const project=current();if(!project||locked(project))return;
    try{
      const value=canonical(read());value.updatedAt=new Date().toISOString();
      // Oppdater kun økonomien i den nyeste lagringen, ikke en gammel prosjektkopi.
      const latest=JSON.parse(localStorage.getItem(PK)||'null');
      if(!latest||!Array.isArray(latest.liste))throw new Error('Prosjektlagringen er ikke tilgjengelig. Endringene dine er beholdt som utkast.');
      const target=latest.liste.find(item=>item.id===project.id);
      if(!target)throw new Error('Prosjektet finnes ikke lenger i lagringen.');
      if(locked(target))throw new Error('Prosjektet er avsluttet. Gjenåpne det før du lagrer økonomi.');
      target.economy=value;target.endret=value.updatedAt;
      localStorage.setItem(PK,JSON.stringify(latest));
      project.info=target.info;project.navn=target.navn;project.economy=value;project.endret=value.updatedAt;
      drafts.delete(project.id);render();q('#economy-save-status').textContent='Økonomien er lagret lokalt.';completeEdit();
    }catch(error){q('#economy-error').hidden=false;q('#economy-error').textContent=error.name==='QuotaExceededError'?'Lagringsplassen er full. Endringene er beholdt som utkast.':error.message;q('#economy-error').scrollIntoView({block:'nearest'});}
  });
  window.addEventListener('beforeunload',event=>{pruneDrafts();if(drafts.size){event.preventDefault();event.returnValue='';}});
  window.addEventListener('storage',event=>{
    if(event.key!==PK||!event.newValue||!P)return;
    try{const latest=JSON.parse(event.newValue);for(const project of P.liste){const other=latest.liste?.find(item=>item.id===project.id);if(other?.economy)project.economy=other.economy;}if(location.hash==='#okonomi'&&!drafts.has(selectedId))render();}catch(error){}
  });
  return {render,hasUnsaved:()=>{pruneDrafts();return drafts.size>0;},selectProject:id=>render({projectId:id})};
})();
