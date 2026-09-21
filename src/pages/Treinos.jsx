import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { programWeeks, philosophy } from '../data/program';
import { ChevronDown, ChevronUp, Play, X, Calendar, Dumbbell, Sparkles, Clock, Flame, Check, Lock } from 'lucide-react';

export function Treinos({ onNavigate }) {
  const { state, hasTrainedToday, getNextPendingDay, theme } = useApp();
  const isDark = theme === 'dark';
  const pendingDay = getNextPendingDay ? getNextPendingDay() : (state.currentDay || 1);
  const trainedToday = hasTrainedToday ? hasTrainedToday() : false;

  const [expandedWeeks, setExpandedWeeks] = useState({
    1: true,
    2: true,
    3: true
  });
  const [showPhilosophyModal, setShowPhilosophyModal] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);

  const toggleWeek = (num) => {
    setExpandedWeeks(prev => ({ ...prev, [num]: !prev[num] }));
  };

  const renderDayItem = (day, weekData, weekNum = 1) => {
    const isCompleted = Boolean(state.progress?.[day]?.completed);
    const isPending = day === pendingDay && !isCompleted;
    const isFuture = day > pendingDay && !isCompleted;

    const categoryLabel = isPending && trainedToday
      ? 'DESBLOQUEADO MAÑANA'
      : weekData.name.toUpperCase();

    return (
      <div
        key={day}
        className={`relative transition-all flex items-center justify-between gap-4 sm:gap-6 ${isFuture ? 'opacity-70' : ''}`}
        style={{
          padding: '18px 20px',
          borderRadius: '22px',
          backgroundColor: isCompleted
            ? (isDark ? '#14261B' : '#EDF7F0')
            : isDark
            ? '#1A1417'
            : '#FFFFFF',
          border: isCompleted
            ? (isDark ? '1.5px solid #285237' : '1.5px solid #BDE3CB')
            : isPending && !trainedToday
            ? '1.5px solid #D3455B'
            : isPending && trainedToday
            ? (isDark ? '1.5px solid #6E3845' : '1.5px solid #F6D8C8')
            : (isDark ? '1px solid #2D2328' : '1px solid #E9E2E4'),
          boxShadow: isCompleted
            ? (isDark ? '0 2px 8px -2px rgba(0,0,0,0.3)' : '0 2px 8px -2px rgba(24,160,88,0.06)')
            : isPending && !trainedToday
            ? (isDark ? '0 4px 14px -2px rgba(211,69,91,0.35)' : '0 4px 14px -2px rgba(211,69,91,0.16)')
            : (isDark ? '0 2px 8px -2px rgba(0,0,0,0.2)' : '0 2px 8px -2px rgba(61,41,48,0.04)')
        }}
      >
        {isCompleted && (
          <div
            className="absolute -top-2.5 -right-2 flex items-center justify-center text-white shadow-xs z-10"
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '9999px',
              backgroundColor: '#1E9E57'
            }}
          >
            <Check className="h-3 w-3 stroke-[3]" />
          </div>
        )}

        <div className="flex-1 min-w-0 pr-2">
          <span
            className="block mb-1 tracking-wider uppercase font-semibold text-[11px]"
            style={{
              color: isCompleted
                ? (isDark ? '#7BA88B' : '#5C806A')
                : isPending && trainedToday
                ? '#D3455B'
                : isPending
                ? '#D3455B'
                : (isDark ? '#A39FA9' : '#84626D')
            }}
          >
            {categoryLabel}
          </span>
          <h4
            className="font-bold text-base leading-tight"
            style={{
              color: isCompleted
                ? (isDark ? '#E5F5EB' : '#193323')
                : (isDark ? '#F7EFF2' : '#301D23')
            }}
          >
            Día {day}
          </h4>
          <div
            className="flex items-center mt-2.5 text-xs font-medium"
            style={{
              gap: '14px',
              color: isCompleted
                ? (isDark ? '#7BA88B' : '#5C806A')
                : (isDark ? '#A39FA9' : '#84626D')
            }}
          >
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.8} />
              <span>{weekData.duration} min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.8} />
              <span>{weekData.exercises.length} ejercicios</span>
            </div>
          </div>
        </div>

        {isCompleted ? (
          <button
            onClick={() => onNavigate(`/treinos/dia/${day}`)}
            className="w-[102px] h-9 rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer flex-shrink-0 shadow-xs"
            style={{
              backgroundColor: isDark ? '#1F2E23' : '#FFFFFF',
              color: isDark ? '#7BA88B' : '#2A4533',
              border: isDark ? '1px solid #285237' : '1px solid #C4E2CF'
            }}
          >
            <span>Ver entreno</span>
          </button>
        ) : isPending && trainedToday ? (
          <button
            onClick={() => onNavigate(`/treinos/dia/${day}`)}
            className="w-[102px] h-9 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
            style={{
              backgroundColor: isDark ? 'rgba(211,69,91,0.14)' : '#FFF5F0',
              color: '#D3455B',
              border: isDark ? '1px solid rgba(211,69,91,0.3)' : '1px solid #F6D8C8'
            }}
            title="Entrenamiento desbloqueado mañana"
          >
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Mañana</span>
          </button>
        ) : isPending ? (
          <button
            onClick={() => onNavigate(`/treino/${day}`)}
            className="w-[102px] h-9 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer flex-shrink-0 text-white"
            style={{
              backgroundColor: '#D3455B',
              border: 'none',
              boxShadow: '0 4px 14px -2px rgba(211,69,91,0.45)'
            }}
          >
            <Play className="h-3 w-3 fill-current flex-shrink-0" />
            <span>Iniciar</span>
          </button>
        ) : (
          <button
            onClick={() => onNavigate(`/treinos/dia/${day}`)}
            className="w-[102px] h-9 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F7',
              color: isDark ? '#A39FA9' : '#84626D',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E9E2E4'
            }}
          >
            <Lock className="h-3 w-3 flex-shrink-0" />
            <span>Bloqueado</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen px-4 pt-4 pb-32 max-w-lg mx-auto">
      <header
        className="animate-fade-in"
        style={{
          marginBottom: '22px',
          paddingTop: '6px'
        }}
      >
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: isDark ? '#F7EFF2' : '#301D23',
            margin: 0,
            lineHeight: 1.2
          }}
        >
          Entrenamientos
        </h1>
        <p
          style={{
            fontSize: '13.5px',
            color: isDark ? '#B8A2AB' : '#84626D',
            marginTop: '8px',
            marginBottom: 0,
            lineHeight: 1.4
          }}
        >
          Programa completo de 21 días
        </p>
      </header>

      {/* Botones de acción superior */}
      <div
        className="overflow-x-auto scrollbar-hide animate-slide-up flex-nowrap"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginBottom: '26px',
          paddingBottom: '4px'
        }}
      >
        <button
          onClick={() => setShowProgramModal(true)}
          className="hover:opacity-90 active:scale-[0.98] transition-all whitespace-nowrap flex-shrink-0 cursor-pointer"
          style={{
            height: '46px',
            padding: '0 18px',
            borderRadius: '20px',
            backgroundColor: isDark ? '#1C1518' : '#FFFFFF',
            border: isDark ? '1px solid #2D2226' : '1px solid #E9E2E4',
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(61,41,48,0.05)',
            fontSize: '13px',
            fontWeight: 600,
            color: isDark ? '#F7EFF2' : '#301D23',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <Calendar style={{ width: '16px', height: '16px', color: '#CB4D6D' }} />
          <span>Ver Programa</span>
        </button>

        <button
          onClick={() => onNavigate('/treinos/exercicios')}
          className="hover:opacity-90 active:scale-[0.98] transition-all whitespace-nowrap flex-shrink-0 cursor-pointer"
          style={{
            height: '46px',
            padding: '0 18px',
            borderRadius: '20px',
            backgroundColor: isDark ? '#1C1518' : '#FFFFFF',
            border: isDark ? '1px solid #2D2226' : '1px solid #E9E2E4',
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(61,41,48,0.05)',
            fontSize: '13px',
            fontWeight: 600,
            color: isDark ? '#F7EFF2' : '#301D23',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>💪</span>
          <span>Todos los Ejercicios</span>
        </button>

        <button
          onClick={() => onNavigate('/filosofia')}
          className="hover:opacity-90 active:scale-[0.98] transition-all whitespace-nowrap flex-shrink-0 cursor-pointer"
          style={{
            height: '46px',
            padding: '0 18px',
            borderRadius: '20px',
            backgroundColor: isDark ? '#1C1518' : '#FFFFFF',
            border: isDark ? '1px solid #2D2226' : '1px solid #E9E2E4',
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(61,41,48,0.05)',
            fontSize: '13px',
            fontWeight: 600,
            color: isDark ? '#F7EFF2' : '#301D23',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>🧘</span>
          <span>Filosofía</span>
        </button>
      </div>

      {/* Semanas Acordeón */}
      <div className="space-y-4 animate-slide-up">
        {/* Semana 1 */}
        <div
          className="shadow-sm overflow-hidden"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #E9E2E4',
            boxShadow: '0 2px 8px -2px rgba(61,41,48,0.05)'
          }}
        >
          <button
            onClick={() => toggleWeek(1)}
            className="w-full flex items-center justify-between hover:bg-black/2 transition-colors cursor-pointer"
            style={{ padding: '16px 20px' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-full text-white font-bold text-sm flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#CB4D6D' }}
              >
                1
              </div>
              <div className="text-left">
                <h3 className="font-bold text-[15px] text-[#301D23] leading-tight">Semana 1</h3>
                <p className="text-[12px] text-[#84626D] mt-0.5">Adaptación</p>
              </div>
            </div>
            {expandedWeeks[1] ? (
              <ChevronDown className="h-5 w-5 text-[#84626D]" />
            ) : (
              <ChevronDown className="h-5 w-5 text-[#84626D] -rotate-90 transition-transform" />
            )}
          </button>

          {expandedWeeks[1] && (
            <div className="px-4 pb-4 pt-1 flex flex-col gap-3">
              {[1, 2, 3, 4, 5, 6, 7].map(day => renderDayItem(day, programWeeks.week1, 1))}
            </div>
          )}
        </div>

        {/* Semana 2 */}
        <div
          className="shadow-sm overflow-hidden"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #E9E2E4',
            boxShadow: '0 2px 8px -2px rgba(61,41,48,0.05)'
          }}
        >
          <button
            onClick={() => toggleWeek(2)}
            className="w-full flex items-center justify-between hover:bg-black/2 transition-colors cursor-pointer"
            style={{ padding: '16px 20px' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-full text-white font-bold text-sm flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#0DA86A' }}
              >
                2
              </div>
              <div className="text-left">
                <h3 className="font-bold text-[15px] text-[#301D23] leading-tight">Semana 2</h3>
                <p className="text-[12px] text-[#84626D] mt-0.5">Activación</p>
              </div>
            </div>
            {expandedWeeks[2] ? (
              <ChevronDown className="h-5 w-5 text-[#84626D]" />
            ) : (
              <ChevronDown className="h-5 w-5 text-[#84626D] -rotate-90 transition-transform" />
            )}
          </button>

          {expandedWeeks[2] && (
            <div className="px-4 pb-4 pt-1 flex flex-col gap-3">
              {[8, 9, 10, 11, 12, 13, 14].map(day => renderDayItem(day, programWeeks.week2, 2))}
            </div>
          )}
        </div>

        {/* Semana 3 */}
        <div
          className="shadow-sm overflow-hidden"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #E9E2E4',
            boxShadow: '0 2px 8px -2px rgba(61,41,48,0.05)'
          }}
        >
          <button
            onClick={() => toggleWeek(3)}
            className="w-full flex items-center justify-between hover:bg-black/2 transition-colors cursor-pointer"
            style={{ padding: '16px 20px' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-full text-white font-bold text-sm flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#0284C7' }}
              >
                3
              </div>
              <div className="text-left">
                <h3 className="font-bold text-[15px] text-[#301D23] leading-tight">Semana 3</h3>
                <p className="text-[12px] text-[#84626D] mt-0.5">Intensificación</p>
              </div>
            </div>
            {expandedWeeks[3] ? (
              <ChevronDown className="h-5 w-5 text-[#84626D]" />
            ) : (
              <ChevronDown className="h-5 w-5 text-[#84626D] -rotate-90 transition-transform" />
            )}
          </button>

          {expandedWeeks[3] && (
            <div className="px-4 pb-4 pt-1 flex flex-col gap-3">
              {[15, 16, 17, 18, 19, 20, 21].map(day => renderDayItem(day, programWeeks.week3, 3))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Filosofía */}
      {showPhilosophyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl max-w-md w-full p-6 shadow-xl border border-border max-h-[85vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">La Filosofía del Método</h2>
              <button
                onClick={() => setShowPhilosophyModal(false)}
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 mb-6">
              {philosophy.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-muted/40 border border-border/40">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-5 w-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowPhilosophyModal(false)}
              className="w-full h-11 rounded-xl bg-[#D3455B] text-white font-semibold text-sm shadow-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal Ver Programa */}
      {showProgramModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl max-w-md w-full p-6 shadow-xl border border-border max-h-[85vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Visión General del Programa</h2>
              <button
                onClick={() => setShowProgramModal(false)}
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-muted-foreground mb-6">
              <p>
                El <strong>Programa 21 Días Calistenia Asiática</strong> fue diseñado para crear una transformación metabólica progresiva a través de la constancia y movimientos fluidos con el propio peso corporal.
              </p>
              <div className="p-3 bg-muted/40 rounded-xl space-y-2">
                <p><strong>Semana 1:</strong> 15 min al día (30s ejercicio / 15s descanso). Enfoque en el aprendizaje y coordinación.</p>
                <p><strong>Semana 2:</strong> 20 min al día (40s ejercicio / 15s descanso). Aumento de quema calórica.</p>
                <p><strong>Semana 3:</strong> 25 min al día (45s ejercicio / 10s descanso en 2 circuitos). Intensificación máxima.</p>
              </div>
            </div>
            <button
              onClick={() => setShowProgramModal(false)}
              className="w-full h-11 rounded-xl bg-[#D3455B] text-white font-semibold text-sm shadow-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
