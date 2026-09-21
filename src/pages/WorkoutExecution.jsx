import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getWorkoutForDay } from '../data/program';
import { getExerciseById } from '../data/exercises';
import { playTickBeep, playSuccessChime } from '../utils/audio';
import confetti from 'canvas-confetti';
import { X, Play, Pause, ChevronLeft, ChevronRight, CheckCircle, Flame, Clock, Lock } from 'lucide-react';

export function WorkoutExecution({ dayNumber, onNavigate }) {
  const { completeDay, state, hasTrainedToday, getNextPendingDay, canStartWorkout } = useApp();
  const day = parseInt(dayNumber, 10) || 1;
  const workout = getWorkoutForDay(day);

  const isCompletedAlready = Boolean(state.progress?.[day]?.completed);
  const pendingDay = getNextPendingDay ? getNextPendingDay() : (state.currentDay || 1);
  const trainedToday = hasTrainedToday ? hasTrainedToday() : false;
  const isBlocked = !isCompletedAlready && (canStartWorkout ? !canStartWorkout(day) : false);

  const TOTAL_SETS = 3;
  const EXERCISE_TIME = 30;
  const REST_TIME = 15;

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXERCISE_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [elapsedTotal, setElapsedTotal] = useState(0);

  const timerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive, exerciseIndex, isResting]);

  const currentExerciseId = workout.exercises[exerciseIndex];
  const currentExercise = getExerciseById(currentExerciseId) || {
    name: 'Ejercicio',
    description: 'Movimiento de calistenia fluida',
    videoUrl: '/videos/Prancha_Lotus.mp4',
    muscleGroups: ['Core']
  };

  // Remaining upcoming exercises
  const upcomingExercises = workout.exercises
    .slice(exerciseIndex + 1)
    .map(id => getExerciseById(id))
    .filter(Boolean);

  const caloriesBurned = Math.round((elapsedTotal / 60) * 8.5);

  // Timer Effect
  useEffect(() => {
    if (!isActive || isCompleted) return;

    timerRef.current = setInterval(() => {
      setElapsedTotal(prev => prev + 1);
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (!isResting) {
            // Completed an active session (30s)
            playSuccessChime();
            setIsResting(true);
            return REST_TIME;
          } else {
            // Completed a rest period (15s)
            playSuccessChime();
            setIsResting(false);
            if (currentSet < TOTAL_SETS) {
              setCurrentSet(s => s + 1);
              return EXERCISE_TIME;
            } else {
              // Completed all 3 sets of this exercise
              if (exerciseIndex + 1 >= workout.exercises.length) {
                handleWorkoutComplete();
                return 0;
              } else {
                setExerciseIndex(idx => idx + 1);
                setCurrentSet(1);
                return EXERCISE_TIME;
              }
            }
          }
        }

        if (prev <= 4 && prev > 1) {
          playTickBeep();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isActive, isResting, currentSet, exerciseIndex, isCompleted, workout]);

  const handleWorkoutComplete = () => {
    setIsCompleted(true);
    setIsActive(false);
    playSuccessChime();

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    completeDay(day, {
      durationSeconds: elapsedTotal,
      calories: caloriesBurned
    });
  };

  const handleSkipNext = () => {
    if (isResting) {
      setIsResting(false);
      if (currentSet < TOTAL_SETS) {
        setCurrentSet(s => s + 1);
        setTimeLeft(EXERCISE_TIME);
      } else {
        if (exerciseIndex + 1 >= workout.exercises.length) {
          handleWorkoutComplete();
        } else {
          setExerciseIndex(idx => idx + 1);
          setCurrentSet(1);
          setTimeLeft(EXERCISE_TIME);
        }
      }
      playSuccessChime();
    } else {
      setIsResting(true);
      setTimeLeft(REST_TIME);
      playSuccessChime();
    }
  };

  const handleSkipPrev = () => {
    if (isResting) {
      setIsResting(false);
      setTimeLeft(EXERCISE_TIME);
    } else {
      if (currentSet > 1) {
        setCurrentSet(s => s - 1);
        setTimeLeft(EXERCISE_TIME);
      } else if (exerciseIndex > 0) {
        setExerciseIndex(idx => idx - 1);
        setCurrentSet(TOTAL_SETS);
        setTimeLeft(EXERCISE_TIME);
      }
    }
  };

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Guard: If workout is blocked (daily limit reached or previous days not finished)
  if (isBlocked) {
    const isTodayBlocked = day === pendingDay && trainedToday;
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center px-6 py-8 max-w-md mx-auto text-center animate-fade-in">
        <div
          className="h-20 w-20 rounded-full flex items-center justify-center mb-6 shadow-md"
          style={{
            backgroundColor: isTodayBlocked ? '#FFF0F3' : '#F5F5F7',
            color: isTodayBlocked ? '#D3455B' : '#84626D'
          }}
        >
          {isTodayBlocked ? <Clock className="h-10 w-10" /> : <Lock className="h-10 w-10" />}
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-[#D3455B] mb-2">
          {isTodayBlocked ? 'Límite: 1 Entrenamiento por Día' : 'Entrenamiento Bloqueado'}
        </span>

        <h2 className="text-2xl font-bold text-foreground mb-3 font-display">
          {isTodayBlocked ? '¡Entrenamiento de hoy ya realizado! 🌸' : `Día ${day} aún bloqueado`}
        </h2>

        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          {isTodayBlocked
            ? `Ya completaste tu sesión diaria de entrenamiento. Para una recuperación muscular adecuada y consistencia real, ¡el Día ${day} se desbloqueará mañana!`
            : `Debes completar el Día ${pendingDay} antes de poder iniciar el Día ${day}. ¡Sigue el programa paso a paso!`}
        </p>

        <div className="w-full space-y-3">
          <button
            onClick={() => onNavigate('/')}
            className="w-full h-12 rounded-2xl bg-[#D3455B] text-white font-semibold flex items-center justify-center shadow-md hover:opacity-90 transition-all"
            style={{ backgroundColor: '#D3455B' }}
          >
            Volver al Inicio
          </button>
          <button
            onClick={() => onNavigate('/treinos')}
            className="w-full h-12 rounded-2xl bg-muted text-foreground font-semibold flex items-center justify-center hover:bg-muted/80 transition-all"
          >
            Ver Entrenamientos
          </button>
        </div>
      </div>
    );
  }

  // Completion screen
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-8 max-w-md mx-auto text-center animate-scale-in">
        <div className="h-20 w-20 rounded-full bg-[#D3455B] flex items-center justify-center text-white mb-6 shadow-md animate-pulse">
          <CheckCircle className="h-10 w-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-[#D3455B] mb-2">
          ¡Felicitaciones!
        </span>
        <h1 className="text-3xl font-bold text-foreground mb-2">¡Entrenamiento Concluido! 🌸</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Completaste el Día {day} del programa Calistenia Asiática.
        </p>

        <div className="grid grid-cols-2 gap-3 w-full mb-8">
          <div className="bg-card rounded-2xl p-4 shadow-card border border-border flex flex-col items-center">
            <Clock className="h-5 w-5 text-[#D3455B] mb-1" />
            <span className="text-2xl font-bold text-foreground">
              {Math.max(1, Math.round(elapsedTotal / 60))} min
            </span>
            <span className="text-xs text-muted-foreground">Tiempo total</span>
          </div>

          <div className="bg-card rounded-2xl p-4 shadow-card border border-border flex flex-col items-center">
            <Flame className="h-5 w-5 text-destructive mb-1" />
            <span className="text-2xl font-bold text-foreground">{caloriesBurned + 100} kcal</span>
            <span className="text-xs text-muted-foreground">Calorías estimadas</span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/')}
          className="w-full h-12 rounded-2xl bg-[#D3455B] text-white font-semibold text-sm shadow-md"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto px-4 pt-4 pb-12 select-none">
      {/* Top close button */}
      <div className="flex justify-end mb-3">
        <button
          onClick={() => onNavigate('/treinos')}
          className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cerrar entrenamiento"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Square Video Card */}
      <div className="relative aspect-square max-w-[340px] w-full mx-auto rounded-3xl overflow-hidden bg-black flex items-center justify-center shadow-lg mb-4">
        {isResting ? (
          <div className="text-center p-6 text-white animate-scale-in">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D3455B] mb-2 block">
              Descanso
            </span>
            <h2 className="text-3xl font-bold mb-2">Respira</h2>
            <p className="text-xs text-white/80">Recupera el aliento para el siguiente movimiento</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            key={currentExercise.videoUrl}
            src={currentExercise.videoUrl}
            loop
            muted
            playsInline
            className="w-full h-full object-contain"
          />
        )}

        {/* Circular play icon overlay */}
        <div
          onClick={() => setIsActive(!isActive)}
          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/10"
        >
          <div
            className="h-16 w-16 rounded-full bg-white/90 text-[#D3455B] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
            style={{ color: '#D3455B' }}
          >
            {isActive ? (
              <Pause className="h-7 w-7 fill-current" />
            ) : (
              <Play className="h-7 w-7 fill-current ml-1" />
            )}
          </div>
        </div>
      </div>

      {/* Segmented Progress Bar */}
      <div className="flex gap-1.5 max-w-[340px] mx-auto w-full mb-4">
        {workout.exercises.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i === exerciseIndex
                ? 'bg-[#D3455B]'
                : i < exerciseIndex
                ? 'bg-[#D3455B]/50'
                : 'bg-muted'
            }`}
            style={
              i === exerciseIndex
                ? { backgroundColor: '#D3455B' }
                : i < exerciseIndex
                ? { backgroundColor: 'rgba(211, 69, 91, 0.5)' }
                : {}
            }
          />
        ))}
      </div>

      {/* Exercise Info & Timer */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <span className="text-xs text-muted-foreground font-medium">
            Ejercicio {exerciseIndex + 1} de {workout.exercises.length}
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold"
            style={{ backgroundColor: '#FDF0E6', color: '#D3455B' }}
          >
            Serie {currentSet} de {TOTAL_SETS}
          </span>
        </div>

        {/* 3 mini set indicator bars */}
        <div className="flex items-center justify-center gap-1.5 mb-2.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: s === currentSet ? '22px' : '9px',
                backgroundColor:
                  s === currentSet
                    ? '#D3455B'
                    : s < currentSet
                    ? 'rgba(211, 69, 91, 0.45)'
                    : '#E5E7EB'
              }}
            />
          ))}
        </div>

        <h2 className="text-xl font-bold text-foreground mb-1">
          {isResting ? 'Descanso' : currentExercise.name}
        </h2>

        {isResting && (
          <p className="text-xs font-semibold mb-3" style={{ color: '#D3455B' }}>
            {currentSet < TOTAL_SETS
              ? `Siguiente: Serie ${currentSet + 1} de ${TOTAL_SETS}`
              : exerciseIndex + 1 < workout.exercises.length
              ? `Siguiente: ${getExerciseById(workout.exercises[exerciseIndex + 1])?.name || 'Ejercicio'} (Serie 1)`
              : '¡Último descanso antes de concluir!'}
          </p>
        )}

        {/* 3-Column Timer Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.3fr 1fr',
            alignItems: 'center',
            width: '100%',
            maxWidth: '320px',
            margin: '0 auto'
          }}
          className="mb-4"
        >
          {/* Transcurrido */}
          <div className="text-center flex flex-col items-center justify-center">
            <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block whitespace-nowrap">
              TRANSCURRIDO
            </span>
            <span className="text-sm sm:text-base font-bold text-foreground mt-1 block tabular-nums">
              {formatSeconds(elapsedTotal)}
            </span>
          </div>

          {/* Countdown Timer */}
          <div
            className="text-5xl sm:text-6xl font-display font-bold tabular-nums text-center leading-none"
            style={{ color: '#D3455B' }}
          >
            {formatSeconds(timeLeft)}
          </div>

          {/* Cal */}
          <div className="text-center flex flex-col items-center justify-center">
            <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block whitespace-nowrap">
              CAL
            </span>
            <span className="text-sm sm:text-base font-bold text-foreground mt-1 block tabular-nums">
              {caloriesBurned}
            </span>
          </div>
        </div>

        {/* Play/Pause Button */}
        <div className="flex justify-center mb-5">
          <button
            onClick={() => setIsActive(!isActive)}
            className="h-12 w-12 rounded-full bg-[#D3455B] text-white flex items-center justify-center shadow-md hover:opacity-90 active:scale-95 transition-all"
            style={{ backgroundColor: '#D3455B' }}
            aria-label={isActive ? "Pausar" : "Iniciar"}
          >
            {isActive ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
          </button>
        </div>

        {/* Botones Anterior / Siguiente */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px'
          }}
          className="mb-8"
        >
          <button
            onClick={handleSkipPrev}
            disabled={exerciseIndex === 0 && currentSet === 1 && !isResting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '9999px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E9E2E4',
              color: exerciseIndex === 0 && currentSet === 1 && !isResting ? '#B5A8AC' : '#5C4049',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              cursor: exerciseIndex === 0 && currentSet === 1 && !isResting ? 'not-allowed' : 'pointer',
              opacity: exerciseIndex === 0 && currentSet === 1 && !isResting ? 0.45 : 1,
              transition: 'all 0.15s'
            }}
          >
            <ChevronLeft style={{ width: '14px', height: '14px' }} strokeWidth={2.5} />
            <span>Anterior</span>
          </button>

          <button
            onClick={handleSkipNext}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '9999px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E9E2E4',
              color: '#301D23',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <span>Siguiente</span>
            <ChevronRight style={{ width: '14px', height: '14px' }} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Lista de próximos ejercicios */}
      {upcomingExercises.length > 0 && (
        <div className="max-w-[340px] mx-auto w-full pb-10">
          <h4 className="text-xs font-bold text-muted-foreground mb-3 px-1">
            Próximos ejercicios ({upcomingExercises.length})
          </h4>
          <div className="space-y-2.5">
            {upcomingExercises.map((ex, idx) => {
              const exerciseNumber = exerciseIndex + idx + 2;
              return (
                <div
                  key={ex.id || idx}
                  className="transition-all hover:border-[#CB4D6D]/40"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1px solid #E9E2E4',
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    boxShadow: '0 2px 6px -2px rgba(61,41,48,0.04)'
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      minWidth: '38px',
                      borderRadius: '9999px',
                      backgroundColor: '#111111',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 700 }}>
                      {exerciseNumber}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h5
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: '#26171C',
                        margin: 0,
                        lineHeight: 1.3,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {ex.name}
                    </h5>
                    <p style={{ fontSize: '12px', color: '#84626D', margin: '3px 0 0 0', lineHeight: 1.2 }}>
                      3 series de 30s • 15s descanso
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
