// Kill switch for the old next-pwa service worker.
// Browsers that installed it keep checking /sw.js for updates; this version
// clears its caches and unregisters itself so they stop precaching the app.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
    })(),
  );
});
