const S = { plan: null, akt: null, sel: new Set() };
const $ = s => document.querySelector(s);
const D = window.DATA;


function btns(box, list, key, multi) {
  const b = $(box);
  b.innerHTML = list.map(([id, n]) => `<button data-id="${id}">${n}</button>`).join('');
  b.onclick = e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    if (multi) S.sel.has(id) ? S.sel.delete(id) : S.sel.add(id);
    else S[key] = S[key] === id ? null : id;
    psave(1); mark(); render();
  };
}

function mark() {
  document.querySelectorAll('button[data-id]').forEach(b => {
    const id = b.dataset.id, p = b.parentElement.id;
    const on = p === 'plan' ? S.plan === id : p === 'akt' ? S.akt === id : S.sel.has(id);
    b.setAttribute('aria-pressed', on);
  });
  const groups = { plan: D.plantyper, akt: D.aktorer, formal: D.faktorer.filter(f => f.gr === 'formal'), sted: D.faktorer.filter(f => f.gr === 'sted') };
  Object.entries(groups).forEach(([key, list]) => {
    const selected = list.filter(x => key === 'plan' ? x.id === S.plan : key === 'akt' ? x.id === S.akt : S.sel.has(x.id));
    const summary = $('#' + key + '-summary');
    summary.textContent = selected.length ? selected.map(x => x.navn).join(', ') : (key === 'plan' || key === 'akt' ? 'Ikke valgt' : 'Ingen valgt');
    summary.closest('details').classList.toggle('has-selection', selected.length > 0);
  });
  const example = D.eks.findIndex(x => x.plan === S.plan && x.akt === S.akt && x.sel.length === S.sel.size && x.sel.every(id => S.sel.has(id)));
  $('#save-scenario').disabled = !S.plan;
  $('#save-scenario-hint').textContent = S.plan ? 'Valgene dine følger med, så du kan fortsette senere.' : 'Velg plantype først. Resten kan du fylle ut senere.';
  $('#eks').value = example < 0 ? '' : String(example);
  $('#eks-hint').textContent = example < 0 ? 'Et eksempel fyller ut valgene for deg.' : D.eks[example].tekst;
}

function init() {
  $('#ver').textContent = D.meta.versjon + ' (' + D.meta.oppdatert + ')';
  $('#eks').replaceChildren(new Option('Velg eksempelscenario …', ''), ...D.eks.map((e, i) => new Option(e.navn, i)));
  $('#eks').onchange = e => {
    if (e.target.value === '') return;
    const x = D.eks[Number(e.target.value)];
    S.plan = x.plan; S.akt = x.akt; S.sel = new Set(x.sel);
    psave(1); mark(); render();
  };
  btns('#plan', D.plantyper.map(p => [p.id, `${p.navn}<small>${p.beskrivelse}</small>`]), 'plan');
  btns('#akt', D.aktorer.map(a => [a.id, a.navn]), 'akt');
  btns('#formal', D.faktorer.filter(f => f.gr === 'formal').map(f => [f.id, f.navn]), null, true);
  btns('#sted', D.faktorer.filter(f => f.gr === 'sted').map(f => [f.id, f.navn]), null, true);
  mark();
}

