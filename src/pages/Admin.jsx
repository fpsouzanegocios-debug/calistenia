import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Users,
  Smartphone,
  Send,
  Bell,
  Zap,
  CheckCircle,
  Clock,
  Flame,
  Search,
  RefreshCw,
  Filter,
  ChevronRight,
  ChevronLeft,
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

// Modelos prontos em Espanhol com alta taxa de conversão e engajamento para os leads / alunos
export const SPANISH_NOTIFICATION_TEMPLATES = [
  {
    id: 'streak',
    name: '🔥 Salvar Ofensiva (Racha)',
    type: 'workout',
    action: '/#/treinos',
    title: '¡Tu racha está en peligro! 🔥',
    message: 'No te vayas a dormir sin tu victoria. ¡Dedica 15 minutos a tu cuerpo antes de medianoche!'
  },
  {
    id: 'morning',
    name: '🌅 Treino Matinal',
    type: 'workout',
    action: '/#/treinos',
    title: '¡Despierta tu cuerpo y mente! 🌿',
    message: 'Buenos días. Empieza tu día con energía renovada completando tu sesión de calistenia.'
  },
  {
    id: 'afternoon',
    name: '⚡ Pausa Ativa da Tarde',
    type: 'workout',
    action: '/#/treinos',
    title: '¿Cansancio de media tarde? ⚡',
    message: 'Una breve pausa de 15 minutos oxigenará tu mente y quemará calorías. ¡El tatami te espera!'
  },
  {
    id: 'diet',
    name: '🥗 Dieta & Nutrição Asiática',
    type: 'diet',
    action: '/#/dieta',
    title: 'Consejo del Sensei: Nutrición Asiática 🥗',
    message: 'Recuerda hidratarte bien hoy y revisar las recetas antiinflamatorias en tu plan de nutrición.'
  },
  {
    id: 'mindset',
    name: '🥋 Motivação Ninja',
    type: 'reminder',
    action: '/#/treinos',
    title: 'La constancia supera al talento 🥋',
    message: 'Cada repetición cuenta en tu transformación. Entra a la aplicación y da tu máximo hoy.'
  },
  {
    id: 'congrats',
    name: '🏆 Parabéns & Conquista',
    type: 'reminder',
    action: '/#/treinos',
    title: '¡Orgullo de tu progreso! 🏆',
    message: 'Tu dedicación está dando frutos. Sigue firme con tu disciplina y alcanza tu mejor versión.'
  }
];

