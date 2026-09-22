import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Users,
  Smartphone,
  Send,
  Bell,
  CheckCircle,
  Clock,
  Flame,
  Search,
  RefreshCw,
  Filter,
  ChevronRight,
  Shield,
  Sparkles,
  ExternalLink,
  Laptop,
  Check,
  X,
  Lock,
  MessageSquare,
  Activity,
  Calendar,
  Layers,
  ArrowUpRight,
  Eye,
  EyeOff,
  Key,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { getDeepSeekApiKey, saveDeepSeekApiKey, testDeepSeekConnection } from '../services/deepseek';

export function Admin({ onNavigate }) {
  const { getAllUsersForAdmin, sendCustomNotification, state, user, theme } = useApp();
  const isDark = theme === 'dark';

  const userEmail = (user?.email || state.userProfile?.email || '').toLowerCase().trim();
  const isMasterAdmin = userEmail === 'idealconsumo@gmail.com' || state.userProfile?.is_admin === true;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ profiles: [], progress: [], notifications: [] });
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'send' | 'history' | 'ai'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPwa, setFilterPwa] = useState('all'); // 'all' | 'pwa' | 'web'

  // DeepSeek AI State
  const [deepseekKeyInput, setDeepseekKeyInput] = useState('');
  const [deepseekStatus, setDeepseekStatus] = useState({ tested: false, success: false, message: '' });
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [showKeyText, setShowKeyText] = useState(false);

  // Notification Composer Form State
  const [targetAudience, setTargetAudience] = useState('all'); // 'all' | 'pwa' | 'user'
  const [selectedUserId, setSelectedUserId] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('workout');
  const [notifAction, setNotifAction] = useState('/#/treinos');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState('');
  const [sendErrorMessage, setSendErrorMessage] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    const result = await getAllUsersForAdmin();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    if (isMasterAdmin) {
      loadAdminData();
      getDeepSeekApiKey().then(k => {
        if (k) setDeepseekKeyInput(k);
      });
    }
  }, [isMasterAdmin]);

  const handleSaveDeepSeekKey = async () => {
    setIsSavingKey(true);
    const res = await saveDeepSeekApiKey(deepseekKeyInput);
    setIsSavingKey(false);
    if (res.success) {
      setDeepseekStatus({
        tested: true,
        success: true,
        message: '¡Clave guardada con éxito en la base de datos y sincronizada con el Soporte!'
      });
    } else {
      setDeepseekStatus({
        tested: true,
        success: false,
        message: res.error || 'Error al guardar clave.'
      });
    }
  };

  const handleTestDeepSeekKey = async () => {
    if (!deepseekKeyInput.trim()) {
      setDeepseekStatus({
        tested: true,
        success: false,
        message: 'Por favor, escribe o pega una clave antes de probar.'
      });
      return;
    }
    setIsTestingKey(true);
    const res = await testDeepSeekConnection(deepseekKeyInput.trim());
    setIsTestingKey(false);
    if (res.success) {
      setDeepseekStatus({
        tested: true,
        success: true,
        message: '¡Conexión con la API de DeepSeek realizada con éxito! El modelo deepseek-chat está respondiendo perfectamente.'
      });
    } else {
      setDeepseekStatus({
        tested: true,
        success: false,
        message: res.error
      });
    }
  };

  // If not master admin, show locked screen
  if (!isMasterAdmin) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: isDark ? '#0E0B0D' : '#FAFAFA',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            maxWidth: '400px',
            width: '100%',
            backgroundColor: isDark ? '#181215' : '#FFFFFF',
            borderRadius: '28px',
            padding: '32px 24px',
            textAlign: 'center',
            boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.8)' : '0 20px 50px rgba(0,0,0,0.06)',
            border: isDark ? '1px solid #2D2226' : '1px solid #E9E2E4'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(211, 69, 91, 0.12)',
              color: '#D3455B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}
          >
            <Lock style={{ width: '28px', height: '28px' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: isDark ? '#F7EFF2' : '#301D23', margin: '0 0 8px 0' }}>
            Acceso Restringido
          </h2>
          <p style={{ fontSize: '13px', color: isDark ? '#B8A2AB' : '#84626D', lineHeight: 1.5, margin: '0 0 24px 0' }}>
            Esta área está restringida exclusivamente al Administrador Master de Calistenia Asiática (<strong>idealconsumo@gmail.com</strong>).
          </p>
          <button
            onClick={() => onNavigate('/')}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '16px',
              backgroundColor: '#D3455B',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(211, 69, 91, 0.35)'
            }}
          >
            Volver al Inicio
          </button>
        </div>
      </main>
    );
  }

  // Compute metrics
  const totalUsers = data.profiles.length;
  const pwaUsersCount = data.profiles.filter(p => p.is_pwa_installed).length;
  const pwaInstallRate = totalUsers > 0 ? Math.round((pwaUsersCount / totalUsers) * 100) : 0;
  const totalWorkoutsCompleted = data.progress.filter(p => p.completed).length;
  const totalNotificationsSent = data.notifications.length;

  // Compute user-specific progress map
  const userProgressMap = {};
  data.progress.forEach(p => {
    if (p.completed && p.user_id) {
      userProgressMap[p.user_id] = (userProgressMap[p.user_id] || 0) + 1;
    }
  });

  // Filter users list
  const filteredUsers = data.profiles.filter(u => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone || '').includes(searchQuery);

    if (!matchesSearch) return false;
    if (filterPwa === 'pwa') return Boolean(u.is_pwa_installed);
    if (filterPwa === 'web') return !u.is_pwa_installed;
    return true;
  });

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    setIsSending(true);
    setSendSuccessMessage('');
    setSendErrorMessage('');

    try {
      if (targetAudience === 'user') {
        if (!selectedUserId) {
          throw new Error('Por favor, selecciona un usuario destinatario.');
        }
        // Send to specific user
        const dest = data.profiles.find(p => (p.user_id || p.id) === selectedUserId);
        const res = await sendCustomNotification({
          title: notifTitle.trim(),
          message: notifMessage.trim(),
          type: notifType,
          action_url: notifAction,
          user_id: selectedUserId
        });
        if (!res?.success) {
          throw new Error(res?.error?.message || 'Error al enviar notificación al usuario.');
        }
        setSendSuccessMessage(`¡Notificación enviada exclusivamente a ${dest?.name || 'usuario'} (${dest?.email})!`);
      } else {
        // Broadcast to all (user_id = null)
        const res = await sendCustomNotification({
          title: notifTitle.trim(),
          message: notifMessage.trim(),
          type: notifType,
          action_url: notifAction,
          user_id: null
        });
        if (!res?.success) {
          throw new Error(res?.error?.message || 'Error al enviar notificación broadcast.');
        }
        setSendSuccessMessage('¡Notificación enviada con éxito a TODOS los dispositivos y usuarios!');
      }
      setNotifTitle('');
      setNotifMessage('');

      // Refresh admin data
      loadAdminData();
    } catch (err) {
      console.error('Erro ao enviar:', err);
      setSendErrorMessage(err.message || 'Error al procesar el envío de la notificación.');
    } finally {
      setIsSending(false);
    }
  };

  const openComposerForUser = (userProfile) => {
    setSelectedUserId(userProfile.user_id || userProfile.id);
    setTargetAudience('user');
    setNotifTitle(`Olá, ${userProfile.name?.split(' ')[0] || 'Atleta'}!`);
    setActiveTab('send');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'workout':
        return '🔥';
      case 'diet':
        return '🥗';
      case 'reminder':
        return '⏰';
      default:
        return '📢';
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: isDark ? '#0E0B0D' : '#F8F6F7',
        color: isDark ? '#F7EFF2' : '#301D23',
        padding: '20px 16px 100px 16px',
        maxWidth: '900px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: isDark ? '1px solid #231A1E' : '1px solid #EBE3E6'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => onNavigate('/perfil')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '9999px',
              backgroundColor: isDark ? '#1C1518' : '#FFFFFF',
              border: isDark ? '1px solid #2D2226' : '1px solid #E9E2E4',
              color: isDark ? '#F7EFF2' : '#301D23',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
            aria-label="Volver"
          >
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Panel Administrativo
              </h1>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: 'rgba(211, 69, 91, 0.12)',
                  color: '#D3455B'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '9999px',
                    backgroundColor: '#D3455B',
                    display: 'inline-block'
                  }}
                />
                Master Admin
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: isDark ? '#B8A2AB' : '#84626D', margin: '4px 0 0 0' }}>
              Conectado como <strong>idealconsumo@gmail.com</strong>
            </p>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          disabled={loading}
          style={{
            height: '40px',
            padding: '0 14px',
            borderRadius: '12px',
            backgroundColor: isDark ? '#1C1518' : '#FFFFFF',
            border: isDark ? '1px solid #2D2226' : '1px solid #E9E2E4',
            color: isDark ? '#F7EFF2' : '#301D23',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
          }}
          title="Recargar datos"
        >
          <RefreshCw style={{ width: '15px', height: '15px' }} className={loading ? 'animate-spin text-[#D3455B]' : ''} />
          <span>Actualizar</span>
        </button>
      </header>

      {/* KPI Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '26px'
        }}
      >
        {/* Card 1: Total Users */}
        <div
          style={{
            backgroundColor: isDark ? '#181215' : '#FFFFFF',
            borderRadius: '20px',
            padding: '18px',
            border: isDark ? '1px solid #281E23' : '1px solid #EFE8EB',
            boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.3)' : '0 4px 14px rgba(61,41,48,0.04)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: isDark ? '#B8A2AB' : '#84626D', letterSpacing: '0.05em' }}>
              Usuarios
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(211, 69, 91, 0.1)', color: '#D3455B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users style={{ width: '16px', height: '16px' }} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: isDark ? '#F7EFF2' : '#301D23', lineHeight: 1.1 }}>
            {totalUsers}
          </div>
          <span style={{ fontSize: '11px', color: isDark ? '#B8A2AB' : '#84626D', marginTop: '4px', display: 'block' }}>
            Registrados en la plataforma
          </span>
        </div>

        {/* Card 2: PWA Installed */}
        <div
          style={{
            backgroundColor: isDark ? '#181215' : '#FFFFFF',
            borderRadius: '20px',
            padding: '18px',
            border: isDark ? '1px solid #281E23' : '1px solid #EFE8EB',
            boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.3)' : '0 4px 14px rgba(61,41,48,0.04)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: isDark ? '#B8A2AB' : '#84626D', letterSpacing: '0.05em' }}>
              App PWA
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(13, 168, 106, 0.1)', color: '#0DA86A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone style={{ width: '16px', height: '16px' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#0DA86A', lineHeight: 1.1 }}>
              {pwaUsersCount}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0DA86A', backgroundColor: 'rgba(13, 168, 106, 0.12)', padding: '2px 8px', borderRadius: '9999px' }}>
              {pwaInstallRate}%
            </span>
          </div>
          <span style={{ fontSize: '11px', color: isDark ? '#B8A2AB' : '#84626D', marginTop: '4px', display: 'block' }}>
            Instalaron en pantalla de inicio
          </span>
        </div>

        {/* Card 3: Workouts Completed */}
        <div
          style={{
            backgroundColor: isDark ? '#181215' : '#FFFFFF',
            borderRadius: '20px',
            padding: '18px',
            border: isDark ? '1px solid #281E23' : '1px solid #EFE8EB',
            boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.3)' : '0 4px 14px rgba(61,41,48,0.04)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: isDark ? '#B8A2AB' : '#84626D', letterSpacing: '0.05em' }}>
              Entrenamientos
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(222, 59, 64, 0.1)', color: '#DE3B40', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame style={{ width: '16px', height: '16px' }} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: isDark ? '#F7EFF2' : '#301D23', lineHeight: 1.1 }}>
            {totalWorkoutsCompleted}
          </div>
          <span style={{ fontSize: '11px', color: isDark ? '#B8A2AB' : '#84626D', marginTop: '4px', display: 'block' }}>
            Completados con éxito
          </span>
        </div>

        {/* Card 4: Notifications */}
        <div
          style={{
            backgroundColor: isDark ? '#181215' : '#FFFFFF',
            borderRadius: '20px',
            padding: '18px',
            border: isDark ? '1px solid #281E23' : '1px solid #EFE8EB',
            boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.3)' : '0 4px 14px rgba(61,41,48,0.04)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: isDark ? '#B8A2AB' : '#84626D', letterSpacing: '0.05em' }}>
              Notificaciones
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(2, 132, 199, 0.1)', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell style={{ width: '16px', height: '16px' }} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: isDark ? '#F7EFF2' : '#301D23', lineHeight: 1.1 }}>
            {totalNotificationsSent}
          </div>
          <span style={{ fontSize: '11px', color: isDark ? '#B8A2AB' : '#84626D', marginTop: '4px', display: 'block' }}>
            Enviadas en total
          </span>
        </div>
      </div>

      {/* Modern Navigation Tabs Bar */}
      <div
        style={{
          display: 'flex',
          backgroundColor: isDark ? '#141012' : '#EDE4E7',
          padding: '6px',
          borderRadius: '18px',
          gap: '6px',
          marginBottom: '26px'
        }}
      >
        <button
          onClick={() => setActiveTab('users')}
          style={{
            flex: 1,
            height: '42px',
            borderRadius: '14px',
            border: 'none',
            backgroundColor: activeTab === 'users' ? (isDark ? '#221A1E' : '#FFFFFF') : 'transparent',
            color: activeTab === 'users' ? (isDark ? '#F7EFF2' : '#301D23') : (isDark ? '#B8A2AB' : '#84626D'),
            fontWeight: activeTab === 'users' ? 700 : 500,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: activeTab === 'users' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Users style={{ width: '16px', height: '16px' }} />
          <span>Usuarios ({totalUsers})</span>
        </button>

        <button
          onClick={() => setActiveTab('send')}
          style={{
            flex: 1,
            height: '42px',
            borderRadius: '14px',
            border: 'none',
            backgroundColor: activeTab === 'send' ? (isDark ? '#221A1E' : '#FFFFFF') : 'transparent',
            color: activeTab === 'send' ? '#D3455B' : (isDark ? '#B8A2AB' : '#84626D'),
            fontWeight: activeTab === 'send' ? 700 : 500,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: activeTab === 'send' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Send style={{ width: '16px', height: '16px' }} />
          <span>Disparador Push</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            flex: 1,
            height: '42px',
            borderRadius: '14px',
            border: 'none',
            backgroundColor: activeTab === 'history' ? (isDark ? '#221A1E' : '#FFFFFF') : 'transparent',
            color: activeTab === 'history' ? (isDark ? '#F7EFF2' : '#301D23') : (isDark ? '#B8A2AB' : '#84626D'),
            fontWeight: activeTab === 'history' ? 700 : 500,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: activeTab === 'history' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Clock style={{ width: '16px', height: '16px' }} />
          <span>Historial</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          style={{
            flex: 1,
            height: '42px',
            borderRadius: '14px',
            border: 'none',
            backgroundColor: activeTab === 'ai' ? (isDark ? '#221A1E' : '#FFFFFF') : 'transparent',
            color: activeTab === 'ai' ? '#D3455B' : (isDark ? '#B8A2AB' : '#84626D'),
            fontWeight: activeTab === 'ai' ? 700 : 500,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: activeTab === 'ai' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Sparkles style={{ width: '16px', height: '16px' }} />
          <span>IA DeepSeek</span>
        </button>
      </div>

      {/* TAB 1: USERS LIST */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
          {/* Search and Filters */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: '240px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Search
                style={{
                  position: 'absolute',
                  left: '14px',
                  width: '16px',
                  height: '16px',
                  color: isDark ? '#B8A2AB' : '#84626D'
                }}
              />
              <input
                type="text"
                placeholder="Buscar por nombre, e-mail o teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 38px 0 40px',
                  borderRadius: '16px',
                  backgroundColor: isDark ? '#181215' : '#FFFFFF',
                  border: isDark ? '1px solid #2D2226' : '1px solid #E9E2E4',
                  fontSize: '13px',
                  color: isDark ? '#F7EFF2' : '#301D23',
                  outline: 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  boxSizing: 'border-box'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: isDark ? '#B8A2AB' : '#84626D',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X style={{ width: '14px', height: '14px' }} />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                backgroundColor: isDark ? '#141012' : '#EDE4E7',
                padding: '4px',
                borderRadius: '14px'
              }}
            >
              <button
                onClick={() => setFilterPwa('all')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: filterPwa === 'all' ? (isDark ? '#221A1E' : '#FFFFFF') : 'transparent',
                  color: filterPwa === 'all' ? (isDark ? '#F7EFF2' : '#301D23') : (isDark ? '#B8A2AB' : '#84626D'),
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: filterPwa === 'all' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                Todos ({totalUsers})
              </button>
              <button
                onClick={() => setFilterPwa('pwa')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: filterPwa === 'pwa' ? '#0DA86A' : 'transparent',
                  color: filterPwa === 'pwa' ? '#FFFFFF' : (isDark ? '#B8A2AB' : '#84626D'),
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: filterPwa === 'pwa' ? '0 1px 4px rgba(13,168,106,0.3)' : 'none'
                }}
              >
                📱 PWA ({pwaUsersCount})
              </button>
              <button
                onClick={() => setFilterPwa('web')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: filterPwa === 'web' ? (isDark ? '#221A1E' : '#FFFFFF') : 'transparent',
                  color: filterPwa === 'web' ? (isDark ? '#F7EFF2' : '#301D23') : (isDark ? '#B8A2AB' : '#84626D'),
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: filterPwa === 'web' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                🌐 Web ({totalUsers - pwaUsersCount})
              </button>
            </div>
          </div>

          {/* User Cards */}
          {filteredUsers.length === 0 ? (
            <div
              style={{
                padding: '48px 20px',
                textAlign: 'center',
                backgroundColor: isDark ? '#181215' : '#FFFFFF',
                borderRadius: '24px',
                border: isDark ? '1px solid #2D2226' : '1px solid #E9E2E4',
                color: isDark ? '#B8A2AB' : '#84626D'
              }}
            >
              <Users style={{ width: '36px', height: '36px', margin: '0 auto 12px auto', opacity: 0.5 }} />
              <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Ningún usuario encontrado con los filtros seleccionados.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredUsers.map((u) => {
                const isPwa = Boolean(u.is_pwa_installed);
                const workoutsDone = userProgressMap[u.user_id] || 0;
                const workoutPercent = Math.round((workoutsDone / 21) * 100);
                const isThisAdmin = u.email === 'idealconsumo@gmail.com' || u.is_admin === true;

                return (
                  <div
                    key={u.id || u.user_id}
                    style={{
                      backgroundColor: isDark ? '#181215' : '#FFFFFF',
                      borderRadius: '22px',
                      padding: '18px 20px',
                      border: isThisAdmin
                        ? '1.5px solid #D3455B'
                        : isDark
                        ? '1px solid #281E23'
                        : '1px solid #EDE4E7',
                      boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.25)' : '0 2px 8px rgba(61,41,48,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }}
                  >
                    {/* Top Row: User Avatar, Name, Email, Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            minWidth: '46px',
                            borderRadius: '9999px',
                            backgroundColor: isThisAdmin ? '#D3455B' : '#72555F',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: 700,
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          {u.photo_url ? (
                            <img src={u.photo_url} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            (u.name || 'U').charAt(0).toUpperCase()
                          )}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '15px',
                                fontWeight: 700,
                                color: isDark ? '#F7EFF2' : '#301D23',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {u.name || 'Usuario Sin Nombre'}
                            </span>
                            {isThisAdmin && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  backgroundColor: 'rgba(211, 69, 91, 0.14)',
                                  color: '#D3455B',
                                  padding: '2px 8px',
                                  borderRadius: '9999px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em'
                                }}
                              >
                                Master Admin
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: '12.5px',
                              color: isDark ? '#B8A2AB' : '#84626D',
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              marginTop: '2px'
                            }}
                          >
                            {u.email || 'Sin email'}
                          </span>
                        </div>
                      </div>

                      {/* Device / PWA Badge */}
                      {isPwa ? (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '9999px',
                            backgroundColor: isDark ? 'rgba(13, 168, 106, 0.15)' : '#E6F7EF',
                            border: isDark ? '1px solid rgba(13, 168, 106, 0.3)' : '1px solid #BEE7D3',
                            color: '#0DA86A',
                            fontSize: '11px',
                            fontWeight: 700,
                            flexShrink: 0
                          }}
                        >
                          <Smartphone style={{ width: '13px', height: '13px' }} />
                          <span>PWA Activo</span>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '9999px',
                            backgroundColor: isDark ? '#221A1E' : '#F2ECED',
                            color: isDark ? '#B8A2AB' : '#84626D',
                            fontSize: '11px',
                            fontWeight: 600,
                            flexShrink: 0
                          }}
                        >
                          <Laptop style={{ width: '13px', height: '13px' }} />
                          <span>Web</span>
                        </div>
                      )}
                    </div>

                    {/* Middle Row: Progress and Info Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '12px',
                        backgroundColor: isDark ? '#20181C' : '#FAFAFA',
                        padding: '12px 14px',
                        borderRadius: '16px',
                        border: isDark ? '1px solid #2B1F25' : '1px solid #F0E6E9'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '10.5px', color: isDark ? '#B8A2AB' : '#84626D', display: 'block' }}>
                          Dispositivo / SO
                        </span>
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: isDark ? '#F7EFF2' : '#301D23', display: 'block', marginTop: '2px' }}>
                          {u.pwa_device_info || 'Navegador Web'}
                        </span>
                      </div>

                      <div>
                        <span style={{ fontSize: '10.5px', color: isDark ? '#B8A2AB' : '#84626D', display: 'block' }}>
                          Instalado el
                        </span>
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: isDark ? '#F7EFF2' : '#301D23', display: 'block', marginTop: '2px' }}>
                          {u.pwa_installed_at ? new Date(u.pwa_installed_at).toLocaleDateString('es-ES') : 'No instalado'}
                        </span>
                      </div>

                      <div>
                        <span style={{ fontSize: '10.5px', color: isDark ? '#B8A2AB' : '#84626D', display: 'block' }}>
                          Progreso en el Desafío
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <div style={{ flex: 1, height: '6px', borderRadius: '9999px', backgroundColor: isDark ? '#33262C' : '#E9E2E4', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(100, workoutPercent)}%`,
                                height: '100%',
                                backgroundColor: '#D3455B',
                                borderRadius: '9999px'
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#D3455B' }}>
                            {workoutsDone}/21d
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '2px' }}>
                      <button
                        onClick={() => openComposerForUser(u)}
                        style={{
                          height: '34px',
                          padding: '0 14px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(211, 69, 91, 0.1)',
                          color: '#D3455B',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Send style={{ width: '13px', height: '13px' }} />
                        <span>Enviar Mensaje</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DISPARADOR PUSH & PREVIEW */}
      {activeTab === 'send' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            alignItems: 'start'
          }}
          className="animate-fade-in"
        >
          {/* Form Composer */}
          <div
            style={{
              backgroundColor: isDark ? '#181215' : '#FFFFFF',
              borderRadius: '26px',
              padding: '26px',
              border: isDark ? '1px solid #281E23' : '1px solid #EDE4E7',
              boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 4px 20px rgba(61,41,48,0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#D3455B',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(211, 69, 91, 0.35)'
                }}
              >
                <Send style={{ width: '20px', height: '20px' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: isDark ? '#F7EFF2' : '#301D23' }}>
                  Disparador de Notificaciones
                </h3>
                <p style={{ fontSize: '12px', color: isDark ? '#B8A2AB' : '#84626D', margin: '2px 0 0 0' }}>
                  Envía directo al centro de notificaciones y push nativo al dispositivo
                </p>
              </div>
            </div>

            {sendSuccessMessage && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '14px',
                  backgroundColor: isDark ? 'rgba(13, 168, 106, 0.15)' : '#E6F7EF',
                  border: '1px solid #0DA86A',
                  color: '#0DA86A',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '20px'
                }}
              >
                <CheckCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                <span>{sendSuccessMessage}</span>
              </div>
            )}

            {sendErrorMessage && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '14px',
                  backgroundColor: isDark ? 'rgba(222, 59, 64, 0.15)' : '#FDE8E9',
                  border: '1px solid #DE3B40',
                  color: '#DE3B40',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '20px'
                }}
              >
                <AlertTriangle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                <span>{sendErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Audience Selector */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: isDark ? '#F7EFF2' : '#301D23', display: 'block', marginBottom: '8px' }}>
                  Público Objetivo:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setTargetAudience('all')}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '14px',
                      border: targetAudience === 'all' ? '1.5px solid #D3455B' : (isDark ? '1px solid #2D2226' : '1px solid #E9E2E4'),
                      backgroundColor: targetAudience === 'all' ? (isDark ? 'rgba(211,69,91,0.15)' : '#FFF0F3') : (isDark ? '#1C1518' : '#FAFAFA'),
                      color: targetAudience === 'all' ? '#D3455B' : (isDark ? '#F7EFF2' : '#4E363E'),
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    🌍 Todos ({totalUsers})
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetAudience('pwa')}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '14px',
                      border: targetAudience === 'pwa' ? '1.5px solid #0DA86A' : (isDark ? '1px solid #2D2226' : '1px solid #E9E2E4'),
                      backgroundColor: targetAudience === 'pwa' ? (isDark ? 'rgba(13,168,106,0.15)' : '#E6F7EF') : (isDark ? '#1C1518' : '#FAFAFA'),
                      color: targetAudience === 'pwa' ? '#0DA86A' : (isDark ? '#F7EFF2' : '#4E363E'),
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    📱 PWA ({pwaUsersCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetAudience('user')}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '14px',
                      border: targetAudience === 'user' ? '1.5px solid #D3455B' : (isDark ? '1px solid #2D2226' : '1px solid #E9E2E4'),
                      backgroundColor: targetAudience === 'user' ? (isDark ? 'rgba(211,69,91,0.15)' : '#FFF0F3') : (isDark ? '#1C1518' : '#FAFAFA'),
                      color: targetAudience === 'user' ? '#D3455B' : (isDark ? '#F7EFF2' : '#4E363E'),
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    👤 Específico
                  </button>
                </div>

                {targetAudience === 'user' && (
                  <div style={{ marginTop: '10px' }}>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 14px',
                        borderRadius: '14px',
                        backgroundColor: isDark ? '#221A1E' : '#FFFFFF',
                        border: isDark ? '1px solid #33272C' : '1px solid #E9E2E4',
                        color: isDark ? '#F7EFF2' : '#301D23',
                        fontSize: '12.5px',
                        outline: 'none'
                      }}
                    >
                      <option value="">Selecciona el atleta destinatario...</option>
                      {data.profiles.map((p) => (
                        <option key={p.id || p.user_id} value={p.user_id || p.id}>
                          {p.name || 'Sin nombre'} — {p.email} {p.is_pwa_installed ? '📱' : '🌐'}
                        </option>
                      ))}
                    </select>

                    {selectedUserId && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          backgroundColor: isDark ? 'rgba(211,69,91,0.15)' : '#FFF0F3',
                          border: '1px solid rgba(211,69,91,0.3)',
                          color: isDark ? '#F7EFF2' : '#841B2D',
                          fontSize: '11.5px',
                          lineHeight: 1.4
                        }}
                      >
                        ⚠️ <strong>Aviso Importante:</strong> Esta notificación se enviará <strong>exclusivamente</strong> a la cuenta seleccionada (<strong>{data.profiles.find(p => (p.user_id || p.id) === selectedUserId)?.email}</strong>). Si estás probando en tu celular y tienes otra cuenta abierta, no le llegará a tu celular. Para que llegue a tu teléfono y a todos los dispositivos, selecciona <strong>"🌍 Todos"</strong>.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Category Picker */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: isDark ? '#F7EFF2' : '#301D23', display: 'block', marginBottom: '8px' }}>
                  Categoría e Ícono:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'workout', label: 'Entrenamiento', icon: '🔥' },
                    { id: 'diet', label: 'Dieta', icon: '🥗' },
                    { id: 'reminder', label: 'Recordatorio', icon: '⏰' },
                    { id: 'info', label: 'General', icon: '📢' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNotifType(cat.id)}
                      style={{
                        padding: '10px 6px',
                        borderRadius: '14px',
                        border: notifType === cat.id ? '1.5px solid #D3455B' : (isDark ? '1px solid #2D2226' : '1px solid #E9E2E4'),
                        backgroundColor: notifType === cat.id ? (isDark ? 'rgba(211,69,91,0.15)' : '#FFF0F3') : (isDark ? '#1C1518' : '#FAFAFA'),
                        color: notifType === cat.id ? '#D3455B' : (isDark ? '#B8A2AB' : '#84626D'),
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: isDark ? '#F7EFF2' : '#301D23', display: 'block', marginBottom: '6px' }}>
                  Título de la Notificación:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: ¡Tu entrenamiento de hoy te está esperando! 🔥"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 16px',
                    borderRadius: '14px',
                    backgroundColor: isDark ? '#221A1E' : '#FFFFFF',
                    border: isDark ? '1px solid #33272C' : '1px solid #E9E2E4',
                    color: isDark ? '#F7EFF2' : '#301D23',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Message Content */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: isDark ? '#F7EFF2' : '#301D23' }}>
                    Mensaje:
                  </label>
                  <span style={{ fontSize: '11px', color: isDark ? '#B8A2AB' : '#84626D' }}>
                    {notifMessage.length}/180 caracteres
                  </span>
                </div>
                <textarea
                  required
                  rows={3}
                  maxLength={180}
                  placeholder="Escribe el mensaje o aviso que aparecerá en la pantalla del dispositivo..."
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    backgroundColor: isDark ? '#221A1E' : '#FFFFFF',
                    border: isDark ? '1px solid #33272C' : '1px solid #E9E2E4',
                    color: isDark ? '#F7EFF2' : '#301D23',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Action Link */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: isDark ? '#F7EFF2' : '#301D23', display: 'block', marginBottom: '6px' }}>
                  Al hacer clic, abrir en la app:
                </label>
                <select
                  value={notifAction}
                  onChange={(e) => setNotifAction(e.target.value)}
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 16px',
                    borderRadius: '14px',
                    backgroundColor: isDark ? '#221A1E' : '#FFFFFF',
                    border: isDark ? '1px solid #33272C' : '1px solid #E9E2E4',
                    color: isDark ? '#F7EFF2' : '#301D23',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="/#/treinos">Categoría Entrenamientos (/#/treinos)</option>
                  <option value="/#/dieta">Plan de Dieta (/#/dieta)</option>
                  <option value="/#/atividade-extra">Actividades Extra (/#/atividade-extra)</option>
                  <option value="/#/">Página de Inicio (/#/)</option>
                  <option value="/#/perfil">Perfil del Usuario (/#/perfil)</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSending || !notifTitle.trim() || !notifMessage.trim()}
                style={{
                  width: '100%',
                  height: '50px',
                  borderRadius: '16px',
                  backgroundColor: '#D3455B',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: isSending ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 20px -2px rgba(211, 69, 91, 0.4)',
                  opacity: isSending || !notifTitle.trim() || !notifMessage.trim() ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
              >
                <Send style={{ width: '18px', height: '18px' }} />
                <span>{isSending ? 'Enviando Mensajes...' : 'Enviar Notificación Ahora'}</span>
              </button>
            </form>
          </div>

          {/* Live Mobile Notification Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                backgroundColor: isDark ? '#181215' : '#FFFFFF',
                borderRadius: '26px',
                padding: '24px',
                border: isDark ? '1px solid #281E23' : '1px solid #EDE4E7',
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 4px 20px rgba(61,41,48,0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Eye style={{ width: '16px', height: '16px', color: '#D3455B' }} />
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: isDark ? '#F7EFF2' : '#301D23' }}>
                  Vista Previa en Smartphone
                </h4>
              </div>

              {/* Smartphone Lockscreen Simulation Box */}
              <div
                style={{
                  backgroundColor: '#1C1B1F',
                  borderRadius: '24px',
                  padding: '20px 16px',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08), 0 10px 30px rgba(0,0,0,0.5)',
                  position: 'relative'
                }}
              >
                <div style={{ textAlign: 'center', color: '#FFFFFF', marginBottom: '16px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 300, letterSpacing: '-0.03em' }}>
                    09:41
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                    Hoy
                  </div>
                </div>

                {/* Simulated Notification Bubble */}
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.94)',
                    borderRadius: '18px',
                    padding: '14px 16px',
                    color: '#1C1B1F',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          backgroundColor: '#D3455B',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px'
                        }}
                      >
                        {getCategoryIcon(notifType)}
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#301D23', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        Calistenia Asiática
                      </span>
                    </div>
                    <span style={{ fontSize: '10px', color: '#84626D' }}>ahora</span>
                  </div>

                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1C1B1F', marginBottom: '3px' }}>
                    {notifTitle.trim() || 'El título de la notificación aparecerá aquí...'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#4A3B40', lineHeight: 1.45 }}>
                    {notifMessage.trim() || 'El mensaje personalizado que escribas aparecerá en el smartphone del usuario de esta manera.'}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '11.5px', color: isDark ? '#B8A2AB' : '#84626D', margin: '14px 0 0 0', lineHeight: 1.45, textAlign: 'center' }}>
                💡 Las notificaciones llegan directamente incluso si el usuario no tiene la página abierta (vía PWA & Service Worker).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HISTÓRICO DE ENVIOS */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="animate-fade-in">
          {data.notifications.length === 0 ? (
            <div
              style={{
                padding: '48px 20px',
                textAlign: 'center',
                backgroundColor: isDark ? '#181215' : '#FFFFFF',
                borderRadius: '24px',
                border: isDark ? '1px solid #2D2226' : '1px solid #E9E2E4',
                color: isDark ? '#B8A2AB' : '#84626D'
              }}
            >
              <Clock style={{ width: '36px', height: '36px', margin: '0 auto 12px auto', opacity: 0.5 }} />
              <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Ninguna notificación enviada aún.</p>
            </div>
          ) : (
            data.notifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  backgroundColor: isDark ? '#181215' : '#FFFFFF',
                  borderRadius: '20px',
                  padding: '16px 20px',
                  border: isDark ? '1px solid #281E23' : '1px solid #EDE4E7',
                  boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(61,41,48,0.04)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px'
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(211, 69, 91, 0.1)',
                    color: '#D3455B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  {getCategoryIcon(notif.type)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: isDark ? '#F7EFF2' : '#301D23' }}>
                      {notif.title}
                    </h4>
                    <span style={{ fontSize: '11px', color: isDark ? '#B8A2AB' : '#84626D', whiteSpace: 'nowrap' }}>
                      {new Date(notif.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <p style={{ fontSize: '12.5px', color: isDark ? '#B8A2AB' : '#66535A', lineHeight: 1.5, margin: '0 0 10px 0' }}>
                    {notif.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: isDark ? '#241B20' : '#F2ECEE',
                        color: isDark ? '#F7EFF2' : '#72555F'
                      }}
                    >
                      {notif.user_id ? '👤 Atleta Específico' : '🌍 Todos los Atletas'}
                    </span>
                    <span style={{ fontSize: '11px', color: isDark ? '#B8A2AB' : '#84626D' }}>
                      Enviado por: <strong>{notif.sent_by || 'idealconsumo@gmail.com'}</strong>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: DEEPSEEK AI CONFIGURATION */}
      {activeTab === 'ai' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
          <div
            style={{
              backgroundColor: isDark ? '#181215' : '#FFFFFF',
              borderRadius: '24px',
              padding: '24px',
              border: isDark ? '1px solid #281E23' : '1px solid #EFE8EB',
              boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(61,41,48,0.04)'
            }}
          >
            {/* Section Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(211, 69, 91, 0.12)',
                      color: '#D3455B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Sparkles style={{ width: '20px', height: '20px' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: isDark ? '#F7EFF2' : '#301D23' }}>
                      Inteligencia Artificial DeepSeek
                    </h3>
                    <p style={{ fontSize: '12.5px', color: isDark ? '#B8A2AB' : '#84626D', margin: '2px 0 0 0' }}>
                      Modelo oficial para soporte dinámico, dudas y nutrición en tiempo real
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: deepseekKeyInput.trim() ? 'rgba(13, 168, 106, 0.12)' : 'rgba(234, 179, 8, 0.12)',
                  color: deepseekKeyInput.trim() ? '#0DA86A' : '#EAB308'
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '9999px',
                    backgroundColor: deepseekKeyInput.trim() ? '#0DA86A' : '#EAB308',
                    display: 'inline-block'
                  }}
                />
                {deepseekKeyInput.trim() ? 'DeepSeek Configurada' : 'Clave Pendiente'}
              </div>
            </div>

            {/* Status Alert if tested / saved */}
            {deepseekStatus.tested && (
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                  fontWeight: 500,
                  backgroundColor: deepseekStatus.success
                    ? (isDark ? 'rgba(13, 168, 106, 0.15)' : '#EDF7F0')
                    : (isDark ? 'rgba(222, 59, 64, 0.15)' : '#FDE8E9'),
                  color: deepseekStatus.success ? '#0DA86A' : '#DE3B40',
                  border: deepseekStatus.success
                    ? (isDark ? '1px solid #1B452D' : '1px solid #B5E8C8')
                    : (isDark ? '1px solid #4D1E22' : '1px solid #F5B5B8')
                }}
              >
                {deepseekStatus.success ? (
                  <CheckCircle2 style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                ) : (
                  <AlertTriangle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                )}
                <span>{deepseekStatus.message}</span>
              </div>
            )}

            {/* Input Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    marginBottom: '8px',
                    color: isDark ? '#F7EFF2' : '#301D23'
                  }}
                >
                  Clave de API DeepSeek (API Key)
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Key
                    style={{
                      position: 'absolute',
                      left: '16px',
                      width: '18px',
                      height: '18px',
                      color: isDark ? '#B8A2AB' : '#84626D',
                      pointerEvents: 'none'
                    }}
                  />
                  <input
                    type={showKeyText ? 'text' : 'password'}
                    placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={deepseekKeyInput}
                    onChange={(e) => setDeepseekKeyInput(e.target.value)}
                    style={{
                      width: '100%',
                      height: '50px',
                      borderRadius: '16px',
                      paddingLeft: '46px',
                      paddingRight: '48px',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      backgroundColor: isDark ? '#20181C' : '#FAFAFA',
                      border: isDark ? '1.5px solid #33242B' : '1.5px solid #EBE3E5',
                      color: isDark ? '#F7EFF2' : '#301D23',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyText(!showKeyText)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: isDark ? '#B8A2AB' : '#84626D',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px'
                    }}
                    title={showKeyText ? 'Ocultar' : 'Visualizar'}
                  >
                    {showKeyText ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                  </button>
                </div>
                <span style={{ fontSize: '11.5px', color: isDark ? '#B8A2AB' : '#84626D', marginTop: '6px', display: 'block' }}>
                  Tu clave se almacena de forma segura en la tabla <code>app_settings</code> de Supabase y encriptada en tránsito.
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={handleTestDeepSeekKey}
                  disabled={isTestingKey}
                  style={{
                    height: '46px',
                    padding: '0 20px',
                    borderRadius: '14px',
                    backgroundColor: isDark ? '#221A1E' : '#FFFFFF',
                    border: isDark ? '1.5px solid #3A2A32' : '1.5px solid #D8CED2',
                    color: isDark ? '#F7EFF2' : '#301D23',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: isTestingKey ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                  }}
                >
                  <RefreshCw style={{ width: '16px', height: '16px' }} className={isTestingKey ? 'animate-spin text-[#D3455B]' : ''} />
                  <span>{isTestingKey ? 'Probando Conexión...' : 'Probar Conexión'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveDeepSeekKey}
                  disabled={isSavingKey}
                  style={{
                    height: '46px',
                    padding: '0 24px',
                    borderRadius: '14px',
                    backgroundColor: '#D3455B',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: isSavingKey ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(211, 69, 91, 0.35)'
                  }}
                >
                  <Check style={{ width: '16px', height: '16px' }} />
                  <span>{isSavingKey ? 'Guardando...' : 'Guardar Clave'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tutorial / Help Card */}
          <div
            style={{
              backgroundColor: isDark ? '#141012' : '#F7F2F4',
              borderRadius: '20px',
              padding: '20px',
              border: isDark ? '1px solid #231A1E' : '1px solid #EAE1E4'
            }}
          >
            <h4 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 10px 0', color: '#D3455B', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ExternalLink style={{ width: '16px', height: '16px' }} />
              Cómo obtener tu clave de API DeepSeek:
            </h4>
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: isDark ? '#B8A2AB' : '#5C4850', lineHeight: 1.7 }}>
              <li>
                Accede al portal oficial: <a href="https://platform.deepseek.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#D3455B', fontWeight: 700, textDecoration: 'underline' }}>platform.deepseek.com</a>
              </li>
              <li>Inicia sesión o crea tu cuenta en DeepSeek.</li>
              <li>Ve al menú <strong>API Keys</strong> y haz clic en <strong>Create new API Key</strong>.</li>
              <li>Copia la clave generada (empieza con <code>sk-</code>), pégala en el campo de arriba y haz clic en <strong>Guardar Clave</strong>.</li>
            </ol>
            <p style={{ fontSize: '12px', color: isDark ? '#84626D' : '#84626D', margin: '12px 0 0 0', fontStyle: 'italic' }}>
              💡 Una vez guardada, el modelo <strong>deepseek-chat</strong> responderá a todas las preguntas de las atletas instantáneamente en Soporte 24h, exactamente como en la aplicación original.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