const a = (t, u) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`;
const LOV = [[/^pbl §§? (\d+-\d+)/, 'lov/2008-06-27-71'], [/^TEK17 § (\d+-\d+)/, 'forskrift/2017-06-19-840'], [/^jordloven § (\d+)/, 'lov/1995-05-12-23'], [/^kulturminneloven § (\d+)/, 'lov/1978-06-09-50'], [/^naturmangfoldloven §§ (\d+)/, 'lov/2009-06-19-100']];
function refUrl(r) {
  for (const [re, base] of LOV) { const m = r.match(re); if (m) return `https://lovdata.no/${base}/§${m[1]}`; }
  if (/^KU-forskriften/.test(r)) return 'https://lovdata.no/forskrift/2017-06-21-854';
  return (D.refurl || {})[r] || null;
}
const GK = [[/\bros\b/i, 'ros'], [/planprogram/i, 'planprogram'], [/konsekvensutredning/i, 'ku'], [/planbeskrivelse/i, 'planbeskrivelse'], [/bestemmelser/i, 'bestemmelser'], [/medvirkning|varsel om oppstart/i, 'medvirkning']];
const checklistTitle = title => esc(title).replace(/kulturminnevurdering/gi, word => word.slice(0, 11) + '\u00ad' + word.slice(11)).replace(/reguleringsbestemmelser/gi, word => word.slice(0, 11) + '\u00ad' + word.slice(11)).replace(/konsekvensutredning/gi, word => word.slice(0, 10) + '\u00ad' + word.slice(10));
const li = (i, grp) => {
  const url = i.r ? refUrl(i.r) : null;
  const ref = i.r ? (url ? `<a class="ref" href="${url}" target="_blank" rel="noopener">${i.r}</a>` : `<span class="ref">${i.r}</span>`) : '';
  const gk = GK.find(([re]) => re.test(i.t)), gg = gk && G.find(x => x.id === gk[1]);
  const lk = [...(i.l || []).map(([t, u]) => a(t, u)), ...(gg ? [`<a href="#${gg.id}">Les mer: ${gg.navn}</a>`] : [])];
  const d = (i.w ? `<p>${i.w}</p>` : '') + (i.f ? `<p class="fall"><b>Fallgruve:</b> ${i.f}</p>` : '') +
    (i.ex ? `<p class="exm"><b>Eksempel:</b> ${i.ex}</p>` : '') +
    (i.utl ? `<div class="utl"><p>Utredninger som skal inngå i planforslaget</p><ul>${i.utl.map(n => { const k = GK.find(([re]) => re.test(n)), g = k && G.find(x => x.id === k[1]); return `<li>${g ? `<a href="#${g.id}">${n}</a>` : n}</li>`; }).join('')}</ul></div>` : '') +
    (lk.length ? `<p class="lenker">${lk.join('')}</p>` : '');
  const key = grp + ':' + i.t;
  const ck = `<input type="checkbox" class="ck" data-k="${key}"${ST.d[key] ? ' checked' : ''}${i.uk ? ` data-a="${i.uk[0]}" data-b="${i.uk[1]}"` : ''} aria-label="Fullført: ${i.t}">`;
  const uk = i.uk ? `<span class="ref">${i.uk[0]}–${i.uk[1]} uker</span>` : '';
  return `<li>${d ? `<details><summary>${ck}<b>${checklistTitle(i.t)}</b>${ref}${uk}</summary>${d}</details>` : `<div class="row">${ck}<b>${checklistTitle(i.t)}</b>${ref}${uk}</div>`}</li>`;
};
const fmtT = (a, b) => b <= 12 ? `${a}–${b} uker` : `${Math.round(a / 4.35)}–${Math.round(b / 4.35)} mnd`;
let ST = { d: {}, t: null };
const PK = 'a101:prosjekter';
let P = null;
const nyId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const nytt = navn => { const n = new Date().toISOString(); return { id: nyId(), navn, plan: null, akt: null, sel: [], d: {}, t: null, opprettet: n, endret: n }; };
const cur = () => P.liste.find(x => x.id === P.aktiv) || null;
const isClosed = project => project?.info?.status === 'Avsluttet';
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtD = s => s ? new Date(s).toLocaleDateString('nb-NO') : '';
function pload() {
  try { P = JSON.parse(localStorage.getItem(PK)); } catch (e) { P = null; }
  if (!P || !Array.isArray(P.liste)) P = { aktiv: null, liste: [] };
  // Fjerner det tidligere autogenererte standardprosjektet
  P.liste = P.liste.filter(p => !(p.navn === 'Mitt prosjekt' && !p.info));
  if (isClosed(cur())) P.aktiv = null;
}
function psave(touch) {
  const c = cur();
  if (c && !isClosed(c)) {
    Object.assign(c, { plan: S.plan, akt: S.akt, sel: [...S.sel], d: ST.d, t: ST.t });
    if (touch) c.endret = new Date().toISOString();
  }
  try { localStorage.setItem(PK, JSON.stringify(P)); } catch (e) {}
}
function popen(id) {
  const requested = P.liste.find(x => x.id === id);
  if (isClosed(requested)) { pdialog(id); return; }
  P.aktiv = P.liste.some(x => x.id === id) ? id : null;
  const c = cur() || {};
  S.plan = c.plan || null; S.akt = c.akt || null; S.sel = new Set(c.sel || []);
  ST = { d: c.d || {}, t: c.t || null };
  const sel = $('#pvelg');
  sel.replaceChildren(new Option(P.liste.length ? 'Ingen prosjekt valgt' : 'Ingen prosjekter ennå', ''), ...P.liste.filter(x => !isClosed(x)).map(x => new Option((x.info && x.info.nr ? x.info.nr + ' – ' : '') + x.navn, x.id)));
  sel.value = P.aktiv || '';
  renderProjectPicker();
  $('.plink').textContent = P.liste.length ? 'Gå til mine prosjekter →' : 'Opprett et prosjekt →';
  const i = c.info || {}, pi = $('#pinfo');
  const parts = [i.oppdragsgiver, i.kommune, i.leder && 'PL: ' + i.leder].filter(Boolean);
  pi.replaceChildren();
  if (i.status) { const b = document.createElement('span'); b.className = 'badge'; b.dataset.s = i.status; b.textContent = i.status; pi.append(b); }
  pi.append(parts.join(' · '));
  pi.hidden = !i.status && !parts.length;
  psave(); mark(); render();
}
const projectTitle = project => [project.info?.nr, project.navn].filter(Boolean).join(' – ');
function projectStamps(project, plan) {
  return `<div class="project-stamps"><span class="project-stamp">${esc(plan?.navn || 'Plantype ikke valgt')}</span><span class="project-stamp">${esc(project.info?.type || 'Oppdragstype ikke angitt')}</span>${project.info?.status ? `<span class="badge" data-s="${esc(project.info.status)}">${esc(project.info.status)}</span>` : ''}</div>`;
}
function projectHeading(project, plan) {
  return `<h2 class="project-main-title">${esc(projectTitle(project))}</h2>${projectStamps(project, plan)}`;
}
function closeProjectPicker(restoreFocus = false) {
  $('.project-menu').hidden = true;
  $('#project-picker').setAttribute('aria-expanded', 'false');
  if (restoreFocus) $('#project-picker').focus();
}
function renderProjectPicker() {
  const project = cur();
  $('#project-picker-name').textContent = project ? projectTitle(project) : 'Velg prosjekt';
  $('#project-picker-meta').textContent = project ? [D.plantyper.find(x => x.id === project.plan)?.navn, project.info?.type].filter(Boolean).join(' · ') || 'Aktivt prosjekt' : P.liste.length ? P.liste.length + ' lagrede prosjekter' : 'Start med valgene nedenfor';
  $('#project-picker').dataset.projectStatus = project?.info?.status || '';
  const options = [{id: '', navn: 'Uten prosjekt', detail: 'Utforsk et nytt scenario'}, ...P.liste.filter(p => !isClosed(p)).map(p => ({id:p.id, navn:projectTitle(p), detail:[D.plantyper.find(x => x.id === p.plan)?.navn, p.info?.type, p.info?.status].filter(Boolean).join(' · ') || 'Lagret prosjekt'}))];
  $('#project-options').innerHTML = options.map(p => `<button type="button" role="option" tabindex="-1" aria-selected="${p.id === (P.aktiv || '')}" data-project-id="${esc(p.id)}"><span><span class="project-option-name">${esc(p.navn)}</span><small>${esc(p.detail)}</small></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4 10-10"/></svg></button>`).join('');
  closeProjectPicker();
}
function initProjectPicker() {
  const picker = $('#project-picker'), options = $('#project-options');
  function open(last = false) {
    $('.project-menu').hidden = false;
    picker.setAttribute('aria-expanded', 'true');
    const items = [...options.querySelectorAll('[role=option]')];
    (last ? items.at(-1) : options.querySelector('[aria-selected=true]') || items[0]).focus({preventScroll:true});
  }
  picker.onclick = () => picker.getAttribute('aria-expanded') === 'true' ? closeProjectPicker() : open();
  picker.onkeydown = e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(e.key === 'ArrowUp'); }
  };
  options.onclick = e => {
    const option = e.target.closest('[role=option]');
    if (!option) return;
    $('#pvelg').value = option.dataset.projectId;
    $('#pvelg').dispatchEvent(new Event('change'));
    closeProjectPicker(true);
  };
  options.onkeydown = e => {
    const items = [...options.querySelectorAll('[role=option]')], current = items.indexOf(document.activeElement);
    let next;
    if (e.key === 'ArrowDown') next = (current + 1) % items.length;
    if (e.key === 'ArrowUp') next = (current - 1 + items.length) % items.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = items.length - 1;
    if (next !== undefined) { e.preventDefault(); items[next].focus(); }
  };
  document.addEventListener('click', e => { if (!e.target.closest('.project-select')) closeProjectPicker(); });
  $('.project-select').addEventListener('keydown', e => {
    if (e.key === 'Escape' && picker.getAttribute('aria-expanded') === 'true') { e.preventDefault(); e.stopPropagation(); closeProjectPicker(true); }
  });
  $('.project-select').addEventListener('focusout', e => { if (!e.currentTarget.contains(e.relatedTarget)) closeProjectPicker(); });
}
const PF = ['navn', 'nr', 'status', 'type', 'oppdragsgiver', 'kontakt', 'epost', 'tlf', 'leder', 'saksbeh', 'kommune', 'planid', 'gbnr', 'sted', 'start', 'vedtak', 'notat'];
let pid = null, toastT, projectScenario = null;
function toast(msg, undo) {
  const t = $('#toast'), hide = () => { t.hidden = true; };
  t.replaceChildren(Object.assign(document.createElement('span'), { textContent: msg }));
  if (undo) t.append(Object.assign(document.createElement('button'), { textContent: 'Angre', onclick: () => { hide(); undo(); } }));
  t.hidden = false; t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(hide, undo ? 7000 : 3000);
}
function pdialog(id, fromScenario = false) {
  projectScenario = fromScenario ? { plan: S.plan, akt: S.akt, sel: [...S.sel] } : null;
  const f = $('#pform'), p = id ? P.liste.find(x => x.id === id) : null;
  pid = p ? p.id : null;
  const info = p ? { ...p.info, navn: p.navn } : { status: 'Planlegging', start: new Date().toISOString().slice(0, 10) };
  PF.forEach(k => { f.elements[k].value = info[k] || ''; });
  if (!f.elements.status.value) f.elements.status.value = 'Planlegging';
  f.elements.plan.value = p ? p.plan || '' : projectScenario?.plan || '';
  f.elements.akt.value = p ? p.akt || '' : S.akt || '';
  $('#pdlg-e').textContent = p ? 'Prosjekt' + (p.opprettet ? ' · opprettet ' + fmtD(p.opprettet) : '') : 'Prosjekt';
  $('#pdlg-t').textContent = p ? p.navn : 'Nytt prosjekt';
  $('#psubmit').textContent = p ? 'Lagre endringer' : 'Opprett prosjekt';
  $('#pslett').hidden = !p;
  $('#popne').hidden = !p || isClosed(p);
  $('#preopen').hidden = !isClosed(p);
  $('#pfeil').hidden = true;
  const summary = $('#scenario-project-summary');
  summary.hidden = !projectScenario;
  summary.textContent = projectScenario ? 'Scenarioet følger med: ' + [D.plantyper.find(x => x.id === projectScenario.plan)?.navn, D.aktorer.find(x => x.id === projectScenario.akt)?.navn, ...D.faktorer.filter(x => projectScenario.sel.includes(x.id)).map(x => x.navn)].filter(Boolean).join(' · ') : '';
  $('#pdlg').showModal();
  f.elements.navn.focus();
}
function psubmit(e) {
  e.preventDefault();
  const f = e.target, bad = [...f.elements].find(x => x.willValidate && !x.checkValidity());
  if (bad || !f.elements.navn.value.trim()) {
    const el = bad || f.elements.navn;
    $('#pfeil').textContent = el.name === 'navn' ? 'Prosjektnavn må fylles ut.' : 'Sjekk feltet «' + el.closest('label').firstChild.textContent.trim() + '».';
    $('#pfeil').hidden = false; el.focus(); return;
  }
  psave();
  if (e.submitter?.id === 'preopen') f.elements.status.value = 'Pågår';
  const info = Object.fromEntries(PF.map(k => [k, f.elements[k].value.trim()]));
  const navn = info.navn; delete info.navn;
  const plan = f.elements.plan.value || null, akt = f.elements.akt.value || null;
  if (pid) {
    Object.assign(P.liste.find(x => x.id === pid), { navn, info, plan, akt, endret: new Date().toISOString() });
    if (pid === P.aktiv) { S.plan = plan; S.akt = akt; }
    if (info.status === 'Avsluttet' && pid === P.aktiv) P.aktiv = null;
    toast(e.submitter?.id === 'preopen' ? 'Prosjektet er gjenåpnet.' : info.status === 'Avsluttet' ? 'Prosjektet er avsluttet og inaktivt.' : 'Endringene er lagret.');
  } else {
    const p = Object.assign(nytt(navn), { info, plan, akt, sel: projectScenario ? [...projectScenario.sel] : [] });
    P.liste.push(p); pid = p.id;
    psave();
    if (!isClosed(p)) P.aktiv = pid;
    toast(isClosed(p) ? `«${navn}» er opprettet som avsluttet prosjekt.` : `«${navn}» er opprettet og satt som aktivt prosjekt.`);
  }
  $('#pdlg').close();
  const open = ['popne', 'preopen'].includes(e.submitter?.id) && info.status !== 'Avsluttet';
  popen(open ? pid : P.aktiv);
  if (open) location.hash = 'veileder';
  else renderProj();
}
function pslett() {
  const ix = P.liste.findIndex(x => x.id === pid), p = P.liste[ix], varAktiv = pid === P.aktiv;
  P.liste.splice(ix, 1);
  $('#pdlg').close();
  popen(varAktiv ? null : P.aktiv);
  renderProj();
  toast(`«${p.navn}» er slettet.`, () => {
    P.liste.splice(Math.min(ix, P.liste.length), 0, p);
    popen(varAktiv ? p.id : P.aktiv);
    renderProj();
  });
}
function renderProj() {
  if (!P) return;
  const q = $('#psok').value.trim().toLowerCase(), s = $('#psort').value;
  const hay = p => [p.navn, ...Object.values(p.info || {})].join(' ').toLowerCase();
  const list = P.liste.filter(p => !q || hay(p).includes(q)).sort((a, b) =>
    s === 'navn' ? a.navn.localeCompare(b.navn, 'nb') :
    s === 'nr' ? ((a.info || {}).nr || '\uffff').localeCompare((b.info || {}).nr || '\uffff', 'nb', { numeric: true }) :
    (b.endret || '').localeCompare(a.endret || ''));
  $('#pantall').textContent = !P.liste.length ? 'Ingen prosjekter ennå' : P.liste.length === 1 ? '1 prosjekt' : P.liste.length + ' prosjekter';
  const ny = '<button class="pcard pnew" data-ny="1"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Opprett nytt prosjekt</button>';
  $('#plist').innerHTML = ny + (list.length ? list.map(p => {
    const i = p.info || {}, pl = D.plantyper.find(x => x.id === p.plan), n = Object.keys(p.d || {}).length;
    const meta = [i.oppdragsgiver, i.kommune].filter(Boolean).map(esc).join(' · ');
    return `<button class="pcard${p.id === P.aktiv && !isClosed(p) ? ' on' : ''}" data-pid="${esc(p.id)}" data-project-status="${esc(i.status || '')}">` +
      `<span class="pc-top"><span>${i.nr ? esc(i.nr) : 'Uten nummer'}</span>${p.id === P.aktiv && !isClosed(p) ? '<span class="pc-akt">Aktiv</span>' : isClosed(p) ? '<span class="pc-inactive">Inaktiv</span>' : ''}</span>` +
      `<span class="pc-navn">${esc(projectTitle(p))}</span>${projectStamps(p, pl)}` +
      `<span class="pc-meta">${meta || 'Ingen oppdragsgiver registrert'}</span>` +
      `<span class="pc-foot"><span>${pl ? pl.navn : 'Plantype ikke valgt'}${n ? ` · ${n} avkrysset` : ''}</span><span>${fmtD(p.endret)}</span></span></button>`;
  }).join('') : `<p class="pempty">${P.liste.length ? 'Ingen prosjekter samsvarer med søket.' : 'Du har ingen prosjekter ennå. Opprett et prosjekt for å lagre scenario, avkrysninger og prosjektdetaljer.'}</p>`);
}
function initProj() {
  pload();
  initProjectPicker();
  const f = $('#pform');
  f.elements.plan.innerHTML = '<option value="">Ikke valgt</option>' + D.plantyper.map(p => `<option value="${p.id}">${p.navn}</option>`).join('');
  f.elements.akt.innerHTML = '<option value="">Ikke valgt</option>' + D.aktorer.map(a => `<option value="${a.id}">${a.navn}</option>`).join('');
  f.onsubmit = psubmit;
  $('#pdlg-x').onclick = $('#pdlg-avbryt').onclick = () => $('#pdlg').close();
  $('#pdlg').onclick = e => { if (e.target === e.currentTarget) e.currentTarget.close(); };
  $('#pslett').onclick = pslett;
  $('#save-scenario').onclick = () => pdialog(null, true);
  $('#pvelg').onchange = e => { psave(); popen(e.target.value); };
  $('#plist').onclick = e => {
    const b = e.target.closest('.pcard'); if (!b) return;
    pdialog(b.dataset.ny ? null : b.dataset.pid);
  };
  $('#psok').oninput = $('#psort').onchange = renderProj;
  popen(P.aktiv);
}
const sec = (h, items, tag = 'ul', cnt) => items.length ? `<h2>${h}${cnt ? '<span class="cnt"></span>' : ''}</h2><${tag}>${items.join('')}</${tag}>` : '';

