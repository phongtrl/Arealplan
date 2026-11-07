const CACHE = 'arealplan-shell-v22';
const SHELL = ['./', 'index.html', 'style.css', 'script.js', 'team.js', 'data.js', 'guider.js', 'APlogo.png', 'manifest.webmanifest', 'fonts/Manrope-Variable.ttf', 'icons/icon-light-180.png', 'icons/icon-light-192.png', 'icons/icon-light-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('arealplan-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const root = new URL('./', self.registration.scope);
  if (event.request.method !== 'GET' || url.origin !== root.origin || !SHELL.some(path => new URL(path, root).pathname === url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    } catch (error) {
      const cached = await cache.match(event.request, {ignoreSearch: true});
      if (cached) return cached;
      throw error;
    }
  })());
});
