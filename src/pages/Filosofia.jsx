import React from 'react';
import { ArrowLeft } from 'lucide-react';

const PRINCIPLES = [
  {
    icon: '🎯',
    title: 'Pocos Ejercicios',
    description: 'Menos es más. Dominamos pocos movimientos con perfección.'
  },
  {
    icon: '🔄',
    title: 'Repetición Inteligente',
    description: 'La repetición crea maestría y resultados duraderos.'
  },
  {
    icon: '🌊',
    title: 'Ritmo Fluido',
    description: 'Movimientos suaves como el agua, sin impacto agresivo.'
  },
  {
    icon: '🛡️',
    title: 'Cero Impacto Agresivo',
    description: 'Protegemos tus articulaciones mientras quemamos grasa.'
  },
  {
    icon: '💎',
    title: 'Constancia > Intensidad',
    description: 'Entrenar todos los días supera a entrenamientos intensos esporádicos.'
  }
];

export function Filosofia({ onNavigate }) {
  return (
    <main className="min-h-screen px-4 pt-4 pb-24 max-w-lg mx-auto select-none bg-slate-50/50">
      {/* Header matching original app */}
      <header className="flex items-center gap-3 mb-4 animate-fade-in">
        <button
          onClick={() => onNavigate('/')}
          className="h-9 w-9 rounded-full flex items-center justify-center text-foreground hover:bg-muted/40 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Filosofía del Entrenamiento</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Nuestra metodología</p>
        </div>
      </header>

      {/* Top Banner Solid Rose matching original app */}
      <div
        className="rounded-3xl p-6 mb-4 text-white shadow-md animate-slide-up"
        style={{ backgroundColor: '#D3455B' }}
      >
        <h2 className="text-lg font-bold mb-2">Calistenia Asiática</h2>
        <p className="text-xs text-white/95 leading-relaxed font-normal">
          Inspirada en las prácticas milenarias orientales, nuestra metodología une movimiento fluido, bajo impacto y constancia para transformar tu cuerpo de forma segura y definitiva.
        </p>
      </div>

      {/* 5 Principle Cards */}
      <div className="space-y-3 mb-5 animate-slide-up">
        {PRINCIPLES.map((p, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 transition-all border shadow-sm"
            style={{
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              borderColor: '#E9E2E4',
              padding: '16px 20px',
              boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)'
            }}
          >
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
              {p.icon}
            </div>

            <div className="flex-1 min-w-0">
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#301D23', lineHeight: 1.25 }}>
                {p.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#84626D', marginTop: '4px', lineHeight: 1.3 }}>
                {p.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quote Box matching original app */}
      <div className="bg-[#FDF0E6] rounded-3xl p-5 text-center text-xs italic text-[#7A4B3A] leading-relaxed mb-6 animate-slide-up border border-[#F6DFC8]/60">
        <p>
          "El agua es suave, pero moldea la roca más dura. Al igual que el agua, nuestro entrenamiento transforma con gentileza y persistencia."
        </p>
        <span className="block font-semibold not-italic mt-2 text-[#9E6572]">
          — Filosofía Calistenia Asiática
        </span>
      </div>
    </main>
  );
}
