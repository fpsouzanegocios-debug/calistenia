import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { generateDietPlan } from '../data/diet';
import { ArrowLeft, Flame, ChevronDown, ChevronUp } from 'lucide-react';

// Helper para obtener los pasos ordenados del Modo de Preparación
function getRecipeSteps(meal) {
  if (!meal) return [];

  // 1. Si ya viene con array de pasos/instrucciones
  if (Array.isArray(meal.passos) && meal.passos.length > 0) {
    return meal.passos;
  }
  if (Array.isArray(meal.instrucoes) && meal.instrucoes.length > 0) {
    return meal.instrucoes;
  }

  const prato = (meal.prato || '').toLowerCase();
  const receita = (meal.receita || '').trim();

  // 2. Mapeo de recetas a pasos detallados en español
  if (prato.includes('omelete') || prato.includes('tortilla') || receita.includes('claras')) {
    return [
      'Bate las claras hasta que estén ligeramente espumosas.',
      'Mezcla la avena y el plátano machacado.',
      'Vierte la mezcla en una sartén antiadherente.',
      'Cocina a fuego medio hasta que cuaje, voltea y dora el otro lado.',
      'Sirve caliente.'
    ];
  }

  if (prato.includes('iogurte') || prato.includes('yogur') || receita.includes('yogur')) {
    return [
      'Coloca el yogur natural en un tazón pequeño.',
      'Pica los anacardos / frutos secos en trozos medianos.',
      'Espolvorea los frutos secos picados sobre el yogur.',
      'Añade una pizca de canela al gusto y sirve de inmediato.'
    ];
  }

  if (prato.includes('frango') || prato.includes('pollo') || receita.includes('pollo')) {
    return [
      'Sazona la pechuga de pollo con hierbas al gusto y sal.',
      'Calienta una sartén o plancha y dora el pollo 4 a 5 minutos por lado.',
      'Cocina el brócoli al vapor hasta que quede al dente.',
      'Calienta el arroz integral cocido.',
      'Arma el plato y finaliza con un toque de aceite de oliva extravirgen.'
    ];
  }

  if (prato.includes('smoothie') || prato.includes('fresa') || prato.includes('morango') || receita.includes('fresas')) {
    return [
      'Lava bien las fresas frescas o separa las congeladas.',
      'Coloca la leche vegetal y las almendras en la licuadora.',
      'Agrega las fresas y licúa a velocidad alta hasta lograr una mezcla homogénea y cremosa.',
      'Sirve en un vaso y disfruta al momento.'
    ];
  }

  if (prato.includes('tilápia') || prato.includes('pescado') || prato.includes('peixe') || receita.includes('pescado')) {
    return [
      'Sazona el filete de pescado con jugo de limón y finas hierbas.',
      'Calienta la sartén con un toque de aceite de oliva y dora el filete por ambos lados.',
      'Cocina las verduras al vapor hasta que estén tiernas.',
      'Sirve el pescado acompañado de las verduras con un toque de aceite de oliva.'
    ];
  }

  if (prato.includes('panqueca') || prato.includes('panqueque') || receita.includes('plátano')) {
    return [
      'En un plato, machaca bien el plátano con ayuda de un tenedor.',
      'Agrega los huevos y la avena, mezclando hasta integrar bien.',
      'Calienta una sartén antiadherente engrasada a fuego bajo.',
      'Vierte la masa y cocina hasta que cuaje, volteando para dorar el otro lado.',
      'Espolvorea canela al gusto y sirve caliente.'
    ];
  }

  if (prato.includes('sopa') || receita.includes('sopa')) {
    return [
      'Calienta la olla a fuego medio con la sopa cremosa.',
      'Añade el pollo desmenuzado ya cocido para calentar todo junto.',
      'Deja hervir suavemente durante 2 a 3 minutos.',
      'Decora con semillas tostadas o hierbas frescas.',
      'Sirve bien caliente.'
    ];
  }

  if (prato.includes('tapioca') || prato.includes('crepioca')) {
    return [
      'En un tazón, bate los huevos o claras con la tapioca.',
      'Vierte en una sartén antiadherente caliente a fuego bajo.',
      'Deja cuajar la masa durante unos 2 minutos.',
      'Distribuye el relleno por encima y dobla por la mitad.',
      'Sirve caliente.'
    ];
  }

  // 3. Fallback: si es texto continuo, separar por oraciones
  if (receita) {
    const sentences = receita
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim().replace(/^[0-9]+[.\-)]\s*/, ''))
      .filter(s => s.length > 5);

    if (sentences.length > 1) {
      return sentences.map(s => (s.endsWith('.') ? s : `${s}.`));
    }

    return [receita.endsWith('.') ? receita : `${receita}.`];
  }

  return [
    'Separa y limpia todos los ingredientes indicados.',
    'Cocina o arma la comida según las orientaciones nutricionales.',
    'Sirve fresco y disfruta tu comida.'
  ];
}

