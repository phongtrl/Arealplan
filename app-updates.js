// Oppdater samlet, også ved reversering til et lavere appversjonsnummer.
(() => {
  const status = document.querySelector('#app-update-status');
  const checkButton = document.querySelector('#check-app-updates');
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    status.textContent = 'Oppdateringskontroll er tilgjengelig når appen åpnes over HTTPS.';
    checkButton.disabled = true;
    return;
  }
  let registration, checking = false, reloading = false, pendingReload = false;
  let lastCheck = 0;
  const initiallyControlled = !!navigator.serviceWorker.controller;
  const banner = document.createElement('aside');
  banner.id = 'app-update-banner'; banner.hidden = true; banner.setAttribute('role','status');
  banner.innerHTML = '<span>En oppdatert utgave er klar. Lukk prosjektvinduet når du er ferdig for å ta den i bruk.</span>';
  document.body.append(banner);
  function refreshWhenSafe() {
    if (!pendingReload || reloading) return;
    if (document.querySelector('dialog[open]') || document.hidden) { banner.hidden = false; return; }
    // Valg og avkrysninger lagres ved endring. Ikke skriv en gammel fanes
    // prosjektkopi over nyere data fra et annet vindu under oppdatering.
    reloading = true;
    location.reload();
  }
  navigator.serviceWorker.addEventListener('controllerchange', async () => {
    const build = await activeBuild(navigator.serviceWorker.controller);
    if (initiallyControlled || pendingReload || build && build !== window.APP_BUILD.build) { pendingReload = true; refreshWhenSafe(); }
  });
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'APP_UPDATED' && event.data.build !== window.APP_BUILD.build) { pendingReload = true; refreshWhenSafe(); }
  });
  document.addEventListener('close', () => { if (pendingReload) setTimeout(refreshWhenSafe,0); }, true);
  function activeBuild(worker) {
    return new Promise(resolve => {
      if (!worker) { resolve(null); return; }
      const channel = new MessageChannel();
      const timeout = setTimeout(() => {channel.port1.close();resolve(null);},1500);
      channel.port1.onmessage = event => {clearTimeout(timeout);channel.port1.close();resolve(event.data?.build);};
      worker.postMessage({type:'GET_BUILD'},[channel.port2]);
    });
  }
  function registerBuild(build) {
    const url = new URL('sw.js',location.href);
    url.searchParams.set('build',build);
    return navigator.serviceWorker.register(url.href,{scope:new URL('./',location.href).href,updateViaCache:'none'});
  }
  async function check(manual = false) {
    if (checking || !registration) return;
    if (!manual && Date.now()-lastCheck < 60000) return;
    checking = true;lastCheck = Date.now();checkButton.disabled = true;
    if (manual) status.textContent = 'Ser etter oppdateringer …';
    try {
      const url = new URL('release.json',location.href);url.searchParams.set('check',Date.now());
      const response = await fetch(url,{cache:'no-store'});
      if (!response.ok) throw new Error('Unavailable');
      const release = await response.json();
      if (typeof release.build !== 'string' || typeof release.version !== 'string') throw new Error('Invalid release');
      if (release.build === window.APP_BUILD.build && release.version === window.APP_RELEASES[0].version) {
        status.textContent = 'Du bruker nyeste versjon (v' + release.version + ').';
        // Kontroller også service worker selv når HTML-versjonen allerede er riktig.
        registration.update().catch(() => {});
      } else {
        pendingReload = true;
        status.textContent = 'Oppdaterer til v' + release.version + ' …';
        if (await activeBuild(registration.active) === release.build) refreshWhenSafe();
        else {
          pendingReload = false;
          registration = await registerBuild(release.build);
        }
      }
    } catch (error) {
      if (manual) status.textContent = 'Kunne ikke kontrollere nå. Koble til nett og prøv igjen. Lagrede prosjekter beholdes.';
    } finally {checking = false;checkButton.disabled = false;}
  }
  checkButton.onclick = () => check(true);
  registerBuild(window.APP_BUILD.build).then(value => {
    registration = value;
    value.addEventListener('updatefound', () => {
      const installing = value.installing;
      installing?.addEventListener('statechange', () => {
        if (installing.state === 'redundant') status.textContent = 'Oppdateringen er ikke klar ennå. Prøv igjen om litt.';
      });
    });
    check();
  }).catch(() => {status.textContent = 'Oppdateringskontroll kunne ikke startes. Prøv å åpne appen igjen.';});
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {refreshWhenSafe();check();}
  });
  window.addEventListener('online', () => check(true));
  window.addEventListener('focus', () => check());
  setInterval(() => {if (!document.hidden) check();}, 5*60*1000);
})();
