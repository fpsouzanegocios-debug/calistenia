import React, { useState } from 'react';
import { ArrowLeft, Check, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ACTIVITIES = [
  {
    id: 'caminhada',
    name: 'Caminata',
    duration: '30 a 60 minutos',
    calories: '150–300 kcal',
    icon: '🚶',
    minMinutes: 30,
    minCalories: 180
  },
  {
    id: 'bicicleta',
    name: 'Bicicleta',
    duration: '30 a 60 minutos',
    calories: '200–400 kcal',
    icon: '🚴',
    minMinutes: 30,
    minCalories: 250
  },
  {
    id: 'corrida',
    name: 'Trote Ligero',
    duration: '20 a 40 minutos',
    calories: '200–350 kcal',
    icon: '🏃',
    minMinutes: 20,
    minCalories: 220
  }
];

export function AtividadeExtra({ onNavigate }) {
  const { state, logExtraActivity } = useApp();
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    if (!selectedActivity) return;
    const act = ACTIVITIES.find(a => a.id === selectedActivity);
    if (act && logExtraActivity) {
      logExtraActivity({
        id: act.id,
        name: act.name,
        calories: act.minCalories || 200
      });
    }
    setCompleted(true);
  };

  return (
    <main className="min-h-screen px-4 pt-4 pb-24 max-w-lg mx-auto select-none bg-white">
      {/* Header matching original app */}
      <header className="flex items-center gap-3 animate-fade-in" style={{ marginBottom: '22px' }}>
        <button
          onClick={() => onNavigate('/')}
          className="h-9 w-9 rounded-full flex items-center justify-center text-foreground hover:bg-muted/40 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Actividades Extra</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Acelera tus resultados</p>
        </div>
      </header>

      {/* Tip Banner matching Image 2 */}
      <div
        className="mb-8 animate-slide-up flex items-start"
        style={{
          backgroundColor: '#FDF0E6',
          color: '#7A4B3A',
          borderRadius: '24px',
          padding: '18px 24px',
          fontSize: '13.5px',
          lineHeight: '1.5',
          fontWeight: 400,
          gap: '12px'
        }}
      >
        <span className="text-base flex-shrink-0" style={{ lineHeight: '1.4' }}>💡</span>
        <span className="flex-1">
          Si deseas acelerar tus resultados, añade una actividad extra. Si no, el entrenamiento principal ya es suficiente.
        </span>
      </div>

      {completed ? (
        /* Image 2: Atividade Concluída view */
        <div className="pt-8 pb-14 flex flex-col items-center justify-center text-center animate-scale-in">
          {/* Green circle with checkmark badge */}
          <div
            className="flex items-center justify-center mb-6"
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '9999px',
              backgroundColor: '#E6F4EA'
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '9999px',
                border: '2.5px solid #23A26D',
                color: '#23A26D'
              }}
            >
              <Check className="h-5 w-5 stroke-[3]" />
            </div>
          </div>

          {/* Title */}
          <h2
            className="font-bold mb-2 flex items-center justify-center gap-2"
            style={{
              fontSize: '22px',
              color: '#1E1418',
              lineHeight: 1.25
            }}
          >
            <span>¡Actividad Completada!</span>
            <span>🎉</span>
          </h2>

          {/* Subtitle */}
          <p
            className="mb-8"
            style={{
              fontSize: '15px',
              color: '#7A666D',
              fontWeight: 400,
              lineHeight: 1.4
            }}
          >
            ¡Felicitaciones por dar un paso más hoy. Cada paso cuenta!
          </p>

          {/* Voltar ao Início button */}
          <button
            onClick={() => onNavigate('/')}
            className="rounded-full transition-all cursor-pointer hover:bg-slate-50 active:scale-[0.98]"
            style={{
              height: '46px',
              padding: '0 32px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E9E2E4',
              borderRadius: '9999px',
              color: '#301D23',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            Volver al Inicio
          </button>
        </div>
      ) : (
        /* Image 1: Escolha uma atividade view */
        <>
          <div className="mb-3 animate-slide-up">
            <h2 className="text-sm font-bold text-foreground">
              Elige una actividad (opcional)
            </h2>
          </div>

          <div className="space-y-3 mb-6 animate-slide-up">
            {ACTIVITIES.map((act) => {
              const isSelected = selectedActivity === act.id;
              return (
                <div
                  key={act.id}
                  onClick={() => setSelectedActivity(act.id)}
                  className="transition-all cursor-pointer flex items-center justify-between shadow-sm border"
                  style={{
                    borderRadius: '24px',
                    backgroundColor: '#FFFFFF',
                    borderColor: isSelected ? '#CB4D6D' : '#E9E2E4',
                    borderWidth: isSelected ? '1.5px' : '1px',
                    padding: '16px 20px',
                    boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Icon Container */}
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
                      {act.icon}
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 min-w-0">
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#301D23', lineHeight: 1.25 }}>
                        {act.name}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#84626D', marginTop: '4px', lineHeight: 1.25 }}>
                        {act.duration}
                      </p>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#CB4D6D', marginTop: '2px' }}>
                        {act.calories}
                      </p>
                    </div>
                  </div>

                  {/* Radio Indicator */}
                  {isSelected && (
                    <div
                      className="h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: '#CB4D6D', color: '#CB4D6D' }}
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Button matching Image 1 */}
          <button
            onClick={handleComplete}
            disabled={!selectedActivity}
            className="w-full h-12 rounded-2xl font-semibold text-xs flex items-center justify-center transition-all shadow-sm text-white hover:opacity-95 active:scale-[0.99] disabled:opacity-40"
            style={{ backgroundColor: '#D3455B' }}
          >
            Marcar como Completada
          </button>
        </>
      )}
    </main>
  );
}
