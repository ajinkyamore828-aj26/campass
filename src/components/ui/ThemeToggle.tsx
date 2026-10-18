import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useCampusPass } from '@/context/CampusPassContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'landing' | 'portal';
  style?: React.CSSProperties;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'landing',
  style,
}) => {
  const { theme, toggleTheme } = useCampusPass();
  const isDark = theme === 'dark';

  if (variant === 'landing') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.12)',
          color: isDark ? '#ffffff' : '#0f172a',
          ...style,
        }}
        className={`group active:scale-95 transition-transform hover:opacity-90 ${className}`}
      >
        {isDark ? (
          <Sun className="h-4 w-4 text-amber-300 transition-transform duration-300 group-hover:rotate-45" />
        ) : (
          <Moon className="h-4 w-4 text-slate-700 transition-transform duration-300 group-hover:-rotate-12" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        width: '38px',
        height: '38px',
        borderRadius: '11px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        background: isDark ? '#18181b' : '#ffffff',
        border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
        color: isDark ? '#f4f4f5' : '#0f172a',
        boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.04)',
        ...style,
      }}
      className={`group active:scale-95 transition-transform hover:opacity-90 ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 transition-transform duration-300 group-hover:-rotate-12" />
      )}
    </button>
  );
};

export default ThemeToggle;
