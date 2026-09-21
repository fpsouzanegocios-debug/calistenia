import React, { useState } from 'react';
import { exercises } from '../data/exercises';
import { ArrowLeft, Search, Play, Pause, Info, X } from 'lucide-react';

export function Exercicios({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [selectedInfoExercise, setSelectedInfoExercise] = useState(null);

  const filteredExercises = exercises.filter(ex => {
    const q = searchQuery.toLowerCase();
    return (
      ex.name.toLowerCase().includes(q) ||
      ex.description.toLowerCase().includes(q) ||
      ex.muscleGroups.some(m => m.toLowerCase().includes(q))
    );
  });

  const togglePlay = (id) => {
    setPlayingVideoId(prev => (prev === id ? null : id));
  };

  return (
    <main className="min-h-screen px-4 pt-4 pb-28 max-w-lg mx-auto select-none bg-[#FAFAFA]">
      {/* Header */}
      <header className="flex items-center gap-3.5 mb-5 animate-fade-in">
        <button
          onClick={() => onNavigate('/treinos')}
          className="h-10 w-10 rounded-full flex items-center justify-center text-[#301D23] hover:bg-black/5 transition-colors cursor-pointer"
          aria-label="Volver a entrenamientos"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-[20px] font-bold text-[#301D23] leading-tight">Todos los Ejercicios</h1>
          <p className="text-[13px] text-[#84626D] mt-0.5">16 ejercicios disponibles</p>
        </div>
      </header>

      {/* Search Input */}
      <div
        className="flex items-center gap-3 w-full bg-white border mb-6 shadow-sm animate-slide-up transition-all focus-within:border-[#CB4D6D]"
        style={{
          height: '46px',
          paddingLeft: '18px',
          paddingRight: '18px',
          borderRadius: '9999px',
          borderColor: '#E9E2E4',
          backgroundColor: '#FFFFFF'
        }}
      >
        <Search className="h-4 w-4 text-[#84626D] flex-shrink-0" strokeWidth={2} />
        <input
          type="text"
          placeholder="Buscar ejercicio o grupo muscular..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-[13px] text-[#301D23] placeholder:text-[#84626D]/70 outline-none border-none p-0 leading-normal"
        />
      </div>

      {/* Exercises List Cards matching screenshot */}
      <div className="space-y-6 animate-slide-up">
        {filteredExercises.map(ex => {
          const isPlaying = playingVideoId === ex.id;

          return (
            <div
              key={ex.id}
              className="bg-white rounded-3xl border border-[#E9E2E4] shadow-sm p-4 text-center animate-slide-up overflow-hidden"
              style={{
                borderRadius: '24px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E9E2E4',
                boxShadow: '0 2px 8px -2px rgba(61,41,48,0.06)'
              }}
            >
              {/* Centered video box */}
              <div
                onClick={() => togglePlay(ex.id)}
                className="relative aspect-square rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer mb-4 mx-auto w-full group"
                style={{ borderRadius: '20px', backgroundColor: '#F5F5F7' }}
              >
                <video
                  src={ex.videoUrl}
                  autoPlay={isPlaying}
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain mx-auto"
                />

                {/* Center play icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-all">
                  <div className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm text-[#CB4D6D] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all">
                    {isPlaying ? (
                      <Pause className="h-5 w-5 fill-current" />
                    ) : (
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    )}
                  </div>
                </div>

                {/* Info trigger on top right of media */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedInfoExercise(ex);
                  }}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/85 backdrop-blur-sm text-[#84626D] hover:text-[#301D23] flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                  aria-label="Más información"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>

              {/* Title Centered */}
              <h3 className="font-bold text-[17px] text-[#301D23] text-center mb-1 leading-snug">
                {ex.name}
              </h3>

              {/* Duration Badge Centered */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <span
                  className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[12px] font-semibold text-[#CB4D6D]"
                  style={{ backgroundColor: 'rgba(203, 77, 109, 0.1)', color: '#CB4D6D' }}
                >
                  ⏱ 30s de ejecución
                </span>
              </div>

              {/* Description Centered */}
              <p className="text-[13px] text-[#84626D] text-center leading-relaxed max-w-sm mx-auto mb-3.5 px-1">
                {ex.description}
              </p>

              {/* Tags Centered */}
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {ex.muscleGroups.map(m => (
                  <span
                    key={m}
                    className="px-3 py-1 rounded-xl bg-[#FAFAFA] border border-[#E9E2E4] text-[#84626D] text-[11.5px] font-medium"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Modal */}
      {selectedInfoExercise && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-[#E9E2E4] animate-scale-in"
            style={{ borderRadius: '24px' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-[#301D23]">{selectedInfoExercise.name}</h3>
              <button
                onClick={() => setSelectedInfoExercise(null)}
                className="h-8 w-8 rounded-full bg-[#FAFAFA] border border-[#E9E2E4] flex items-center justify-center text-[#84626D] hover:text-[#301D23] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-[#84626D] mb-4 leading-relaxed">
              {selectedInfoExercise.description}
            </p>
            <div className="mb-5">
              <span className="text-[11px] font-bold text-[#84626D] uppercase tracking-wider block mb-2">
                Músculos Activados
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedInfoExercise.muscleGroups.map(m => (
                  <span
                    key={m}
                    className="px-2.5 py-1 rounded-lg bg-[#FAFAFA] border border-[#E9E2E4] text-[#301D23] text-xs font-medium"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => setSelectedInfoExercise(null)}
              className="w-full h-11 rounded-xl text-white font-semibold text-sm shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
              style={{ backgroundColor: '#CB4D6D' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
