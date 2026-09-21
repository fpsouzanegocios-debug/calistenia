// Utility for native device / OS push notifications
export async function showDeviceNotification(title, options = {}) {
  if (typeof window === 'undefined') return false;

  // 1. Check if Notifications API exists and is granted
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  const notifOptions = {
    body: options.body || '',
    icon: options.icon || '/icons/icon-192.png',
    badge: options.badge || '/icons/icon-72.png',
    vibrate: [150, 80, 150],
    data: options.data || { url: options.action_url || '/' },
    tag: options.id || options.tag || `calistenia-${Date.now()}`,
    renotify: true,
    ...options
  };

  // 2. Primary: Service Worker showNotification (Works reliably on Android PWA, iOS 16.4+ PWA, and Desktop)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && typeof reg.showNotification === 'function') {
        await reg.showNotification(title, notifOptions);
        return true;
      }
    } catch (swErr) {
      console.warn('[Notification] ServiceWorker ready error, falling back:', swErr);
    }
  }

  // 3. Fallback: postMessage to active service worker controller
  if (navigator.serviceWorker?.controller) {
    try {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body: notifOptions.body,
        icon: notifOptions.icon,
        badge: notifOptions.badge,
        data: notifOptions.data
      });
      return true;
    } catch (postErr) {
      console.warn('[Notification] postMessage error:', postErr);
    }
  }

  // 4. Fallback: Window Notification constructor (Desktop only)
  try {
    new Notification(title, notifOptions);
    return true;
  } catch (winErr) {
    console.warn('[Notification] Window Notification constructor not allowed on mobile:', winErr);
    return false;
  }
}

export async function requestDeviceNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      showDeviceNotification('¡Notificaciones activadas! 🌿', {
        body: 'Te avisaremos cuando tengas entrenamientos y recordatorios de Calistenia Asiática.',
        icon: '/icons/icon-192.png'
      });
    }
    return permission;
  } catch (err) {
    console.warn('[Notification] Error requesting permission:', err);
    return 'denied';
  }
}
