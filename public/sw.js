// Service Worker - Calistenia Asiática PWA v1.0
const SHELL_CACHE = 'calistenia-shell-v1';
const VIDEO_CACHE = 'video-cache-v3';
const DYNAMIC_CACHE = 'calistenia-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon.svg',
  '/icons/icon-maskable.png'
];

// Install: Cache essential app shell
self.addEventListener('install', (event) => {
  console.log('[SW] PWA Install');
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Non-critical asset cache failed:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] PWA Activate');
  const expectedCaches = [SHELL_CACHE, VIDEO_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (!expectedCaches.includes(key)) {
            console.log('[SW] Deleting obsolete cache:', key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: Route video requests to dedicated cache, app assets to stale-while-revalidate/cache-first
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Ignore non-GET requests or chrome-extension URLs
  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 2. Video Streaming & Caching
  if (url.pathname.startsWith('/videos/') && url.pathname.endsWith('.mp4')) {
    if (url.searchParams.has('nocache') || url.searchParams.has('retry')) {
      return;
    }
    event.respondWith(handleVideoRequest(event));
    return;
  }

  // 3. Static Assets & App Shell (Cache-First / Stale-While-Revalidate)
  if (
    url.origin === self.location.origin &&
    (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/) || url.pathname === '/manifest.json')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) {
          // Revalidate in background
          fetch(event.request).then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              caches.open(SHELL_CACHE).then((cache) => cache.put(event.request, networkRes));
            }
          }).catch(() => {});
          return cached;
        }
        return fetch(event.request).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return networkRes;
        });
      })
    );
    return;
  }

  // 4. Navigation requests (SPA fallback)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }
});

// Video handler helpers
function buildVideoHeaders(extra = {}) {
  return {
    'Content-Type': 'video/mp4',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=31536000, immutable',
    ...extra,
  };
}

async function handleVideoRequest(event) {
  const request = event.request;
  const cache = await caches.open(VIDEO_CACHE);
  const url = new URL(request.url);
  const rangeHeader = request.headers.get('Range');

  const cached = await cache.match(url.pathname, { ignoreSearch: true });
  if (cached) {
    try {
      if (rangeHeader) {
        return await handleRangeRequest(cached, rangeHeader, url.pathname, cache);
      }
      const blob = await cached.blob();
      if (!blob || blob.size === 0) {
        await cache.delete(url.pathname);
        return fetchDirect(event, cache, url.pathname);
      }
      return new Response(blob, {
        status: 200,
        headers: buildVideoHeaders({ 'Content-Length': blob.size.toString() }),
      });
    } catch (err) {
      await cache.delete(url.pathname).catch(() => {});
      return fetchDirect(event, cache, url.pathname);
    }
  }

  return fetchDirect(event, cache, url.pathname);
}

async function fetchDirect(event, cache, pathname) {
  let response;
  try {
    response = await fetch(event.request);
  } catch (error) {
    return new Response(null, { status: 502, statusText: 'Bad Gateway' });
  }

  if (response.status === 200) {
    const clone = response.clone();
    event.waitUntil(
      cache.put(pathname, clone).catch(() => {})
    );
  }
  return response;
}

async function handleRangeRequest(cachedResponse, rangeHeader, pathname, cache) {
  let blob;
  try {
    blob = await cachedResponse.blob();
  } catch (e) {
    await cache.delete(pathname).catch(() => {});
    return new Response(null, { status: 500 });
  }

  const totalSize = blob.size;
  const rangeMatch = rangeHeader.match(/bytes=(\d*)-(\d*)/);
  if (!rangeMatch) {
    return new Response(blob, {
      status: 200,
      headers: buildVideoHeaders({ 'Content-Length': totalSize.toString() }),
    });
  }

  let start;
  let end;
  if (rangeMatch[1] === '' && rangeMatch[2] !== '') {
    const suffixLen = parseInt(rangeMatch[2], 10);
    start = Math.max(0, totalSize - suffixLen);
    end = totalSize - 1;
  } else {
    start = parseInt(rangeMatch[1], 10);
    end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : totalSize - 1;
  }

  if (isNaN(start) || start < 0 || start >= totalSize || end >= totalSize || start > end) {
    return new Response(null, {
      status: 416,
      headers: {
        'Content-Range': `bytes */${totalSize}`,
        'Accept-Ranges': 'bytes',
      },
    });
  }

  const slicedBlob = blob.slice(start, end + 1);
  const chunkSize = end - start + 1;

  return new Response(slicedBlob, {
    status: 206,
    headers: buildVideoHeaders({
      'Content-Length': chunkSize.toString(),
      'Content-Range': `bytes ${start}-${end}/${totalSize}`,
    }),
  });
}

// 5. PUSH NOTIFICATIONS
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  let data = {
    title: 'Calistenia Asiática',
    body: '¡Hora de moverte y cuidar tu salud!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    url: '/'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = {
        ...data,
        ...parsed,
        body: parsed.body || parsed.message || data.body,
        url: parsed.url || parsed.action_url || data.url
      };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-72.png',
    vibrate: [150, 80, 150],
    data: {
      url: data.url || '/'
    },
    tag: data.id || data.tag || `calistenia-push-${Date.now()}`,
    renotify: true,
    actions: [
      { action: 'open', title: 'Abrir App' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 6. NOTIFICATION CLICK
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 7. MESSAGE EVENT
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, badge, data } = event.data;
    event.waitUntil(
      self.registration.showNotification(title || 'Calistenia Asiática', {
        body: body || '',
        icon: icon || '/icons/icon-192.png',
        badge: badge || '/icons/icon-72.png',
        vibrate: [150, 80, 150],
        data: data || { url: '/' }
      })
    );
  }
});