function renderTeam(plan) {
  const team = window.recommendTeam(plan, S.sel, S.akt);
  const project = cur();
  const rows = roles => roles.map(role => `<li class="team-role"><div class="team-role-heading"><b>${esc(role.name)}</b><span class="team-count">${esc(role.count)}</span></div><p>${esc(role.task)}</p><p class="team-when"><span>Involveres</span> ${esc(role.when)}</p>${role.triggers?.length ? `<p class="team-trigger">Basert på: ${role.triggers.map(id => esc(D.faktorer.find(f => f.id === id).navn)).join(', ')}</p>` : ''}</li>`).join('');
  const context = S.akt === 'kommune' ? 'For kommunen: skill mellom rollen som planmyndighet og eventuelt eget planarbeid. Avklar saksbehandler, interne sektorer og politiske beslutningspunkter.' : S.akt === 'utbygger' ? 'For forslagsstiller: utpek en prosjekteier som godkjenner rammer og beslutninger, og avklar grensesnittet mot kommunen.' : S.akt === 'konsulent' ? 'For konsulentteamet: avklar mandat og leveranser med oppdragsgiver. Oppdragsgiver og kommunen inngår normalt ikke i bemanningen til konsulentteamet.' : 'Avklar hvem som er prosjekteier, forslagsstiller og kommunens kontaktperson før oppstart.';
  return `<aside class="team-plan" aria-labelledby="team-title"><p class="eyebrow">Ressursplanlegging</p><h2 id="team-title">Anbefalt team</h2><div class="team-overview"><strong>${team.min}–${team.max}</strong><span>personer i kjerneteamet<br><small>+ fagressurser etter behov</small></span></div><p>${esc(team.explanation)}</p><p class="team-basis">Et planleggingsanslag basert på plantype og valgene dine, ikke et bemanningskrav. Antall gjelder personer gjennom prosjektet, ikke årsverk eller samtidig fulltidsbemanning. Avklar omfang og timebudsjett før bestilling.</p>${project?.info?.leder ? `<p class="team-leader">Registrert prosjektleder: <b>${esc(project.info.leder)}</b></p>` : ''}<details open><summary>Kjerneteam <span class="team-detail-note">roller og ansvar</span></summary><p class="team-note">Én person kan dekke flere roller ved riktig kompetanse. Kvalitetssikring bør utføres av en annen enn forfatteren. Rolleantallene skal derfor ikke summeres direkte.</p><ul class="team-roles">${rows(team.core)}</ul></details><details><summary>Fagressurser <span class="team-detail-note">${team.specialists.length} anbefalte fagroller</span></summary>${team.specialists.length ? `<p class="team-note">Kobles inn for avgrensede leveranser. Roller kan kombineres der kompetansen dekker behovet; antallene skal ikke summeres ukritisk.</p><ul class="team-roles">${rows(team.specialists)}</ul>` : '<p class="team-note">Ingen ekstra fagroller er foreslått ut fra valgene ennå. Avklar fagbehov i oppstartsmøtet; ingen valgte stedsforhold betyr ikke at området er uten risiko.</p>'}</details><details><summary>Samordning og beslutninger</summary><p class="team-note">${context}</p><ul class="team-management"><li><b>Fordel tverrgående ansvar:</b> ROS, medvirkning, barn og unge, klima og universell utforming må ha en navngitt ansvarlig i teamet. Bruk fagstøtte ved behov.</li><li><b>Før oppstart:</b> avtal ansvarlig, leveranse, timebudsjett og frist for hver fagressurs.</li><li><b>Ved milepæler:</b> følg opp fremdrift, økonomi, avhengigheter og beslutninger. Samordne fag før høring og innsending.</li></ul></details></aside>`;
}

