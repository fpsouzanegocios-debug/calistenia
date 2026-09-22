import React, { useState } from 'react';
import {
  Bell,
  Smartphone,
  Check,
  X,
  Share,
  Zap,
  MoreVertical,
  PlusSquare,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function AppEntranceModal({ isOpen, onClose, pwa }) {
  const { theme, notificationPermission, requestPermission } = useApp();
  const isDark = theme === 'dark';

  const isAppInstalled = Boolean(pwa?.isInstalled);
  const isIOS = Boolean(pwa?.isIOS);
  const isAndroid = Boolean(pwa?.isAndroid);

  const [isInstalling, setIsInstalling] = useState(false);
  const [isRequestingNotif, setIsRequestingNotif] = useState(false);
  const [notifResult, setNotifResult] = useState(notificationPermission); // 'default' | 'granted' | 'denied' | 'unsupported'

  if (!isOpen) return null;

  const handleInstallClick = async () => {
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

  const handleRequestNotifications = async () => {
    setIsRequestingNotif(true);
    try {
      const res = await requestPermission();
      setNotifResult(res);
      if (res === 'granted') {
        // Success! Keep visible for a moment or allow closing
      }
    } catch (e) {
      console.warn('Error solicitando permisos:', e);
      setNotifResult('denied');
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
          maxWidth: '440px',
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

        {/* ============================================================== */}
        {/* SITUATION 1: ON WEB (NOT INSTALLED) -> ONLY INSTALL POPUP      */}
        {/* ============================================================== */}
        {!isAppInstalled ? (
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
                  fontSize: '21px',
                  fontWeight: 800,
                  color: isDark ? '#F7EFF2' : '#2A171D',
                  margin: '0 0 6px 0',
                  letterSpacing: '-0.02em'
                }}
              >
                {isIOS
                  ? 'Instala el App en tu iPhone'
                  : (isAndroid ? 'Instala el App en tu Android' : 'Instala Calistenia Asiática')}
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
                  ? 'Agrega la app a tu pantalla de inicio para tener acceso a pantalla completa y poder recibir las notificaciones push de tus entrenamientos.'
                  : 'Instala la aplicación en tu pantalla de inicio para entrenar a pantalla completa y habilitar los avisos diarios de entrenamiento.'}
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
                      Confirma arriba a la derecha. ¡Listo, ya tendrás el icono instalado en tu pantalla!
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    backgroundColor: isDark ? 'rgba(211, 69, 91, 0.12)' : '#FFF0F3',
                    fontSize: '11.5px',
                    color: '#D3455B',
                    lineHeight: 1.4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Bell style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                  <span>Al abrir el app desde tu pantalla de inicio podrás activar las notificaciones.</span>
                </div>
              </div>
            )}

            {/* Android / Desktop Guide */}
            {!isIOS && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
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
                    <span>Pasos en Chrome / Navegador:</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: isDark ? '#F7EFF2' : '#301D23' }}>
                    <MoreVertical style={{ width: '18px', height: '18px', color: '#D3455B', flexShrink: 0 }} />
                    <span><strong>Paso 1:</strong> Toca en los <strong>3 puntos (⋮)</strong> arriba a la derecha.</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: isDark ? '#F7EFF2' : '#301D23' }}>
                    <Smartphone style={{ width: '18px', height: '18px', color: '#0DA86A', flexShrink: 0 }} />
                    <span><strong>Paso 2:</strong> Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.</span>
                  </div>
                </div>

                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    backgroundColor: isDark ? 'rgba(211, 69, 91, 0.12)' : '#FFF0F3',
                    fontSize: '11.5px',
                    color: '#D3455B',
                    lineHeight: 1.4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Bell style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                  <span>Al abrir el app instalada podrás activar las notificaciones push.</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => {
                  if (pwa?.recordInstallation) {
                    pwa.recordInstallation();
                  }
                  onClose();
                }}
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
                  boxShadow: '0 6px 18px rgba(211, 69, 91, 0.4)',
                  transition: 'all 0.2s'
                }}
              >
                <Check style={{ width: '18px', height: '18px', strokeWidth: 3 }} />
                <span>¡Ya agregué la App a mi pantalla!</span>
              </button>

              <button
                onClick={onClose}
                style={{
                  height: '38px',
                  background: 'none',
                  border: 'none',
                  color: isDark ? '#8A737C' : '#99828B',
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                Continuar en el navegador por ahora
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* SITUATION 2: IN INSTALLED APP (STANDALONE) -> NOTIFICATIONS    */
          /* ============================================================== */
          <div style={{ position: 'relative', zIndex: 1 }} className="animate-fade-in">
            {/* Header Icon */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '22px',
                  backgroundColor: notifResult === 'granted' ? '#0DA86A' : '#D3455B',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                  boxShadow: notifResult === 'granted'
                    ? '0 8px 24px -4px rgba(13, 168, 106, 0.45)'
                    : '0 8px 24px -4px rgba(211, 69, 91, 0.45)',
                  transition: 'all 0.3s ease'
                }}
              >
                {notifResult === 'granted' ? (
                  <CheckCircle2 style={{ width: '34px', height: '34px' }} />
                ) : (
                  <Bell style={{ width: '32px', height: '32px' }} />
                )}
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
                App instalada en tu dispositivo
              </span>

              <h3
                style={{
                  fontSize: '21px',
                  fontWeight: 800,
                  color: isDark ? '#F7EFF2' : '#2A171D',
                  margin: '0 0 6px 0',
                  letterSpacing: '-0.02em'
                }}
              >
                {notifResult === 'granted'
                  ? '¡Notificaciones Activadas!'
                  : 'Activa tus Notificaciones Push'}
              </h3>

              <p
                style={{
                  fontSize: '12.5px',
                  color: isDark ? '#B8A2AB' : '#72555F',
                  margin: 0,
                  lineHeight: 1.45
                }}
              >
                {notifResult === 'granted'
                  ? '¡Excelente! Ahora recibirás las alertas de tus entrenamientos diarios de 21 días.'
                  : 'Recibe alertas matutinas de tu entrenamiento, recordatorios de hidratación y avisos del coach.'}
              </p>
            </div>

            {/* Notification Preview Mock (if not yet granted) */}
            {notifResult !== 'granted' && (
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
            )}

            {/* Feedback message if denied */}
            {notifResult === 'denied' && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '14px',
                  backgroundColor: isDark ? 'rgba(222, 59, 64, 0.15)' : '#FDE8E9',
                  border: '1px solid #DE3B40',
                  color: '#DE3B40',
                  fontSize: '12px',
                  lineHeight: 1.4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}
              >
                <AlertTriangle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                <span>Las notificaciones están bloqueadas en los ajustes de tu navegador o teléfono.</span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifResult === 'granted' ? (
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
                    transition: 'all 0.2s'
                  }}
                >
                  <Zap style={{ width: '18px', height: '18px' }} />
                  <span>Comenzar a Entrenar</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleRequestNotifications}
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
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
