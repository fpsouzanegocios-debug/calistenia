import React, { useState, useEffect } from 'react';
import {
  Bell,
  Smartphone,
  Check,
  Sparkles,
  X,
  Share,
  Zap,
  ArrowRight,
  MoreVertical,
  PlusSquare,
  Flame,
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function AppEntranceModal({ isOpen, onClose, pwa }) {
  const { theme, notificationPermission, requestPermission } = useApp();
  const isDark = theme === 'dark';

  const isAppInstalled = Boolean(pwa?.isInstalled);
  const notifsActive = notificationPermission === 'granted';

  // Step 1: 'install' | Step 2: 'notifications' | Step 3: 'done'
  const [currentStep, setCurrentStep] = useState(isAppInstalled ? 'notifications' : 'install');
  const [isInstalling, setIsInstalling] = useState(false);
  const [isRequestingNotif, setIsRequestingNotif] = useState(false);

  // Auto-advance if already installed
  useEffect(() => {
    if (isAppInstalled && currentStep === 'install') {
      setCurrentStep('notifications');
    }
  }, [isAppInstalled, currentStep]);

  if (!isOpen) return null;

  // Platform detection
  const isIOS = Boolean(pwa?.isIOS);
  const isAndroid = Boolean(pwa?.isAndroid);

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      if (pwa?.installApp) {
        const res = await pwa.installApp();
        if (res?.success) {
          setCurrentStep('notifications');
        }
      }
    } catch (e) {
      console.warn('Error en prompt de instalación:', e);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleConfirmInstalled = () => {
    if (pwa?.recordInstallation) {
      pwa.recordInstallation();
    }
    setCurrentStep('notifications');
  };

  const handleActivateNotifications = async () => {
    setIsRequestingNotif(true);
    try {
      const perm = await requestPermission();
      if (perm === 'granted') {
        setCurrentStep('done');
      } else {
        // Even if denied or dismissed, allow finishing
        setCurrentStep('done');
      }
    } catch (e) {
      console.warn('Error solicitando permisos:', e);
      setCurrentStep('done');
    } finally {
      setIsRequestingNotif(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
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
          maxWidth: '450px',
          width: '100%',
          padding: '26px 22px',
          boxShadow: isDark
            ? '0 30px 70px -10px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.08)'
            : '0 30px 70px -10px rgba(211, 69, 91, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          border: isDark ? '1px solid #2D1E24' : '1px solid #EFE4E7',
          position: 'relative',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {/* Glow Header */}
        <div
          style={{
            position: 'absolute',
            top: '-70px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '280px',
            height: '140px',
            background: 'radial-gradient(ellipse at center, rgba(211, 69, 91, 0.38) 0%, rgba(211, 69, 91, 0) 70%)',
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

        {/* 2-Step Progress Indicator */}
        <div style={{ position: 'relative', zIndex: 1, marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            {/* Step 1 Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: currentStep === 'install'
                  ? '#D3455B'
                  : (isDark ? 'rgba(13, 168, 106, 0.2)' : '#E6F7EF'),
                color: currentStep === 'install'
                  ? '#FFFFFF'
                  : '#0DA86A',
                boxShadow: currentStep === 'install' ? '0 2px 8px rgba(211, 69, 91, 0.35)' : 'none'
              }}
            >
              {currentStep !== 'install' ? (
                <Check style={{ width: '12px', height: '12px', strokeWidth: 3 }} />
              ) : (
                <span>1</span>
              )}
              <span>Paso 1: Instalar</span>
            </div>

            <ChevronRight style={{ width: '14px', height: '14px', color: isDark ? '#554249' : '#C4B5BA' }} />

            {/* Step 2 Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: currentStep === 'notifications'
                  ? '#D3455B'
                  : (currentStep === 'done' ? (isDark ? 'rgba(13, 168, 106, 0.2)' : '#E6F7EF') : (isDark ? '#23171C' : '#F0E6E9')),
                color: currentStep === 'notifications'
                  ? '#FFFFFF'
                  : (currentStep === 'done' ? '#0DA86A' : (isDark ? '#7E6971' : '#99828B')),
                boxShadow: currentStep === 'notifications' ? '0 2px 8px rgba(211, 69, 91, 0.35)' : 'none'
              }}
            >
              {currentStep === 'done' ? (
                <Check style={{ width: '12px', height: '12px', strokeWidth: 3 }} />
              ) : (
                <span>2</span>
              )}
              <span>Paso 2: Notificaciones</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* STEP 1: INSTALL APP (CUSTOMIZED FOR IOS / ANDROID) */}
        {/* ============================================================== */}
        {currentStep === 'install' && (
          <div style={{ position: 'relative', zIndex: 1 }} className="animate-fade-in">
            {/* Device Badge */}
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  backgroundColor: isIOS
                    ? (isDark ? 'rgba(255, 255, 255, 0.1)' : '#F2F2F7')
                    : (isDark ? 'rgba(13, 168, 106, 0.15)' : '#E6F7EF'),
                  color: isIOS
                    ? (isDark ? '#F7EFF2' : '#301D23')
                    : '#0DA86A'
                }}
              >
                <Smartphone style={{ width: '13px', height: '13px' }} />
                {isIOS ? '📱 Dispositivo Apple (iPhone / iPad)' : (isAndroid ? '🤖 Dispositivo Android' : '🌐 Navegador Web')}
              </span>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: isDark ? '#F7EFF2' : '#2A171D',
                  margin: '0 0 6px 0',
                  letterSpacing: '-0.02em'
                }}
              >
                {isIOS
                  ? 'Instala el App en tu iPhone'
                  : 'Instala el App en tu Android'}
              </h3>
              <p
                style={{
                  fontSize: '12.5px',
                  color: isDark ? '#B8A2AB' : '#72555F',
                  margin: 0,
                  lineHeight: 1.45
                }}
              >
                {isIOS
                  ? 'Apple exige instalar la app en tu pantalla de inicio para poder activar las notificaciones de entrenamiento.'
                  : 'Instala la app para entrenar a pantalla completa y recibir las notificaciones diarias sin interrupciones.'}
              </p>
            </div>

            {/* iOS Step-by-Step Guide */}
            {isIOS && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {/* iOS Step 1 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    backgroundColor: isDark ? '#1F1418' : '#FFF7F8',
                    border: isDark ? '1px solid #332026' : '1px solid #F5DEE3'
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: '#007AFF',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Share style={{ width: '18px', height: '18px' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#F7EFF2' : '#301D23', display: 'block' }}>
                      1. Toca en Compartir
                    </span>
                    <span style={{ fontSize: '11.5px', color: isDark ? '#B8A2AB' : '#84626D' }}>
                      En la barra inferior de Safari, pulsa el ícono <strong>Compartir (📤)</strong>.
                    </span>
                  </div>
                </div>

                {/* iOS Step 2 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    backgroundColor: isDark ? '#1F1418' : '#FFF7F8',
                    border: isDark ? '1px solid #332026' : '1px solid #F5DEE3'
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: isDark ? '#2D1E24' : '#EBE1E4',
                      color: isDark ? '#F7EFF2' : '#301D23',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <PlusSquare style={{ width: '18px', height: '18px' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#F7EFF2' : '#301D23', display: 'block' }}>
                      2. "Agregar a Inicio"
                    </span>
                    <span style={{ fontSize: '11.5px', color: isDark ? '#B8A2AB' : '#84626D' }}>
                      Desliza hacia arriba en el menú y selecciona <strong>"Agregar a Inicio" (➕)</strong>.
                    </span>
                  </div>
                </div>

                {/* iOS Step 3 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    backgroundColor: isDark ? '#1F1418' : '#FFF7F8',
                    border: isDark ? '1px solid #332026' : '1px solid #F5DEE3'
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: '#D3455B',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Check style={{ width: '18px', height: '18px', strokeWidth: 3 }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#F7EFF2' : '#301D23', display: 'block' }}>
                      3. Toca en "Agregar"
                    </span>
                    <span style={{ fontSize: '11.5px', color: isDark ? '#B8A2AB' : '#84626D' }}>
                      Confirma arriba a la derecha. ¡Listo, ya tendrás el icono en tu pantalla!
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Android Guide */}
            {!isIOS && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {/* 1-Click Native Install Button (if browser supports beforeinstallprompt) */}
                {pwa?.isInstallable && (
                  <button
                    onClick={handleInstallClick}
                    disabled={isInstalling}
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
                      boxShadow: '0 6px 18px rgba(211, 69, 91, 0.45)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Smartphone style={{ width: '18px', height: '18px' }} />
                    <span>{isInstalling ? 'Instalando...' : 'Instalar en 1 Clic en Android'}</span>
                  </button>
                )}

                {/* Android Manual Steps Card */}
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '18px',
                    backgroundColor: isDark ? '#1F1418' : '#FFF7F8',
                    border: isDark ? '1px solid #332026' : '1px solid #F5DEE3',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D3455B', fontSize: '11.5px', fontWeight: 700 }}>
                    <Info style={{ width: '14px', height: '14px' }} />
                    <span>¿Cómo instalar desde Chrome o navegador?</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: isDark ? '#F7EFF2' : '#301D23' }}>
                    <MoreVertical style={{ width: '18px', height: '18px', color: '#D3455B', flexShrink: 0 }} />
                    <span><strong>Paso 1:</strong> Toca en los <strong>3 puntos (⋮)</strong> arriba a la derecha en tu navegador.</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: isDark ? '#F7EFF2' : '#301D23' }}>
                    <Smartphone style={{ width: '18px', height: '18px', color: '#0DA86A', flexShrink: 0 }} />
                    <span><strong>Paso 2:</strong> Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Advance to Step 2 Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleConfirmInstalled}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '16px',
                  backgroundColor: '#D3455B',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(211, 69, 91, 0.4)',
                  transition: 'all 0.2s'
                }}
              >
                <span>¡Ya agregué la App! ➔ Paso 2</span>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </button>

              <button
                onClick={onClose}
                style={{
                  height: '36px',
                  background: 'none',
                  border: 'none',
                  color: isDark ? '#8A737C' : '#99828B',
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                Continuar al app por ahora
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: NOTIFICATIONS (ONLY REACHED AFTER STEP 1) */}
        {/* ============================================================== */}
        {currentStep === 'notifications' && (
          <div style={{ position: 'relative', zIndex: 1 }} className="animate-fade-in">
            {/* Header Icon */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
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
                  margin: '0 auto 12px auto',
                  boxShadow: '0 8px 24px -4px rgba(211, 69, 91, 0.45)'
                }}
              >
                <Bell style={{ width: '32px', height: '32px' }} />
              </div>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: 'rgba(13, 168, 106, 0.15)',
                  color: '#0DA86A',
                  marginBottom: '8px'
                }}
              >
                <Check style={{ width: '12px', height: '12px', strokeWidth: 3 }} />
                App lista en tu pantalla
              </span>

              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: isDark ? '#F7EFF2' : '#2A171D',
                  margin: '0 0 6px 0',
                  letterSpacing: '-0.02em'
                }}
              >
                Ahora, Activa las Notificaciones
              </h3>

              <p
                style={{
                  fontSize: '12.5px',
                  color: isDark ? '#B8A2AB' : '#72555F',
                  margin: 0,
                  lineHeight: 1.45
                }}
              >
                Recibe los recordatorios diarios para completar tus 21 días de entrenamiento, avisos de dieta y mensajes del coach.
              </p>
            </div>

            {/* Notification Preview Mock */}
            <div
              style={{
                padding: '14px',
                borderRadius: '18px',
                backgroundColor: isDark ? '#1F1418' : '#FFF7F8',
                border: isDark ? '1px solid #332026' : '1px solid #F5DEE3',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: '#D3455B',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Flame style={{ width: '22px', height: '22px' }} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#D3455B', textTransform: 'uppercase' }}>
                    Calistenia Asiática
                  </span>
                  <span style={{ fontSize: '10px', color: isDark ? '#8A737C' : '#99828B' }}>
                    • Ahora
                  </span>
                </div>
                <h5 style={{ fontSize: '13px', fontWeight: 700, margin: '2px 0 0 0', color: isDark ? '#F7EFF2' : '#301D23' }}>
                  ¡Tu entrenamiento de hoy te espera! 🔥
                </h5>
                <p style={{ fontSize: '11.5px', color: isDark ? '#B8A2AB' : '#72555F', margin: '2px 0 0 0' }}>
                  Mantén tu racha de 21 días para transformar tu cuerpo.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleActivateNotifications}
                disabled={isRequestingNotif}
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
                  transition: 'all 0.2s'
                }}
              >
                <Bell style={{ width: '18px', height: '18px' }} />
                <span>{isRequestingNotif ? 'Activando...' : 'Permitir Notificaciones'}</span>
              </button>

              <button
                onClick={onClose}
                style={{
                  height: '36px',
                  background: 'none',
                  border: 'none',
                  color: isDark ? '#8A737C' : '#99828B',
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                Recordarme más tarde
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: SUCCESS / DONE */}
        {/* ============================================================== */}
        {currentStep === 'done' && (
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }} className="animate-fade-in">
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(13, 168, 106, 0.15)',
                color: '#0DA86A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '10px auto 16px auto'
              }}
            >
              <CheckCircle2 style={{ width: '42px', height: '42px' }} />
            </div>

            <h3
              style={{
                fontSize: '21px',
                fontWeight: 800,
                color: isDark ? '#F7EFF2' : '#2A171D',
                margin: '0 0 8px 0'
              }}
            >
              ¡Configuración Completada!
            </h3>

            <p
              style={{
                fontSize: '13px',
                color: isDark ? '#B8A2AB' : '#72555F',
                margin: '0 0 24px 0',
                lineHeight: 1.5
              }}
            >
              Ya tienes Calistenia Asiática lista para entrenar con notificaciones automáticas en tu dispositivo.
            </p>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '16px',
                backgroundColor: '#0DA86A',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px -2px rgba(13, 168, 106, 0.4)',
                transition: 'all 0.2s'
              }}
            >
              <Zap style={{ width: '18px', height: '18px' }} />
              <span>Entrar a Calistenia Asiática</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
