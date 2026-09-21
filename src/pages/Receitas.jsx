import React, { useState } from 'react';
import { recipes } from '../data/diet';
import { ArrowLeft, Clock, Flame, ChevronRight } from 'lucide-react';

export function Receitas({ onNavigate }) {
  const [activeRecipe, setActiveRecipe] = useState(null);

  if (activeRecipe) {
    return (
      <main className="min-h-screen px-4 pt-4 pb-28 max-w-lg mx-auto select-none bg-[#FAFAFA]">
        <header className="flex items-center gap-3 mb-5 animate-fade-in">
          <button
            onClick={() => setActiveRecipe(null)}
            className="h-10 w-10 rounded-full flex items-center justify-center text-[#301D23] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-[20px] font-bold text-[#301D23] leading-tight">{activeRecipe.name}</h1>
            <p className="text-[12px] text-[#84626D]">{activeRecipe.category}</p>
          </div>
        </header>

        <div
          className="aspect-video bg-white flex items-center justify-center mb-5 text-6xl border border-[#E9E2E4]"
          style={{
            borderRadius: '24px',
            boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)'
          }}
        >
          {activeRecipe.image}
        </div>

        <div className="flex gap-3 mb-5">
          <div
            className="flex items-center gap-2 text-xs font-semibold text-[#84626D] bg-white border border-[#E9E2E4] px-4 py-2"
            style={{
              borderRadius: '16px',
              boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)'
            }}
          >
            <Clock className="h-4 w-4 text-[#CB4D6D]" />
            <span>{activeRecipe.time}</span>
          </div>
          <div
            className="flex items-center gap-2 text-xs font-semibold text-[#84626D] bg-white border border-[#E9E2E4] px-4 py-2"
            style={{
              borderRadius: '16px',
              boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)'
            }}
          >
            <Flame className="h-4 w-4 text-[#CB4D6D]" />
            <span>{activeRecipe.calories} kcal</span>
          </div>
        </div>

        {/* Ingredientes */}
        <div
          className="bg-white p-5 border border-[#E9E2E4] mb-5"
          style={{
            borderRadius: '24px',
            boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)'
          }}
        >
          <h3 className="font-bold text-[15px] text-[#301D23] mb-3">Ingredientes</h3>
          <ul className="space-y-2">
            {activeRecipe.ingredients.map((item, idx) => (
              <li key={idx} className="text-[13px] text-[#301D23] flex items-start gap-2.5">
                <span className="text-[#CB4D6D] font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Modo de Preparo */}
        <div
          className="bg-white p-5 border border-[#E9E2E4] mb-6"
          style={{
            borderRadius: '24px',
            boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)'
          }}
        >
          <h3 className="font-bold text-[15px] text-[#301D23] mb-3">Modo de Preparación</h3>
          <ol className="space-y-3">
            {activeRecipe.instructions.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-[#CB4D6D]"
                  style={{ backgroundColor: 'rgba(203, 77, 109, 0.1)' }}
                >
                  {idx + 1}
                </span>
                <span className="text-[13px] text-[#84626D] leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <button
          onClick={() => setActiveRecipe(null)}
          className="w-full h-12 text-white font-semibold text-sm shadow-md cursor-pointer transition-all hover:opacity-95"
          style={{
            borderRadius: '18px',
            background: 'linear-gradient(135deg, rgb(203, 77, 109), rgb(214, 92, 102))',
            boxShadow: '0 4px 16px -2px rgba(203,77,109,0.35)'
          }}
        >
          Volver a Recetas
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pt-4 pb-28 max-w-lg mx-auto select-none bg-[#FAFAFA]">
      <header className="flex items-center gap-3 mb-5 animate-fade-in">
        <button
          onClick={() => onNavigate('/dieta')}
          className="h-10 w-10 rounded-full flex items-center justify-center text-[#301D23] hover:bg-black/5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-[20px] font-bold text-[#301D23] leading-tight">Recetas Saludables</h1>
          <p className="text-[13px] text-[#84626D]">Platos nutritivos, rápidos y sabrosos</p>
        </div>
      </header>

      <div className="space-y-3 animate-slide-up">
        {recipes.map(recipe => (
          <div
            key={recipe.id}
            onClick={() => setActiveRecipe(recipe)}
            className="p-4 bg-white border border-[#E9E2E4] hover:border-[#CB4D6D]/40 cursor-pointer transition-all flex items-center gap-4"
            style={{
              borderRadius: '24px',
              boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)'
            }}
          >
            <div
              className="h-14 w-14 border border-[#E9E2E4] flex items-center justify-center text-3xl flex-shrink-0"
              style={{
                borderRadius: '18px',
                backgroundColor: '#F7F5F6'
              }}
            >
              {recipe.image}
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[11px] text-[#CB4D6D] font-bold uppercase tracking-wider block">
                {recipe.category}
              </span>
              <h3 className="font-semibold text-[15px] text-[#301D23] truncate mt-0.5">{recipe.name}</h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-[#84626D] font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[#CB4D6D]" /> {recipe.time}
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-[#CB4D6D]" /> {recipe.calories} kcal
                </span>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-[#9D7B87] flex-shrink-0" />
          </div>
        ))}
      </div>
    </main>
  );
}
