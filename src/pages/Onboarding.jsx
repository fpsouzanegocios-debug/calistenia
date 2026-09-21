import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, User, Ruler, Scale, Target } from 'lucide-react';

export function Onboarding({ onNavigate }) {
  const { state, updateUserProfile } = useApp();

  const [age, setAge] = useState(state.userProfile?.age ? state.userProfile.age.toString() : '');
  const [height, setHeight] = useState(state.userProfile?.height ? state.userProfile.height.toString() : '');
  const [currentWeight, setCurrentWeight] = useState(state.userProfile?.currentWeight ? state.userProfile.currentWeight.toString() : '');
  const [targetWeight, setTargetWeight] = useState(state.userProfile?.targetWeight ? state.userProfile.targetWeight.toString() : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserProfile({
        age: parseInt(age, 10) || 28,
        height: parseFloat(height) || 165,
        currentWeight: parseFloat(currentWeight) || 70,
        targetWeight: parseFloat(targetWeight) || 60,
        targetDays: 30,
        onboardingCompleted: true
      });
      onNavigate('/');
    } catch (err) {
      console.error('Onboarding save error:', err);
      onNavigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Header Section */}
      <div className="text-center mb-6 animate-fade-in">
        <h1 className="text-4xl font-display text-[#D3455B] tracking-tight mb-1.5">
          CALISTENIA
        </h1>
        <span className="inline-block text-[11px] font-medium text-[#84626D] dark:text-[#B8A2AB] bg-[#F7F2F4] dark:bg-[#251D21] px-3 py-0.5 rounded-md">
          Asiática
        </span>
      </div>

      {/* Main Card */}
      <div className="auth-card-modern animate-slide-up">
        {/* Card Title & Subtitle */}
        <h2 className="text-xl sm:text-2xl font-bold text-center text-[#301D23] dark:text-[#F7EFF2] mb-2 tracking-tight">
          Antes de comenzar...
        </h2>
        <p
          className="text-[12px] text-[#84626D] dark:text-[#B8A2AB] text-center max-w-[290px] mx-auto mb-6 leading-relaxed"
          style={{ fontSize: '12px' }}
        >
          Necesitamos algunos datos para personalizar tu experiencia
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Edad */}
          <div>
            <label
              htmlFor="age"
              className="block text-[14px] font-medium text-[#301D23] dark:text-[#F7EFF2] mb-1.5 pl-2 text-left"
            >
              Edad
            </label>
            <div
              className="onboarding-field-pill"
              onClick={() => document.getElementById('age')?.focus()}
            >
              <User
                className="w-[19px] h-[19px] text-[#84626D] dark:text-[#B8A2AB] flex-shrink-0"
                aria-hidden="true"
              />
              <input
                id="age"
                type="number"
                placeholder="Tu edad"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="onboarding-field-input"
                required
                min="10"
                max="120"
              />
            </div>
          </div>

          {/* Campo Altura */}
          <div>
            <label
              htmlFor="height"
              className="block text-[14px] font-medium text-[#301D23] dark:text-[#F7EFF2] mb-1.5 pl-2 text-left"
            >
              Altura (cm)
            </label>
            <div
              className="onboarding-field-pill"
              onClick={() => document.getElementById('height')?.focus()}
            >
              <Ruler
                className="w-[19px] h-[19px] text-[#84626D] dark:text-[#B8A2AB] flex-shrink-0"
                aria-hidden="true"
              />
              <input
                id="height"
                type="number"
                placeholder="Ej: 165"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="onboarding-field-input"
                required
                min="50"
                max="250"
              />
            </div>
          </div>

          {/* Campo Peso Actual */}
          <div>
            <label
              htmlFor="currentWeight"
              className="block text-[14px] font-medium text-[#301D23] dark:text-[#F7EFF2] mb-1.5 pl-2 text-left"
            >
              Peso Actual (kg)
            </label>
            <div
              className="onboarding-field-pill"
              onClick={() => document.getElementById('currentWeight')?.focus()}
            >
              <Scale
                className="w-[19px] h-[19px] text-[#84626D] dark:text-[#B8A2AB] flex-shrink-0"
                aria-hidden="true"
              />
              <input
                id="currentWeight"
                type="number"
                step="0.1"
                placeholder="Ej: 70"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                className="onboarding-field-input"
                required
                min="20"
                max="300"
              />
            </div>
          </div>

          {/* Campo Peso Objetivo */}
          <div>
            <label
              htmlFor="targetWeight"
              className="block text-[14px] font-medium text-[#301D23] dark:text-[#F7EFF2] mb-1.5 pl-2 text-left"
            >
              Peso objetivo (kg)
            </label>
            <div
              className="onboarding-field-pill"
              onClick={() => document.getElementById('targetWeight')?.focus()}
            >
              <Target
                className="w-[19px] h-[19px] text-[#84626D] dark:text-[#B8A2AB] flex-shrink-0"
                aria-hidden="true"
              />
              <input
                id="targetWeight"
                type="number"
                step="0.1"
                placeholder="Ej: 60"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="onboarding-field-input"
                required
                min="20"
                max="300"
              />
            </div>
          </div>

          {/* Botón Comenzar */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="auth-btn-primary"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="inline-flex items-center justify-center gap-2">
                  <span>Comenzar</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Footer Text */}
      <div className="text-center mt-6 mb-2">
        <p
          className="text-[12px] text-[#84626D] dark:text-[#B8A2AB] max-w-[280px] mx-auto leading-relaxed"
          style={{ fontSize: '12px' }}
        >
          Estos datos se utilizarán para personalizar tus entrenamientos y dieta
        </p>
      </div>
    </div>
  );
}
export default Onboarding;
