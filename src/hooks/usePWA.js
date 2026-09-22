import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function usePWA(user) {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      localStorage.getItem('calistenia_pwa_installed') === 'true';
    return Boolean(isStandalone);
  });
  const [platform, setPlatform] = useState('unknown');

  const deferredPromptRef = useRef(null);

  // Detect platform / device
  const getDeviceInfo = useCallback(() => {
    if (typeof window === 'undefined') return 'Desconhecido';
    const ua = navigator.userAgent || '';
    if (/android/i.test(ua)) return 'Android';
    if (/iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'iOS (iPhone/iPad)';
    if (/windows/i.test(ua)) return 'Windows PC';
    if (/macintosh|mac os x/i.test(ua)) return 'macOS';
    if (/linux/i.test(ua)) return 'Linux';
    return 'Web Browser';
  }, []);

  const isIOS = typeof window !== 'undefined' && (/iphone|ipad|ipod/i.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  const isAndroid = typeof window !== 'undefined' && /android/i.test(navigator.userAgent || '');

  // Sync install status to Supabase
  const recordInstallation = useCallback(async (deviceDetails) => {
    try {
      localStorage.setItem('calistenia_pwa_installed', 'true');
      setIsInstalled(true);

      const currentUser = user || (await supabase.auth.getUser())?.data?.user;
      const deviceStr = deviceDetails || getDeviceInfo();

      if (currentUser?.id) {
        await supabase
          .from('profiles')
          .update({
            is_pwa_installed: true,
            pwa_installed_at: new Date().toISOString(),
            pwa_device_info: deviceStr,
            last_seen_at: new Date().toISOString()
          })
          .eq('user_id', currentUser.id);
        console.log('[PWA] Instalação gravada no Supabase para usuário:', currentUser.id);
      }
    } catch (e) {
      console.warn('[PWA] Erro ao gravar instalação no Supabase:', e);
    }
  }, [user, getDeviceInfo]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setPlatform(getDeviceInfo());

    // Check if running standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      recordInstallation();
    }

    // Capture beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setIsInstallable(true);
      console.log('[PWA] Evento beforeinstallprompt capturado!');
    };

    // Capture appinstalled
    const handleAppInstalled = () => {
      console.log('[PWA] App instalado com sucesso!');
      deferredPromptRef.current = null;
      setIsInstallable(false);
      setIsInstalled(true);
      recordInstallation();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [recordInstallation, getDeviceInfo]);

  // Trigger installation prompt
  const installApp = async () => {
    if (!deferredPromptRef.current) {
      return { success: false, reason: 'no_prompt' };
    }

    try {
      deferredPromptRef.current.prompt();
      const choiceResult = await deferredPromptRef.current.userChoice;
      deferredPromptRef.current = null;
      setIsInstallable(false);

      if (choiceResult.outcome === 'accepted') {
        recordInstallation();
        return { success: true };
      } else {
        return { success: false, reason: 'dismissed' };
      }
    } catch (error) {
      console.error('[PWA] Erro durante prompt de instalação:', error);
      return { success: false, error };
    }
  };

  return {
    isInstallable,
    isInstalled,
    platform,
    isIOS,
    isAndroid,
    installApp,
    recordInstallation
  };
}
