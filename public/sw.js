/**
 * SplitSave Service Worker
 * Provides offline support, caching, and background sync
 */

const CACHE_NAME = 'splitsave-v1.0.0'
const STATIC_CACHE = 'splitsave-static-v1.0.0'
const DYNAMIC_CACHE = 'splitsave-dynamic-v1.0.0'

// Assets to cache immediately
// Only precache truly static assets. Avoid caching the root document because
// Next.js streams the shell HTML and caching it can capture an empty loading
// state that never hydrates when returned offline or from a stale cache.
const STATIC_ASSETS = [
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/offline.html'
]

// API routes that should be cached
const API_CACHE_PATTERNS = [
  '/api/auth/profile',
  '/api/goals',
  '/api/expenses',
  '/api/partnerships',
  '/api/notifications'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('✅ Service Worker: Static assets cached')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('❌ Service Worker: Failed to cache static assets', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker: Activated and cleaned up')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }
  
  // Handle static assets
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request))
    return
  }
  
  // Handle page requests
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(handlePageRequest(request))
    return
  }
})

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url)
  
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok && shouldCacheApi(url.pathname)) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('🌐 Service Worker: Network failed, trying cache for', url.pathname)
    
    // Fallback to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for API calls
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This feature requires an internet connection' 
      }),
      { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('❌ Service Worker: Failed to fetch static asset', request.url)
    throw error
  }
}

// Handle page requests with network-first strategy
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('🌐 Service Worker: Network failed, trying cache for page', request.url)
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page
    const offlineResponse = await caches.match('/offline.html')
    if (offlineResponse) {
      return offlineResponse
    }
    
    // Fallback offline response
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SplitSave - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0; padding: 20px; background: #f3f4f6; 
              display: flex; align-items: center; justify-content: center; min-height: 100vh;
            }
            .container { 
              text-align: center; background: white; padding: 40px; 
              border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              max-width: 400px;
            }
            .icon { font-size: 48px; margin-bottom: 20px; }
            h1 { color: #374151; margin-bottom: 16px; }
            p { color: #6b7280; margin-bottom: 24px; }
            .retry { 
              background: #3b82f6; color: white; border: none; 
              padding: 12px 24px; border-radius: 8px; cursor: pointer;
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">📱</div>
            <h1>You're Offline</h1>
            <p>SplitSave needs an internet connection to work properly. Please check your connection and try again.</p>
            <button class="retry" onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>
      `,
      { 
        status: 200, 
        headers: { 'Content-Type': 'text/html' } 
      }
    )
  }
}

// Check if request is for a static asset
function isStaticAsset(request) {
  const url = new URL(request.url)
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
}

// Check if API endpoint should be cached
function shouldCacheApi(pathname) {
  return API_CACHE_PATTERNS.some(pattern => pathname.startsWith(pattern))
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync triggered', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

// Perform background sync
async function doBackgroundSync() {
  try {
    console.log('🔄 Service Worker: Performing background sync...')
    
    // Get pending offline actions from IndexedDB
    const pendingActions = await getPendingOfflineActions()
    
    for (const action of pendingActions) {
      try {
        await syncOfflineAction(action)
        await removePendingAction(action.id)
      } catch (error) {
        console.error('❌ Service Worker: Failed to sync action', action.id, error)
      }
    }
    
    console.log('✅ Service Worker: Background sync completed')
  } catch (error) {
    console.error('❌ Service Worker: Background sync failed', error)
  }
}

// Get pending offline actions from IndexedDB
async function getPendingOfflineActions() {
  // This would integrate with your IndexedDB implementation
  // For now, return empty array
  return []
}

// Sync a single offline action
async function syncOfflineAction(action) {
  const response = await fetch(action.url, {
    method: action.method,
    headers: action.headers,
    body: action.body
  })
  
  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`)
  }
  
  return response
}

// Remove pending action after successful sync
async function removePendingAction(actionId) {
  // This would remove the action from IndexedDB
  console.log('🗑️ Service Worker: Removing synced action', actionId)
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('📱 Service Worker: Push notification received')
  
  let notificationData = {
    title: 'SplitSave',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'splitsave-notification',
    requireInteraction: false,
    data: {}
  }

  if (event.data) {
    try {
      const payload = event.data.json()
      notificationData = { ...notificationData, ...payload }
    } catch (error) {
      console.error('Failed to parse push payload:', error)
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.requireInteraction,
      vibrate: [200, 100, 200],
      timestamp: Date.now(),
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: '/icon-192x192.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    })
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Service Worker: Notification clicked', event.action)
  
  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  // Default action or 'open' action
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      
      // Open new window if app is not open
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('📱 Service Worker: Notification closed')
  
  // Track notification dismissal
  if (event.notification.data && event.notification.data.trackDismissal) {
    // Send analytics event
    fetch('/api/analytics/notification-dismissed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        notificationId: event.notification.data.id,
        tag: event.notification.tag,
        timestamp: Date.now()
      })
    }).catch(error => {
      console.error('Failed to track notification dismissal:', error)
    })
  }
})

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker: Message received', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})

console.log('✅ Service Worker: Loaded and ready')
