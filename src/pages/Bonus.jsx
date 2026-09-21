import React from 'react';
import { bonusList } from '../data/bonus';
import { ArrowLeft, ChevronRight, CheckCircle2, Gift } from 'lucide-react';

export function Bonus({ onNavigate }) {
  return (
    <main className="min-h-screen px-4 pt-4 pb-24 max-w-lg mx-auto select-none bg-slate-50/50">
      {/* Header */}
      <header className="flex items-center gap-3 mb-4 animate-fade-in">
        <button
          onClick={() => onNavigate('/')}
          className="h-9 w-9 rounded-full flex items-center justify-center text-foreground hover:bg-muted/40 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Bonos y Contenidos</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Materiales extra exclusivos</p>
        </div>
      </header>

      {/* Banner de recompensa matching Image 2 */}
      <div
        className="animate-slide-up shadow-sm"
        style={{
          backgroundColor: '#FAF0E6',
          borderRadius: '24px',
          padding: '20px 22px',
          marginBottom: '24px'
        }}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <Gift className="w-5 h-5 flex-shrink-0" style={{ color: '#7E4734' }} strokeWidth={2.2} />
          <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: '#7E4734', lineHeight: 1.2 }}>
            ¡Desbloquea recompensas!
          </h3>
        </div>
        <p style={{ fontSize: '13px', color: '#8A5844', lineHeight: 1.5, fontWeight: 400 }}>
          Con cada logro del programa, desbloqueas contenidos exclusivos. ¡Continúa entrenando para desbloquear todos!
        </p>
      </div>

      {/* Lista de Bônus (6 itens) matching screenshot */}
      <div className="space-y-3.5 animate-slide-up" style={{ marginTop: '24px' }}>
        {bonusList.map((bonus) => (
          <div
            key={bonus.id}
            onClick={() => onNavigate(`/bonus/${bonus.slug}`)}
            className="cursor-pointer transition-all flex items-center justify-between border shadow-sm hover:border-[#CB4D6D]/40"
            style={{
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              borderColor: '#E9E2E4',
              padding: '16px 20px',
              boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="flex-1 min-w-0 mr-3">
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
                {bonus.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#301D23', lineHeight: 1.25 }} className="truncate">
                    {bonus.title}
                  </h3>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                </div>
                <p style={{ fontSize: '13px', color: '#84626D', marginTop: '4px', lineHeight: 1.25 }} className="line-clamp-1">
                  {bonus.description}
                </p>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-[#84626D] flex-shrink-0" />
          </div>
        ))}
      </div>
    </main>
  );
}
