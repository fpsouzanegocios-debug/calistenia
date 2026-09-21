import React from 'react';
import { Bell, X, Check, ChevronRight, Sparkles, Flame, Utensils, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function NotificationCenterModal({ isOpen, onClose, notifications: propsNotifications, onMarkAsRead, onNavigate }) {
  const {
    theme,
    notifications: contextNotifications = [],
    markNotificationAsRead,
    notificationPermission,
    requestPermission,
    showDeviceNotification
  } = useApp();
  const isDark = theme === 'dark';
  const [testSent, setTestSent] = React.useState(false);

  if (!isOpen) return null;

  const notifications = propsNotifications && propsNotifications.length > 0 ? propsNotifications : contextNotifications;
  const handleMarkAsRead = onMarkAsRead || markNotificationAsRead;

  const handleTestNotification = async () => {
    setTestSent(true);
    await showDeviceNotification('¡Notificación de Calistenia Asiática! 🌿', {
      body: 'Tu dispositivo está configurado y recibiendo notificaciones correctamente.',
      icon: '/icons/icon-192.png'
    });
    setTimeout(() => setTestSent(false), 3000);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'workout':
        return <Flame style={{ width: '16px', height: '16px', color: '#DE3B40' }} />;
      case 'diet':
        return <Utensils style={{ width: '16px', height: '16px', color: '#0DA86A' }} />;
      case 'reminder':
        return <Sparkles style={{ width: '16px', height: '16px', color: '#EAB308' }} />;
      default:
        return <Info style={{ width: '16px', height: '16px', color: '#0284C7' }} />;
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
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
          padding: '26px 22px',
          boxShadow: isDark
            ? '0 25px 60px -15px rgba(0, 0, 0, 0.85)'
            : '0 25px 60px -15px rgba(211, 69, 91, 0.25)',
          border: isDark ? '1px solid #2D2226' : '1px solid #E9E2E4',
          position: 'relative',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '82vh',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '16px',
            borderBottom: isDark ? '1px solid #2D2226' : '1px solid #F0E6E9',
            marginBottom: '18px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                minWidth: '44px',
                borderRadius: '14px',
                backgroundColor: '#D3455B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(211, 69, 91, 0.35)',
                flexShrink: 0
              }}
            >
              <Bell style={{ width: '22px', height: '22px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: isDark ? '#F7EFF2' : '#301D23',
                  margin: 0,
                  lineHeight: 1.25
                }}
              >
                Notificaciones
              </h3>
              <span
                style={{
                  fontSize: '12px',
                  color: isDark ? '#B8A2AB' : '#84626D',
                  marginTop: '2px'
                }}
              >
                {notifications.length} {notifications.length === 1 ? 'mensaje' : 'mensajes'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
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
        </div>

        {/* Device Notification Status / Activation Banner */}
        {notificationPermission !== 'granted' ? (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '16px',
              backgroundColor: isDark ? 'rgba(211, 69, 91, 0.15)' : '#FFF0F3',
              border: isDark ? '1px solid rgba(211, 69, 91, 0.3)' : '1px solid #FAD8DF',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell style={{ width: '18px', height: '18px', color: '#D3455B', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '12.5px', fontWeight: 600, color: isDark ? '#FFF' : '#301D23', margin: 0, lineHeight: 1.2 }}>
                  Notificaciones del dispositivo
                </p>
                <p style={{ fontSize: '11px', color: isDark ? '#B8A2AB' : '#84626D', margin: '2px 0 0 0', lineHeight: 1.25 }}>
                  Recibe avisos directos en tu teléfono o navegador.
                </p>
              </div>
            </div>
            <button
              onClick={requestPermission}
              style={{
                padding: '7px 12px',
                borderRadius: '10px',
                backgroundColor: '#D3455B',
                color: '#FFF',
                fontSize: '11.5px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(211, 69, 91, 0.3)'
              }}
            >
              Activar
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '12px',
              backgroundColor: isDark ? '#1F171B' : '#F7F3F5',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '11.5px', color: '#0DA86A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check style={{ width: '13px', height: '13px' }} /> Notificaciones activadas en el dispositivo
            </span>
            <button
              onClick={handleTestNotification}
              disabled={testSent}
              style={{
                padding: '4px 8px',
                borderRadius: '8px',
                border: isDark ? '1px solid #382A31' : '1px solid #E2D3D8',
                backgroundColor: 'transparent',
                color: isDark ? '#E5D6DB' : '#5C3A46',
                fontSize: '10.5px',
                fontWeight: 600,
                cursor: testSent ? 'default' : 'pointer'
              }}
            >
              {testSent ? '¡Enviada!' : 'Probar'}
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {notifications.length === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '9999px',
                  backgroundColor: isDark ? '#241B20' : '#FFF0F3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  color: '#D3455B'
                }}
              >
                <Bell style={{ width: '28px', height: '28px' }} />
              </div>
              <p
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: isDark ? '#F7EFF2' : '#301D23',
                  margin: '0 0 6px 0'
                }}
              >
                ¡Todo al día!
              </p>
              <p
                style={{
                  fontSize: '13px',
                  color: isDark ? '#B8A2AB' : '#84626D',
                  maxWidth: '260px',
                  margin: 0,
                  lineHeight: 1.5
                }}
              >
                No tienes ninguna notificación pendiente en este momento.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isUnread = !notif.read;
              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (handleMarkAsRead) handleMarkAsRead(notif.id);
                    if (notif.action_url && onNavigate) {
                      onClose();
                      onNavigate(notif.action_url);
                    }
                  }}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '18px',
                    backgroundColor: isUnread
                      ? (isDark ? '#22181C' : '#FFF7F8')
                      : (isDark ? '#1C1619' : '#FAFAFA'),
                    border: isUnread
                      ? (isDark ? '1px solid #442630' : '1px solid #F5D3DB')
                      : (isDark ? '1px solid #281F23' : '1px solid #EDE4E7'),
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    boxShadow: isUnread ? '0 2px 8px -2px rgba(211, 69, 91, 0.15)' : 'none'
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      backgroundColor: isDark ? '#2B1E24' : '#FFFFFF',
                      border: isDark ? '1px solid #3A2A31' : '1px solid #F0E6E9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        marginBottom: '4px'
                      }}
                    >
                      <h4
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: isDark ? '#F7EFF2' : '#301D23',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {notif.title}
                      </h4>
                      <span
                        style={{
                          fontSize: '11px',
                          color: isDark ? '#B8A2AB' : '#84626D',
                          whiteSpace: 'nowrap',
                          flexShrink: 0
                        }}
                      >
                        {formatDate(notif.created_at)}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: '12.5px',
                        color: isDark ? '#B8A2AB' : '#66535A',
                        lineHeight: 1.5,
                        margin: 0
                      }}
                    >
                      {notif.message}
                    </p>

                    {notif.action_url && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          color: '#D3455B',
                          marginTop: '8px'
                        }}
                      >
                        <span>Ver detalles</span>
                        <ChevronRight style={{ width: '13px', height: '13px' }} />
                      </div>
                    )}
                  </div>

                  {isUnread && (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '9999px',
                        backgroundColor: '#D3455B',
                        flexShrink: 0,
                        marginTop: '6px'
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
