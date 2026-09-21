import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { User, Settings, LogOut, Trash2, Edit2, X, Moon, Sun, Check, ChevronRight, Camera, Smartphone, ShieldCheck, Bell } from 'lucide-react';
import { CircularProgress } from '../components/CircularProgress';

// Helper to compress and resize image client-side to max 400x400
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => resolve(event.target.result);
    };
  });
};

export function Perfil({ onNavigate }) {
  const {
    state,
    theme,
    toggleTheme,
    updateUserProfile,
    resetProgress,
    signOut,
    getCompletedDays,
    getTotalProgress,
    user,
    notificationPermission,
    requestPermission,
    showDeviceNotification
  } = useApp();
  const isDark = theme === 'dark';
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  const handleNotificationClick = async () => {
    if (notificationPermission !== 'granted') {
      await requestPermission();
    } else {
      setTestNotificationSent(true);
      await showDeviceNotification('¡Notificación de Calistenia Asiática! 🌿', {
        body: 'Tu dispositivo está sincronizado y recibiendo notificaciones en tiempo real.',
        icon: '/icons/icon-192.png'
      });
      setTimeout(() => setTestNotificationSent(false), 3000);
    }
  };

  const profile = state.userProfile || {};
  const userEmail = (user?.email || profile.email || '').toLowerCase().trim();
  const isAdmin = userEmail === 'idealconsumo@gmail.com' || profile.is_admin === true;
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingData, setIsEditingData] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Preferences Modal states
  const fileInputRef = useRef(null);
  const [prefName, setPrefName] = useState(profile.name || 'Usuária');
  const [prefPhoto, setPrefPhoto] = useState(profile.photoUrl || null);
  const [isSavingPref, setIsSavingPref] = useState(false);

  // Form states
  const [name, setName] = useState(profile.name || 'Felipe Souza Fp');
  const [age, setAge] = useState(profile.age || 30);
  const [height, setHeight] = useState(profile.height || 165);
  const [currentWeight, setCurrentWeight] = useState(profile.currentWeight || 70);
  const [targetWeight, setTargetWeight] = useState(profile.targetWeight || 60);

  const completedDays = getCompletedDays();
  const totalProgress = getTotalProgress();
  const daysRemaining = Math.max(0, 21 - completedDays);

  const openPreferences = () => {
    setPrefName(profile.name || 'Usuária');
    setPrefPhoto(profile.photoUrl || null);
    setShowPreferences(true);
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem.');
      return;
    }

    try {
      const resized = await compressImage(file);
      setPrefPhoto(resized);
    } catch (err) {
      console.error('Error processing image:', err);
    }
  };

  const handleSavePreferences = async () => {
    setIsSavingPref(true);
    try {
      await updateUserProfile({
        name: prefName.trim() || 'Usuária',
        photoUrl: prefPhoto
      });
      setName(prefName.trim() || 'Usuária');
      setShowPreferences(false);
    } catch (err) {
      console.error('Error saving preferences:', err);
    } finally {
      setIsSavingPref(false);
    }
  };

  const handleCancelPreferences = () => {
    setPrefName(profile.name || 'Usuária');
    setPrefPhoto(profile.photoUrl || null);
    setShowPreferences(false);
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await updateUserProfile({ name: name.trim() });
    setIsEditingName(false);
  };

  const handleSaveData = async (e) => {
    e.preventDefault();
    await updateUserProfile({
      age: Number(age),
      height: Number(height),
      currentWeight: Number(currentWeight),
      targetWeight: Number(targetWeight)
    });
    setIsEditingData(false);
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja resetar todo o progresso do programa para o Dia 1?')) {
      resetProgress();
    }
  };

  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      setShowSignOutConfirm(false);
      onNavigate('/auth');
    } catch (err) {
      console.error('Erro ao sair:', err);
      setShowSignOutConfirm(false);
      onNavigate('/auth');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <main className="min-h-screen px-4 pt-4 pb-24 max-w-lg mx-auto select-none bg-background text-foreground transition-colors">
      {/* Header matching image 1 */}
      <header className="mb-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Tus datos y configuración</p>
      </header>

      {/* Main Profile Card matching image 1 */}
      <div className="bg-card rounded-3xl p-6 shadow-sm border border-border mb-4 animate-slide-up">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div
              className="h-16 w-16 rounded-full text-white flex items-center justify-center overflow-hidden shadow-sm"
              style={{ backgroundColor: '#CF4863' }}
            >
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt="Foto" className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-white" />
              )}
            </div>
            {/* Small pencil icon badge */}
            <button
              onClick={openPreferences}
              className="absolute bottom-0 right-0 h-5 w-5 rounded-full text-white flex items-center justify-center shadow border-2 border-white cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: '#CF4863' }}
              aria-label="Editar foto o nombre"
            >
              <Edit2 className="h-2.5 w-2.5" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-foreground truncate">
              {profile.name || name}
            </h2>
            <button
              onClick={() => setIsEditingName(true)}
              className="text-xs font-medium hover:underline block mt-0.5"
              style={{ color: '#CF4863' }}
            >
              Editar nombre
            </button>
          </div>
        </div>

        {/* 3 Stats columns matching image 1 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            alignItems: 'center',
            textAlign: 'center',
            width: '100%'
          }}
          className="pt-2"
        >
          {/* Progresso Circle */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              <CircularProgress progress={totalProgress} size={60} strokeWidth={5}>
                <span className="text-xs font-bold text-foreground">{totalProgress}%</span>
              </CircularProgress>
            </div>
            <span className="text-[11px] text-muted-foreground mt-2 font-medium">Progreso</span>
          </div>

          {/* Treinos */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground block leading-tight">
              {completedDays}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">Entrenamientos</span>
          </div>

          {/* Restantes */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground block leading-tight">
              {daysRemaining}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">Restantes</span>
          </div>
        </div>
      </div>

      {/* Seus Dados Card matching image 1 */}
      <div className="bg-card rounded-3xl p-5 shadow-sm border border-border mb-4 animate-slide-up">
        <h3 className="font-bold text-sm text-foreground mb-3.5">Tus Datos</h3>

        <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 mb-4">
          <div>
            <span className="text-xs text-muted-foreground block">Edad</span>
            <span className="text-sm font-bold text-foreground mt-0.5 block">
              {profile.age || age} años
            </span>
          </div>

          <div>
            <span className="text-xs text-muted-foreground block">Altura</span>
            <span className="text-sm font-bold text-foreground mt-0.5 block">
              {profile.height || height} cm
            </span>
          </div>

          <div>
            <span className="text-xs text-muted-foreground block">Peso Actual</span>
            <span className="text-sm font-bold text-foreground mt-0.5 block">
              {profile.currentWeight || currentWeight} kg
            </span>
          </div>

          <div>
            <span className="text-xs text-muted-foreground block">Peso Objetivo</span>
            <span className="text-sm font-bold text-foreground mt-0.5 block">
              {profile.targetWeight || targetWeight} kg
            </span>
          </div>
        </div>

        {/* Editar Dados Button */}
        <button
          onClick={() => {
            setAge(profile.age || 30);
            setHeight(profile.height || 165);
            setCurrentWeight(profile.currentWeight || 70);
            setTargetWeight(profile.targetWeight || 60);
            setIsEditingData(true);
          }}
          className="w-full h-11 rounded-2xl border border-border bg-card hover:bg-muted/40 text-foreground text-xs font-semibold flex items-center justify-center transition-colors shadow-sm cursor-pointer"
        >
          Editar Datos
        </button>
      </div>

      {/* Preferências Card matching standard design */}
      <div
        onClick={openPreferences}
        className="cursor-pointer transition-all flex items-center justify-between mb-4 border shadow-sm hover:border-[#CB4D6D]/40 animate-slide-up"
        style={{
          borderRadius: '24px',
          backgroundColor: isDark ? '#1A1417' : '#FFFFFF',
          borderColor: isDark ? '#2D2226' : '#E9E2E4',
          padding: '16px 20px',
          boxShadow: isDark ? '0 2px 8px -2px rgba(0,0,0,0.3)' : '0 2px 8px -2px rgba(61,41,48,0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: '44px',
              height: '44px',
              minWidth: '44px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(203, 77, 109, 0.1)',
              color: '#CB4D6D'
            }}
          >
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: isDark ? '#F7EFF2' : '#301D23', lineHeight: 1.25 }}>
              Preferencias
            </h3>
            <p style={{ fontSize: '13px', color: isDark ? '#B8A2AB' : '#84626D', marginTop: '4px', lineHeight: 1.25 }}>
              Configura tu app
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-[#84626D] flex-shrink-0" />
      </div>

      {/* Notificaciones Push del Dispositivo */}
      <div
        onClick={handleNotificationClick}
        className="cursor-pointer transition-all flex items-center justify-between mb-4 border shadow-sm hover:border-[#CB4D6D]/40 animate-slide-up"
        style={{
          borderRadius: '24px',
          backgroundColor: isDark ? '#1A1417' : '#FFFFFF',
          borderColor: isDark ? '#2D2226' : '#E9E2E4',
          padding: '16px 20px',
          boxShadow: isDark ? '0 2px 8px -2px rgba(0,0,0,0.3)' : '0 2px 8px -2px rgba(61,41,48,0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: '44px',
              height: '44px',
              minWidth: '44px',
              borderRadius: '9999px',
              backgroundColor: notificationPermission === 'granted' ? 'rgba(13, 168, 106, 0.12)' : 'rgba(211, 69, 91, 0.12)',
              color: notificationPermission === 'granted' ? '#0DA86A' : '#D3455B'
            }}
          >
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: isDark ? '#F7EFF2' : '#301D23', lineHeight: 1.25 }}>
                Notificaciones en el Dispositivo
              </h3>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: notificationPermission === 'granted' ? 'rgba(13, 168, 106, 0.15)' : 'rgba(211, 69, 91, 0.15)',
                  color: notificationPermission === 'granted' ? '#0DA86A' : '#D3455B'
                }}
              >
                {notificationPermission === 'granted' ? 'Activas' : 'Activar'}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: isDark ? '#B8A2AB' : '#84626D', marginTop: '4px', lineHeight: 1.25 }}>
              {notificationPermission === 'granted'
                ? (testNotificationSent ? '¡Notificación de prueba enviada!' : 'Toca para enviar una prueba a este dispositivo')
                : 'Toca para permitir avisos diarios y alertas de entrenamiento'}
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-[#84626D] flex-shrink-0" />
      </div>

      {/* Instalar App no Celular (PWA) */}
      <div
        onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install'))}
        className="cursor-pointer transition-all flex items-center justify-between mb-4 border shadow-sm hover:border-[#CB4D6D]/40 animate-slide-up"
        style={{
          borderRadius: '24px',
          backgroundColor: isDark ? '#1A1417' : '#FFFFFF',
          borderColor: isDark ? '#2D2226' : '#E9E2E4',
          padding: '16px 20px',
          boxShadow: isDark ? '0 2px 8px -2px rgba(0,0,0,0.3)' : '0 2px 8px -2px rgba(61,41,48,0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: '44px',
              height: '44px',
              minWidth: '44px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(211, 69, 91, 0.12)',
              color: '#D3455B'
            }}
          >
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: isDark ? '#F7EFF2' : '#301D23', lineHeight: 1.25 }}>
              Instalar en el Celular
            </h3>
            <p style={{ fontSize: '13px', color: isDark ? '#B8A2AB' : '#84626D', marginTop: '4px', lineHeight: 1.25 }}>
              Úsalo directo desde la pantalla de inicio, offline y más rápido
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-[#84626D] flex-shrink-0" />
      </div>

      {/* Painel do Administrador (Visível Apenas para idealconsumo@gmail.com) */}
      {isAdmin && (
        <div
          onClick={() => onNavigate('/admin')}
          className="cursor-pointer transition-all flex items-center justify-between mb-4 border shadow-sm hover:border-[#CB4D6D]/40 animate-slide-up"
          style={{
            borderRadius: '24px',
            backgroundColor: isDark ? '#1A1417' : '#FFFFFF',
            borderColor: isDark ? '#2D2226' : '#E9E2E4',
            padding: '16px 20px',
            boxShadow: isDark ? '0 2px 8px -2px rgba(0,0,0,0.3)' : '0 2px 8px -2px rgba(61,41,48,0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: '44px',
                height: '44px',
                minWidth: '44px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                color: '#6366F1'
              }}
            >
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: isDark ? '#F7EFF2' : '#301D23', lineHeight: 1.25 }}>
                  Panel Administrativo
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500">
                  Admin
                </span>
              </div>
              <p style={{ fontSize: '13px', color: isDark ? '#B8A2AB' : '#84626D', marginTop: '4px', lineHeight: 1.25 }}>
                Gestionar usuarios, instalaciones y notificaciones
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-[#84626D] flex-shrink-0" />
        </div>
      )}

      {/* Sair da Conta Outline Button */}
      <div className="space-y-3 mb-6 animate-slide-up">
        <button
          onClick={() => setShowSignOutConfirm(true)}
          className="w-full h-12 rounded-2xl border border-border bg-card hover:bg-muted/40 text-foreground text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <LogOut className="h-4 w-4 text-muted-foreground" />
          <span>Cerrar Sesión</span>
        </button>

        {/* Resetar Progresso Text Button */}
        <div className="text-center pt-1">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs text-[#DE3B40] hover:underline font-medium transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Reiniciar Progreso</span>
          </button>
        </div>
      </div>

      {/* Modern Logout Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card rounded-3xl max-w-xs w-full p-6 shadow-2xl border border-border text-center animate-scale-in">
            <div className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-3.5">
              <LogOut className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1.5">¿Cerrar Sesión?</h3>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
              Tendrás que iniciar sesión de nuevo para acceder a tus entrenamientos y plan de alimentación.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                disabled={isSigningOut}
                className="flex-1 h-11 rounded-xl border border-border bg-muted/40 text-foreground text-xs font-semibold hover:bg-muted transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex-1 h-11 rounded-xl bg-destructive text-destructive-foreground text-xs font-semibold hover:opacity-95 transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                {isSigningOut ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saliendo...</span>
                  </>
                ) : (
                  <span>Cerrar Sesión</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Name Modal */}
      {isEditingName && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 shadow-xl border border-border animate-scale-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-foreground">Editar Nombre</h3>
              <button onClick={() => setIsEditingName(false)} className="text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveName} className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-input text-xs text-foreground outline-none focus:border-[#CF4863]"
                autoFocus
              />
              <button
                type="submit"
                className="w-full h-10 rounded-xl text-white font-semibold text-xs shadow-sm"
                style={{ backgroundColor: '#CF4863' }}
              >
                Guardar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Data Modal */}
      {isEditingData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-border animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground">Editar Tus Datos</h3>
              <button onClick={() => setIsEditingData(false)} className="text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveData} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Edad (años)
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-input text-xs text-foreground outline-none focus:border-[#CF4863]"
                  min="12"
                  max="100"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-input text-xs text-foreground outline-none focus:border-[#CF4863]"
                  min="100"
                  max="250"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Peso Actual (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-input text-xs text-foreground outline-none focus:border-[#CF4863]"
                  min="30"
                  max="250"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Peso Objetivo (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-input text-xs text-foreground outline-none focus:border-[#CF4863]"
                  min="30"
                  max="250"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-11 rounded-2xl text-white font-semibold text-xs shadow-md"
                  style={{ backgroundColor: '#CF4863' }}
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preferences Modal matching Image 2 */}
      {showPreferences && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            className="animate-scale-in"
            style={{
              backgroundColor: isDark ? '#181215' : '#FFFFFF',
              borderRadius: '32px',
              maxWidth: '380px',
              width: '100%',
              padding: '26px 24px',
              boxShadow: isDark
                ? '0 25px 60px -15px rgba(0, 0, 0, 0.7)'
                : '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
              border: isDark ? '1px solid #2D2226' : '1px solid #E9E2E4',
              position: 'relative',
              opacity: 1
            }}
          >
            {/* Header */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}
            >
              <h3
                style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  color: isDark ? '#F7EFF2' : '#301D23',
                  margin: 0
                }}
              >
                Preferencias
              </h3>
              <button
                type="button"
                onClick={handleCancelPreferences}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: isDark ? '#B8A2AB' : '#84626D',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Cerrar"
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Avatar section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  position: 'relative',
                  width: '96px',
                  height: '96px',
                  cursor: 'pointer',
                  margin: '0 auto'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {/* Circular avatar image/placeholder */}
                <div
                  style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '9999px',
                    backgroundColor: '#CB4D6D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(203,77,109,0.2)'
                  }}
                >
                  {prefPhoto ? (
                    <img
                      src={prefPhoto}
                      alt="Foto de perfil"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <User style={{ width: '50px', height: '50px', color: '#FFFFFF' }} strokeWidth={1.8} />
                  )}
                </div>

                {/* Camera button at bottom right corner */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  style={{
                    position: 'absolute',
                    bottom: '0px',
                    right: '0px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '9999px',
                    backgroundColor: '#E07A2B',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isDark ? '3px solid #181215' : '3px solid #FFFFFF',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    transform: 'translate(4px, 4px)',
                    zIndex: 10
                  }}
                  aria-label="Cambiar foto"
                >
                  <Camera style={{ width: '15px', height: '15px' }} />
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />

              <p
                style={{
                  fontSize: '12.5px',
                  color: isDark ? '#B8A2AB' : '#84626D',
                  marginTop: '12px',
                  textAlign: 'center',
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                Toca en el ícono para cambiar la foto
              </p>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {/* Field Nome */}
              <div>
                <label
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isDark ? '#F7EFF2' : '#301D23',
                    display: 'block',
                    marginBottom: '8px'
                  }}
                >
                  Nombre
                </label>
                <input
                  type="text"
                  value={prefName}
                  onChange={(e) => setPrefName(e.target.value)}
                  placeholder="Usuario"
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    borderRadius: '16px',
                    backgroundColor: isDark ? '#221A1E' : '#FFFFFF',
                    border: isDark ? '1px solid #33272C' : '1px solid #E9E2E4',
                    fontSize: '14px',
                    color: isDark ? '#F7EFF2' : '#301D23',
                    outline: 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#CB4D6D')}
                  onBlur={(e) => (e.target.style.borderColor = isDark ? '#33272C' : '#E9E2E4')}
                />
              </div>

              {/* Field Modo Escuro / Claro */}
              <div>
                <label
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isDark ? '#F7EFF2' : '#301D23',
                    display: 'block',
                    marginBottom: '8px'
                  }}
                >
                  Modo de Visualización
                </label>
                <button
                  type="button"
                  onClick={toggleTheme}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    borderRadius: '16px',
                    backgroundColor: isDark ? '#221A1E' : '#FFFFFF',
                    border: isDark ? '1px solid #33272C' : '1px solid #E9E2E4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isDark ? (
                      <Moon style={{ width: '18px', height: '18px', color: '#CB4D6D' }} />
                    ) : (
                      <Sun style={{ width: '18px', height: '18px', color: '#CB4D6D' }} />
                    )}
                    <span style={{ fontSize: '14px', fontWeight: 500, color: isDark ? '#F7EFF2' : '#301D23' }}>
                      {isDark ? 'Modo Oscuro' : 'Modo Claro'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: isDark ? '#CB4D6D' : '#84626D'
                      }}
                    >
                      {isDark ? 'Activado' : 'Desactivado'}
                    </span>
                    <div
                      style={{
                        width: '40px',
                        height: '24px',
                        borderRadius: '9999px',
                        backgroundColor: isDark ? '#CB4D6D' : '#E9E2E4',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '2px',
                        transition: 'background-color 0.2s',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '9999px',
                          backgroundColor: '#FFFFFF',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                          transform: isDark ? 'translateX(16px)' : 'translateX(0)',
                          transition: 'transform 0.2s'
                        }}
                      />
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Bottom Buttons: Cancelar e Salvar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={handleCancelPreferences}
                style={{
                  height: '46px',
                  borderRadius: '16px',
                  border: isDark ? '1px solid #33272C' : '1px solid #E9E2E4',
                  backgroundColor: isDark ? '#221A1E' : '#FFFFFF',
                  color: isDark ? '#F7EFF2' : '#301D23',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={isSavingPref}
                style={{
                  height: '46px',
                  borderRadius: '16px',
                  border: 'none',
                  backgroundColor: '#CB4D6D',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px -2px rgba(203,77,109,0.4)',
                  opacity: isSavingPref ? 0.7 : 1
                }}
              >
                {isSavingPref ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
