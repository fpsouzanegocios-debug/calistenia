import React from 'react';
import { bonusDetails } from '../data/bonus';
import { ArrowLeft } from 'lucide-react';

export function BonusDetail({ slug, onNavigate }) {
  const guide = bonusDetails[slug] || {
    title: 'Guía Bono',
    icon: '✨',
    description: 'Material complementario',
    sections: []
  };

  return (
    <main className="min-h-screen px-4 pt-4 pb-24 max-w-lg mx-auto select-none bg-slate-50/50">
      {/* Header matching original app */}
      <header className="flex items-center gap-3 mb-4 animate-fade-in">
        <button
          onClick={() => onNavigate('/bonus')}
          className="h-9 w-9 rounded-full flex items-center justify-center text-foreground hover:bg-muted/40 transition-colors"
          aria-label="Volver a bonos"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{guide.title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{guide.description}</p>
        </div>
      </header>

      {/* Hero Icon card with solid rose matching Image 2 */}
      <div
        className="w-full flex items-center justify-center shadow-sm mb-5 animate-slide-up"
        style={{
          height: '116px',
          minHeight: '116px',
          borderRadius: '28px',
          backgroundColor: '#CF4863'
        }}
      >
        <span style={{ fontSize: '50px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {guide.icon}
        </span>
      </div>

      {/* Sections Cards matching original app */}
      <div className="space-y-3.5 mb-6 animate-slide-up">
        {guide.sections.map((sec, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-5 shadow-sm border border-border/50"
          >
            <h3 className="font-bold text-sm text-foreground mb-2">
              {sec.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
              {sec.content}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
