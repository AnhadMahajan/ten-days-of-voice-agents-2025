'use client';

import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

// Constants
const THEME_STORAGE_KEY = 'theme-preference';
const THEME_MEDIA_QUERY = '(prefers-color-scheme: dark)';

// Minified script to prevent FOUC (Flash of Unstyled Content)
const THEME_SCRIPT = `
  (function() {
    try {
      const doc = document.documentElement;
      const localTheme = localStorage.getItem("${THEME_STORAGE_KEY}");
      const systemTheme = window.matchMedia("${THEME_MEDIA_QUERY}").matches ? "dark" : "light";
      
      doc.classList.remove("light", "dark");
      
      if (localTheme === "dark" || (!localTheme && systemTheme === "dark") || (localTheme === "system" && systemTheme === "dark")) {
        doc.classList.add("dark");
      } else {
        doc.classList.add("light");
      }
    } catch (e) {}
  })();
`
  .replace(/\n/g, '')
  .replace(/\s+/g, ' ');

export type ThemeMode = 'dark' | 'light' | 'system';

export function ApplyThemeScript() {
  return (
    <script
      id="theme-script"
      dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
    />
  );
}

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeMode | undefined>(undefined);

  // 1. Initialize state on mount
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
    setTheme(stored ?? 'system');
  }, []);

  // 2. Listen for system changes when mode is 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia(THEME_MEDIA_QUERY);
    
    const handleChange = () => {
      const doc = document.documentElement;
      doc.classList.remove('light', 'dark');
      doc.classList.add(mediaQuery.matches ? 'dark' : 'light');
    };

    handleChange();

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const updateTheme = (newTheme: ThemeMode) => {
    const doc = document.documentElement;
    
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    setTheme(newTheme);

    doc.classList.remove('light', 'dark');

    if (newTheme === 'system') {
      const systemTheme = window.matchMedia(THEME_MEDIA_QUERY).matches ? 'dark' : 'light';
      doc.classList.add(systemTheme);
    } else {
      doc.classList.add(newTheme);
    }
  };

  // Prevent hydration mismatch
  if (!theme) {
    return (
      <div className={cn("h-20 w-20 rounded-full bg-gradient-to-br from-purple-900/20 to-pink-900/20 animate-pulse", className)} />
    );
  }

  const getActiveIndex = () => {
    switch (theme) {
      case 'light': return 0;
      case 'system': return 1;
      case 'dark': return 2;
      default: return 1;
    }
  };

  const activeIndex = getActiveIndex();
  const rotation = activeIndex * 120; // 120 degrees apart for 3 items

  return (
    <div className={cn("relative", className)}>
      <style>{`
        @keyframes orbit-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(236, 72, 153, 0.3);
          }
          50% { 
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(236, 72, 153, 0.5);
          }
        }
        @keyframes rotate-gradient {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      {/* Outer rotating gradient ring */}
      <div 
        className="absolute inset-0 -m-2 opacity-60 pointer-events-none"
        style={{ animation: 'rotate-gradient 8s linear infinite' }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 blur-xl" />
      </div>

      {/* Main circular container */}
      <div
        className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] border border-white/10 overflow-visible"
        style={{
          width: '180px',
          height: '180px',
          animation: 'orbit-glow 3s ease-in-out infinite',
        }}
        role="radiogroup"
        aria-label="Theme toggle"
      >
        {/* Pulsing rings background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="absolute w-[90%] h-[90%] rounded-full border border-purple-500/10 animate-ping"
            style={{ animationDuration: '3s' }}
          />
          <div 
            className="absolute w-[75%] h-[75%] rounded-full border border-pink-500/10 animate-ping"
            style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
          />
        </div>

        {/* Rotating gradient overlay */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: 'conic-gradient(from 0deg, transparent, rgba(139, 92, 246, 0.4), transparent)',
            animation: 'rotate-gradient 6s linear infinite'
          }}
        />

        {/* Center icon display */}
        <div className="relative z-20 flex flex-col items-center justify-center">
          <div 
            className="text-5xl mb-2 transition-all duration-500"
            style={{
              animation: 'pulse-scale 2s ease-in-out infinite',
              filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.8))'
            }}
          >
            {theme === 'light' && '☀️'}
            {theme === 'system' && '🖥️'}
            {theme === 'dark' && '🌙'}
          </div>
          <div className="text-xs font-mono uppercase tracking-widest text-white/40">
            {theme}
          </div>
        </div>

        {/* Orbiting buttons */}
        <div 
          className="absolute inset-0 transition-transform duration-700 ease-out"
          style={{ 
            transform: `rotate(${-rotation}deg)`,
          }}
        >
          {/* Light button */}
          <ThemeOrbitButton
            mode="light"
            current={theme}
            onClick={() => updateTheme('light')}
            icon={<Sun weight="fill" size={20} />}
            label="Light"
            angle={0}
            rotation={rotation}
          />

          {/* System button */}
          <ThemeOrbitButton
            mode="system"
            current={theme}
            onClick={() => updateTheme('system')}
            icon={<Monitor weight="fill" size={20} />}
            label="System"
            angle={120}
            rotation={rotation}
          />

          {/* Dark button */}
          <ThemeOrbitButton
            mode="dark"
            current={theme}
            onClick={() => updateTheme('dark')}
            icon={<Moon weight="fill" size={20} />}
            label="Dark"
            angle={240}
            rotation={rotation}
          />
        </div>
      </div>
    </div>
  );
}

function ThemeOrbitButton({
  mode,
  current,
  onClick,
  icon,
  label,
  angle,
  rotation,
}: {
  mode: ThemeMode;
  current: ThemeMode;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  angle: number;
  rotation: number;
}) {
  const isActive = current === mode;
  const radius = 70; // Distance from center

  // Calculate position
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius;

  // Color based on mode
  const getGradient = () => {
    switch (mode) {
      case 'light':
        return 'from-yellow-400 to-orange-500';
      case 'system':
        return 'from-cyan-400 to-blue-500';
      case 'dark':
        return 'from-purple-500 to-indigo-600';
    }
  };

  const getGlowColor = () => {
    switch (mode) {
      case 'light':
        return 'rgba(251, 191, 36, 0.6)';
      case 'system':
        return 'rgba(6, 182, 212, 0.6)';
      case 'dark':
        return 'rgba(139, 92, 246, 0.6)';
    }
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      aria-label={`Switch to ${label} theme`}
      onClick={onClick}
      className={cn(
        'absolute flex items-center justify-center rounded-full transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500',
        isActive 
          ? 'w-14 h-14 scale-110' 
          : 'w-11 h-11 scale-90 opacity-60 hover:opacity-100 hover:scale-100'
      )}
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      }}
    >
      {/* Glow effect for active button */}
      {isActive && (
        <div 
          className="absolute inset-0 rounded-full blur-lg animate-pulse"
          style={{
            background: getGlowColor(),
          }}
        />
      )}

      {/* Button body */}
      <div
        className={cn(
          'relative z-10 w-full h-full rounded-full flex items-center justify-center transition-all duration-300',
          isActive
            ? `bg-gradient-to-br ${getGradient()} shadow-lg text-white border-2 border-white/20`
            : 'bg-black/60 backdrop-blur-sm text-white/40 hover:text-white/80 border border-white/10 hover:border-white/30'
        )}
        style={{
          boxShadow: isActive ? `0 0 20px ${getGlowColor()}` : 'none',
        }}
      >
        <span className="transform" style={{ transform: `rotate(${-rotation}deg)` }}>
          {icon}
        </span>
      </div>
    </button>
  );
}