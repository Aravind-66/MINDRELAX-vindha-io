import React, { useState, useEffect } from 'react';
import { useWellness } from '../context/WellnessContext';
import { api } from '../services/api';
import { ThreeZenCanvas } from '../components/ThreeZenCanvas';
import { ThreeDCard } from '../components/ThreeDCard';
import { LiveActivityTicker } from '../components/LiveActivityTicker';
import { Compass, Play, Pause, RotateCcw, CheckCircle2, Clock } from 'lucide-react';

export const MeditationView: React.FC = () => {
  const { profile, refreshUserData } = useWellness();
  const [category, setCategory] = useState<string>('Breathing');
  const [durationMins, setDurationMins] = useState<number>(5);
  const [secondsLeft, setSecondsLeft] = useState<number>(300);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  const categories = [
    { name: 'Breathing', description: 'Calm your nervous system with rhythmic diaphragmatic breath.' },
    { name: 'Sleep', description: 'Unwind your mind for deep, restorative nighttime rest.' },
    { name: 'Stress relief', description: 'Release physical tightness and mental tension.' },
    { name: 'Focus', description: 'Sharpen your attention and single-pointed clarity.' },
    { name: 'Relaxation', description: 'Gentle body scan to dissolve daily fatigue.' },
    { name: 'Mindfulness', description: 'Cultivate open, non-judgmental present awareness.' }
  ];

  useEffect(() => {
    setSecondsLeft(durationMins * 60);
    setIsActive(false);
    setIsCompleted(false);
  }, [durationMins, category]);

  // Meditation Countdown Timer
  useEffect(() => {
    let timer: any = null;
    if (isActive && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && secondsLeft === 0) {
      setIsActive(false);
      handleSessionComplete();
    }
    return () => clearInterval(timer);
  }, [isActive, secondsLeft]);

  // Breathing Phase Loop (Inhale 4s -> Hold 4s -> Exhale 4s)
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setBreathPhase(prev => {
        if (prev === 'Inhale') return 'Hold';
        if (prev === 'Hold') return 'Exhale';
        return 'Inhale';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isActive]);

  const handleSessionComplete = async () => {
    if (!profile) return;
    setIsCompleted(true);
    try {
      await api.completeMeditation(profile.id, category, `${category} Meditation (${durationMins}m)`, durationMins * 60);
      await refreshUserData();
    } catch (e) {
      console.error('Error recording meditation session:', e);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setIsCompleted(false);
    setSecondsLeft(durationMins * 60);
    setBreathPhase('Inhale');
  };

  const formatTime = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Realtime Ticker */}
      <LiveActivityTicker />

      {/* Header */}
      <div className="theme-hero-card rounded-3xl p-6 sm:p-8 text-white shadow-2xl border">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-white/10 theme-text-accent border theme-border-accent backdrop-blur-md">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Guided Meditation & Focus</h1>
        </div>
        <p className="text-slate-200 text-sm max-w-xl">
          Enter a peaceful presence. Choose a duration and theme to quiet your thoughts and restore inner clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category & Setup Selection */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight">Select Theme</h2>

            <div className="space-y-2">
              {categories.map(c => {
                const isSelected = category === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => {
                      setCategory(c.name);
                      handleReset();
                    }}
                    className={`w-full p-3.5 rounded-2xl text-left border transition ${
                      isSelected
                        ? 'theme-gradient-btn text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="font-bold text-sm block">{c.name}</span>
                    <span className="text-xs text-slate-300 block mt-0.5">{c.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duration</h2>
            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 10, 15].map(m => (
                <button
                  key={m}
                  onClick={() => {
                    setDurationMins(m);
                    handleReset();
                  }}
                  className={`py-2.5 text-xs font-bold rounded-xl border transition ${
                    durationMins === m
                      ? 'theme-gradient-btn text-white shadow-md'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {m} Min
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Meditation Timer & 3D Environment */}
        <div className="lg:col-span-2 glass-card p-4 sm:p-8 rounded-3xl border border-white/10 text-white shadow-2xl flex flex-col items-center justify-center min-h-[400px] sm:min-h-[480px] relative overflow-hidden">
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 text-xs theme-text-accent font-semibold uppercase tracking-wider flex items-center gap-1.5 z-10">
            <Clock className="w-4 h-4" />
            <span>{category} Meditation • {durationMins} Mins</span>
          </div>

          {/* 3D Breathing Environment Canvas Background */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <ThreeZenCanvas variant="meditation" className="w-full h-full" />
          </div>

          {/* Animated Breathing Circle Visualizer */}
          <div className="relative z-10 my-6 sm:my-8 flex items-center justify-center">
            <div
              className={`w-48 h-48 sm:w-64 sm:h-64 rounded-full border-2 border-teal-500/30 flex items-center justify-center transition-all duration-[4000ms] ${
                isActive && breathPhase === 'Inhale'
                  ? 'scale-105 sm:scale-110 border-teal-400/80 bg-teal-500/10 shadow-[0_0_60px_rgba(20,184,166,0.3)]'
                  : isActive && breathPhase === 'Exhale'
                  ? 'scale-95 sm:scale-90 border-teal-600/40 bg-transparent'
                  : 'scale-100 border-teal-500/20'
              }`}
            >
              <div
                className={`w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 flex flex-col items-center justify-center shadow-2xl transition-all duration-[4000ms] ${
                  isActive && breathPhase === 'Inhale' ? 'scale-105 sm:scale-110 shadow-teal-500/50' : 'scale-95'
                }`}
              >
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono">{formatTime(secondsLeft)}</span>
                {isActive && (
                  <span className="text-[10px] sm:text-xs text-emerald-100 font-semibold tracking-wider uppercase mt-1 animate-pulse">
                    {breathPhase}...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Completion state alert */}
          {isCompleted && (
            <div className="relative z-10 bg-emerald-500/20 border border-emerald-500/40 px-6 py-3 rounded-2xl text-emerald-200 text-sm font-bold flex items-center gap-2 mb-4 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Session Complete! You earned +{Math.max(20, durationMins * 10)} Wellness Points!</span>
            </div>
          )}

          {/* Controls */}
          <div className="relative z-10 flex items-center gap-4">
            <button
              onClick={() => setIsActive(!isActive)}
              disabled={isCompleted}
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-base rounded-2xl shadow-xl transition hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isActive ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" />
                  <span>{secondsLeft < durationMins * 60 ? 'Resume' : 'Begin Session'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="p-3.5 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-2xl transition"
              aria-label="Reset timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
