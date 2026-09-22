import React from 'react';
import { Download, X, Smartphone, Bell, Zap, Share } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function InstallPromptModal({ isOpen, onClose, pwa, onInstall, isInstallable, platform }) {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const currentPlatform = platform || pwa?.platform || '';
  const isIOS = Boolean(pwa?.isIOS || currentPlatform.includes('iOS'));
  const installFn = onInstall || pwa?.installApp;

  const handleInstallClick = async () => {
    if (installFn) {
      const res = await installFn();
      if (res?.success) {
        onClose();
      }
    } else {
      alert('Para instalar, use a opção "Adicionar à Tela de Início" no menu do seu navegador.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="animate-scale-in"
        style={{
          backgroundColor: isDark ? '#181215' : '#FFFFFF',
          borderRadius: '30px',
          maxWidth: '430px',
          width: '100%',
          padding: '28px 24px',
          boxShadow: isDark
            ? '0 25px 60px -15px rgba(0, 0, 0, 0.85)'
            : '0 25px 60px -15px rgba(211, 69, 91, 0.25)',
          border: isDark ? '1px solid #2D2226' : '1px solid #E9E2E4',
          position: 'relative',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
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
            backgroundColor: isDark ? '#241B20' : '#F5ECEF',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDark ? '#B8A2AB' : '#84626D',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          aria-label="Cerrar"
        >
          <X style={{ width: '18px', height: '18px' }} />
        </button>

        {/* Header with Icon and Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px',
            paddingRight: '36px'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              minWidth: '52px',
              borderRadius: '18px',
              backgroundColor: '#D3455B',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px -2px rgba(211, 69, 91, 0.4)',
              flexShrink: 0
            }}
          >
            <Smartphone style={{ width: '26px', height: '26px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#D3455B',
                marginBottom: '3px'
              }}
            >
              Experiencia de App Nativa
            </span>
            <h3
              style={{
                fontSize: '19px',
                fontWeight: 700,
                color: isDark ? '#F7EFF2' : '#301D23',
                margin: 0,
                lineHeight: 1.25
              }}
            >
              Instalar Calistenia Asiática
            </h3>
          </div>
        </div>

        {/* Subtitle / Description */}
        <p
          style={{
            fontSize: '13.5px',
            lineHeight: '1.55',
            color: isDark ? '#B8A2AB' : '#72555F',
            margin: '0 0 20px 0'
          }}
        >
          ¡Instala la app directamente en tu dispositivo para tener acceso ultra rápido, recordatorios de entrenamiento y soporte sin conexión completo!
        </p>

        {/* Feature Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {/* Item 1 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 14px',
              borderRadius: '16px',
              backgroundColor: isDark ? '#20181C' : '#FFF7F8',
              border: isDark ? '1px solid #302227' : '1px solid #F8DFE4'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                minWidth: '32px',
                borderRadius: '10px',
                backgroundColor: 'rgba(211, 69, 91, 0.12)',
                color: '#D3455B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Zap style={{ width: '16px', height: '16px' }} />
            </div>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: isDark ? '#F7EFF2' : '#301D23',
                lineHeight: 1.3
              }}
            >
              Acceso instantáneo directo desde la pantalla de inicio
            </span>
          </div>

          {/* Item 2 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 14px',
              borderRadius: '16px',
              backgroundColor: isDark ? '#20181C' : '#FFF7F8',
              border: isDark ? '1px solid #302227' : '1px solid #F8DFE4'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                minWidth: '32px',
                borderRadius: '10px',
                backgroundColor: 'rgba(211, 69, 91, 0.12)',
                color: '#D3455B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Bell style={{ width: '16px', height: '16px' }} />
            </div>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: isDark ? '#F7EFF2' : '#301D23',
                lineHeight: 1.3
              }}
            >
              Notificaciones de entrenamientos y novedades de dieta
            </span>
          </div>

          {/* Item 3 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 14px',
              borderRadius: '16px',
              backgroundColor: isDark ? '#20181C' : '#FFF7F8',
              border: isDark ? '1px solid #302227' : '1px solid #F8DFE4'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                minWidth: '32px',
                borderRadius: '10px',
                backgroundColor: 'rgba(211, 69, 91, 0.12)',
                color: '#D3455B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Download style={{ width: '16px', height: '16px' }} />
            </div>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: isDark ? '#F7EFF2' : '#301D23',
                lineHeight: 1.3
              }}
            >
              Consume menos batería y funciona sin conexión
            </span>
          </div>
        </div>

        {/* Buttons */}
        {isIOS ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                backgroundColor: isDark ? '#271B16' : '#FDF0E6',
                color: isDark ? '#E5B496' : '#7A4B3A',
                padding: '14px 16px',
                borderRadius: '16px',
                fontSize: '12.5px',
                lineHeight: 1.5,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                border: isDark ? '1px solid #3D291F' : '1px solid #FADEC8'
              }}
            >
              <Share style={{ width: '18px', height: '18px', flexShrink: 0, marginTop: '2px', color: '#D3455B' }} />
              <span>
                En Safari de iPhone: toca el icono de <strong>Compartir (📤)</strong> y selecciona <strong>"Agregar a Inicio"</strong>.
              </span>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '16px',
                backgroundColor: '#D3455B',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(211, 69, 91, 0.35)'
              }}
            >
              Entendido
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                height: '48px',
                borderRadius: '16px',
                backgroundColor: isDark ? '#241B20' : '#FFFFFF',
                border: isDark ? '1px solid #33272C' : '1px solid #E9E2E4',
                color: isDark ? '#F7EFF2' : '#4E363E',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Ahora no
            </button>

            <button
              onClick={handleInstallClick}
              style={{
                height: '48px',
                borderRadius: '16px',
                backgroundColor: '#D3455B',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px -2px rgba(211, 69, 91, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              <Download style={{ width: '18px', height: '18px' }} />
              <span>Instalar App</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