function render() {
  const out = $('#out');
  const p = D.plantyper.find(x => x.id === S.plan);
  const project = cur();
  out.dataset.projectStatus = project?.info?.status || '';
  renderProjectPicker();
  if (!p) { out.innerHTML = (project ? projectHeading(project, p) : '') + '<p class="hint">Velg plantype for å få råd. Legg til formål og stedsforhold for et mer treffsikkert scenario.</p>'; return; }
  const f = D.faktorer.filter(x => S.sel.has(x.id));
  const kombo = D.kombo.filter(k => k.if.every(i => S.sel.has(i)));
  const ku = p.ku || f.some(x => x.ku);
  const akt = D.aktorer.find(a => a.id === S.akt);
  const signal = [
    ...(ku ? ['<li class="alert"><b>Vurder planprogram og konsekvensutredning</b><span class="ref">KU-forskriften, pbl § 4-1</span></li>'] : []),
    ...kombo.map(k => `<li class="alert">${k.tekst}</li>`)
  ];
  const risiko = [
    ...f.map(x => `<li><b>${x.navn}:</b> ${x.risiko}</li>`),
    ...(akt ? [`<li><b>Som ${akt.navn.toLowerCase()}:</b> ${akt.tips}</li>`] : [])
  ];
  const ext = f.reduce((r, x) => x.uker ? [Math.max(r[0], x.uker[0]), Math.max(r[1], x.uker[1])] : r, [0, 0]);
  const utl = [...new Set([...(ku ? ['Planprogram og konsekvensutredning'] : []), ...f.map(x => x.t), ...D.alltid.map(x => x.t)])];
  const steps = p.steg.map(x => ({ ...x, uk: x.ut ? [x.uker[0] + ext[0], x.uker[1] + ext[1]] : x.uker, utl: x.ut ? utl : null }));
  const tot = steps.reduce((r, x) => [r[0] + x.uk[0], r[1] + x.uk[1]], [0, 0]);
  const lang = f.filter(x => x.uker && x.uker[1] > 0).sort((a, b) => b.uker[1] - a.uker[1])[0];
  const bars = steps.map(x => `<i style="flex:${x.uk[1]}" title="${x.t}: ${x.uk[0]}–${x.uk[1]} uker"></i>`).join('');
  const box = `<div class="prog"><div class="bar"><i id="pbar"></i></div><p id="ptxt"></p><button id="nullstill" class="link">Nullstill avkryssing</button></div>` +
    `<div class="tlbox"><p><b>Estimert tid til vedtak: ${fmtT(tot[0], tot[1])}</b> (${tot[0]}–${tot[1]} uker)</p><div class="tlbar">${bars}</div><p id="rest"></p>` +
    (lang ? `<p>Lengste utredning i dette scenarioet: <b>${lang.navn}</b> (+${lang.uker[0]}–${lang.uker[1]} uker).</p>` : '') +
    `<p>Grovt anslag. Utredningene antas å løpe parallelt, og den lengste styrer. Faktisk tid avhenger av kommunens kapasitet, kvaliteten på underlaget og eventuelle innsigelser.</p></div>`;
  out.innerHTML =
    (project ? projectHeading(project, p) : `<h2>${p.navn}<span class="ref">${p.r}</span></h2>`) + `<p class="sub">${p.beskrivelse}</p>${project ? `<p class="project-plan-ref">${esc(p.r)}</p>` : ''}<button id="alle" class="link">Åpne alle beskrivelser</button>` + box +
    sec('Gjenkjent scenario', signal) +
    renderTeam(p) +
    sec('Anbefalt prosess', steps.map(x => li(x, 'steg')), 'ol', 1) +
    `<aside class="work-order" aria-labelledby="work-order-title">
      <h3 id="work-order-title">Hva gjør du først?</h3>
      <p>Utredninger og plandokumenter utvikles delvis parallelt. Listene nedenfor er sjekklister, ikke en fast arbeidsrekkefølge.</p>
      <ol>
        <li><b>Innhent kunnskap og innspill.</b> Start medvirkning tidlig, og avklar barn og unges interesser før løsningen låses. Medvirkning fortsetter gjennom planarbeidet.</li>
        <li><b>Avklar risiko og stedets forutsetninger.</b> Start ROS, klima- og overvannsvurderinger tidlig. Kartlegg også behov for universell utforming. Gjør relevante fagutredninger parallelt.</li>
        <li><b>Prøv ut løsninger.</b> Bruk skisser og, der det er relevant, illustrasjonsplan og snitt. Juster arealbruk, terreng, adkomst og utearealer ut fra utredninger og innspill.</li>
        <li><b>Utarbeid plankart og bestemmelser sammen.</b> Sikre nødvendige tiltak og rekkefølgekrav i de bindende plandokumentene.</li>
        <li><b>Ferdigstill og kontroller helheten.</b> ${p.id === 'endring' ? 'Oppdater begrunnelsen og vurderingen av virkninger for endringen.' : 'Skriv planbeskrivelsen underveis, og ferdigstill den når løsningen er avklart.'} Oppdater ROS slik at den gjelder forslaget som sendes inn.</li>
      </ol>
      <p class="work-order-note"><b>Hvorfor står ROS begge steder?</b> Det er samme analyse: Den starter som utredning og oppdateres til et dokument som følger planforslaget. Avkryssingene skiller mellom gjennomført utredning og ferdig dokument i planforslaget.</p>
      <p class="work-order-note">Illustrasjoner forklarer løsningen. Bindende krav må sikres i plankart og bestemmelser. Omfanget av arbeidet tilpasses plantype og tiltak.</p>
    </aside>` +
    sec('Utredninger og tema', [...f.map(x => li(x, 'utr')), ...D.alltid.map(x => li(x, 'utr'))], 'ul', 1) +
    sec('Innhold i planforslaget', p.innhold.map(x => li(x, 'inn')), 'ul', 1) +
    sec('Risiko og fallgruver', risiko) +
    sec('Veiledere og eksempeldokumenter', D.dok.filter(x => !x.p || x.p.includes(S.plan)).map(x => `<li><div class="row">${a(x.t, x.u)}<span class="ref">${x.k}</span></div></li>`));
  wireToggle();
  updateProgress();
}

