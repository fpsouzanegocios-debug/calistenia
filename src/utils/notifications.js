import { supabase } from '../lib/supabase';

// VAPID Public Key corresponding to the private key in Supabase Edge Function 'send-push'
export const VAPID_PUBLIC_KEY = 'BMDRNY6p5EnmPW0w4Ghx6zk6F_ieKk0FhbBE9tqJzWpjvG5NnqyXiH-YIVbc_caYydQAXpubdxnYzdvVNNTEwD0';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Utility for native device / OS push notifications
export async function showDeviceNotification(title, options = {}) {
  if (typeof window === 'undefined') return false;

  // 1. Check if Notifications API exists and is granted
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  const notifOptions = {
    body: options.body || options.message || '',
    icon: options.icon || '/icons/icon-192.png',
    badge: options.badge || '/icons/icon-72.png',
    vibrate: [150, 80, 150],
    data: options.data || { url: options.action_url || options.url || '/' },
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

// Subscribe the device to W3C Web Push using VAPID (Google FCM / Apple APNs)
// This ensures notifications wake up the device and arrive even when the app is completely closed!
export async function subscribeUserToWebPush(user) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    if (!reg || !reg.pushManager) {
      console.warn('[WebPush] pushManager not supported in this browser');
      return null;
    }

    let subscription = await reg.pushManager.getSubscription();

    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
      console.log('[WebPush] Subscribed device to pushManager:', subscription.endpoint);
    }

    const subJson = subscription.toJSON();
    const currentUser = user || (await supabase.auth.getUser())?.data?.user;

    const payload = {
      user_id: currentUser?.id || null,
      endpoint: subscription.endpoint,
      p256dh: subJson.keys?.p256dh,
      auth: subJson.keys?.auth,
      user_agent: navigator.userAgent || 'Unknown',
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(payload, { onConflict: 'endpoint' });

    if (error) {
      console.warn('[WebPush] Error saving push subscription to Supabase:', error);
    } else {
      console.log('[WebPush] Push subscription synced with Supabase for user:', currentUser?.id || 'anonymous');
    }

    return subscription;
  } catch (err) {
    console.warn('[WebPush] Failed to register push subscription:', err);
    return null;
  }
}

export async function requestDeviceNotificationPermission(user) {
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

      // Automatically register Web Push subscription for background delivery
      await subscribeUserToWebPush(user);
    }
    return permission;
  } catch (err) {
    console.warn('[Notification] Error requesting permission:', err);
    return 'denied';
  }
}
