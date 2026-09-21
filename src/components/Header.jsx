import React from 'react';
import { Moon, Sun, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Header() {
  const { theme, toggleTheme, unreadNotificationsCount } = useApp();

  return (
    <header className="relative flex items-center justify-between mb-6 pt-2">
      <div className="flex items-center gap-1.5">
        <span className="text-2xl font-display text-primary tracking-tight">CALISTENIA</span>
        <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded font-medium">Asiática</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-notifications'))}
          className="relative h-10 w-10 rounded-full flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
          aria-label="Abrir notificaciones"
        >
          {/* Ondas redondas translúcidas que pulsam quando há notificação */}
          {unreadNotificationsCount > 0 && (
            <>
              {/* Fundo suave circular estático atrás do sino */}
              <span className="absolute inset-0.5 rounded-full bg-[#D3455B]/15 dark:bg-[#D3455B]/25 pointer-events-none" />
              {/* Onda primária que se expande */}
              <span className="absolute inset-0.5 rounded-full bg-[#D3455B]/25 dark:bg-[#D3455B]/35 animate-bell-wave pointer-events-none" />
              {/* Onda secundária com delay para fluxo contínuo */}
              <span className="absolute inset-0.5 rounded-full bg-[#D3455B]/20 dark:bg-[#D3455B]/25 animate-bell-wave-delayed pointer-events-none" />
            </>
          )}

          <div className="relative z-10 inline-flex items-center justify-center">
            <Bell className="h-5 w-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 h-4 min-w-[17px] px-1 bg-[#D3455B] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-background shadow-xs pointer-events-none tabular-nums">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </div>
        </button>

        <button
          onClick={toggleTheme}
          className="h-10 w-10 rounded-full flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
          aria-label="Alternar modo oscuro"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
}