function updateProgress() {
  const all = [...document.querySelectorAll('#out .ck')], done = all.filter(x => x.checked);
  const pct = all.length ? Math.round(done.length / all.length * 100) : 0;
  $('#pbar').style.width = pct + '%';
  $('#ptxt').textContent = `${done.length} av ${all.length} punkter fullført (${pct} %)` + (ST.t ? `. Sist oppdatert ${new Date(ST.t).toLocaleDateString('nb-NO')}.` : '');
  document.querySelectorAll('#out h2 .cnt').forEach(c => {
    const b = [...c.closest('h2').nextElementSibling.querySelectorAll('.ck')];
    c.textContent = `${b.filter(x => x.checked).length}/${b.length}`;
  });
  const rest = [...document.querySelectorAll('#out .ck[data-a]')].filter(x => !x.checked);
  $('#rest').textContent = rest.length ? `Gjenstår ca. ${fmtT(rest.reduce((n, x) => n + +x.dataset.a, 0), rest.reduce((n, x) => n + +x.dataset.b, 0))} etter avkryssede steg.` : 'Alle prosesstegene er fullført.';
}

function wireToggle() {
  const b = $('#alle'), ds = () => [...document.querySelectorAll('#out details')];
  b.onclick = () => {
    const open = ds().some(d => !d.open);
    ds().forEach(d => d.open = open);
    b.textContent = open ? 'Lukk alle beskrivelser' : 'Åpne alle beskrivelser';
  };
}

function setTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('theme', t); } catch (e) {}
  $('#tema').setAttribute('aria-label', t === 'dark' ? 'Bytt til lys modus' : 'Bytt til mørk modus');
  document.querySelector('meta[name=theme-color]').content = t === 'dark' ? '#1C1B19' : '#F2EFE8';
}
$('#tema').onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
setTheme(document.documentElement.dataset.theme || 'light');

const G = window.GUIDER || [];
const LOGO = '<img class="logo" src="APlogo.png" width="1536" height="1024" alt="" aria-hidden="true">';
$('#mark').innerHTML = LOGO;
$('#nav').innerHTML = `<a href="#veileder" data-p="veileder">Veileder</a><a href="#prosjekter" data-p="prosjekter">Mine prosjekter</a><div class="dd"><button id="ddb" aria-expanded="false" aria-controls="ddm">Guider</button><div class="menu" id="ddm" hidden>${G.map(g => `<a href="#${g.id}" data-p="${g.id}">${g.navn}</a>`).join('')}</div></div>`;
const ddb = $('#ddb'), ddm = $('#ddm');
const dd = open => { ddm.hidden = !open; ddb.setAttribute('aria-expanded', open); };
ddb.onclick = () => dd(ddm.hidden);
document.addEventListener('click', e => { if (!e.target.closest('.dd')) dd(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !ddm.hidden) { dd(false); ddb.focus(); } });
$('#nav').addEventListener('keydown', e => {
  const menu = [...ddm.querySelectorAll('a')], mi = menu.indexOf(e.target);
  if (mi >= 0 && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
    e.preventDefault(); menu[(mi + (e.key === 'ArrowDown' ? 1 : -1) + menu.length) % menu.length].focus(); return;
  }
  if (e.target === ddb && e.key === 'ArrowDown') { e.preventDefault(); dd(true); menu[0].focus(); return; }
  const tabs = [...document.querySelectorAll('#nav > a, #ddb')], i = tabs.indexOf(e.target);
  if (i < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
  e.preventDefault();
  tabs[e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length].focus();
});

function renderGuide(g) {
  const list = (arr, tag = 'ul') => `<${tag}>${arr.map(x => `<li>${x}</li>`).join('')}</${tag}>`;
  const refs = g.hjemmel.map(r => { const u = refUrl(r); return u ? `<a class="ref" href="${u}" target="_blank" rel="noopener">${r}</a>` : `<span class="ref">${r}</span>`; }).join('');
  const title = esc(g.navn).replace(/Reguleringsbestemmelser/g, 'Regulerings\u00adbestemmelser').replace(/Konsekvensutredning/g, 'Konsekvens\u00adutredning');
  $('#guide').innerHTML = `<p class="guide-eyebrow">Plankunnskap</p><h2>${title}</h2><div class="refs">${refs}</div><p class="lead">${g.hva}</p>` +
    `<h3>Når kreves det?</h3>${list(g.nar)}` +
    `<h3>Hva skal det inneholde?</h3><dl>${g.innhold.map(([t, d]) => `<dt>${t}</dt><dd>${d}</dd>`).join('')}</dl>` +
    `<h3>Slik gjør du det</h3>${list(g.steg, 'ol')}` +
    `<h3>Vanlige feil</h3>${list(g.feil)}` +
    `<h3>Dokumenter</h3><p class="lenker">${g.l.map(([t, u]) => a(t, u)).join('')}</p>`;
}

let lastIx = null;
function route() {
  const h = location.hash.slice(1), g = G.find(x => x.id === h), pg = h === 'prosjekter', info = h === 'om' || h === 'faq';
  $('#veileder').hidden = !!g || pg || info;
  $('#prosjekter').hidden = !pg;
  $('#guide').hidden = !g;
  $('#about').hidden = !info;
  document.querySelectorAll('[data-info]').forEach(link => {
    if (link.dataset.info === h) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (g) renderGuide(g);
  if (pg) renderProj();
  const ix = info ? 3 : g ? 2 : pg ? 1 : 0, el = info ? $('#about') : g ? $('#guide') : pg ? $('#prosjekter') : $('#veileder');
  if (lastIx !== null) {
    el.classList.remove('enter-l', 'enter-r', 'enter-f'); void el.offsetWidth;
    el.classList.add(ix > lastIx ? 'enter-r' : ix < lastIx ? 'enter-l' : 'enter-f');
  }
  lastIx = ix;
  document.querySelectorAll('#nav a').forEach(l => l.removeAttribute('aria-current'));
  const cur = document.querySelector(`#nav a[data-p="${g ? g.id : pg ? 'prosjekter' : 'veileder'}"]`);
  if (cur && !info) cur.setAttribute('aria-current', 'page');
  ddb.textContent = 'Plankunnskap';
  ddb.setAttribute('aria-label', g ? 'Plankunnskap, valgt: ' + g.navn : 'Plankunnskap');
  ddb.classList.toggle('on', !!g);
  dd(false);
  window.scrollTo(0, 0);
  if (h === 'faq') requestAnimationFrame(() => { if (location.hash === '#faq') $('#faq-content').scrollIntoView({block: 'start'}); });
}

if (D) { init(); initProj(); }
else $('#out').innerHTML = '<p class="err">Kunne ikke laste data.js. Sjekk at filen ligger i samme mappe som index.html.</p>';

route();
window.onhashchange = route;

let splashTimer, splashRemoval;
function closeSplash() {
  clearTimeout(splashTimer);
  const splash = $('#splash');
  if (!splash || splash.classList.contains('out')) return;
  splash.classList.add('out');
  splashRemoval = setTimeout(() => splash.remove(), 450);
}
async function showSplash(userRequested = false) {
  clearTimeout(splashTimer);
  clearTimeout(splashRemoval);
  $('#splash')?.remove();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion && !userRequested) return;
  const splash = document.createElement('div');
  splash.id = 'splash';
  if (userRequested) splash.classList.add('user-requested');
  splash.setAttribute('aria-hidden', 'true');
  splash.innerHTML = LOGO + '<p class="splash-wordmark"><strong>Areal</strong><span>plan</span></p>';
  splash.onclick = closeSplash;
  document.body.append(splash);
  const image = splash.querySelector('img');
  try {
    await image.decode();
  } catch (error) {
    // Ikke vis navnet alene dersom logosymbolet ikke kan lastes.
    if (splash.isConnected) splash.remove();
    return;
  }
  if (!splash.isConnected || splash.classList.contains('out')) return;
  // Start hele sekvensen fra samme tegnede bilde, også ved kald cache.
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  if (!splash.isConnected || splash.classList.contains('out')) return;
  splash.classList.add('ready');
  splashTimer = setTimeout(closeSplash, reducedMotion ? 1400 : 2500);
}
$('.brand').addEventListener('click', e => {
  if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  if (location.hash !== '#veileder') location.hash = 'veileder';
  showSplash(true);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' || e.key === 'Tab') closeSplash();
});
showSplash();

$('#out').addEventListener('change', e => {
  const c = e.target.closest('.ck'); if (!c) return;
  if (c.checked) ST.d[c.dataset.k] = 1; else delete ST.d[c.dataset.k];
  ST.t = new Date().toISOString(); psave(1); updateProgress();
});
$('#out').addEventListener('click', e => {
  if (e.target.id === 'nullstill') { ST = { d: {}, t: null }; psave(1); render(); }
});

// Installering fra nettleser og hjemskjerm.
let installPrompt = null;
const installButton = $('#install-app');
const installDialog = $('#install-dialog');
const standalone = matchMedia('(display-mode: standalone)');
function updateInstallButton() {
  installButton.hidden = standalone.matches || navigator.standalone === true;
}
updateInstallButton();
standalone.addEventListener('change', updateInstallButton);
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  $('#install-confirm').hidden = false;
});
installButton.onclick = () => {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const android = /Android/.test(navigator.userAgent);
  $('#install-ios').hidden = !ios;
  $('#install-android').hidden = !android || ios;
  $('#install-desktop').hidden = ios || android;
  installDialog.showModal();
};
$('#install-close').onclick = () => installDialog.close();
$('#install-confirm').onclick = async () => {
  if (!installPrompt) return;
  const prompt = installPrompt;
  installPrompt = null;
  $('#install-confirm').hidden = true;
  try {
    await prompt.prompt();
    const result = await prompt.userChoice;
    if (result.outcome === 'accepted') installDialog.close();
  } catch (error) { /* Manuell installasjonsveiledning er fortsatt tilgjengelig. */ }
};
window.addEventListener('appinstalled', () => {
  installPrompt = null;
  installButton.hidden = true;
  $('#install-confirm').hidden = true;
  installDialog.close();
});
if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* Siden fungerer også uten frakoblet modus. */ });
  });
}

