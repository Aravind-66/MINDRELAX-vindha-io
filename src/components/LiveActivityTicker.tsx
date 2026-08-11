import React from 'react';
import { useWellness } from '../context/WellnessContext';
import { Radio, Palette, Sun, Moon } from 'lucide-react';

export const LiveActivityTicker: React.FC = () => {
  const {
    liveActivities,
    onlineCount,
    isRealtimeConnected,
    bgTheme,
    setBgTheme,
    colorMode,
    toggleColorMode
  } = useWellness();

  if (!liveActivities || liveActivities.length === 0) return null;

  const currentActivity = liveActivities[0];

  const themes: Array<{ id: 'emerald' | 'cosmic' | 'ocean' | 'sunset' | 'zen'; label: string; color: string }> = [
    { id: 'emerald', label: 'Emerald', color: 'bg-emerald-500' },
    { id: 'cosmic', label: 'Cosmic', color: 'bg-purple-500' },
    { id: 'ocean', label: 'Ocean', color: 'bg-cyan-500' },
    { id: 'sunset', label: 'Sunset', color: 'bg-rose-500' },
    { id: 'zen', label: 'Zen', color: 'bg-lime-500' }
  ];

  return (
    <div className="glass-card rounded-2xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs backdrop-blur-xl transition-all duration-300">
      <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-[240px]">
        <div className="p-1.5 rounded-xl bg-emerald-500/10 theme-text-accent border theme-border-accent shrink-0">
          <Radio className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="font-bold theme-text-accent uppercase tracking-wider text-[10px] shrink-0 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border theme-border-accent">
            Live Sanctuary
          </span>
          <p className="truncate font-semibold text-xs opacity-90">
            {currentActivity.message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleColorMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-slate-300/30 text-[11px] font-bold transition scale-100 hover:scale-105 active:scale-95 shadow-sm"
          title={colorMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {colorMode === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {/* Live Theme Switcher */}
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-slate-300/30">
          <Palette className="w-3.5 h-3.5 opacity-60 ml-1" />
          <div className="flex items-center gap-1">
            {themes.map(t => {
              const isSelected = bgTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setBgTheme(t.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    isSelected
                      ? 'theme-gradient-btn text-white shadow-sm'
                      : 'opacity-70 hover:opacity-100 hover:bg-white/10'
                  }`}
                  title={`Switch live theme to ${t.label}`}
                >
                  <span className={`w-2 h-2 rounded-full ${t.color}`} />
                  <span className="inline">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Online Badge */}
        <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-xl border border-slate-300/30 text-[10px] theme-text-accent font-bold">
          <span className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span>{onlineCount} Online</span>
        </div>
      </div>
    </div>
  );
};
