import React from 'react';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { CircularProgress } from '../components/CircularProgress';
import { getWorkoutForDay, motivationalQuotes } from '../data/program';
import { getExerciseById } from '../data/exercises';
import { Play, ChevronRight, Sparkles, Flame, TrendingUp, Clock, Scale, Zap, CheckCircle2, Lock } from 'lucide-react';

export function Home({ onNavigate }) {
  const {
    state,
    getCompletedDays,
    getTotalProgress,
    getCaloriesStats,
    hasTrainedToday,
    getNextPendingDay,
    getTodayCompletedWorkoutDay
  } = useApp();

  const completedDays = getCompletedDays();
  const totalProgress = getTotalProgress();
  const alreadyTrainedToday = hasTrainedToday ? hasTrainedToday() : false;
  const todayCompletedDay = getTodayCompletedWorkoutDay ? getTodayCompletedWorkoutDay() : null;
  const pendingDay = getNextPendingDay ? getNextPendingDay() : Math.min(21, Math.max(1, state.currentDay || 1));
  const currentDay = pendingDay;
  const currentWorkout = getWorkoutForDay(currentDay);

  const quote = motivationalQuotes[completedDays % motivationalQuotes.length];

  const previewExercises = currentWorkout.exercises
    .slice(0, 3)
    .map(id => getExerciseById(id))
    .filter(Boolean);

  const remainingExercisesCount = Math.max(0, currentWorkout.exercises.length - 3);
  const totalMinutes = completedDays * currentWorkout.duration;
  const targetWeight = state.userProfile?.targetWeight;
  const caloriesStats = getCaloriesStats ? getCaloriesStats() : { today: 0, total: 0 };

  return (
    <main className="min-h-screen px-4 pt-2 pb-28 max-w-lg mx-auto">
      <Header />

      {/* User Greeting Card */}
      <div
        onClick={() => onNavigate('/perfil')}
        className="flex items-center mb-5 p-1 rounded-2xl cursor-pointer hover:opacity-90 transition-opacity animate-fade-in"
        style={{ gap: '18px' }}
      >
        <div
          className="rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 text-white shadow-sm"
          style={{ backgroundColor: '#CB4D6D', width: '48px', height: '48px', minWidth: '48px' }}
        >
          {state.userProfile?.photoUrl ? (
            <img
              src={state.userProfile.photoUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-[12px] text-[#84626D] leading-none mb-1">Hola,</p>
          <h1 className="text-[18px] font-bold text-[#301D23] truncate leading-tight tracking-tight">
            {state.userProfile?.name || 'Atleta'} 🌸
          </h1>
        </div>
        <ChevronRight className="h-5 w-5 text-[#84626D]/80 flex-shrink-0" />
      </div>

      {/* Motivational message bubble */}
      <div className="bg-primary/10 dark:bg-primary/20 rounded-2xl p-4 mb-6 animate-slide-up">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
          <p className="text-sm font-medium text-foreground">{quote}</p>
        </div>
      </div>

      {/* 21 Days Progress Card */}
      <div className="bg-card rounded-3xl p-6 shadow-card border border-border/40 mb-6 animate-slide-up">
        <div className="flex items-center gap-6">
          <CircularProgress progress={totalProgress} size={88} strokeWidth={8}>
            <div className="text-center">
              <span className="text-2xl font-bold text-foreground leading-none">{completedDays}</span>
              <span className="text-xs text-muted-foreground block font-medium">/21</span>
            </div>
          </CircularProgress>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground mb-1">Programa 21 Días</h3>
            <p className="text-xs text-muted-foreground mb-3 font-medium">
              {completedDays === 0 ? '¡Comienza tu viaje hoy!' : `${21 - completedDays} días restantes`}
            </p>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D3455B] transition-all duration-500 rounded-full"
                style={{ width: `${totalProgress}%`, backgroundColor: '#D3455B' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta de Entrenamiento del Día */}
      <div className="bg-card rounded-3xl overflow-hidden shadow-card border border-border/40 mb-6 animate-slide-up">
        {alreadyTrainedToday ? (
          <div className="p-5 text-white" style={{ backgroundColor: '#0DA86A' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                ENTRENAMIENTO DE HOY COMPLETADO
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold text-white">
                {todayCompletedDay ? `Día ${todayCompletedDay} Hecho` : 'Completado'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">¡Misión cumplida por hoy! 🌸</h2>
            <p className="text-xs text-white/90 leading-relaxed">
              Ya realizaste tu entrenamiento diario. Descansa tus músculos; ¡el Día {currentDay} se desbloqueará mañana!
            </p>
          </div>
        ) : (
          <div className="bg-[#D3455B] p-5 text-white" style={{ backgroundColor: '#D3455B' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
                ENTRENAMIENTO DISPONIBLE
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold text-white">
                Día {currentDay}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{currentWorkout.name}</h2>
            <p className="text-xs text-white/90">{currentWorkout.description}</p>
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center mb-4 text-xs font-medium" style={{ gap: '16px' }}>
            <div className="flex items-center font-medium text-[#84626D]" style={{ gap: '4px' }}>
              <Clock className="h-3.5 w-3.5 text-[#84626D] flex-shrink-0" strokeWidth={1.8} />
              <span>{currentWorkout.duration} min</span>
            </div>
            <div className="flex items-center font-medium text-[#84626D]" style={{ gap: '4px' }}>
              <Flame className="h-3.5 w-3.5 text-[#84626D] flex-shrink-0" strokeWidth={1.8} />
              <span>{currentWorkout.exercises.length} ejercicios (3 series)</span>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {previewExercises.map((ex, idx) => (
              <div key={ex.id} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 text-sm">
                <span className="h-6 w-6 rounded-md bg-muted text-muted-foreground font-semibold flex items-center justify-center text-xs">
                  {idx + 1}
                </span>
                <span className="font-medium text-foreground text-sm">{ex.name}</span>
              </div>
            ))}

            {remainingExercisesCount > 0 && (
              <p className="text-xs text-center text-muted-foreground pt-1 pb-1">
                +{remainingExercisesCount} ejercicios más...
              </p>
            )}
          </div>

          {alreadyTrainedToday ? (
            <div className="space-y-2.5">
              <button
                disabled
                className="w-full h-12 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 cursor-not-allowed border"
                style={{
                  backgroundColor: '#F5F5F7',
                  borderColor: '#E5E7EB',
                  color: '#84626D'
                }}
              >
                <Clock className="h-4 w-4 text-[#84626D]" />
                <span>Día {currentDay} Desbloqueado Mañana</span>
              </button>

              {todayCompletedDay && (
                <button
                  onClick={() => onNavigate(`/treinos/dia/${todayCompletedDay}`)}
                  className="w-full text-center py-1 text-xs font-semibold text-[#D3455B] hover:underline flex items-center justify-center gap-1"
                >
                  <span>Revisar entrenamiento del Día {todayCompletedDay}</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate(`/treino/${currentDay}`)}
              className="w-full h-12 rounded-2xl bg-[#D3455B] text-white font-semibold flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-[0.99] transition-all"
              style={{ backgroundColor: '#D3455B' }}
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Iniciar Entrenamiento (Día {currentDay})</span>
            </button>
          )}
        </div>
      </div>

      {/* Mis Estadísticas */}
      <div className="mb-6 animate-slide-up">
        <h3 className="text-base font-bold text-foreground mb-3">Mis Estadísticas</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Card Entrenamientos */}
          <div
            className="bg-[#DE3B40] text-white rounded-2xl p-4 relative overflow-hidden shadow-sm"
            style={{ backgroundColor: '#DE3B40' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold tracking-wider text-white/90">ENTRENAMIENTOS</span>
              <Flame className="h-5 w-5 text-white/80" />
            </div>
            <p className="text-3xl font-bold leading-tight">{completedDays}</p>
            <p className="text-xs text-white/80 mt-0.5">Completados</p>
          </div>

          {/* Card Progreso */}
          <div
            className="bg-[#0DA86A] text-white rounded-2xl p-4 relative overflow-hidden shadow-sm"
            style={{ backgroundColor: '#0DA86A' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold tracking-wider text-white/90">PROGRESO</span>
              <TrendingUp className="h-5 w-5 text-white/80" />
            </div>
            <p className="text-3xl font-bold leading-tight">{totalProgress}%</p>
            <p className="text-xs text-white/80 mt-0.5">Del programa</p>
          </div>

          {/* Card Tiempo */}
          <div
            className="bg-[#0284C7] text-white rounded-2xl p-4 relative overflow-hidden shadow-sm"
            style={{ backgroundColor: '#0284C7' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold tracking-wider text-white/90">TIEMPO</span>
              <Clock className="h-5 w-5 text-white/80" />
            </div>
            <p className="text-3xl font-bold leading-tight">{totalMinutes}</p>
            <p className="text-xs text-white/80 mt-0.5">Minutos entrenados</p>
          </div>

          {/* Card Meta */}
          <div
            className="bg-[#EAB308] text-white rounded-2xl p-4 relative overflow-hidden shadow-sm"
            style={{ backgroundColor: '#EAB308' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold tracking-wider text-white/90">OBJETIVO</span>
              <Scale className="h-5 w-5 text-white/80" />
            </div>
            <p className="text-3xl font-bold leading-tight">
              {targetWeight ? `${targetWeight} kg` : '—'}
            </p>
            <p className="text-xs text-white/80 mt-0.5">Peso deseado</p>
          </div>

          {/* Card Calorías Quemadas */}
          <div
            className="col-span-2 bg-[#8B5CF6] text-white rounded-2xl p-4 relative overflow-hidden shadow-sm"
            style={{ backgroundColor: '#8B5CF6' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-wider text-white/90">
                CALORÍAS QUEMADAS
              </span>
              <Zap className="h-5 w-5 text-white/80" />
            </div>
            <div className="grid grid-cols-2 gap-4 divide-x divide-white/20">
              <div>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-bold leading-tight">{caloriesStats.today}</p>
                  <span className="text-xs font-semibold text-white/80">kcal</span>
                </div>
                <p className="text-xs text-white/80 mt-0.5">Hoy</p>
              </div>
              <div className="pl-4">
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-bold leading-tight">{caloriesStats.total}</p>
                  <span className="text-xs font-semibold text-white/80">kcal</span>
                </div>
                <p className="text-xs text-white/80 mt-0.5">En total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="space-y-3 mb-6">
          <div
            onClick={() => onNavigate('/atividade-extra')}
            className="cursor-pointer transition-all flex items-center justify-between border shadow-sm hover:border-[#CB4D6D]/40"
            style={{
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              borderColor: '#E9E2E4',
              padding: '16px 20px',
              boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                className="flex items-center justify-center flex-shrink-0 text-xl"
                style={{
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  borderRadius: '9999px',
                  backgroundColor: '#F7F5F6'
                }}
              >
                🚶
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#301D23', lineHeight: 1.25 }}>
                  Actividad Extra
                </h4>
                <p style={{ fontSize: '13px', color: '#84626D', marginTop: '4px', lineHeight: 1.25 }}>
                  Acelera tus resultados (opcional)
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#84626D] flex-shrink-0" />
          </div>

          <div
            onClick={() => onNavigate('/filosofia')}
            className="cursor-pointer transition-all flex items-center justify-between border shadow-sm hover:border-[#CB4D6D]/40"
            style={{
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              borderColor: '#E9E2E4',
              padding: '16px 20px',
              boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                className="flex items-center justify-center flex-shrink-0 text-xl"
                style={{
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(203, 77, 109, 0.1)'
                }}
              >
                📖
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#301D23', lineHeight: 1.25 }}>
                  Filosofía del Entrenamiento
                </h4>
                <p style={{ fontSize: '13px', color: '#84626D', marginTop: '4px', lineHeight: 1.25 }}>
                  Conoce nuestra metodología
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#84626D] flex-shrink-0" />
          </div>

          <div
            onClick={() => onNavigate('/bonus')}
            className="cursor-pointer transition-all flex items-center justify-between border shadow-sm hover:border-[#CB4D6D]/40"
            style={{
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              borderColor: '#E9E2E4',
              padding: '16px 20px',
              boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                className="flex items-center justify-center flex-shrink-0 text-xl"
                style={{
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(203, 77, 109, 0.1)'
                }}
              >
                🎁
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#301D23', lineHeight: 1.25 }}>
                  Bonos y Contenidos
                </h4>
                <p style={{ fontSize: '13px', color: '#84626D', marginTop: '4px', lineHeight: 1.25 }}>
                  Materiales extras exclusivos
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#84626D] flex-shrink-0" />
          </div>
        </div>
      </div>
    </main>
  );
}