export function DietaPlano({ onNavigate }) {
  const { state } = useApp();
  const [dietPlan, setDietPlan] = useState(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [expandedRecipes, setExpandedRecipes] = useState({});

  useEffect(() => {
    // 1. Tenta carregar o plano salvo do localStorage
    const saved = localStorage.getItem('generated-diet-plan');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const validDias = Array.isArray(parsed?.dias)
          ? parsed.dias.filter(d => !!d && typeof d.dia === 'string' && Array.isArray(d.refeicoes))
          : [];
        if (validDias.length > 0) {
          setDietPlan({
            totalCaloriasDiarias: Number(parsed.totalCaloriasDiarias) || 1400,
            dias: validDias,
            dicas: Array.isArray(parsed.dicas) ? parsed.dicas : []
          });
          return;
        }
      } catch (e) {
        console.error('Erro ao ler plano salvo de dieta:', e);
      }
    }

    // 2. Se não houver plano salvo, gera um com base nos dados do usuário e persiste
    const plan = generateDietPlan({
      age: state.userProfile?.age || 30,
      height: state.userProfile?.height || 165,
      currentWeight: state.userProfile?.currentWeight || 70,
      targetWeight: state.userProfile?.targetWeight || 60,
      targetDays: state.userProfile?.targetDays || 30,
      dietaryRestrictions: state.userProfile?.dietaryRestrictions || [],
      foodPreferences: state.userProfile?.foodPreferences || []
    });
    localStorage.setItem('generated-diet-plan', JSON.stringify(plan));
    setDietPlan(plan);
  }, [state.userProfile]);

  const toggleRecipe = (key) => {
    setExpandedRecipes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!dietPlan || !dietPlan.dias) {
    return (
      <main className="min-h-screen px-4 pt-4 pb-28 max-w-lg mx-auto select-none bg-[#FAFAFA] flex flex-col items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-[#CB4D6D] border-t-transparent animate-spin mb-4"></div>
        <p className="text-sm text-[#84626D]">Cargando tu plan de alimentación...</p>
      </main>
    );
  }

  const currentDayData = dietPlan.dias[activeDayIndex] || dietPlan.dias[0];
  const weightDiff = Math.max(0, (state.userProfile?.currentWeight || 70) - (state.userProfile?.targetWeight || 60));
  const targetDays = state.userProfile?.targetDays || 30;

  return (
    <main className="min-h-screen px-4 pt-4 pb-28 max-w-lg mx-auto select-none bg-[#FAFAFA]">
      {/* Header matching Imagem 3 */}
      <header className="flex items-center gap-3 mb-5 animate-fade-in">
        <button
          onClick={() => onNavigate('/dieta')}
          className="h-10 w-10 rounded-full flex items-center justify-center text-[#301D23] hover:bg-black/5 transition-colors cursor-pointer"
          aria-label="Volver a dieta"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-[20px] font-bold text-[#301D23] leading-tight">Tu Plan de Alimentación</h1>
          <p className="text-[13px] text-[#84626D] mt-0.5">7 días personalizados por IA</p>
        </div>
      </header>

      {/* Hero Calories Banner */}
      <div
        className="p-6 mb-4 text-white text-center shadow-[0_4px_20px_-4px_rgba(203,77,109,0.35)] animate-slide-up"
        style={{
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgb(203, 77, 109), rgb(214, 92, 102))'
        }}
      >
        <p className="text-[13px] text-white/90 font-medium mb-1">
          Meta de calorías diarias
        </p>
        <div className="text-5xl font-extrabold text-white font-display my-1 tracking-tight">
          {dietPlan.totalCaloriasDiarias || 1400}
        </div>
        <p className="text-[13px] text-white/90 font-medium">kcal/día</p>
      </div>

      {/* Goal Banner matching Imagem 3 */}
      <div
        className="bg-[#FDF0E6] text-[#7A4B3A] flex items-center animate-slide-up border border-[#F5DEC8]"
        style={{
          borderRadius: '20px',
          padding: '15px 18px',
          gap: '12px',
          fontSize: '14px',
          fontWeight: 500,
          marginBottom: '28px'
        }}
      >
        <span className="text-lg">🎯</span>
        <span>
          Tu meta: Perder {weightDiff > 0 ? `${weightDiff.toFixed(0)}kg` : '10kg'} en {targetDays} días
        </span>
      </div>

      {/* Seleccione o dia */}
      <div className="animate-slide-up" style={{ marginBottom: '28px' }}>
        <h3 className="text-[15px] font-semibold text-[#301D23]" style={{ marginBottom: '12px' }}>
          Selecciona el día
        </h3>
        <div className="flex overflow-x-auto pb-2 scrollbar-hide" style={{ gap: '10px' }}>
          {dietPlan.dias.map((d, idx) => {
            const rawLabel = d.short || d.dia.split('–')[0].split('-')[0].trim();
            const label = rawLabel.replace('-feira', '');
            const isActive = activeDayIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveDayIndex(idx)}
                className="flex items-center justify-center whitespace-nowrap transition-all flex-shrink-0 cursor-pointer"
                style={{
                  height: '40px',
                  padding: '0 18px',
                  borderRadius: '16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: isActive ? '#CB4D6D' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#301D23',
                  border: isActive ? 'none' : '1px solid #E9E2E4',
                  boxShadow: isActive
                    ? '0 4px 12px -2px rgba(203,77,109,0.35)'
                    : '0 2px 6px -2px rgba(61,41,48,0.05)'
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Day Section Title Row */}
      <div style={{ marginBottom: '16px' }}>
        <h2 className="text-[16px] font-bold text-[#301D23]">
          {currentDayData.dia}
        </h2>
      </div>

      {/* Meal Cards */}
      <div className="space-y-4 mb-8 animate-slide-up">
        {currentDayData.refeicoes.map((meal, mealIdx) => {
          const recipeKey = `${activeDayIndex}-${mealIdx}`;
          const isExpanded = !!expandedRecipes[recipeKey];

          return (
            <div
              key={mealIdx}
              className="p-5 border transition-all"
              style={{
                borderRadius: '24px',
                backgroundColor: '#FFFFFF',
                borderColor: '#E9E2E4',
                boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)'
              }}
            >
              {/* Header row: Prato + Badge */}
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="text-[15px] font-bold text-[#301D23] leading-snug">
                  {meal.prato}
                </h3>
                <div
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold flex-shrink-0"
                  style={{
                    backgroundColor: '#FFF0F3',
                    color: '#CB4D6D',
                    borderRadius: '9999px'
                  }}
                >
                  <Flame className="h-3.5 w-3.5 fill-current" />
                  <span>{meal.calorias} kcal</span>
                </div>
              </div>

              {/* Subtitle: Categoria • Horário */}
              <p className="text-[13px] text-[#84626D] mb-3">
                {meal.nome} • {meal.horario}
              </p>

              {/* Ingredients Title */}
              <p className="text-[11px] font-bold uppercase tracking-wider mb-2 text-[#9E6572]">
                INGREDIENTES
              </p>

              {/* Ingredients List */}
              <ul className="space-y-1.5 mb-3">
                {meal.itens.map((item, i) => (
                  <li key={i} className="text-[13px] text-[#301D23] flex items-start gap-2">
                    <span
                      className="font-bold text-base leading-none -mt-0.5"
                      style={{ color: '#CB4D6D' }}
                    >
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Ver receita Toggle matching Imagem 3 */}
              {meal.receita && (
                <div className="mt-3 pt-1 text-center">
                  <button
                    onClick={() => toggleRecipe(recipeKey)}
                    className="inline-flex items-center justify-center gap-1 text-xs font-medium hover:opacity-85 transition-colors cursor-pointer"
                    style={{ color: '#CB4D6D' }}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                    <span>{isExpanded ? 'Ocultar receta' : 'Ver receta'}</span>
                  </button>

                  {isExpanded && (
                    <div
                      className="mt-3 text-left animate-fade-in"
                      style={{
                        borderRadius: '16px',
                        padding: '12px 16px',
                        backgroundColor: '#F9F7F8',
                        border: '1px solid #EFEAEB',
                        boxShadow: '0 2px 6px -2px rgba(61,41,48,0.04)'
                      }}
                    >
                      <p
                        className="font-bold text-[#301D23] mb-2 flex items-center gap-1.5"
                        style={{ fontSize: '12.5px' }}
                      >
                        <span className="text-sm">📝</span>
                        <span>Modo de Preparación:</span>
                      </p>

                      <div className="space-y-1.5">
                        {getRecipeSteps(meal).map((step, idx) => (
                          <p
                            key={idx}
                            className="text-[12px] text-[#301D23] leading-relaxed flex items-start gap-1.5"
                          >
                            <span className="font-semibold text-[#301D23] flex-shrink-0">
                              {idx + 1}.
                            </span>
                            <span>{step}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