export function Admin({ onNavigate }) {
  const { getAllUsersForAdmin, sendCustomNotification, state, user, theme } = useApp();
  const isDark = theme === 'dark';

  const userEmail = (user?.email || state.userProfile?.email || '').toLowerCase().trim();
  const isMasterAdmin = userEmail === 'idealconsumo@gmail.com' || state.userProfile?.is_admin === true;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ profiles: [], progress: [], notifications: [] });
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'send' | 'history' | 'ai' | 'automation'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPwa, setFilterPwa] = useState('all'); // 'all' | 'pwa' | 'web'
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);

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
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState('');
  const [sendErrorMessage, setSendErrorMessage] = useState('');

  // Duolingo Automatic Notifications Engine State
  const [autoTriggerMode, setAutoTriggerMode] = useState('streak_saver');
  const [triggeringMode, setTriggeringMode] = useState(null); // null | 'morning' | 'afternoon' | 'streak_saver'
  const [autoTestTarget, setAutoTestTarget] = useState('me'); // 'me' | 'all'
  const [autoTriggerResult, setAutoTriggerResult] = useState(null);

  const handleTriggerAutomation = async (mode) => {
    setTriggeringMode(mode);
    setAutoTriggerResult(null);
    try {
      const currentUid = user?.id || state.userProfile?.user_id || state.userProfile?.id;
      const targetUserId = autoTestTarget === 'me' ? currentUid : null;

      const res = await supabase.functions.invoke('auto-notifications', {
        body: {
          trigger: mode,
          test_user_id: targetUserId,
          force: true // Garante que o teste não seja barrado pelas regras de anti-spam
        }
      });
      setAutoTriggerResult(res.data || res.error || { success: true, trigger: mode });
      loadAdminData();
    } catch (e) {
      setAutoTriggerResult({ error: e.message || 'Erro ao executar o motor de notificações automáticas.' });
    } finally {
      setTriggeringMode(null);
    }
  };

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
        message: 'Chave salva com sucesso no banco de dados e sincronizada com o Suporte!'
      });
    } else {
      setDeepseekStatus({
        tested: true,
        success: false,
        message: res.error || 'Erro ao salvar chave da API.'
      });
    }
  };

  const handleTestDeepSeekKey = async () => {
    if (!deepseekKeyInput.trim()) {
      setDeepseekStatus({
        tested: true,
        success: false,
        message: 'Por favor, digite ou cole uma chave antes de testar.'
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
        message: 'Conexão com a API DeepSeek realizada com sucesso! O modelo deepseek-chat está respondendo perfeitamente.'
      });
    } else {
      setDeepseekStatus({
        tested: true,
        success: false,
        message: res.error || 'Falha ao conectar com a API DeepSeek.'
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
            Acesso Restrito
          </h2>
          <p style={{ fontSize: '13px', color: isDark ? '#B8A2AB' : '#84626D', lineHeight: 1.5, margin: '0 0 24px 0' }}>
            Esta área é restrita exclusivamente ao Administrador Master da Calistenia Asiática (<strong>idealconsumo@gmail.com</strong>).
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
            Voltar ao Início
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

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    setIsSending(true);
    setSendSuccessMessage('');
    setSendErrorMessage('');

    try {
      if (targetAudience === 'user') {
        if (!selectedUserId) {
          throw new Error('Por favor, selecione um aluno destinatário.');
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
          throw new Error(res?.error?.message || 'Erro ao enviar notificação ao aluno.');
        }
        setSendSuccessMessage(`Notificação enviada exclusivamente para ${dest?.name || 'aluno'} (${dest?.email})!`);
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
          throw new Error(res?.error?.message || 'Erro ao enviar notificação broadcast.');
        }
        setSendSuccessMessage('Notificação enviada com sucesso para TODOS os dispositivos e alunos!');
      }
      setNotifTitle('');
      setNotifMessage('');
      setSelectedTemplateId('');

      // Refresh admin data
      loadAdminData();
    } catch (err) {
      console.error('Erro ao enviar:', err);
      setSendErrorMessage(err.message || 'Erro ao processar o envio da notificação.');
    } finally {
      setIsSending(false);
    }
  };

  const openComposerForUser = (userProfile) => {
    setSelectedUserId(userProfile.user_id || userProfile.id);
    setTargetAudience('user');
    const firstName = userProfile.name?.trim().split(' ')[0] || 'Atleta';
    setNotifTitle(`¡Hola, ${firstName}! 🔥`);
    setNotifMessage(`¡Tu entrenamiento de hoy te está esperando! Entra y mantén tu racha activa.`);
    setNotifType('workout');
    setNotifAction('/#/treinos');
    setSelectedTemplateId('');
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
            aria-label="Voltar"
          >
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Painel Administrativo
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
          title="Recarregar dados"
        >
          <RefreshCw style={{ width: '15px', height: '15px' }} className={loading ? 'animate-spin text-[#D3455B]' : ''} />
          <span>Atualizar</span>
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
              Alunos
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(211, 69, 91, 0.1)', color: '#D3455B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users style={{ width: '16px', height: '16px' }} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: isDark ? '#F7EFF2' : '#301D23', lineHeight: 1.1 }}>
            {totalUsers}
          </div>
          <span style={{ fontSize: '11px', color: isDark ? '#B8A2AB' : '#84626D', marginTop: '4px', display: 'block' }}>
            Cadastrados na plataforma
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
            Instalados na tela inicial
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
              Treinos
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(222, 59, 64, 0.1)', color: '#DE3B40', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame style={{ width: '16px', height: '16px' }} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: isDark ? '#F7EFF2' : '#301D23', lineHeight: 1.1 }}>
            {totalWorkoutsCompleted}
          </div>
          <span style={{ fontSize: '11px', color: isDark ? '#B8A2AB' : '#84626D', marginTop: '4px', display: 'block' }}>
            Concluídos com sucesso
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
              Notificações
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(2, 132, 199, 0.1)', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell style={{ width: '16px', height: '16px' }} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: isDark ? '#F7EFF2' : '#301D23', lineHeight: 1.1 }}>
            {totalNotificationsSent}
          </div>
          <span style={{ fontSize: '11px', color: isDark ? '#B8A2AB' : '#84626D', marginTop: '4px', display: 'block' }}>
            Enviadas no total
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
          <span>Alunos ({totalUsers})</span>
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
          <span>Histórico</span>
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

        <button
          onClick={() => setActiveTab('automation')}
          style={{
            flex: 1,
            height: '42px',
            borderRadius: '14px',
            border: 'none',
            backgroundColor: activeTab === 'automation' ? (isDark ? '#221A1E' : '#FFFFFF') : 'transparent',
            color: activeTab === 'automation' ? '#FF5722' : (isDark ? '#B8A2AB' : '#84626D'),
            fontWeight: activeTab === 'automation' ? 700 : 500,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: activeTab === 'automation' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Flame style={{ width: '16px', height: '16px', color: '#FF5722' }} />
          <span>Auto (Duolingo)</span>
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
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
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
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
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
                onClick={() => {
                  setFilterPwa('all');
                  setCurrentPage(1);
                }}
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
                onClick={() => {
                  setFilterPwa('pwa');
                  setCurrentPage(1);
                }}
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
                onClick={() => {
                  setFilterPwa('web');
                  setCurrentPage(1);
                }}
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
              <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Nenhum aluno encontrado com os filtros selecionados.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {paginatedUsers.map((u) => {
                const isPwa = Boolean(u.is_pwa_installed);
                const workoutsDone = userProgressMap[u.user_id] || 0;
                const workoutPercent = Math.round((workoutsDone / 21) * 100);
                const isThisAdmin = u.email === 'idealconsumo@gmail.com' || u.is_admin === true;

                return (
                  <div
                    key={u.id || u.user_id}
                    style={{
                      backgroundColor: isDark ? '#181215' : '#FFFFFF',
                      borderRadius: '16px',
                      padding: '10px 16px',
                      border: isThisAdmin
                        ? '1.5px solid #D3455B'
                        : isDark
                        ? '1px solid #251B20'
                        : '1px solid #EDE4E7',
                      boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 6px rgba(61,41,48,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      flexWrap: 'wrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Left: User Avatar + Name + Subtitle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px', flex: '1 1 220px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          minWidth: '38px',
                          borderRadius: '9999px',
                          backgroundColor: isThisAdmin ? '#D3455B' : '#72555F',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 700,
                          overflow: 'hidden',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                        }}
                      >
                        {u.photo_url ? (
                          <img src={u.photo_url} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          (u.name || 'U').charAt(0).toUpperCase()
                        )}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '13.5px',
                              fontWeight: 700,
                              color: isDark ? '#F7EFF2' : '#301D23',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {u.name || 'Aluno sem nome'}
                          </span>
                          {isThisAdmin && (
                            <span
                              style={{
                                fontSize: '9px',
                                fontWeight: 800,
                                backgroundColor: 'rgba(211, 69, 91, 0.14)',
                                color: '#D3455B',
                                padding: '1px 6px',
                                borderRadius: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em'
                              }}
                            >
                              Admin
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '12px',
                              color: isDark ? '#B8A2AB' : '#84626D',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '190px'
                            }}
                            title={u.email}
                          >
                            {u.email || 'Sem e-mail'}
                          </span>
                          {u.pwa_device_info && (
                            <span style={{ fontSize: '11px', color: isDark ? '#7D6A73' : '#A38B94' }}>
                              • {u.pwa_device_info}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Challenge Progress + Device Pill + Notification Action */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end', flex: '1 1 auto' }}>
                      {/* Challenge Progress */}
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: '85px', gap: '3px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', color: isDark ? '#B8A2AB' : '#84626D', fontWeight: 600 }}>Desafio</span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#D3455B' }}>{workoutsDone}/21d</span>
                        </div>
                        <div style={{ width: '85px', height: '5px', borderRadius: '9999px', backgroundColor: isDark ? '#33262C' : '#E9E2E4', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.min(100, workoutPercent)}%`,
                              height: '100%',
                              backgroundColor: '#D3455B',
                              borderRadius: '9999px'
                            }}
                          />
                        </div>
                      </div>

                      {/* Device Pill */}
                      {isPwa ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 9px',
                            borderRadius: '9999px',
                            backgroundColor: isDark ? 'rgba(13, 168, 106, 0.15)' : '#E6F7EF',
                            border: isDark ? '1px solid rgba(13, 168, 106, 0.3)' : '1px solid #BEE7D3',
                            color: '#0DA86A',
                            fontSize: '11px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <Smartphone style={{ width: '12px', height: '12px' }} />
                          <span>PWA Ativo</span>
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 9px',
                            borderRadius: '9999px',
                            backgroundColor: isDark ? '#221A1E' : '#F2ECED',
                            border: isDark ? '1px solid #2E2429' : '1px solid #E5DCDF',
                            color: isDark ? '#B8A2AB' : '#84626D',
                            fontSize: '11px',
                            fontWeight: 600,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <Laptop style={{ width: '12px', height: '12px' }} />
                          <span>Web</span>
                        </span>
                      )}

                      {/* Action Button */}
                      <button
                        onClick={() => openComposerForUser(u)}
                        title="Enviar notificação push exclusiva para este aluno"
                        style={{
                          height: '32px',
                          padding: '0 12px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(211, 69, 91, 0.1)',
                          color: '#D3455B',
                          border: '1px solid rgba(211, 69, 91, 0.2)',
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#D3455B';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(211, 69, 91, 0.1)';
                          e.currentTarget.style.color = '#D3455B';
                        }}
                      >
                        <Send style={{ width: '12px', height: '12px' }} />
                        <span>Notificar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls Bar */}
          {filteredUsers.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginTop: '16px',
                padding: '12px 16px',
                backgroundColor: isDark ? '#181215' : '#FFFFFF',
                borderRadius: '16px',
                border: isDark ? '1px solid #281E23' : '1px solid #EDE4E7',
                boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.15)' : '0 2px 6px rgba(61,41,48,0.02)'
              }}
            >
              {/* Left: Info Range */}
              <div style={{ fontSize: '12.5px', color: isDark ? '#B8A2AB' : '#84626D' }}>
                Mostrando <strong style={{ color: isDark ? '#F7EFF2' : '#301D23' }}>{startIndex + 1}–{Math.min(startIndex + usersPerPage, filteredUsers.length)}</strong> de <strong style={{ color: isDark ? '#F7EFF2' : '#301D23' }}>{filteredUsers.length}</strong> alunos
              </div>

              {/* Right: Items per page & Page navigation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: isDark ? '#B8A2AB' : '#84626D' }}>
                  <span>Por página:</span>
                  <select
                    value={usersPerPage}
                    onChange={(e) => {
                      setUsersPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{
                      backgroundColor: isDark ? '#231A1E' : '#F5EFF1',
                      color: isDark ? '#F7EFF2' : '#301D23',
                      border: isDark ? '1px solid #36282E' : '1px solid #DFD5D8',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {/* Previous Page Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={safeCurrentPage <= 1}
                      aria-label="Página anterior"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: isDark ? '1px solid #2B1F25' : '1px solid #E5DCDF',
                        backgroundColor: isDark ? '#20181C' : '#FAFAFA',
                        color: safeCurrentPage <= 1 ? (isDark ? '#4D3B43' : '#D1C4C8') : (isDark ? '#F7EFF2' : '#301D23'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: safeCurrentPage <= 1 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <ChevronLeft style={{ width: '15px', height: '15px' }} />
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                      .filter(pageNum => {
                        if (totalPages <= 7) return true;
                        if (pageNum === 1 || pageNum === totalPages) return true;
                        if (Math.abs(pageNum - safeCurrentPage) <= 1) return true;
                        return false;
                      })
                      .reduce((acc, pageNum, idx, arr) => {
                        if (idx > 0 && pageNum - arr[idx - 1] > 1) {
                          acc.push('ellipsis-' + pageNum);
                        }
                        acc.push(pageNum);
                        return acc;
                      }, [])
                      .map((item) => {
                        if (typeof item === 'string') {
                          return (
                            <span
                              key={item}
                              style={{
                                width: '20px',
                                textAlign: 'center',
                                fontSize: '12px',
                                color: isDark ? '#7D6A73' : '#A38B94'
                              }}
                            >
                              ...
                            </span>
                          );
                        }

                        const isCurrent = item === safeCurrentPage;
                        return (
                          <button
                            key={item}
                            onClick={() => setCurrentPage(item)}
                            style={{
                              minWidth: '32px',
                              height: '32px',
                              padding: '0 6px',
                              borderRadius: '8px',
                              border: isCurrent
                                ? 'none'
                                : isDark
                                ? '1px solid #2B1F25'
                                : '1px solid #E5DCDF',
                              backgroundColor: isCurrent
                                ? '#D3455B'
                                : isDark
                                ? '#20181C'
                                : '#FAFAFA',
                              color: isCurrent
                                ? '#FFFFFF'
                                : isDark
                                ? '#F7EFF2'
                                : '#301D23',
                              fontSize: '12px',
                              fontWeight: isCurrent ? 700 : 500,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              boxShadow: isCurrent ? '0 2px 6px rgba(211, 69, 91, 0.3)' : 'none'
                            }}
                          >
                            {item}
                          </button>
                        );
                      })}

                    {/* Next Page Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={safeCurrentPage >= totalPages}
                      aria-label="Próxima página"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: isDark ? '1px solid #2B1F25' : '1px solid #E5DCDF',
                        backgroundColor: isDark ? '#20181C' : '#FAFAFA',
                        color: safeCurrentPage >= totalPages ? (isDark ? '#4D3B43' : '#D1C4C8') : (isDark ? '#F7EFF2' : '#301D23'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: safeCurrentPage >= totalPages ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <ChevronRight style={{ width: '15px', height: '15px' }} />
                    </button>
                  </div>
                )}
              </div>
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
                  Disparador de Notificações
                </h3>
                <p style={{ fontSize: '12px', color: isDark ? '#B8A2AB' : '#84626D', margin: '2px 0 0 0' }}>
                  Dispare mensagens push na tela de bloqueio e no app dos alunos
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
              {/* Quick Templates Picker in Spanish */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: isDark ? '#F7EFF2' : '#301D23', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles style={{ width: '14px', height: '14px', color: '#D3455B' }} />
                    <span>Modelos Prontos em Espanhol (Clique para Usar):</span>
                  </label>
                  {selectedTemplateId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTemplateId('');
                        setNotifTitle('');
                        setNotifMessage('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isDark ? '#B8A2AB' : '#84626D',
                        fontSize: '11px',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Limpar modelo
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                  {SPANISH_NOTIFICATION_TEMPLATES.map((tpl) => {
                    const isSelected = selectedTemplateId === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => {
                          setSelectedTemplateId(tpl.id);
                          setNotifTitle(tpl.title);
                          setNotifMessage(tpl.message);
                          setNotifType(tpl.type);
                          if (tpl.action) setNotifAction(tpl.action);
                        }}
                        style={{
                          padding: '9px 10px',
                          borderRadius: '12px',
                          border: isSelected ? '1.5px solid #D3455B' : (isDark ? '1px solid #2D2226' : '1px solid #E9E2E4'),
                          backgroundColor: isSelected ? (isDark ? 'rgba(211,69,91,0.18)' : '#FFF0F3') : (isDark ? '#1C1518' : '#FAFAFA'),
                          color: isSelected ? '#D3455B' : (isDark ? '#F7EFF2' : '#4E363E'),
                          fontSize: '11.5px',
                          fontWeight: isSelected ? 700 : 600,
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {tpl.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Audience Selector */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: isDark ? '#F7EFF2' : '#301D23', display: 'block', marginBottom: '8px' }}>
                  Público-Alvo:
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
                      <option value="">Selecione o atleta destinatário...</option>
                      {data.profiles.map((p) => (
                        <option key={p.id || p.user_id} value={p.user_id || p.id}>
                          {p.name || 'Sem nome'} — {p.email} {p.is_pwa_installed ? '📱' : '🌐'}
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
                        ⚠️ <strong>Aviso Importante:</strong> Esta notificação será enviada <strong>exclusivamente</strong> para a conta selecionada (<strong>{data.profiles.find(p => (p.user_id || p.id) === selectedUserId)?.email}</strong>). Se você estiver testando no seu celular com outra conta aberta, ela não chegará nele. Para que chegue no seu celular e em todos os aparelhos, selecione <strong>"🌍 Todos"</strong>.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Category Picker */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: isDark ? '#F7EFF2' : '#301D23', display: 'block', marginBottom: '8px' }}>
                  Categoria & Ícone:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'workout', label: 'Treino', icon: '🔥' },
                    { id: 'diet', label: 'Dieta', icon: '🥗' },
                    { id: 'reminder', label: 'Lembrete', icon: '⏰' },
                    { id: 'info', label: 'Geral', icon: '📢' }
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
                  Título da Notificação (em Espanhol para os alunos):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: ¡Tu entrenamiento de hoy te está esperando! 🔥"
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
                    Mensagem Push (em Espanhol para os alunos):
                  </label>
                  <span style={{ fontSize: '11px', color: isDark ? '#B8A2AB' : '#84626D' }}>
                    {notifMessage.length}/180 caracteres
                  </span>
                </div>
                <textarea
                  required
                  rows={3}
                  maxLength={180}
                  placeholder="Escreva a mensagem em espanhol que aparecerá na tela do celular do aluno..."
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
                  Ao clicar, abrir no app:
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
                  <option value="/#/treinos">Página de Treinos (/#/treinos)</option>
                  <option value="/#/dieta">Plano de Dieta (/#/dieta)</option>
                  <option value="/#/atividade-extra">Atividades Extras (/#/atividade-extra)</option>
                  <option value="/#/">Página Inicial (/#/)</option>
                  <option value="/#/perfil">Perfil do Aluno (/#/perfil)</option>
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
                <span>{isSending ? 'Enviando Mensagens...' : 'Enviar Notificação (em Espanhol) aos Alunos'}</span>
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
                  Prévia no Smartphone do Aluno (Tela de Bloqueio)
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
                💡 As notificações chegam diretamente no aparelho do aluno mesmo com o aplicativo fechado (via PWA & Service Worker).
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
              <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Nenhuma notificação enviada ainda.</p>
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
                      {new Date(notif.created_at).toLocaleDateString('pt-BR', {
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
                      {notif.user_id ? '👤 Aluno Específico' : '🌍 Todos os Alunos'}
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
                      Inteligência Artificial DeepSeek
                    </h3>
                    <p style={{ fontSize: '12.5px', color: isDark ? '#B8A2AB' : '#84626D', margin: '2px 0 0 0' }}>
                      Modelo oficial para suporte dinâmico, dúvidas e nutrição em tempo real
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
                {deepseekKeyInput.trim() ? 'DeepSeek Configurada' : 'Chave Pendente'}
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
                  Chave de API DeepSeek (API Key)
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
                  Sua chave é armazenada com segurança na tabela <code>app_settings</code> do Supabase e criptografada em trânsito.
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
                  <span>{isTestingKey ? 'Testando Conexão...' : 'Testar Conexão'}</span>
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
                  <span>{isSavingKey ? 'Salvando...' : 'Salvar Chave'}</span>
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
              Como obter sua chave de API DeepSeek:
            </h4>
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: isDark ? '#B8A2AB' : '#5C4850', lineHeight: 1.7 }}>
              <li>
                Acesse o portal oficial: <a href="https://platform.deepseek.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#D3455B', fontWeight: 700, textDecoration: 'underline' }}>platform.deepseek.com</a>
              </li>
              <li>Faça login ou crie sua conta na DeepSeek.</li>
              <li>Acesse o menu <strong>API Keys</strong> e clique em <strong>Create new API Key</strong>.</li>
              <li>Copie a chave gerada (começa com <code>sk-</code>), cole no campo acima e clique em <strong>Salvar Chave</strong>.</li>
            </ol>
            <p style={{ fontSize: '12px', color: isDark ? '#84626D' : '#84626D', margin: '12px 0 0 0', fontStyle: 'italic' }}>
              💡 Depois de salva, o modelo <strong>deepseek-chat</strong> responderá a todas as dúvidas das alunas instantaneamente no Suporte 24h, exatamente como no aplicativo original.
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: DUOLINGO-STYLE AUTOMATED NOTIFICATIONS */}
      {activeTab === 'automation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }} className="animate-fade-in">
          {/* Header Card */}
          <div
            style={{
              backgroundColor: isDark ? '#181215' : '#FFFFFF',
              borderRadius: '26px',
              padding: '24px',
              border: isDark ? '1px solid #281E23' : '1px solid #EDE4E7',
              boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 4px 20px rgba(61,41,48,0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(255, 87, 34, 0.15)',
                    color: '#FF5722',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Flame style={{ width: '24px', height: '24px' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: isDark ? '#F7EFF2' : '#301D23' }}>
                    Motor de Notificações Automáticas (Estilo Duolingo)
                  </h3>
                  <p style={{ fontSize: '12.5px', color: isDark ? '#B8A2AB' : '#84626D', margin: '2px 0 0 0' }}>
                    Gatilhos comportamentais na nuvem para manter o engajamento e a ofensiva do Desafio 21 Dias.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  backgroundColor: isDark ? 'rgba(13, 168, 106, 0.15)' : '#E6F7EF',
                  border: isDark ? '1px solid rgba(13, 168, 106, 0.3)' : '1px solid #BEE7D3',
                  color: '#0DA86A',
                  fontSize: '12px',
                  fontWeight: 700
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#0DA86A' }} />
                <span>3 Rotinas Automáticas (Cron Jobs) Ativas no Supabase Cloud</span>
              </div>
            </div>

            {/* Smart Rules Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
              <div style={{ padding: '6px 12px', borderRadius: '12px', backgroundColor: isDark ? '#221A1E' : '#F6EFF1', fontSize: '11.5px', color: isDark ? '#F7EFF2' : '#4E363E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🛡️</span> <strong>Filtro Anti-Incômodo:</strong> Pula quem já treinou hoje
              </div>
              <div style={{ padding: '6px 12px', borderRadius: '12px', backgroundColor: isDark ? '#221A1E' : '#F6EFF1', fontSize: '11.5px', color: isDark ? '#F7EFF2' : '#4E363E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🎯</span> <strong>Dia Dinâmico:</strong> Calcula o Dia (1-21) exato de cada aluno
              </div>
              <div style={{ padding: '6px 12px', borderRadius: '12px', backgroundColor: isDark ? '#221A1E' : '#F6EFF1', fontSize: '11.5px', color: isDark ? '#F7EFF2' : '#4E363E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🛑</span> <strong>Anti-Spam:</strong> Máximo 1 notificação a cada 4 horas
              </div>
              <div style={{ padding: '6px 12px', borderRadius: '12px', backgroundColor: isDark ? '#221A1E' : '#F6EFF1', fontSize: '11.5px', color: isDark ? '#F7EFF2' : '#4E363E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🥋</span> <strong>Resgate:</strong> Alerta de reengajamento para ausentes há +24h
              </div>
            </div>
          </div>

          {/* Test Target Selector (Choose Me vs All) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              padding: '16px 20px',
              borderRadius: '20px',
              backgroundColor: isDark ? '#181215' : '#FFFFFF',
              border: isDark ? '1px solid #281E23' : '1px solid #EDE4E7',
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(61,41,48,0.04)'
            }}
          >
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#F7EFF2' : '#301D23', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🎯</span> Destinatário do Teste de Disparo:
              </span>
              <span style={{ fontSize: '11.5px', color: isDark ? '#B8A2AB' : '#84626D', marginTop: '2px', display: 'block' }}>
                Selecione para onde enviar o teste ao clicar nos botões abaixo
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setAutoTestTarget('me')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '12px',
                  border: autoTestTarget === 'me' ? '1.5px solid #D3455B' : (isDark ? '1px solid #2D2226' : '1px solid #E9E2E4'),
                  backgroundColor: autoTestTarget === 'me' ? (isDark ? 'rgba(211,69,91,0.18)' : '#FFF0F3') : 'transparent',
                  color: autoTestTarget === 'me' ? '#D3455B' : (isDark ? '#F7EFF2' : '#4E363E'),
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                👤 Apenas Minha Conta ({userEmail || 'Admin'})
              </button>

              <button
                type="button"
                onClick={() => setAutoTestTarget('all')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '12px',
                  border: autoTestTarget === 'all' ? '1.5px solid #D3455B' : (isDark ? '1px solid #2D2226' : '1px solid #E9E2E4'),
                  backgroundColor: autoTestTarget === 'all' ? (isDark ? 'rgba(211,69,91,0.18)' : '#FFF0F3') : 'transparent',
                  color: autoTestTarget === 'all' ? '#D3455B' : (isDark ? '#F7EFF2' : '#4E363E'),
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                🌍 Todos os Alunos ({totalUsers})
              </button>
            </div>
          </div>

          {/* Schedule Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Card 1: Manhã */}
            <div
              style={{
                backgroundColor: isDark ? '#181215' : '#FFFFFF',
                borderRadius: '22px',
                padding: '20px',
                border: isDark ? '1px solid #281E23' : '1px solid #EDE4E7',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px' }}>🌅</span>
                  <span style={{ padding: '4px 10px', borderRadius: '9999px', backgroundColor: isDark ? '#251D21' : '#F5ECEE', fontSize: '11px', fontWeight: 700, color: '#D3455B' }}>
                    08:30 (Manhã)
                  </span>
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px 0', color: isDark ? '#F7EFF2' : '#301D23' }}>
                  Despertar & Postura
                </h4>
                <p style={{ fontSize: '12px', color: isDark ? '#B8A2AB' : '#84626D', lineHeight: 1.5, margin: 0 }}>
                  Ativa o metabolismo matinal e convida o aluno a iniciar o dia com 15 min de calistenia.
                </p>
                <div style={{ marginTop: '14px', padding: '10px 12px', borderRadius: '12px', backgroundColor: isDark ? '#20181C' : '#FAFAFA', border: isDark ? '1px solid #2A1F24' : '1px solid #F0E6E9', fontSize: '11.5px', color: isDark ? '#D9C5CD' : '#5C4850', fontStyle: 'italic' }}>
                  "¡Despierta tu cuerpo! 🌿 15 minutos de calistenia hoy activarán tu metabolismo todo el día."
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleTriggerAutomation('morning')}
                disabled={triggeringMode !== null}
                style={{
                  marginTop: '16px',
                  width: '100%',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: isDark ? '#251D21' : '#F7F0F2',
                  border: '1px solid rgba(211,69,91,0.2)',
                  color: '#D3455B',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: triggeringMode !== null ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  opacity: triggeringMode !== null && triggeringMode !== 'morning' ? 0.5 : 1
                }}
              >
                <Zap style={{ width: '14px', height: '14px' }} className={triggeringMode === 'morning' ? 'animate-spin' : ''} />
                <span>{triggeringMode === 'morning' ? 'Disparando Manhã...' : 'Testar Disparo da Manhã'}</span>
              </button>
            </div>

            {/* Card 2: Tarde */}
            <div
              style={{
                backgroundColor: isDark ? '#181215' : '#FFFFFF',
                borderRadius: '22px',
                padding: '20px',
                border: isDark ? '1px solid #281E23' : '1px solid #EDE4E7',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px' }}>⚡</span>
                  <span style={{ padding: '4px 10px', borderRadius: '9999px', backgroundColor: isDark ? '#251D21' : '#F5ECEE', fontSize: '11px', fontWeight: 700, color: '#D3455B' }}>
                    15:00 (Tarde)
                  </span>
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px 0', color: isDark ? '#F7EFF2' : '#301D23' }}>
                  Recarga da Tarde
                </h4>
                <p style={{ fontSize: '12px', color: isDark ? '#B8A2AB' : '#84626D', lineHeight: 1.5, margin: 0 }}>
                  Resgata o aluno do cansaço pós-almoço e lembra que a aula continua disponível.
                </p>
                <div style={{ marginTop: '14px', padding: '10px 12px', borderRadius: '12px', backgroundColor: isDark ? '#20181C' : '#FAFAFA', border: isDark ? '1px solid #2A1F24' : '1px solid #F0E6E9', fontSize: '11.5px', color: isDark ? '#D9C5CD' : '#5C4850', fontStyle: 'italic' }}>
                  "¿Cansancio de media tarde? ⚡ Una sesión breve de calistenia oxigenará tu mente y renovará tu energía."
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleTriggerAutomation('afternoon')}
                disabled={triggeringMode !== null}
                style={{
                  marginTop: '16px',
                  width: '100%',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: isDark ? '#251D21' : '#F7F0F2',
                  border: '1px solid rgba(211,69,91,0.2)',
                  color: '#D3455B',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: triggeringMode !== null ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  opacity: triggeringMode !== null && triggeringMode !== 'afternoon' ? 0.5 : 1
                }}
              >
                <Zap style={{ width: '14px', height: '14px' }} className={triggeringMode === 'afternoon' ? 'animate-spin' : ''} />
                <span>{triggeringMode === 'afternoon' ? 'Disparando Tarde...' : 'Testar Disparo da Tarde'}</span>
              </button>
            </div>

            {/* Card 3: Salvar Ofensiva (Duolingo Style) */}
            <div
              style={{
                backgroundColor: isDark ? '#1E1418' : '#FFF5F6',
                borderRadius: '22px',
                padding: '20px',
                border: '1.5px solid #FF5722',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(255, 87, 34, 0.12)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px' }}>🔥</span>
                  <span style={{ padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#FF5722', fontSize: '11px', fontWeight: 800, color: '#FFFFFF' }}>
                    20:00 (Salvar Ofensiva)
                  </span>
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 6px 0', color: isDark ? '#F7EFF2' : '#301D23' }}>
                  Gatilho de Urgência & Ofensiva (Estilo Duolingo)
                </h4>
                <p style={{ fontSize: '12px', color: isDark ? '#B8A2AB' : '#84626D', lineHeight: 1.5, margin: 0 }}>
                  Alerta com urgência os alunos que ainda não treinaram hoje para não perderem a sequência do Desafio.
                </p>
                <div style={{ marginTop: '14px', padding: '10px 12px', borderRadius: '12px', backgroundColor: isDark ? '#170E12' : '#FFFFFF', border: isDark ? '1px solid #3D2228' : '1px solid #FCDADF', fontSize: '11.5px', color: '#D3455B', fontWeight: 600 }}>
                  {'"¡Tu racha está en peligro! 🔥 No te vayas a dormir sin tu victoria, [Nombre]. Completa el Día [X] antes de medianoche."'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleTriggerAutomation('streak_saver')}
                disabled={triggeringMode !== null}
                style={{
                  marginTop: '16px',
                  width: '100%',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: '#FF5722',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: triggeringMode !== null ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(255, 87, 34, 0.35)',
                  opacity: triggeringMode !== null && triggeringMode !== 'streak_saver' ? 0.5 : 1
                }}
              >
                <Flame style={{ width: '14px', height: '14px' }} className={triggeringMode === 'streak_saver' ? 'animate-bounce' : ''} />
                <span>{triggeringMode === 'streak_saver' ? 'Disparando Ofensiva...' : 'Disparar Salvar Ofensiva Agora'}</span>
              </button>
            </div>
          </div>

          {/* Test Engine Execution Feedback Card */}
          {autoTriggerResult && (
            <div
              style={{
                backgroundColor: isDark ? '#181215' : '#FFFFFF',
                borderRadius: '22px',
                padding: '22px',
                border: isDark ? '1px solid #281E23' : '1px solid #EDE4E7'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: isDark ? '#F7EFF2' : '#301D23', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle style={{ width: '18px', height: '18px', color: '#0DA86A' }} />
                  <span>
                    Resultado do Disparo ({autoTriggerResult.trigger === 'morning' ? 'Manhã' : autoTriggerResult.trigger === 'afternoon' ? 'Tarde' : 'Salvar Ofensiva'}):
                  </span>
                </h4>
                <button
                  onClick={() => setAutoTriggerResult(null)}
                  style={{ background: 'none', border: 'none', color: isDark ? '#B8A2AB' : '#84626D', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                >
                  Fechar
                </button>
              </div>

              {/* Metrics row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '14px', backgroundColor: isDark ? 'rgba(13, 168, 106, 0.15)' : '#EDF7F0' }}>
                  <span style={{ fontSize: '11px', color: '#0DA86A', display: 'block', fontWeight: 600 }}>Notificações Enviadas</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#0DA86A' }}>{autoTriggerResult.sent || 0}</span>
                </div>
                <div style={{ padding: '12px', borderRadius: '14px', backgroundColor: isDark ? '#221A1E' : '#F7F2F4' }}>
                  <span style={{ fontSize: '11px', color: isDark ? '#B8A2AB' : '#84626D', display: 'block' }}>Alunos Processados</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: isDark ? '#F7EFF2' : '#301D23' }}>{autoTriggerResult.processed || 0}</span>
                </div>
                <div style={{ padding: '12px', borderRadius: '14px', backgroundColor: isDark ? '#221A1E' : '#F7F2F4' }}>
                  <span style={{ fontSize: '11px', color: isDark ? '#B8A2AB' : '#84626D', display: 'block' }}>Já Treinaram Hoje</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: isDark ? '#F7EFF2' : '#301D23' }}>{autoTriggerResult.skipped_already_trained || 0}</span>
                </div>
                <div style={{ padding: '12px', borderRadius: '14px', backgroundColor: isDark ? '#221A1E' : '#F7F2F4' }}>
                  <span style={{ fontSize: '11px', color: isDark ? '#B8A2AB' : '#84626D', display: 'block' }}>Ignorados Anti-Spam (4h)</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: isDark ? '#F7EFF2' : '#301D23' }}>{autoTriggerResult.skipped_recent || 0}</span>
                </div>
              </div>

              {/* Detailed results list */}
              {autoTriggerResult.results && autoTriggerResult.results.length > 0 && (
                <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {autoTriggerResult.results.map((r, i) => {
                    const isSuccess = r.status === 'sent_push_and_app' || r.status === 'sent_in_app_only' || r.status === 'sent';
                    return (
                      <div
                        key={i}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '14px',
                          backgroundColor: isDark ? '#20181C' : '#FAFAFA',
                          border: isDark ? '1px solid #2B2025' : '1px solid #EFE6E8',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '10px'
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 700, color: isDark ? '#F7EFF2' : '#301D23' }}>
                            {r.email}
                          </div>
                          {r.title && (
                            <div style={{ fontSize: '11.5px', color: '#D3455B', marginTop: '2px', fontStyle: 'italic' }}>
                              "{r.title}" — {r.message}
                            </div>
                          )}
                        </div>

                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: isSuccess ? 'rgba(13, 168, 106, 0.15)' : (isDark ? '#2C2126' : '#ECE2E5'),
                            color: isSuccess ? '#0DA86A' : (isDark ? '#B8A2AB' : '#84626D'),
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {r.status === 'sent_push_and_app' || (r.status === 'sent' && r.devices_pushed > 0)
                            ? `🔔 Push Entregue (${r.devices_pushed || 1} aparelho(s))`
                            : isSuccess
                            ? '🔔 Entregue no App'
                            : r.status === 'skipped_recent_notification'
                            ? 'Pausa Anti-Spam (4h)'
                            : r.status === 'skipped_trained_today'
                            ? 'Já Treinou Hoje'
                            : r.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
