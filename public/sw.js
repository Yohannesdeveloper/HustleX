// Replacement service worker – clears stale caches and unregisters itself.
// The previous sw.js was trying to cache POST / 206 responses which the
// Cache API doesn't support.  This version is a no-op passthrough.

self.addEventListener("install", (event) => {
  // Skip waiting so this new SW activates immediately
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Clear any leftover caches from the old service worker
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      // Unregister so future loads have no service worker at all
      await self.registration.unregister();
    })()
  );
});
