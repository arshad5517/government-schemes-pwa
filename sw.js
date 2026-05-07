const CACHE_NAME = 'gov-schemes-v2.1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/schemes.js',
    '/firebase-config.js',
    '/manifest.json',
    '/assets/icons/icon-192.png',
    '/assets/icons/icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            }).catch(() => {
                if (event.request.destination === 'image') {
                    return new Response('<svg width="400" height="300" role="img" aria-labelledby="offline-title" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><title id="offline-title">Offline</title><g fill="none" fill-rule="evenodd"><path fill="#D9D9D9" d="M0 0h400v300H0z"/><text fill="#9B9B9B" font-family="Helvetica,Arial,sans-serif" font-size="72" font-weight="bold" x="50%" y="50%" dy=".3em" text-anchor="middle">offline</text></g></svg>', {
                        headers: { 'Content-Type': 'image/svg+xml' }
                    });
                }
            })
    );
});

// Push notification handling
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'नई सरकारी योजना उपलब्ध!',
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/icon-192.png',
        vibrate: [100, 50, 100],
        data: { date: new Date().toISOString() },
        actions: [
            { action: 'view', title: 'देखें' },
            { action: 'close', title: 'बंद करें' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('सरकारी योजनाएं', options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});