import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { BottomNav } from './components/BottomNav';
import { Auth } from './pages/Auth';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Treinos } from './pages/Treinos';
import { Exercicios } from './pages/Exercicios';
import { WorkoutExecution } from './pages/WorkoutExecution';
import { WorkoutDayPreview } from './pages/WorkoutDayPreview';
import { Dieta } from './pages/Dieta';
import { DietaPlano } from './pages/DietaPlano';
import { Receitas } from './pages/Receitas';
import { Bonus } from './pages/Bonus';
import { BonusDetail } from './pages/BonusDetail';
import { AtividadeExtra } from './pages/AtividadeExtra';
import { Filosofia } from './pages/Filosofia';
import { Suporte } from './pages/Suporte';
import { Perfil } from './pages/Perfil';
import { Admin } from './pages/Admin';
import { usePWA } from './hooks/usePWA';
import { InstallPromptModal } from './components/InstallPromptModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { AppEntranceModal } from './components/AppEntranceModal';

export function App() {
  const { user, loading, state } = useApp();
  const pwa = usePWA(user);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showEntranceModal, setShowEntranceModal] = useState(false);
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      return hash || window.location.pathname || '/';
    }
    return '/';
  });

  const navigate = (path) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.location.hash = path;
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentPath(hash);
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const handleOpenInstall = () => setShowInstallModal(true);
    const handleOpenNotifications = () => setShowNotificationModal(true);

    window.addEventListener('open-pwa-install', handleOpenInstall);
    window.addEventListener('open-notifications', handleOpenNotifications);

    return () => {
      window.removeEventListener('open-pwa-install', handleOpenInstall);
      window.removeEventListener('open-notifications', handleOpenNotifications);
    };
  }, []);

  // Show entrance popup for Notifications & PWA install upon entering the app
  useEffect(() => {
    if (!loading) {
      const hasProfile = !!state.userProfile?.name || !!user;
      if (!hasProfile) return;

      const alreadySeen = typeof window !== 'undefined' ? sessionStorage.getItem('calistenia_entrance_modal_seen') : null;
      const notifsActive = typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
      const isAppInstalled = pwa?.isInstalled;

      // If either notifications or app install is not yet active and not dismissed in this session
      if (!alreadySeen && (!notifsActive || !isAppInstalled)) {
        const timer = setTimeout(() => {
          setShowEntranceModal(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, user, state.userProfile?.name, pwa?.isInstalled]);

  const handleCloseEntranceModal = () => {
    setShowEntranceModal(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('calistenia_entrance_modal_seen', 'true');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
        <p className="text-sm text-muted-foreground font-medium">Cargando Calistenia Asiática...</p>
      </div>
    );
  }

  // Check authentication & onboarding
  const hasProfile = !!state.userProfile?.name || !!user;
  const onboardingCompleted = state.userProfile?.onboardingCompleted;

  if (!hasProfile) {
    return <Auth onNavigate={navigate} />;
  }

  if (!onboardingCompleted && currentPath !== '/onboarding') {
    return <Onboarding onNavigate={navigate} />;
  }

  const renderCurrentView = () => {
    if (currentPath === '/auth') {
      return <Auth onNavigate={navigate} />;
    }
    if (currentPath === '/onboarding') {
      return <Onboarding onNavigate={navigate} />;
    }
    if (currentPath === '/treinos') {
      return <Treinos onNavigate={navigate} />;
    }
    if (currentPath === '/treinos/exercicios') {
      return <Exercicios onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/treinos/dia/')) {
      const dayNum = currentPath.replace('/treinos/dia/', '').split('?')[0];
      return <WorkoutDayPreview dayNumber={dayNum} onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/treino/')) {
      const dayNum = currentPath.replace('/treino/', '').split('?')[0];
      return <WorkoutExecution dayNumber={dayNum} onNavigate={navigate} />;
    }
    if (currentPath === '/dieta') {
      return <Dieta onNavigate={navigate} />;
    }
    if (currentPath === '/dieta/plano') {
      return <DietaPlano onNavigate={navigate} />;
    }
    if (currentPath === '/dieta/receitas') {
      return <Receitas onNavigate={navigate} />;
    }
    if (currentPath === '/bonus') {
      return <Bonus onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/bonus/')) {
      const slug = currentPath.replace('/bonus/', '');
      return <BonusDetail slug={slug} onNavigate={navigate} />;
    }
    if (currentPath === '/atividade-extra' || currentPath === '/atividades-extras') {
      return <AtividadeExtra onNavigate={navigate} />;
    }
    if (currentPath === '/filosofia') {
      return <Filosofia onNavigate={navigate} />;
    }
    if (currentPath === '/suporte') {
      return <Suporte onNavigate={navigate} />;
    }
    if (currentPath === '/perfil') {
      return <Perfil onNavigate={navigate} />;
    }
    if (currentPath === '/admin') {
      const userEmail = (user?.email || state.userProfile?.email || '').toLowerCase().trim();
      const isAdmin = userEmail === 'idealconsumo@gmail.com' || state.userProfile?.is_admin === true;
      if (!isAdmin) {
        return <Home onNavigate={navigate} />;
      }
      return <Admin onNavigate={navigate} />;
    }
    // Default: Home Dashboard
    return <Home onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {renderCurrentView()}
      {hasProfile && onboardingCompleted && !['/auth', '/onboarding'].includes(currentPath) && !currentPath.startsWith('/treino/') && (
        <BottomNav currentPath={currentPath} onNavigate={navigate} />
      )}

      {/* PWA Install Modal */}
      <InstallPromptModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        pwa={pwa}
      />

      {/* Notifications Modal */}
      <NotificationCenterModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onNavigate={navigate}
      />

      {/* Entrance Popup for Notifications & PWA Install */}
      <AppEntranceModal
        isOpen={showEntranceModal}
        onClose={handleCloseEntranceModal}
        pwa={pwa}
      />
    </div>
  );
}
