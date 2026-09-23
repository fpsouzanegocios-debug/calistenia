import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { showDeviceNotification, requestDeviceNotificationPermission, subscribeUserToWebPush } from '../utils/notifications';

const AppContext = createContext(null);

const DEFAULT_STATE = {
  currentDay: 1,
  progress: {},
  extraActivities: [],
  userProfile: null,
  dietGenerated: false,
  chatHistory: []
};

const STORAGE_KEY = 'calistenia-atlas-state';

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('calistenia-theme') || 'light';
    }
    return 'light';
  });

  const [state, setState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const hasSavedPlan = !!localStorage.getItem('generated-diet-plan');
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const rawChat = (parsed.chatHistory || []).map(m => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }));
          const dedupedChat = [];
          for (const m of rawChat) {
            let content = m.content || '';
            if (content.includes('assistente virtual da Calistenia') || content.includes('Sou a assistente')) {
              content = "¡Hola! Soy la asistente virtual de Calistenia Asiática. 🌿 Estoy aquí para ayudarte con cualquier duda sobre entrenamientos, dieta, bienestar o la aplicación. ¡Puedes preguntarme lo que quieras! ¿Cómo puedo ayudarte hoy?";
            }
            const prev = dedupedChat[dedupedChat.length - 1];
            if (!prev || !(prev.role === m.role && prev.content?.trim() === content?.trim())) {
              dedupedChat.push({ ...m, content });
            }
          }
          return {
            ...DEFAULT_STATE,
            ...parsed,
            dietGenerated: parsed.dietGenerated || hasSavedPlan,
            chatHistory: dedupedChat
          };
        } else if (hasSavedPlan) {
          return {
            ...DEFAULT_STATE,
            dietGenerated: true
          };
        }
      } catch (e) {
        console.error('Error reading localStorage state:', e);
      }
    }
    return DEFAULT_STATE;
  });

  // Apply theme class to HTML root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('calistenia-theme', theme);
  }, [theme]);

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not persist state to localStorage:', e);
    }
  }, [state]);

  const [notifications, setNotifications] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const requestPermission = async () => {
    const perm = await requestDeviceNotificationPermission(user);
    setNotificationPermission(perm);
    if (perm === 'granted') {
      await subscribeUserToWebPush(user);
    }
    return perm;
  };

  // Ensure Web Push subscription is registered & tied to current user whenever permission is granted
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      subscribeUserToWebPush(user);
    }
  }, [user]);

  const [isAdminMode, setIsAdminMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('calistenia_admin_mode') === 'true';
    }
    return false;
  });

  const fetchNotifications = async (currentUser) => {
    const usr = currentUser || user;
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (usr?.id) {
        query = query.or(`user_id.is.null,user_id.eq.${usr.id}`);
      } else {
        query = query.is('user_id', null);
      }

      const { data, error } = await query;
      if (data && !error) {
        setNotifications(data);
      }
    } catch (e) {
      console.warn('Erro ao carregar notificações:', e);
    }
  };

  // Realtime subscription to notifications table
  useEffect(() => {
    fetchNotifications(user);

    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        async (payload) => {
          const newNotif = payload.new;
          if (!newNotif) return;

          // Audience filter: broadcast to all (user_id === null) or to specific recipient
          const currentUserId = user?.id;
          if (newNotif.user_id && newNotif.user_id !== currentUserId) {
            return;
          }

          // Add to in-app notification state
          setNotifications((prev) => {
            if (prev.some((n) => n.id === newNotif.id)) return prev;
            return [newNotif, ...prev];
          });

          // Trigger native device notification (Android / iOS PWA / Desktop)
          await showDeviceNotification(newNotif.title, {
            body: newNotif.message,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-72.png',
            action_url: newNotif.action_url || '/'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Sync Supabase Auth and User Profile
  useEffect(() => {
    let mounted = true;

    async function loadUserData(currentUser) {
      if (!currentUser) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();

        if (data && mounted) {
          setState(prev => ({
            ...prev,
            userProfile: {
              ...prev.userProfile,
              name: data.name || currentUser.user_metadata?.name || '',
              email: data.email || currentUser.email || '',
              phone: data.phone || '',
              photoUrl: data.photo_url || null,
              age: data.age || prev.userProfile?.age || 28,
              height: data.height || prev.userProfile?.height || 165,
              currentWeight: data.current_weight || prev.userProfile?.currentWeight || 68,
              targetWeight: data.target_weight || prev.userProfile?.targetWeight || 60,
              targetDays: data.target_days || prev.userProfile?.targetDays || 30,
              onboardingCompleted: data.onboarding_completed ?? false,
              isPwaInstalled: data.is_pwa_installed ?? false,
              pwaInstalledAt: data.pwa_installed_at ?? null,
              pwaDeviceInfo: data.pwa_device_info ?? null,
              isAdmin: data.is_admin ?? false
            }
          }));

          if (data.is_admin) {
            setIsAdminMode(true);
            localStorage.setItem('calistenia_admin_mode', 'true');
          }
        } else if (!data && mounted) {
          // Fallback if profile row is missing: create it immediately so userProfile is never empty
          const fallbackName = currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'Atleta';
          const { data: createdProfile } = await supabase
            .from('profiles')
            .upsert({
              user_id: currentUser.id,
              email: currentUser.email,
              name: fallbackName,
              onboarding_completed: false
            }, { onConflict: 'user_id' })
            .select()
            .single();

          if (mounted) {
            setState(prev => ({
              ...prev,
              userProfile: {
                ...prev.userProfile,
                name: createdProfile?.name || fallbackName,
                email: createdProfile?.email || currentUser.email,
                onboardingCompleted: createdProfile?.onboarding_completed ?? false,
                isAdmin: createdProfile?.is_admin ?? false
              }
            }));
          }
        }

        // Fetch completed workout progress
        const { data: progressRows } = await supabase
          .from('workout_progress')
          .select('day, completed_at')
          .eq('user_id', currentUser.id);

        if (progressRows && progressRows.length > 0 && mounted) {
          const remoteProgress = {};
          let maxDay = 1;
          progressRows.forEach(row => {
            remoteProgress[row.day] = { completed: true, date: row.completed_at };
            if (row.day >= maxDay) maxDay = Math.min(21, row.day + 1);
          });
          setState(prev => ({
            ...prev,
            progress: { ...prev.progress, ...remoteProgress },
            currentDay: Math.max(prev.currentDay, maxDay)
          }));
        }

        // Fetch notifications
        fetchNotifications(currentUser);
      } catch (err) {
        console.error('Error loading Supabase user data:', err);
      }
    }

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadUserData(currentUser);
      } else {
        fetchNotifications(null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadUserData(currentUser);
      } else {
        fetchNotifications(null);
        if (event === 'SIGNED_OUT') {
          setIsAdminMode(false);
          setState(DEFAULT_STATE);
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem(STORAGE_KEY);
              localStorage.removeItem('calistenia_admin_mode');
            } catch (e) {
              console.warn(e);
            }
          }
        }
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setCurrentDay = (day) => {
    setState(prev => ({ ...prev, currentDay: day }));
  };

  const completeDay = async (day, stats = {}) => {
    const nextDay = Math.min(day + 1, 21);
    const nowIso = new Date().toISOString();

    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        [day]: { completed: true, date: nowIso, calories: stats.calories || 150, ...stats }
      },
      currentDay: nextDay
    }));

    // If user is authenticated, sync to Supabase
    if (user?.id) {
      try {
        await supabase
          .from('workout_progress')
          .upsert({
            user_id: user.id,
            day: day,
            completed: true,
            completed_at: nowIso
          }, { onConflict: 'user_id,day' });
      } catch (err) {
        console.warn('Error saving workout progress to Supabase:', err);
      }
    }
  };

  const updateUserProfile = async (updates) => {
    setState(prev => ({
      ...prev,
      userProfile: {
        ...(prev.userProfile || {}),
        ...updates
      }
    }));

    if (user?.id) {
      try {
        const payload = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.age !== undefined) payload.age = updates.age;
        if (updates.height !== undefined) payload.height = updates.height;
        if (updates.currentWeight !== undefined) payload.current_weight = updates.currentWeight;
        if (updates.targetWeight !== undefined) payload.target_weight = updates.targetWeight;
        if (updates.targetDays !== undefined) payload.target_days = updates.targetDays;
        if (updates.onboardingCompleted !== undefined) payload.onboarding_completed = updates.onboardingCompleted;
        if (updates.photoUrl !== undefined) payload.photo_url = updates.photoUrl;

        await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            email: user.email,
            ...payload,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      } catch (err) {
        console.warn('Error saving profile to Supabase:', err);
      }
    }
  };

  const setDietGenerated = (val) => {
    setState(prev => ({ ...prev, dietGenerated: val }));
  };

  const addChatMessage = (role, content) => {
    if (!content) return;
    setState(prev => {
      const history = prev.chatHistory || [];
      if (history.length > 0) {
        const last = history[history.length - 1];
        if (last.role === role && last.content?.trim() === content?.trim()) {
          return prev;
        }
      }
      return {
        ...prev,
        chatHistory: [
          ...history,
          { role, content, timestamp: new Date() }
        ]
      };
    });
  };

  const logExtraActivity = (activity) => {
    const entry = {
      id: Date.now().toString(),
      activityId: activity.id,
      name: activity.name,
      calories: Number(activity.calories) || 200,
      date: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      extraActivities: [...(prev.extraActivities || []), entry]
    }));
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const hasTrainedToday = () => {
    const today = new Date();
    return Object.values(state.progress || {}).some(p => {
      return p && p.completed && p.date && isSameDay(p.date, today);
    });
  };

  const getTodayCompletedWorkoutDay = () => {
    const today = new Date();
    for (const [dayStr, p] of Object.entries(state.progress || {})) {
      if (p && p.completed && p.date && isSameDay(p.date, today)) {
        return parseInt(dayStr, 10);
      }
    }
    return null;
  };

  const getNextPendingDay = () => {
    for (let d = 1; d <= 21; d++) {
      if (!state.progress?.[d]?.completed) {
        return d;
      }
    }
    return 21;
  };

  const canStartWorkout = (dayNumber) => {
    const day = parseInt(dayNumber, 10);
    const pendingDay = getNextPendingDay();

    // Already completed days cannot be started as new workout
    if (state.progress?.[day]?.completed) {
      return false;
    }

    // Only the exact next pending day can be started
    if (day !== pendingDay) {
      return false;
    }

    // Only 1 workout per day allowed! If already trained today, next day unlocks tomorrow
    if (hasTrainedToday()) {
      return false;
    }

    return true;
  };

  const getCaloriesStats = () => {
    const today = new Date();

    let todayCalories = 0;
    let totalCalories = 0;

    // Workouts
    Object.values(state.progress || {}).forEach(p => {
      if (p && p.completed) {
        const cal = Number(p.calories) || 150;
        totalCalories += cal;
        if (p.date && isSameDay(p.date, today)) {
          todayCalories += cal;
        }
      }
    });

    // Extra activities
    (state.extraActivities || []).forEach(act => {
      const cal = Number(act.calories) || 0;
      totalCalories += cal;
      if (act.date && isSameDay(act.date, today)) {
        todayCalories += cal;
      }
    });

    return {
      today: todayCalories,
      total: totalCalories
    };
  };

  const getCompletedDays = () => {
    return Object.values(state.progress || {}).filter(d => d && d.completed).length;
  };

  const getTotalProgress = () => {
    const completed = getCompletedDays();
    return Math.round((completed / 21) * 100);
  };

  const markNotificationAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    } catch (e) {
      console.warn('Erro ao atualizar status da notificação:', e);
    }
  };

  const sendCustomNotification = async ({ title, message, type = 'info', action_url = '', user_id = null }) => {
    try {
      const payload = {
        title,
        message,
        type,
        action_url: action_url || null,
        user_id: user_id || null,
        sent_by: state.userProfile?.name || 'Admin Calistenia Asiática',
        read: false
      };
      const { data, error } = await supabase.from('notifications').insert(payload).select().single();
      if (error) {
        console.error('Error insert notification in Supabase:', error);
        return { success: false, error };
      }
      if (data) {
        const currentUserId = user?.id;
        // Only add to sender's own bell if it's a broadcast or specifically targeted to themselves
        if (!data.user_id || data.user_id === currentUserId) {
          setNotifications(prev => {
            if (prev.some(n => n.id === data.id)) return prev;
            return [data, ...prev];
          });

          await showDeviceNotification(title, {
            body: message,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-72.png',
            action_url: action_url || '/'
          });
        }

        // Trigger Edge Function 'send-push' so that ALL offline/closed devices receive Web Push through FCM/APNs
        try {
          supabase.functions.invoke('send-push', {
            body: {
              title,
              message,
              action_url: action_url || '/',
              user_id: user_id || null
            }
          }).then(res => {
            console.log('[send-push] Edge function response:', res);
          }).catch(fnErr => {
            console.warn('[send-push] Error invoking send-push edge function:', fnErr);
          });
        } catch (fnEx) {
          console.warn('[send-push] Exception invoking send-push:', fnEx);
        }

        return { success: true, data };
      }
      return { success: false, error: new Error('No data returned') };
    } catch (err) {
      console.error('Exception in sendCustomNotification:', err);
      return { success: false, error: err };
    }
  };

  const getAllUsersForAdmin = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: progressList } = await supabase
        .from('workout_progress')
        .select('user_id, day, completed, completed_at');

      const { data: notifList } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      return {
        profiles: profiles || [],
        progress: progressList || [],
        notifications: notifList || []
      };
    } catch (e) {
      console.error('Erro ao buscar dados de admin:', e);
      return { profiles: [], progress: [], notifications: [] };
    }
  };

  const setAdminMode = (enabled) => {
    setIsAdminMode(enabled);
    if (enabled) {
      localStorage.setItem('calistenia_admin_mode', 'true');
    } else {
      localStorage.removeItem('calistenia_admin_mode');
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const resetProgress = async () => {
    setState(prev => ({
      ...prev,
      currentDay: 1,
      progress: {},
      extraActivities: []
    }));
    if (user?.id) {
      try {
        await supabase
          .from('workout_progress')
          .delete()
          .eq('user_id', user.id);
      } catch (err) {
        console.warn('Error resetting workout progress:', err);
      }
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Erro ao deslogar do Supabase:', err);
    }
    setUser(null);
    setSession(null);
    setIsAdminMode(false);
    setState(DEFAULT_STATE);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('calistenia_admin_mode');
        localStorage.removeItem('calistenia_pwa_installed');
        sessionStorage.removeItem('calistenia_web_install_prompt_seen');
        sessionStorage.removeItem('calistenia_app_notif_prompt_seen');
        localStorage.removeItem('generated-diet-plan');
        localStorage.removeItem('calistenia-workout-timer-state');
      } catch (e) {
        console.warn('Erro ao limpar localStorage:', e);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        session,
        loading,
        theme,
        toggleTheme,
        setTheme,
        state,
        setCurrentDay,
        completeDay,
        logExtraActivity,
        getCaloriesStats,
        hasTrainedToday,
        getTodayCompletedWorkoutDay,
        getNextPendingDay,
        canStartWorkout,
        updateUserProfile,
        setDietGenerated,
        addChatMessage,
        getCompletedDays,
        getTotalProgress,
        resetProgress,
        signOut,
        notifications,
        unreadNotificationsCount,
        fetchNotifications,
        markNotificationAsRead,
        sendCustomNotification,
        notificationPermission,
        requestPermission,
        showDeviceNotification,
        isAdmin: isAdminMode,
        setAdminMode,
        getAllUsersForAdmin
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
