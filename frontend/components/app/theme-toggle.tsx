'use client';

import { useEffect, useState } from 'react';
import { MonitorIcon, MoonIcon, SunIcon } from '@phosphor-icons/react';
import { THEME_MEDIA_QUERY, THEME_STORAGE_KEY, cn } from '@/lib/utils';

const THEME_SCRIPT = `
  const doc = document.documentElement;
  const theme = localStorage.getItem("${THEME_STORAGE_KEY}") ?? "system";

  if (theme === "system") {
    if (window.matchMedia("${THEME_MEDIA_QUERY}").matches) {
      doc.classList.add("dark");
    } else {
      doc.classList.add("light");
    }
  } else {
    doc.classList.add(theme);
  }
`
  .trim()
  .replace(/\n/g, '')
  .replace(/\s+/g, ' ');

export type ThemeMode = 'dark' | 'light' | 'system';

function applyTheme(theme: ThemeMode) {
  const doc = document.documentElement;

  doc.classList.remove('dark', 'light');
  localStorage.setItem(THEME_STORAGE_KEY, theme);

  if (theme === 'system') {
    if (window.matchMedia(THEME_MEDIA_QUERY).matches) {
      doc.classList.add('dark');
    } else {
      doc.classList.add('light');
    }
  } else {
    doc.classList.add(theme);
  }
}

interface ThemeToggleProps {
  className?: string;
}

export function ApplyThemeScript() {
  return <script id="theme-script">{THEME_SCRIPT}</script>;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeMode | undefined>(undefined);

  useEffect(() => {
    const storedTheme = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) ?? 'system';

    setTheme(storedTheme);
  }, []);

  function handleThemeChange(theme: ThemeMode) {
    applyTheme(theme);
    setTheme(theme);
  }

  return (
    <div
      className={cn(
        'text-foreground bg-white dark:bg-slate-900 flex w-full flex-row justify-end divide-x divide-slate-200 dark:divide-slate-700 overflow-hidden rounded-full border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300',
        className
      )}
    >
      <span className="sr-only">Color scheme toggle</span>
      
      {/* Dark Mode Button */}
      <button
        type="button"
        onClick={() => handleThemeChange('dark')}
        className={cn(
          'cursor-pointer p-2 pl-2.5 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800',
          theme === 'dark' && 'bg-slate-100 dark:bg-slate-800'
        )}
        aria-label="Enable dark color scheme"
      >
        <span className="sr-only">Enable dark color scheme</span>
        <MoonIcon 
          size={18} 
          weight="bold" 
          className={cn(
            'transition-all duration-300',
            theme === 'dark' 
              ? 'text-blue-600 dark:text-blue-400 scale-110' 
              : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
          )} 
        />
      </button>

      {/* Light Mode Button */}
      <button
        type="button"
        onClick={() => handleThemeChange('light')}
        className={cn(
          'cursor-pointer px-2.5 py-2 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800',
          theme === 'light' && 'bg-slate-100 dark:bg-slate-800'
        )}
        aria-label="Enable light color scheme"
      >
        <span className="sr-only">Enable light color scheme</span>
        <SunIcon 
          size={18} 
          weight="bold" 
          className={cn(
            'transition-all duration-300',
            theme === 'light' 
              ? 'text-amber-500 scale-110' 
              : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
          )} 
        />
      </button>

      {/* System Mode Button */}
      <button
        type="button"
        onClick={() => handleThemeChange('system')}
        className={cn(
          'cursor-pointer p-2 pr-2.5 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800',
          theme === 'system' && 'bg-slate-100 dark:bg-slate-800'
        )}
        aria-label="Enable system color scheme"
      >
        <span className="sr-only">Enable system color scheme</span>
        <MonitorIcon 
          size={18} 
          weight="bold" 
          className={cn(
            'transition-all duration-300',
            theme === 'system' 
              ? 'text-emerald-600 dark:text-emerald-400 scale-110' 
              : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
          )} 
        />
      </button>
    </div>
  );
}