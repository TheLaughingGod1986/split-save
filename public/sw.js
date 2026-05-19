/**
 * SplitSave Service Worker — neutralized.
 *
 * The application no longer uses a service worker. Earlier deploys shipped a
 * caching service worker and registered it on every visit, so it is still
 * installed and active on the devices of anyone who opened the site back then.
 *
 * That stale worker serves content-hashed JS/CSS chunks cache-first. After a
 * redeploy the cached HTML shell references chunk filenames that have since
 * been removed from the server, so the document loads but its scripts 404 and
 * React never hydrates — the app is stuck on the loading screen forever and a
 * reload does not help because the worker keeps serving the stale shell.
 *
 * Since no current code registers or updates a service worker, there was no
 * way for those devices to recover. This file replaces the old worker with a
 * no-op that deletes every cache and unregisters itself. When the browser runs
 * its routine service-worker update check (on navigation, at least every 24h),
 * it fetches this script directly — bypassing the old worker — installs it,
 * and the affected device cleans itself up and reloads from the network.
 *
 * Do not delete this file: a 404 on the script during an update check leaves
 * the old worker running. It must exist and serve a 200 to neutralize it.
 */

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        await self.clients.claim()
      } catch (error) {
        // best effort
      }

      try {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((name) => caches.delete(name)))
      } catch (error) {
        // best effort
      }

      try {
        await self.registration.unregister()
      } catch (error) {
        // best effort
      }

      // Reload any open tabs so a device that was stuck on a stale shell
      // recovers immediately instead of waiting for the next manual visit.
      try {
        const clients = await self.clients.matchAll({ type: 'window' })
        for (const client of clients) {
          client.navigate(client.url)
        }
      } catch (error) {
        // best effort
      }
    })()
  )
})

// Intentionally no `fetch` handler: every request must go straight to the
// network so a stale cache can never brick the app again.
