import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getWorkoutForDay, programWeeks } from '../data/program';
import { getExerciseById } from '../data/exercises';
import { ArrowLeft, Clock, Flame, Play, Info, X, Lock, CheckCircle2 } from 'lucide-react';

export function WorkoutDayPreview({ dayNumber, onNavigate }) {
  const { state, hasTrainedToday, getNextPendingDay, canStartWorkout } = useApp();
  const day = parseInt(dayNumber, 10) || 1;
  const workout = getWorkoutForDay(day);

  const [selectedExercise, setSelectedExercise] = useState(null);

  const isCompleted = Boolean(state.progress?.[day]?.completed);
  const pendingDay = getNextPendingDay ? getNextPendingDay() : (state.currentDay || 1);
  const trainedToday = hasTrainedToday ? hasTrainedToday() : false;
  const isAllowedToStart = canStartWorkout ? canStartWorkout(day) : false;

  // Determine week info
  let weekNum = 1;
  let weekInfo = programWeeks.week1;
  if (day > 14) {
    weekNum = 3;
    weekInfo = programWeeks.week3;
  } else if (day > 7) {
    weekNum = 2;
    weekInfo = programWeeks.week2;
  }

  const exercises = workout.exercises
    .map(id => getExerciseById(id))
    .filter(Boolean);

  return (
    <main className="min-h-screen px-4 pt-4 pb-32 max-w-lg mx-auto select-none animate-fade-in">
      {/* Top navigation header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => onNavigate('/treinos')}
          className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-muted/50 text-foreground transition-colors"
          aria-label="Volver a entrenamientos"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <span className="text-xs text-muted-foreground block font-medium">Día {day}</span>
          <h1 className="text-xl font-bold tracking-tight text-foreground font-display">
            {weekInfo.name}
          </h1>
        </div>
      </div>

      {/* 2 Top Stat Cards matching screenshot 4 */}
      <div className="grid grid-cols-2 gap-3 mb-4 animate-slide-up">
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
            <Clock className="h-4 w-4" />
            <span>Duración</span>
          </div>
          <p className="text-xl font-bold text-foreground">{workout.duration} min</p>
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
            <Flame className="h-4 w-4" />
            <span>Ejercicios</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {workout.exercises.length} <span className="text-xs font-normal text-muted-foreground">(3 series)</span>
          </p>
        </div>
      </div>

      {/* Status Alert if already trained today or day is locked */}
      {day === pendingDay && trainedToday ? (
        <div
          className="bg-[#FFF0F3] text-[#9E2A3B] border border-[#FAD2DA] rounded-2xl p-3.5 px-4 mb-4 flex items-start text-xs font-medium animate-slide-up"
          style={{ gap: '10px' }}
        >
          <Clock className="h-4 w-4 text-[#D3455B] flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm mb-0.5">¡Ya entrenaste hoy! 🌸</span>
            <span>
              Para una recuperación muscular óptima y resultados duraderos, el Día {day} estará disponible a partir de mañana.
            </span>
          </div>
        </div>
      ) : day > pendingDay && !isCompleted ? (
        <div
          className="bg-muted/60 text-muted-foreground border border-border rounded-2xl p-3.5 px-4 mb-4 flex items-start text-xs font-medium animate-slide-up"
          style={{ gap: '10px' }}
        >
          <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm mb-0.5 text-foreground">Entrenamiento Bloqueado</span>
            <span>
              Completa el Día {pendingDay} primero para desbloquear los siguientes entrenamientos. El programa avanza paso a paso.
            </span>
          </div>
        </div>
      ) : null}

      {/* Tip Banner matching screenshot 4 */}
      <div
        className="bg-[#FDF0E6] text-[#7A4B3A] rounded-2xl p-3.5 px-4 mb-5 flex items-center text-xs font-medium animate-slide-up"
        style={{ gap: '10px' }}
      >
        <span className="text-sm flex-shrink-0">💡</span>
        <span>Cada ejercicio consta de 3 series de 30s con 15s de descanso entre ellas.</span>
      </div>

      {/* Section Title */}
      <div className="mb-3.5">
        <h2 className="text-sm font-bold text-foreground">Ejercicios</h2>
      </div>

      {/* Exercise Cards matching screenshot 4 */}
      <div className="space-y-4 mb-6">
        {exercises.map((ex, idx) => (
          <div
            key={ex.id || idx}
            className="bg-card rounded-3xl p-4 shadow-card border border-border/50 animate-slide-up overflow-hidden"
          >
            {/* Square video preview */}
            <div
              className="relative aspect-square w-full rounded-2xl overflow-hidden flex items-center justify-center mb-3"
              style={{ backgroundColor: '#F5F5F7', borderRadius: '20px' }}
            >
              <video
                src={ex.videoUrl}
                muted
                loop
                playsInline
                className="w-full h-full object-contain mx-auto"
              />
              <div
                onClick={() => setSelectedExercise(ex)}
                className="absolute inset-0 flex items-center justify-center bg-black/10 cursor-pointer hover:bg-black/20 transition-all"
              >
                <div className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm text-[#CB4D6D] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all">
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </div>
              </div>
            </div>

            {/* Exercise Details */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="text-base font-bold text-foreground">{ex.name}</h3>
              <span
                className="text-xs font-bold whitespace-nowrap px-2 py-0.5 rounded-full"
                style={{ color: '#D3455B', backgroundColor: '#FDF0E6' }}
              >
                3x 30s
              </span>
            </div>

            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              {ex.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {ex.muscleGroups?.map(mg => (
                  <span
                    key={mg}
                    className="px-2.5 py-1 rounded-lg bg-muted/60 text-[11px] font-medium text-muted-foreground"
                  >
                    {mg}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setSelectedExercise(ex)}
                className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Ver detalles"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>

            {/* Iniciar Treino button inside card matching screenshot 4 */}
            {isCompleted ? (
              <div className="w-full h-11 rounded-2xl bg-[#EDF7F0] text-[#193323] border border-[#BDE3CB] font-semibold text-xs flex items-center justify-center gap-2 mt-4">
                <CheckCircle2 className="h-4 w-4 text-[#1E9E57]" />
                <span>Entrenamiento Ya Completado ✓</span>
              </div>
            ) : isAllowedToStart ? (
              <button
                onClick={() => onNavigate(`/treino/${day}`)}
                className="w-full h-11 rounded-2xl bg-[#D3455B] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-[0.99] transition-all mt-4"
                style={{ backgroundColor: '#D3455B' }}
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Iniciar Entrenamiento</span>
              </button>
            ) : day === pendingDay && trainedToday ? (
              <button
                disabled
                className="w-full h-11 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 cursor-not-allowed border mt-4"
                style={{
                  backgroundColor: '#F5F5F7',
                  borderColor: '#E5E7EB',
                  color: '#84626D'
                }}
              >
                <Clock className="h-3.5 w-3.5 text-[#84626D]" />
                <span>Disponible Mañana</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full h-11 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 cursor-not-allowed border mt-4 opacity-75"
                style={{
                  backgroundColor: '#F5F5F7',
                  borderColor: '#E5E7EB',
                  color: '#84626D'
                }}
              >
                <Lock className="h-3.5 w-3.5 text-[#84626D]" />
                <span>Bloqueado (Completa el Día {pendingDay})</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Exercise Modal if info clicked */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-3xl p-5 shadow-2xl border border-border animate-scale-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-foreground">{selectedExercise.name}</h3>
              <button
                onClick={() => setSelectedExercise(null)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-black mb-3 flex items-center justify-center">
              <video
                src={selectedExercise.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-xs text-muted-foreground mb-4">{selectedExercise.description}</p>

            {isAllowedToStart ? (
              <button
                onClick={() => {
                  setSelectedExercise(null);
                  onNavigate(`/treino/${day}`);
                }}
                className="w-full h-11 rounded-2xl bg-[#D3455B] text-white font-semibold text-sm shadow-md"
                style={{ backgroundColor: '#D3455B' }}
              >
                Iniciar Este Entrenamiento
              </button>
            ) : (
              <button
                onClick={() => setSelectedExercise(null)}
                className="w-full h-11 rounded-2xl bg-muted text-foreground font-semibold text-sm"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