// Mobil: separate sider med naturlig sveiping og tilgjengelige knapper.
const mobileLayout = matchMedia('(max-width: 55.999rem)');
const scenarioPages = $('.scenario-pages');
const mobilePanels = [$('#ctrl'), $('#out')];
const mobileButtons = [$('#show-scenario'), $('#show-advice')];
let mobilePage = 0;
function updateMobileIndicator() {
  if (!mobileLayout.matches || !scenarioPages.clientWidth) return;
  const width = scenarioPages.clientWidth;
  const progress = Math.max(0, Math.min(1, scenarioPages.scrollLeft / width));
  const track = $('.mobile-page-buttons');
  const distance = mobileButtons[1].offsetLeft - mobileButtons[0].offsetLeft;
  track.style.setProperty('--indicator-x', (progress * distance) + 'px');
  track.style.setProperty('--indicator-stretch', 1 + Math.sin(progress * Math.PI) * .06);
}
function syncMobilePage() {
  mobileButtons.forEach((button, index) => button.setAttribute('aria-pressed', index === mobilePage));
  mobilePanels.forEach((panel, index) => { panel.inert = mobileLayout.matches ? index !== mobilePage : index === 0 && $('#veileder').classList.contains('choices-collapsed'); });
}
function openMobilePage(index) {
  mobilePage = index;
  syncMobilePage();
  scenarioPages.scrollTo({left: index * scenarioPages.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
}
mobileButtons.forEach((button, index) => {
  button.onclick = () => openMobilePage(index);
  button.onkeydown = event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' || event.key === 'ArrowLeft' ? 0 : 1;
    mobileButtons[next].focus();
    openMobilePage(next);
  };
});
scenarioPages.addEventListener('scroll', () => {
  if (!mobileLayout.matches || !scenarioPages.clientWidth) return;
  updateMobileIndicator();
  mobilePage = Math.round(scenarioPages.scrollLeft / scenarioPages.clientWidth);
  syncMobilePage();
}, {passive: true});
new ResizeObserver(() => {
  if (mobileLayout.matches) scenarioPages.scrollLeft = mobilePage * scenarioPages.clientWidth;
  updateMobileIndicator();
}).observe(scenarioPages);
mobileLayout.addEventListener('change', () => { syncMobilePage(); updateMobileIndicator(); });
syncMobilePage();

updateMobileIndicator();

// Desktop: gi veiledningen hele bredden ved behov.
const choicesToggle = $('#toggle-project-choices');
let choicesCollapsed = false;
try { choicesCollapsed = localStorage.getItem('a101:choices-collapsed') === 'true'; } catch (error) {}
function syncChoicesPanel() {
  $('#veileder').classList.toggle('choices-collapsed', choicesCollapsed);
  syncMobilePage();
  choicesToggle.setAttribute('aria-expanded', String(!choicesCollapsed));
  choicesToggle.querySelector('span').textContent = choicesCollapsed ? 'Vis prosjektvalg' : 'Skjul prosjektvalg';
}
choicesToggle.onclick = () => {
  choicesCollapsed = !choicesCollapsed;
  syncChoicesPanel();
  try { localStorage.setItem('a101:choices-collapsed', String(choicesCollapsed)); } catch (error) {}
};
syncChoicesPanel();
