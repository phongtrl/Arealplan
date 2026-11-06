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
    psave(); mark(); render();
  };
}

function mark() {
  document.querySelectorAll('button[data-id]').forEach(b => {
    const id = b.dataset.id, p = b.parentElement.id;
    const on = p === 'plan' ? S.plan === id : p === 'akt' ? S.akt === id : S.sel.has(id);
    b.setAttribute('aria-pressed', on);
  });
}

function init() {
  $('#ver').textContent = D.meta.versjon + ' (' + D.meta.oppdatert + ')';
  $('#eks').innerHTML = D.eks.map((e, i) => `<button data-i="${i}">${e.navn}<small>${e.tekst}</small></button>`).join('');
  $('#eks').onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    const x = D.eks[b.dataset.i];
    S.plan = x.plan; S.akt = x.akt; S.sel = new Set(x.sel);
    psave(); mark(); render();
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
  return `<li>${d ? `<details><summary>${ck}<b>${i.t}</b>${ref}${uk}</summary>${d}</details>` : `<div class="row">${ck}<b>${i.t}</b>${ref}${uk}</div>`}</li>`;
};
const fmtT = (a, b) => b <= 12 ? `${a}–${b} uker` : `${Math.round(a / 4.35)}–${Math.round(b / 4.35)} mnd`;
let ST = { d: {}, t: null };
const PK = 'a101:prosjekter';
let P = null;
const nyId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const nytt = navn => ({ id: nyId(), navn, plan: null, akt: null, sel: [], d: {}, t: null });
const cur = () => P.liste.find(x => x.id === P.aktiv) || P.liste[0];
function pload() {
  try { P = JSON.parse(localStorage.getItem(PK)); } catch (e) { P = null; }
  if (!P || !Array.isArray(P.liste) || !P.liste.length) { const p = nytt('Mitt prosjekt'); P = { aktiv: p.id, liste: [p] }; }
}
function psave() {
  const c = cur();
  Object.assign(c, { plan: S.plan, akt: S.akt, sel: [...S.sel], d: ST.d, t: ST.t });
  try { localStorage.setItem(PK, JSON.stringify(P)); } catch (e) {}
}
function popen(id) {
  P.aktiv = id;
  const c = cur();
  P.aktiv = c.id;
  S.plan = c.plan; S.akt = c.akt; S.sel = new Set(c.sel || []);
  ST = { d: c.d || {}, t: c.t || null };
  const sel = $('#pvelg');
  sel.replaceChildren(...P.liste.map(x => new Option(x.navn, x.id)));
  sel.value = c.id;
  psave(); mark(); render();
}
function initProj() {
  pload();
  $('#pvelg').onchange = e => { psave(); popen(e.target.value); };
  $('#pny').onclick = () => {
    const n = prompt('Navn på nytt prosjekt:', 'Prosjekt ' + (P.liste.length + 1));
    if (n === null) return;
    psave();
    const p = nytt(n.trim() || 'Uten navn');
    P.liste.push(p); popen(p.id);
  };
  $('#pnavn').onclick = () => {
    const c = cur(), n = prompt('Nytt navn på prosjektet:', c.navn);
    if (n === null || !n.trim()) return;
    c.navn = n.trim(); popen(c.id);
  };
  $('#pslett').onclick = () => {
    const c = cur();
    if (!confirm(`Slette prosjektet «${c.navn}»? Dette kan ikke angres.`)) return;
    P.liste = P.liste.filter(x => x.id !== c.id);
    if (!P.liste.length) P.liste.push(nytt('Mitt prosjekt'));
    popen(P.liste[0].id);
  };
  popen(P.aktiv);
}
const sec = (h, items, tag = 'ul', cnt) => items.length ? `<h2>${h}${cnt ? '<span class="cnt"></span>' : ''}</h2><${tag}>${items.join('')}</${tag}>` : '';

function render() {
  const out = $('#out');
  const p = D.plantyper.find(x => x.id === S.plan);
  if (!p) { out.innerHTML = '<p class="hint">Velg plantype for å få råd. Legg til formål og stedsforhold for et mer treffsikkert scenario.</p>'; return; }
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
    `<h2>${p.navn}<span class="ref">${p.r}</span></h2><p class="sub">${p.beskrivelse}</p><button id="alle" class="link">Åpne alle beskrivelser</button>` + box +
    sec('Gjenkjent scenario', signal) +
    sec('Anbefalt prosess', steps.map(x => li(x, 'steg')), 'ol', 1) +
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
}
$('#tema').onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
setTheme(document.documentElement.dataset.theme || 'light');

