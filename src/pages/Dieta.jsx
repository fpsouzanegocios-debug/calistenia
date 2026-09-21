import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { dietaryRestrictions, foodGroups, generateDietPlan } from '../data/diet';
import { ChevronRight, Leaf, Apple, Soup, Check, Sparkles, ChefHat } from 'lucide-react';
import { DietProcessingModal } from '../components/DietProcessingModal';

export function Dieta({ onNavigate }) {
  const { state, updateUserProfile, setDietGenerated } = useApp();

  const [age, setAge] = useState(state.userProfile?.age?.toString() || '30');
  const [height, setHeight] = useState(state.userProfile?.height?.toString() || '165');
  const [currentWeight, setCurrentWeight] = useState(state.userProfile?.currentWeight?.toString() || '70');
  const [targetWeight, setTargetWeight] = useState(state.userProfile?.targetWeight?.toString() || '60');
  const [targetDays, setTargetDays] = useState(state.userProfile?.targetDays?.toString() || '30');

  const [selectedRestrictions, setSelectedRestrictions] = useState(
    state.userProfile?.dietaryRestrictions || []
  );
  const [selectedFoods, setSelectedFoods] = useState(
    state.userProfile?.foodPreferences || []
  );
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);

  const toggleRestriction = (id) => {
    setSelectedRestrictions(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleFood = (id) => {
    setSelectedFoods(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const toggleAllGroup = (items) => {
    const itemIds = items.map(i => i.id);
    const allSelected = itemIds.every(id => selectedFoods.includes(id));
    if (allSelected) {
      setSelectedFoods(prev => prev.filter(id => !itemIds.includes(id)));
    } else {
      setSelectedFoods(prev => [...new Set([...prev, ...itemIds])]);
    }
  };

  const handleGenerateDiet = () => {
    setIsProcessingModalOpen(true);
  };

  const handleProcessingComplete = () => {
    const plan = generateDietPlan({
      age: parseInt(age, 10) || 30,
      height: parseFloat(height) || 165,
      currentWeight: parseFloat(currentWeight) || 70,
      targetWeight: parseFloat(targetWeight) || 60,
      targetDays: parseInt(targetDays, 10) || 30,
      dietaryRestrictions: selectedRestrictions,
      foodPreferences: selectedFoods
    });

    localStorage.setItem('generated-diet-plan', JSON.stringify(plan));
    setDietGenerated(true);
    updateUserProfile({
      age: parseInt(age, 10) || 30,
      height: parseFloat(height) || 165,
      currentWeight: parseFloat(currentWeight) || 70,
      targetWeight: parseFloat(targetWeight) || 60,
      targetDays: parseInt(targetDays, 10) || 30,
      dietaryRestrictions: selectedRestrictions,
      foodPreferences: selectedFoods
    });

    setIsProcessingModalOpen(false);
    onNavigate('/dieta/plano');
  };

  return (
    <main className="min-h-screen px-4 pb-28 max-w-lg mx-auto select-none" style={{ backgroundColor: '#FAFAFA', paddingTop: '36px' }}>
      {/* Header matching original app */}
      <header className="mb-6 animate-fade-in flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-[#301D23] leading-tight">
            Dieta Personalizada
          </h1>
          <p className="text-[14px] font-normal text-[#84626D] mt-1.5 leading-normal">
            Alimentación generada por IA para tus objetivos
          </p>
        </div>
        {state.dietGenerated && (
          <button
            onClick={() => onNavigate('/dieta/plano')}
            className="text-[12px] font-semibold text-[#CB4D6D] bg-[#FCE8ED] px-3.5 py-1.5 rounded-full hover:opacity-90 transition-all flex-shrink-0 mt-1 cursor-pointer"
            style={{ borderRadius: '9999px' }}
          >
            Ver Plan →
          </button>
        )}
      </header>

      {/* Plano Light Banner */}
      <div
        className="flex items-center justify-between border shadow-sm animate-slide-up"
        style={{
          borderRadius: '24px',
          backgroundColor: '#FFF5F7',
          borderColor: '#FAD8DF',
          boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)',
          padding: '16px 20px',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: '44px',
              height: '44px',
              minWidth: '44px',
              borderRadius: '9999px',
              backgroundColor: '#FCE8ED'
            }}
          >
            <Leaf className="w-5 h-5 text-[#CB4D6D]" strokeWidth={2} />
          </div>
          <div>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#301D23', display: 'flex', alignItems: 'center', gap: '6px', lineHeight: 1.25 }}>
              <span>🌿</span> Plan Light
            </span>
            <p style={{ fontSize: '13px', fontWeight: 400, color: '#84626D', marginTop: '4px', lineHeight: 1.25 }}>
              Puedes generar 1 dieta más
            </p>
          </div>
        </div>
      </div>

      {/* Quando a dieta já foi gerada, exibe os cards de acesso rápido para Plano Alimentar e Receitas */}
      {state.dietGenerated && (
        <div className="animate-slide-up">
          {/* Card: Seu Plano Alimentar */}
          <div
            onClick={() => onNavigate('/dieta/plano')}
            className="flex items-center justify-between cursor-pointer transition-all border shadow-sm hover:border-[#CB4D6D]/40"
            style={{
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              borderColor: '#E9E2E4',
              boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)',
              padding: '16px 20px',
              marginBottom: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(13, 168, 106, 0.1)'
                }}
              >
                <Apple className="h-5 w-5" style={{ color: '#0DA86A' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#301D23', lineHeight: 1.25 }}>
                  Tu Plan de Alimentación
                </h3>
                <p style={{ fontSize: '13px', fontWeight: 400, color: '#84626D', marginTop: '4px', lineHeight: 1.25 }}>
                  Menú personalizado
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#84626D]" />
          </div>

          {/* Card: Receitas */}
          <div
            onClick={() => onNavigate('/dieta/receitas')}
            className="flex items-center justify-between cursor-pointer transition-all border shadow-sm hover:border-[#CB4D6D]/40"
            style={{
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              borderColor: '#E9E2E4',
              boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)',
              padding: '16px 20px',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  borderRadius: '9999px',
                  backgroundColor: '#FCE8ED'
                }}
              >
                <ChefHat className="h-5 w-5" style={{ color: '#CB4D6D' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#301D23', lineHeight: 1.25 }}>
                  Recetas
                </h3>
                <p style={{ fontSize: '13px', fontWeight: 400, color: '#84626D', marginTop: '4px', lineHeight: 1.25 }}>
                  Platos saludables y fáciles
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#84626D]" />
          </div>
        </div>
      )}

      {/* Caso ainda não tenha gerado dieta, permite acessar o catálogo de receitas */}
      {!state.dietGenerated && (
        <div className="animate-slide-up">
          <div
            onClick={() => onNavigate('/dieta/receitas')}
            className="flex items-center justify-between cursor-pointer transition-all border shadow-sm hover:border-[#CB4D6D]/40"
            style={{
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              borderColor: '#E9E2E4',
              boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)',
              padding: '16px 20px',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  borderRadius: '9999px',
                  backgroundColor: '#FCE8ED'
                }}
              >
                <ChefHat className="h-5 w-5" style={{ color: '#CB4D6D' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#301D23', lineHeight: 1.25 }}>
                  Recetas Saludables
                </h3>
                <p style={{ fontSize: '13px', fontWeight: 400, color: '#84626D', marginTop: '4px', lineHeight: 1.25 }}>
                  Platos saludables y fáciles
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#84626D]" />
          </div>
        </div>
      )}

      {/* Seus Dados Card */}
      <div
        className="rounded-24 border shadow-sm animate-slide-up"
        style={{
          borderRadius: '24px',
          backgroundColor: '#FFFFFF',
          borderColor: '#E9E2E4',
          boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)',
          padding: '22px 20px',
          marginBottom: '22px'
        }}
      >
        <h3 className="font-bold text-[16px] text-[#301D23]" style={{ marginBottom: '18px' }}>
          Tus Datos
        </h3>

        {/* Row 1: Idade e Altura */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            columnGap: '16px',
            marginBottom: '18px'
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#84626D', marginBottom: '8px' }}>
              Edad
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="outline-none transition-all focus:border-[#CB4D6D] focus:bg-white"
              style={{
                width: '100%',
                height: '44px',
                padding: '0 16px',
                borderRadius: '14px',
                backgroundColor: '#FAFAFA',
                border: '1px solid #E9E2E4',
                fontSize: '14px',
                color: '#301D23',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#84626D', marginBottom: '8px' }}>
              Altura (cm)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="outline-none transition-all focus:border-[#CB4D6D] focus:bg-white"
              style={{
                width: '100%',
                height: '44px',
                padding: '0 16px',
                borderRadius: '14px',
                backgroundColor: '#FAFAFA',
                border: '1px solid #E9E2E4',
                fontSize: '14px',
                color: '#301D23',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Row 2: Peso Atual e Peso Meta */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            columnGap: '16px',
            marginBottom: '18px'
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#84626D', marginBottom: '8px' }}>
              Peso Actual (kg)
            </label>
            <input
              type="number"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              className="outline-none transition-all focus:border-[#CB4D6D] focus:bg-white"
              style={{
                width: '100%',
                height: '44px',
                padding: '0 16px',
                borderRadius: '14px',
                backgroundColor: '#FAFAFA',
                border: '1px solid #E9E2E4',
                fontSize: '14px',
                color: '#301D23',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#84626D', marginBottom: '8px' }}>
              Peso Objetivo (kg)
            </label>
            <input
              type="number"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              className="outline-none transition-all focus:border-[#CB4D6D] focus:bg-white"
              style={{
                width: '100%',
                height: '44px',
                padding: '0 16px',
                borderRadius: '14px',
                backgroundColor: '#FAFAFA',
                border: '1px solid #E9E2E4',
                fontSize: '14px',
                color: '#301D23',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Row 3: Prazo desejado */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#84626D', marginBottom: '8px' }}>
            Plazo deseado (días)
          </label>
          <input
            type="number"
            value={targetDays}
            onChange={(e) => setTargetDays(e.target.value)}
            className="outline-none transition-all focus:border-[#CB4D6D] focus:bg-white"
            style={{
              width: '100%',
              height: '44px',
              padding: '0 16px',
              borderRadius: '14px',
              backgroundColor: '#FAFAFA',
              border: '1px solid #E9E2E4',
              fontSize: '14px',
              color: '#301D23',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Restrições Alimentares Card */}
      <div
        className="rounded-24 border shadow-sm animate-slide-up"
        style={{
          borderRadius: '24px',
          backgroundColor: '#FFFFFF',
          borderColor: '#E9E2E4',
          boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)',
          padding: '22px 20px',
          marginBottom: '24px'
        }}
      >
        <h3 className="font-bold text-[16px] text-[#301D23]" style={{ marginBottom: '18px' }}>
          Restricciones Alimentarias
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            columnGap: '12px',
            rowGap: '12px'
          }}
        >
          {dietaryRestrictions.map(r => {
            const isSelected = selectedRestrictions.includes(r.id);
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => toggleRestriction(r.id)}
                className="transition-all cursor-pointer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '48px',
                  padding: '0 16px',
                  borderRadius: '20px',
                  backgroundColor: isSelected ? '#FFF5F7' : '#FAFAFA',
                  border: isSelected ? '1px solid #CB4D6D' : '1px solid #E9E2E4',
                  width: '100%',
                  textAlign: 'left',
                  boxSizing: 'border-box'
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    minWidth: '18px',
                    borderRadius: '9999px',
                    backgroundColor: isSelected ? '#CB4D6D' : 'transparent',
                    border: isSelected ? '1px solid #CB4D6D' : '1px solid rgba(203, 77, 109, 0.45)',
                    marginRight: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </div>
                <span
                  style={{
                    fontSize: '13.5px',
                    color: isSelected ? '#CB4D6D' : '#301D23',
                    fontWeight: isSelected ? 600 : 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {r.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grupos Alimentares Section */}
      <div className="animate-slide-up" style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 className="font-bold text-[16px] text-[#301D23] leading-snug">Grupos de Alimentos</h3>
          <p className="text-[13.5px] font-normal text-[#84626D] leading-normal" style={{ marginTop: '8px' }}>
            Selecciona los alimentos que te gustan y deseas incluir en tu dieta
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {foodGroups.map(group => {
            const selectedCount = group.items.filter(i => selectedFoods.includes(i.id)).length;
            const allSelected = selectedCount === group.items.length;

            return (
              <div
                key={group.id}
                className="rounded-24 border shadow-sm"
                style={{
                  borderRadius: '24px',
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E9E2E4',
                  boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)',
                  padding: '20px 18px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: '42px',
                        height: '42px',
                        minWidth: '42px',
                        borderRadius: '9999px',
                        backgroundColor: '#F7F5F6',
                        fontSize: '20px'
                      }}
                    >
                      {group.icon}
                    </div>
                    <div>
                      <span className="font-semibold text-[15px] text-[#301D23] block leading-tight">{group.name}</span>
                      <span className="text-[12px] font-normal text-[#84626D] block" style={{ marginTop: '4px' }}>
                        {selectedCount} de {group.items.length} seleccionados
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleAllGroup(group.items)}
                    className="text-[12px] font-medium text-[#CB4D6D] hover:underline transition-colors cursor-pointer"
                    style={{ background: 'none', border: 'none' }}
                  >
                    {allSelected ? 'Desmarcar' : 'Marcar todos'}
                  </button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    columnGap: '10px',
                    rowGap: '10px'
                  }}
                >
                  {group.items.map(item => {
                    const isSelected = selectedFoods.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleFood(item.id)}
                        className="transition-all cursor-pointer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          height: '42px',
                          padding: '0 14px',
                          borderRadius: '16px',
                          backgroundColor: isSelected ? '#FFF5F7' : '#FAFAFA',
                          border: isSelected ? '1px solid #CB4D6D' : '1px solid #E9E2E4',
                          width: '100%',
                          textAlign: 'left',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            minWidth: '16px',
                            borderRadius: '9999px',
                            backgroundColor: isSelected ? '#CB4D6D' : 'transparent',
                            border: isSelected ? '1px solid #CB4D6D' : '1px solid rgba(203, 77, 109, 0.45)',
                            marginRight: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {isSelected && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
                        </div>
                        <span
                          style={{
                            fontSize: '13px',
                            color: isSelected ? '#CB4D6D' : '#301D23',
                            fontWeight: isSelected ? 600 : 400,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* Primary Action Button */}
      <button
        onClick={handleGenerateDiet}
        disabled={isProcessingModalOpen}
        className="rounded-20 w-full h-14 text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer mb-6 active:scale-[0.99] hover:opacity-95"
        style={{
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgb(203, 77, 109), rgb(214, 92, 102))',
          boxShadow: '0 4px 20px -4px rgba(203, 77, 109, 0.35)'
        }}
      >
        <Sparkles className="w-4 h-4 text-white mr-1" />
        <span>Generar Dieta Personalizada</span>
      </button>

      {/* Professional Processing / Calculating Screen */}
      <DietProcessingModal
        isOpen={isProcessingModalOpen}
        onComplete={handleProcessingComplete}
        userProfile={{
          age,
          height,
          currentWeight,
          targetWeight,
          targetDays
        }}
      />
    </main>
  );
}


