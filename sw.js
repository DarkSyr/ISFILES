/* Root service worker — routes /service/* through Ultraviolet */
importScripts("/uv.bundle.js");
importScripts("/uv.config.js");
importScripts("/uv.sw.js");

const uv = new UVServiceWorker();

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      if (event.request.url.startsWith(location.origin + (self.__uv$config.prefix || "/service/"))) {
        return await uv.fetch(event);
      }
      return await fetch(event.request);
    })()
  );
});

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});
