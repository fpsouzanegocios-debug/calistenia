import React, { useState, useEffect } from 'react';
import { Sparkles, Leaf, Flame, Scale, Check, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';

const CALCULATION_STEPS = [
  {
    id: 'biometrics',
    title: 'Evaluando perfil biométrico',
    subtitle: 'Calculando Tasa Metabólica Basal (TMB) y gasto energético',
    icon: Flame
  },
  {
    id: 'deficit',
    title: 'Calibrando déficit calórico inteligente',
    subtitle: 'Optimizando quema de grasa sin comprometer masa muscular',
    icon: Scale
  },
  {
    id: 'preferences',
    title: 'Filtrando preferencias y restricciones',
    subtitle: 'Excluyendo alérgenos y seleccionando alimentos saludables',
    icon: Leaf
  },
  {
    id: 'macros',
    title: 'Balance de macronutrientes Yin-Yang',
    subtitle: 'Distribuyendo proteínas limpias, grasas buenas y carbohidratos',
    icon: Sparkles
  },
  {
    id: 'meals',
    title: 'Estructurando menú de 7 días',
    subtitle: 'Organizando 5 tiempos de comida diarios con recetas adaptadas',
    icon: ShieldCheck
  }
];

export function DietProcessingModal({ isOpen, onComplete, userProfile }) {
  const [progress, setProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setActiveStepIndex(0);
      return;
    }

    // Realistic calculation animation over ~3.4s
    const startTime = Date.now();
    const duration = 3400; // 3.4 seconds total

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));

      setProgress(pct);

      if (pct < 22) {
        setActiveStepIndex(0);
      } else if (pct < 45) {
        setActiveStepIndex(1);
      } else if (pct < 68) {
        setActiveStepIndex(2);
      } else if (pct < 90) {
        setActiveStepIndex(3);
      } else {
        setActiveStepIndex(4);
      }

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete?.();
        }, 650);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  const radius = 48;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none animate-fade-in"
      style={{
        backgroundColor: 'rgba(26, 17, 21, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div
        className="w-full max-w-[430px] rounded-[28px] overflow-hidden shadow-2xl animate-scale-up"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #F2E7E9',
          boxShadow: '0 25px 50px -12px rgba(48, 29, 35, 0.25)',
          padding: '28px 24px'
        }}
      >
        {/* Top Header Badge */}
        <div className="flex flex-col items-center text-center">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold mb-3 shadow-xs"
            style={{
              backgroundColor: '#FFF0F3',
              color: '#CB4D6D',
              border: '1px solid #FAD8DF'
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#CB4D6D] animate-pulse" />
            <span>Algoritmo Nutricional Calistenia Asiática</span>
          </div>

          <h2
            className="text-[20px] font-bold text-[#301D23] leading-tight"
            style={{ letterSpacing: '-0.02em' }}
          >
            {progress >= 100 ? '¡Plan Nutricional Listo!' : 'Calculando tu Plan Nutricional'}
          </h2>

          <p className="text-[13px] text-[#84626D] mt-1 px-2 leading-relaxed">
            {progress >= 100
              ? 'Optimizamos cada caloría y porción para tu meta.'
              : 'Procesando tu perfil metabólico y estructurando tu menú personalizado.'}
          </p>
        </div>

        {/* Circular Progress Gauge */}
        <div className="flex flex-col items-center justify-center my-6">
          <div className="relative flex items-center justify-center">
            {/* Pulsing ring background */}
            <div
              className="absolute rounded-full -inset-2 opacity-25 animate-ping pointer-events-none"
              style={{
                backgroundColor: '#CB4D6D',
                animationDuration: '2.5s'
              }}
            />

            <svg width="124" height="124" className="-rotate-90">
              <defs>
                <linearGradient id="dietProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#CB4D6D" />
                  <stop offset="100%" stopColor="#E56A86" />
                </linearGradient>
              </defs>
              <circle
                cx="62"
                cy="62"
                r={radius}
                fill="none"
                stroke="#F6ECEE"
                strokeWidth={strokeWidth}
              />
              <circle
                cx="62"
                cy="62"
                r={radius}
                fill="none"
                stroke="url(#dietProgressGrad)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 80ms ease-out'
                }}
              />
            </svg>

            {/* Inner Gauge Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {progress >= 100 ? (
                <div className="flex flex-col items-center animate-scale-up">
                  <CheckCircle2 className="w-8 h-8 text-[#0DA86A]" />
                  <span className="text-[11px] font-bold text-[#0DA86A] mt-1">100%</span>
                </div>
              ) : (
                <>
                  <span className="text-[26px] font-bold text-[#301D23] tracking-tight leading-none">
                    {progress}%
                  </span>
                  <span className="text-[10.5px] font-medium text-[#84626D] mt-1 uppercase tracking-wider">
                    Calculando
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Calculation Steps */}
        <div
          className="space-y-2.5 rounded-2xl p-3.5"
          style={{
            backgroundColor: '#FAF7F8',
            border: '1px solid #F0E6E8'
          }}
        >
          {CALCULATION_STEPS.map((step, idx) => {
            const isFinished = progress >= (idx + 1) * 20 || (idx === 4 && progress >= 100);
            const isCurrent = idx === activeStepIndex && !isFinished;
            const isPending = idx > activeStepIndex;

            return (
              <div
                key={step.id}
                className="flex items-start gap-2.5 transition-all duration-300"
                style={{
                  opacity: isPending ? 0.45 : 1,
                  transform: isCurrent ? 'translateX(2px)' : 'none'
                }}
              >
                {/* Status Indicator */}
                <div
                  className="flex items-center justify-center flex-shrink-0 mt-0.5 rounded-full transition-all duration-300"
                  style={{
                    width: '22px',
                    height: '22px',
                    backgroundColor: isFinished
                      ? '#0DA86A'
                      : isCurrent
                      ? '#CB4D6D'
                      : '#EBE3E5',
                    color: '#FFFFFF'
                  }}
                >
                  {isFinished ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3 h-3 animate-spin stroke-[2.5]" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                  )}
                </div>

                {/* Step Text Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p
                      className="text-[12.5px] leading-tight font-semibold"
                      style={{
                        color: isFinished
                          ? '#0DA86A'
                          : isCurrent
                          ? '#301D23'
                          : '#84626D'
                      }}
                    >
                      {step.title}
                    </p>
                    {isFinished && (
                      <span className="text-[10px] font-bold text-[#0DA86A] uppercase tracking-wide">
                        Listo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#84626D] mt-0.5 leading-snug truncate">
                    {step.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Credibility & Scientific Assurance Footer */}
        <div
          className="mt-4 pt-3 flex items-center justify-center gap-2 text-center"
          style={{ borderTop: '1px solid #F4EBEF' }}
        >
          <ShieldCheck className="w-4 h-4 text-[#CB4D6D] flex-shrink-0" />
          <p className="text-[11.5px] font-medium text-[#84626D] leading-tight">
            Fórmula Harris-Benedict adaptada + Equilibrio Nutricional Asiático
          </p>
        </div>
      </div>
    </div>
  );
}