const G = window.GUIDER || [];
const LOGO = '<svg class="logo" viewBox="0 0 64 64" aria-hidden="true"><path pathLength="1" d="M10 54L32 10L54 54"/><path class="b" pathLength="1" d="M19 38H45"/><circle cx="10" cy="54" r="4"/><circle cx="32" cy="10" r="4"/><circle cx="54" cy="54" r="4"/><circle cx="19" cy="38" r="3.5"/><circle cx="45" cy="38" r="3.5"/></svg>';
$('#mark').innerHTML = LOGO;
$('#nav').innerHTML = `<a href="#veileder" data-p="veileder">Veileder</a><div class="dd"><button id="ddb" aria-expanded="false" aria-controls="ddm">Guider</button><div class="menu" id="ddm" hidden>${G.map(g => `<a href="#${g.id}" data-p="${g.id}">${g.navn}</a>`).join('')}</div></div>`;
const ddb = $('#ddb'), ddm = $('#ddm');
const dd = open => { ddm.hidden = !open; ddb.setAttribute('aria-expanded', open); };
ddb.onclick = () => dd(ddm.hidden);
document.addEventListener('click', e => { if (!e.target.closest('.dd')) dd(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !ddm.hidden) { dd(false); ddb.focus(); } });

function renderGuide(g) {
  const list = (arr, tag = 'ul') => `<${tag}>${arr.map(x => `<li>${x}</li>`).join('')}</${tag}>`;
  const refs = g.hjemmel.map(r => { const u = refUrl(r); return u ? `<a class="ref" href="${u}" target="_blank" rel="noopener">${r}</a>` : `<span class="ref">${r}</span>`; }).join('');
  $('#guide').innerHTML = `<h2>${g.navn}</h2><div class="refs">${refs}</div><p class="lead">${g.hva}</p>` +
    `<h3>Når kreves det?</h3>${list(g.nar)}` +
    `<h3>Hva skal det inneholde?</h3><dl>${g.innhold.map(([t, d]) => `<dt>${t}</dt><dd>${d}</dd>`).join('')}</dl>` +
    `<h3>Slik gjør du det</h3>${list(g.steg, 'ol')}` +
    `<h3>Vanlige feil</h3>${list(g.feil)}` +
    `<h3>Dokumenter</h3><p class="lenker">${g.l.map(([t, u]) => a(t, u)).join('')}</p>`;
}

function route() {
  const g = G.find(x => x.id === location.hash.slice(1));
  $('#veileder').hidden = !!g;
  $('#guide').hidden = !g;
  if (g) renderGuide(g);
  document.querySelectorAll('#nav a').forEach(l => l.removeAttribute('aria-current'));
  const cur = document.querySelector(`#nav a[data-p="${g ? g.id : 'veileder'}"]`);
  if (cur) cur.setAttribute('aria-current', 'page');
  ddb.textContent = g ? g.navn : 'Guider';
  ddb.classList.toggle('on', !!g);
  dd(false);
  window.scrollTo(0, 0);
}

if (D) { init(); initProj(); }
else $('#out').innerHTML = '<p class="err">Kunne ikke laste data.js. Sjekk at filen ligger i samme mappe som index.html.</p>';

route();
window.onhashchange = route;

const sp = $('#splash');
if (matchMedia('(prefers-reduced-motion: reduce)').matches) sp.remove();
else {
  sp.innerHTML = LOGO.replace('class="logo"', 'class="logo anim"') + '<p>Arealplan101</p>';
  const close = () => { sp.classList.add('out'); setTimeout(() => sp.remove(), 600); };
  sp.onclick = close;
  setTimeout(close, 2400);
}

$('#out').addEventListener('change', e => {
  const c = e.target.closest('.ck'); if (!c) return;
  if (c.checked) ST.d[c.dataset.k] = 1; else delete ST.d[c.dataset.k];
  ST.t = new Date().toISOString(); psave(); updateProgress();
});
$('#out').addEventListener('click', e => {
  if (e.target.id === 'nullstill') { ST = { d: {}, t: null }; psave(); render(); }
});
