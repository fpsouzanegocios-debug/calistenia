import React, { useState } from 'react';
import { Bell, Smartphone, Check, Sparkles, X, Share, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function AppEntranceModal({ isOpen, onClose, pwa }) {
  const { theme, notificationPermission, requestPermission } = useApp();
  const isDark = theme === 'dark';

  const [isRequestingNotif, setIsRequestingNotif] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  if (!isOpen) return null;

  const currentPlatform = pwa?.platform || '';
  const isIOS = currentPlatform.includes('iOS') || (typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent || ''));
  const notifsActive = notificationPermission === 'granted';
  const isAppInstalled = pwa?.isInstalled;

  const handleActivateNotifications = async () => {
    setIsRequestingNotif(true);
    try {
      await requestPermission();
    } catch (e) {
      console.warn('Error solicitando permisos:', e);
    } finally {
      setIsRequestingNotif(false);
    }
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosGuide(true);
      return;
    }

    setIsInstalling(true);
    try {
      if (pwa?.installApp) {
        await pwa.installApp();
      }
    } catch (e) {
      console.warn('Error en prompt de instalación:', e);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleActivateAll = async () => {
    // 1. First trigger notifications permission
    if (!notifsActive) {
      setIsRequestingNotif(true);
      try {
        await requestPermission();
      } catch (e) {
        console.warn('Error al activar notificaciones:', e);
      } finally {
        setIsRequestingNotif(false);
      }
    }

    // 2. Then trigger install prompt
    if (!isAppInstalled) {
      if (isIOS) {
        setShowIosGuide(true);
      } else if (pwa?.installApp) {
        setIsInstalling(true);
        try {
          await pwa.installApp();
        } catch (e) {
          console.warn('Error al instalar:', e);
        } finally {
          setIsInstalling(false);
        }
      }
    }

    // If both done, close
    if (notifsActive && isAppInstalled) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="animate-scale-in"
        style={{
          backgroundColor: isDark ? '#161013' : '#FFFFFF',
          borderRadius: '32px',
          maxWidth: '440px',
          width: '100%',
          padding: '28px 22px',
          boxShadow: isDark
            ? '0 25px 60px -10px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.08)'
            : '0 25px 60px -10px rgba(211, 69, 91, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          border: isDark ? '1px solid #2B1D23' : '1px solid #EFE4E7',
          position: 'relative',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {/* Ambient Top Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '260px',
            height: '120px',
            background: 'radial-gradient(ellipse at center, rgba(211, 69, 91, 0.35) 0%, rgba(211, 69, 91, 0) 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            width: '36px',
            height: '36px',
            borderRadius: '9999px',
            backgroundColor: isDark ? '#23171C' : '#F7ECEF',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDark ? '#B8A2AB' : '#84626D',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            zIndex: 2
          }}
          aria-label="Cerrar"
        >
          <X style={{ width: '18px', height: '18px' }} />
        </button>

        {/* Header Section */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '22px',
              backgroundColor: '#D3455B',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto',
              boxShadow: '0 8px 24px -4px rgba(211, 69, 91, 0.5)'
            }}
          >
            <Sparkles style={{ width: '32px', height: '32px' }} />
          </div>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              backgroundColor: isDark ? 'rgba(211, 69, 91, 0.15)' : '#FFF0F3',
              color: '#D3455B',
              marginBottom: '8px'
            }}
          >
            <Zap style={{ width: '12px', height: '12px' }} />
            Configuración Rápida
          </span>

          <h2
            style={{
              fontSize: '21px',
              fontWeight: 800,
              color: isDark ? '#F7EFF2' : '#2A171D',
              margin: '0 0 6px 0',
              lineHeight: 1.25,
              letterSpacing: '-0.02em'
            }}
          >
            ¡Activa la App al 100%!
          </h2>

          <p
            style={{
              fontSize: '13px',
              color: isDark ? '#B8A2AB' : '#72555F',
              margin: 0,
              lineHeight: 1.5,
              padding: '0 6px'
            }}
          >
            Para recibir los recordatorios de entrenamiento diario y tener la experiencia completa instalada en tu pantalla.
          </p>
        </div>

        {/* Steps Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px', position: 'relative', zIndex: 1 }}>
          
          {/* Item 1: Notificaciones */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '20px',
              backgroundColor: isDark ? '#1F1519' : '#FFF9FA',
              border: notifsActive
                ? (isDark ? '1.5px solid rgba(13, 168, 106, 0.5)' : '1.5px solid #A3E6C7')
                : (isDark ? '1px solid #332229' : '1px solid #F5DDE3'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '14px',
                  backgroundColor: notifsActive ? 'rgba(13, 168, 106, 0.15)' : 'rgba(211, 69, 91, 0.12)',
                  color: notifsActive ? '#0DA86A' : '#D3455B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {notifsActive ? (
                  <Check style={{ width: '22px', height: '22px', strokeWidth: 3 }} />
                ) : (
                  <Bell style={{ width: '20px', height: '20px' }} />
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: isDark ? '#F7EFF2' : '#301D23' }}>
                    1. Notificaciones Push
                  </h4>
                  {notifsActive && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: '#0DA86A',
                        color: '#FFFFFF',
                        padding: '2px 6px',
                        borderRadius: '6px'
                      }}
                    >
                      ACTIVO
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: isDark ? '#B8A2AB' : '#84626D', margin: '2px 0 0 0' }}>
                  {notifsActive ? '¡Listo! Te avisaremos de cada treino.' : 'Alertas de tus treinos diarios y dieta.'}
                </p>
              </div>
            </div>

            {!notifsActive && (
              <button
                onClick={handleActivateNotifications}
                disabled={isRequestingNotif}
                style={{
                  padding: '9px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#D3455B',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: '0 3px 10px rgba(211, 69, 91, 0.35)',
                  transition: 'all 0.2s ease'
                }}
              >
                {isRequestingNotif ? '...' : 'Activar'}
              </button>
            )}
          </div>

          {/* Item 2: Instalar App */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '20px',
              backgroundColor: isDark ? '#1F1519' : '#FFF9FA',
              border: isAppInstalled
                ? (isDark ? '1.5px solid rgba(13, 168, 106, 0.5)' : '1.5px solid #A3E6C7')
                : (isDark ? '1px solid #332229' : '1px solid #F5DDE3'),
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '14px',
                    backgroundColor: isAppInstalled ? 'rgba(13, 168, 106, 0.15)' : 'rgba(211, 69, 91, 0.12)',
                    color: isAppInstalled ? '#0DA86A' : '#D3455B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {isAppInstalled ? (
                    <Check style={{ width: '22px', height: '22px', strokeWidth: 3 }} />
                  ) : (
                    <Smartphone style={{ width: '20px', height: '20px' }} />
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: isDark ? '#F7EFF2' : '#301D23' }}>
                      2. Instalar en Pantalla
                    </h4>
                    {isAppInstalled && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: '#0DA86A',
                          color: '#FFFFFF',
                          padding: '2px 6px',
                          borderRadius: '6px'
                        }}
                      >
                        INSTALADA
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: isDark ? '#B8A2AB' : '#84626D', margin: '2px 0 0 0' }}>
                    {isAppInstalled ? 'App lista en tu pantalla de inicio.' : 'Pantalla completa y acceso sin navegador.'}
                  </p>
                </div>
              </div>

              {!isAppInstalled && (
                <button
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '12px',
                    backgroundColor: '#D3455B',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxShadow: '0 3px 10px rgba(211, 69, 91, 0.35)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isIOS ? 'Ver Cómo' : (isInstalling ? '...' : 'Instalar')}
                </button>
              )}
            </div>

            {/* iOS Guide Box (if requested or on iOS) */}
            {isIOS && !isAppInstalled && (showIosGuide || true) && (
              <div
                style={{
                  backgroundColor: isDark ? '#26181D' : '#FDF0E6',
                  borderRadius: '14px',
                  padding: '10px 14px',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  color: isDark ? '#F2D3DC' : '#7A4B3A',
                  border: isDark ? '1px solid #3E242C' : '1px solid #FADEC8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Share style={{ width: '18px', height: '18px', color: '#D3455B', flexShrink: 0 }} />
                <span>
                  En Safari: toca <strong>Compartir (📤)</strong> abajo y luego <strong>"Agregar a Inicio"</strong>.
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative', zIndex: 1 }}>
          {(!notifsActive || !isAppInstalled) ? (
            <button
              onClick={handleActivateAll}
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '16px',
                backgroundColor: '#D3455B',
                color: '#FFFFFF',
                fontSize: '14.5px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px -2px rgba(211, 69, 91, 0.45)',
                transition: 'all 0.2s ease'
              }}
            >
              <Zap style={{ width: '18px', height: '18px' }} />
              <span>Activar Notificaciones e Instalar</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '16px',
                backgroundColor: '#0DA86A',
                color: '#FFFFFF',
                fontSize: '14.5px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px -2px rgba(13, 168, 106, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              <Check style={{ width: '18px', height: '18px', strokeWidth: 3 }} />
              <span>¡Todo Listo! Entrar al App</span>
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              width: '100%',
              height: '42px',
              borderRadius: '14px',
              backgroundColor: 'transparent',
              border: 'none',
              color: isDark ? '#B8A2AB' : '#84626D',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
          >
            Continuar al App
          </button>
        </div>
      </div>
    </div>
  );
}
