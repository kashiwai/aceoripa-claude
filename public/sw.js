// Service Worker for Push Notifications
const CACHE_NAME = 'aceoripa-gacha-v1'
const urlsToCache = [
  '/',
  '/mypage',
  '/static/js/bundle.js',
  '/static/css/main.css'
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response
        }
        return fetch(event.request)
      })
  )
})

// Push event handler
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  
  const title = data.title || 'ACEORIPA GACHA'
  const options = {
    body: data.body || '新しいお知らせがあります',
    icon: data.icon || '/icon-192x192.png',
    badge: '/badge-72x72.png',
    image: data.image,
    data: data.url ? { url: data.url } : undefined,
    actions: [
      {
        action: 'open',
        title: '開く',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: '閉じる'
      }
    ],
    tag: data.tag || 'gacha-notification',
    requireInteraction: data.requireInteraction || false,
    silent: false,
    vibrate: [200, 100, 200]
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'close') {
    return
  }
  
  const targetUrl = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

function doBackgroundSync() {
  // Handle offline gacha purchases or other actions
  return new Promise((resolve) => {
    // Implementation for background sync
    resolve()
  })
}