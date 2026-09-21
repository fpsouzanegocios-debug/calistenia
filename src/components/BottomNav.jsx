import React from 'react';
import { Home, Dumbbell, Utensils, MessageCircle, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function BottomNav({ currentPath, onNavigate }) {
  const { theme } = useApp();

  // Hide bottom nav during active workout
  if (currentPath.startsWith('/treino/')) {
    return null;
  }

  const items = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/treinos', label: 'Entrenamientos', icon: Dumbbell },
    { path: '/dieta', label: 'Dieta', icon: Utensils },
    { path: '/suporte', label: 'Soporte', icon: MessageCircle },
    { path: '/perfil', label: 'Perfil', icon: User }
  ];

  const isDark = theme === 'dark';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 select-none border-t transition-colors duration-200"
      style={{
        backgroundColor: isDark ? '#141012' : '#FFFFFF',
        borderTopColor: isDark ? '#261D21' : '#EEE8EA',
        height: '70px'
      }}
    >
      <div className="mx-auto max-w-lg h-full">
        <div className="flex items-center justify-around h-[70px] px-2">
          {items.map(item => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className="flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer"
                style={{ background: 'none', border: 'none' }}
              >
                {isActive ? (
                  <div
                    className="flex items-center justify-center mb-0.5"
                    style={{
                      width: '48px',
                      height: '28px',
                      borderRadius: '9999px',
                      backgroundColor: isDark ? 'rgba(203, 77, 109, 0.25)' : '#FCE8ED'
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: '#CB4D6D' }} strokeWidth={2} />
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center mb-0.5"
                    style={{ width: '48px', height: '28px' }}
                  >
                    <Icon className="w-5 h-5" style={{ color: isDark ? '#A68D96' : '#9D7B87' }} strokeWidth={1.75} />
                  </div>
                )}
                <span
                  className="text-[11px] tracking-tight"
                  style={{
                    color: isActive ? '#CB4D6D' : (isDark ? '#A68D96' : '#9D7B87'),
                    fontWeight: isActive ? 600 : 400
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
