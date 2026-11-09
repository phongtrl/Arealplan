const CACHE = 'arealplan-shell-v64';
const SHELL = ['./', 'index.html', 'style.css', 'script.js', 'select-ui.js', 'app-updates.js', 'viewport.js', 'build.js', 'team.js', 'versions.js', 'data.js', 'guider.js', 'APlogo.png', 'manifest.webmanifest', 'fonts/Manrope-Variable.ttf', 'fonts/Roboto-Variable.ttf', 'icons/icon-light-180.png', 'icons/icon-light-192.png', 'icons/icon-light-512.png'];
async function readRelease() {
  const response = await fetch(new URL('release.json', self.registration.scope), {cache:'no-store'});
  if (!response.ok) throw new Error('Release metadata unavailable');
  return response.json();
}
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const before = await readRelease();
    if (before.build !== CACHE) throw new Error('Deployment not ready');
    const cache = await caches.open(CACHE);
    const complete = (await Promise.all(SHELL.map(path => cache.match(new URL(path,self.registration.scope))))).every(Boolean);
    if (complete) { await self.skipWaiting(); return; }
    // Bruk én komplett utgave, uten utdaterte svar fra HTTP-mellomlageret.
    try {
      await cache.addAll(SHELL.map(path => new Request(new URL(path, self.registration.scope), {cache:'no-store'})));
      const after = await readRelease();
      if (after.build !== before.build || after.version !== before.version) throw new Error('Deployment changed');
      const versions = await (await cache.match(new URL('versions.js', self.registration.scope))).text();
      const current = versions.match(/version:\s*'([^']+)'/);
      if (!current || current[1] !== after.version) throw new Error('Version mismatch');
    } catch (error) { await caches.delete(CACHE); throw error; }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await self.clients.claim();
    const windows = await self.clients.matchAll({type:'window'});
    windows.forEach(client => client.postMessage({type:'APP_UPDATED',build:CACHE}));
    await Promise.all((await caches.keys()).filter(key => key.startsWith('arealplan-shell-') && key !== CACHE).map(key => caches.delete(key)));
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'GET_BUILD') event.ports[0]?.postMessage({build:CACHE});
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const root = new URL('./', self.registration.scope);
  if (event.request.method !== 'GET' || url.origin !== root.origin) return;
  if (url.pathname === new URL('release.json', root).pathname) {
    event.respondWith(fetch(event.request, {cache:'no-store'}));
    return;
  }
  if (!SHELL.some(path => new URL(path,root).pathname === url.pathname)) return;
  // Ingen filvis oppgradering: HTML, kode, stiler og versjonsnummer følger samme cache.
  event.respondWith(caches.open(CACHE).then(async cache => await cache.match(event.request,{ignoreSearch:true}) || fetch(event.request,{cache:'no-store'})));
});
