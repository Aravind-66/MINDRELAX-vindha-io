import React, { useEffect, useState } from 'react';
import { useWellness } from '../context/WellnessContext';
import { NavLink } from 'react-router-dom';
import { ThreeZenCanvas } from '../components/ThreeZenCanvas';
import { LiveActivityTicker } from '../components/LiveActivityTicker';
import { ThreeDCard } from '../components/ThreeDCard';
import {
  Smile,
  Flame,
  Award,
  Clock,
  BookOpen,
  Bot,
  Gamepad2,
  Sprout,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Music,
  BarChart2,
  Compass
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { profile, recentMoods, recentJournals, recentMeditations, triggerMindaModal } = useWellness();
  const [greeting, setGreeting] = useState<string>('Good day');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Calculate statistics
  const todayMood = recentMoods[0]?.mood || profile?.current_mood || 'Not checked';
  const totalMeditationMins = Math.round(
    recentMeditations.reduce((acc, m) => acc + (m.duration_seconds || 0), 0) / 60
  );
  const totalJournals = recentJournals.length;

  const getDailyInsight = () => {
    if (recentMoods.length > 0 && ['Sad', 'Stressed', 'Anxious'].includes(recentMoods[0].mood)) {
      return "Taking a 5-minute ocean ambient session can help regulate your nervous system and release daily pressure.";
    }
    if (recentJournals.length >= 3) {
      return "You have been journaling consistently. Recording your inner thoughts clears mental bandwidth for restful sleep.";
    }
    if (totalMeditationMins > 15) {
      return "Excellent mindfulness progress. You have built over 15 minutes of quiet focus this week.";
    }
    return "A calmer mind begins with one deliberate pause. Try logging your mood or spending 3 minutes breathing deeply today.";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Real-time Ticker */}
      <LiveActivityTicker />

      {/* Hero Section with Interactive 3D Canvas */}
      <ThreeDCard depth={8} glowColor="var(--color-glow)">
        <div className="theme-hero-card rounded-3xl p-6 sm:p-8 text-slate-900 shadow-md relative overflow-hidden border grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-4 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-300/50 text-slate-800 text-xs font-bold backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 theme-text-accent" />
              <span>MindRelax Sanctuary</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              {greeting}, {profile?.display_name || 'Friend'}
            </h1>

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
              Welcome to your daily peaceful space. Take a slow breath and step into mindful presence.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={triggerMindaModal}
                className="theme-gradient-btn flex items-center gap-2 px-5 py-2.5 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition scale-100 hover:scale-105 active:scale-95"
              >
                <Bot className="w-4 h-4 text-white" />
                <span>Ask Minda AI</span>
              </button>
              <NavLink
                to="/meditate"
                className="flex items-center gap-2 px-5 py-2.5 glass-card border border-slate-300/40 font-bold rounded-2xl text-xs sm:text-sm transition hover:scale-105 active:scale-95"
              >
                <Compass className="w-4 h-4 theme-text-accent" />
                <span>Start Relaxation</span>
              </NavLink>
            </div>
          </div>

          {/* 3D Ambient Hero Ring */}
          <div className="h-48 md:h-56 w-full relative flex items-center justify-center">
            <ThreeZenCanvas variant="hero" className="w-full h-full" />
          </div>
        </div>
      </ThreeDCard>

      {/* Wellness Overview Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Mood Card */}
        <div className="glass-card p-5 rounded-3xl space-y-2 hover:border-slate-300 transition transform hover:-translate-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Current Mood</span>
            <Smile className="w-5 h-5 theme-text-accent" />
          </div>
          <p className="text-lg font-bold text-slate-900 truncate">{todayMood}</p>
          <NavLink to="/mood" className="text-[11px] font-bold theme-text-accent hover:underline inline-flex items-center gap-1">
            <span>Check In</span>
            <ArrowRight className="w-3 h-3" />
          </NavLink>
        </div>

        {/* Streak Card */}
        <div className="glass-card p-5 rounded-3xl space-y-2 hover:border-slate-300 transition transform hover:-translate-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Streak</span>
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-lg font-bold text-slate-900">{profile?.streak || 1} Days</p>
          <span className="text-[11px] text-slate-500 block font-semibold">Active daily check-ins</span>
        </div>

        {/* Points Card */}
        <div className="glass-card p-5 rounded-3xl space-y-2 hover:border-slate-300 transition transform hover:-translate-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Wellness Points</span>
            <Award className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-lg font-bold text-slate-900">{profile?.wellness_points || 0}</p>
          <span className="text-[11px] theme-text-accent font-bold block">Level {profile?.plant_level || 1} Plant</span>
        </div>

        {/* Meditation Minutes */}
        <div className="glass-card p-5 rounded-3xl space-y-2 hover:border-slate-300 transition transform hover:-translate-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Meditation</span>
            <Clock className="w-5 h-5 theme-text-accent" />
          </div>
          <p className="text-lg font-bold text-slate-900">{totalMeditationMins} mins</p>
          <span className="text-[11px] text-slate-500 block font-semibold">Total session time</span>
        </div>

        {/* Journal Entries */}
        <div className="col-span-2 sm:col-span-1 glass-card p-5 rounded-3xl space-y-2 hover:border-slate-300 transition transform hover:-translate-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Journal</span>
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-lg font-bold text-slate-900">{totalJournals} entries</p>
          <NavLink to="/journal" className="text-[11px] font-bold theme-text-accent hover:underline inline-flex items-center gap-1">
            <span>Write Entry</span>
            <ArrowRight className="w-3 h-3" />
          </NavLink>
        </div>
      </div>

      {/* Daily Insight Box */}
      <div className="glass-card p-6 rounded-3xl flex items-start gap-4 shadow-sm border theme-border-accent bg-emerald-50/40">
        <div className="p-3 bg-emerald-500/10 theme-text-accent rounded-2xl border theme-border-accent shrink-0">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-white text-base">Daily Mindful Insight</h3>
          <p className="text-slate-200 text-sm leading-relaxed">{getDailyInsight()}</p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <NavLink
            to="/mood"
            className="flex flex-col items-center justify-center p-4 glass-card rounded-2xl border border-white/10 shadow-xs hover:border-emerald-500 transition group"
          >
            <div className="p-3 rounded-2xl bg-white/5 theme-text-accent group-hover:scale-110 transition mb-2">
              <Smile className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200">Mood Tracker</span>
          </NavLink>

          <NavLink
            to="/journal"
            className="flex flex-col items-center justify-center p-4 glass-card rounded-2xl border border-white/10 shadow-xs hover:border-indigo-500 transition group"
          >
            <div className="p-3 rounded-2xl bg-white/5 text-indigo-400 group-hover:scale-110 transition mb-2">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200">Journal</span>
          </NavLink>

          <NavLink
            to="/meditate"
            className="flex flex-col items-center justify-center p-4 glass-card rounded-2xl border border-white/10 shadow-xs hover:border-teal-500 transition group"
          >
            <div className="p-3 rounded-2xl bg-white/5 theme-text-accent group-hover:scale-110 transition mb-2">
              <Compass className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200">Relaxation</span>
          </NavLink>

          <NavLink
            to="/music"
            className="flex flex-col items-center justify-center p-4 glass-card rounded-2xl border border-white/10 shadow-xs hover:border-cyan-500 transition group"
          >
            <div className="p-3 rounded-2xl bg-white/5 text-cyan-400 group-hover:scale-110 transition mb-2">
              <Music className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200">Music & Sound</span>
          </NavLink>

          <NavLink
            to="/analytics"
            className="flex flex-col items-center justify-center p-4 glass-card rounded-2xl border border-white/10 shadow-xs hover:border-blue-500 transition group"
          >
            <div className="p-3 rounded-2xl bg-white/5 text-blue-400 group-hover:scale-110 transition mb-2">
              <BarChart2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200">Analytics</span>
          </NavLink>

          <NavLink
            to="/games"
            className="flex flex-col items-center justify-center p-4 glass-card rounded-2xl border border-white/10 shadow-xs hover:border-purple-500 transition group"
          >
            <div className="p-3 rounded-2xl bg-white/5 text-purple-400 group-hover:scale-110 transition mb-2">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-200">Mind Games</span>
          </NavLink>
        </div>
      </div>

      {/* Plant & Goals Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plant Widget */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-md flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center theme-text-accent shrink-0 shadow-inner">
            <Sprout className="w-10 h-10" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Virtual Plant</h3>
              <span className="text-xs font-bold bg-white/10 theme-text-accent px-2.5 py-0.5 rounded-full border theme-border-accent">
                Level {profile?.plant_level || 1}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">Your plant flourishes as you maintain daily mindfulness and self-care logs.</p>
            <NavLink
              to="/plant"
              className="text-xs font-bold theme-text-accent hover:underline inline-flex items-center gap-1 pt-1"
            >
              <span>Care for Plant</span>
              <ArrowRight className="w-3 h-3" />
            </NavLink>
          </div>
        </div>

        {/* Goals Widget */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-md flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="font-bold text-white text-base">Wellness Goals</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Set daily and weekly intentions to nurture calm habits and emotional clarity.</p>
            <NavLink
              to="/goals"
              className="text-xs font-bold theme-text-accent hover:underline inline-flex items-center gap-1 pt-1"
            >
              <span>View Active Goals</span>
              <ArrowRight className="w-3 h-3" />
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
