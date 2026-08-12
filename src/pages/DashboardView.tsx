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
  Compass,
  Users,
  Target,
  FileText,
  Video,
  User
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
    <div className="space-y-8 animate-in fade-in duration-300 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
      <ThreeDCard depth={8} glowColor="var(--color-glow)">
        <div className="theme-hero-card rounded-3xl p-6 sm:p-8 text-slate-900 shadow-md relative overflow-hidden border grid gap-6 lg:grid-cols-[1.3fr_0.9fr] items-center">
          <div className="space-y-5 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-300/50 text-slate-800 text-xs font-bold backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 theme-text-accent" />
              <span>MindRelax Home</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              {greeting}, {profile?.display_name || 'Friend'}
            </h1>

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium max-w-2xl">
              Welcome to your personal wellness sanctuary. Pick one of the pages below to continue your mindful journey.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 sm:max-w-full">
              <NavLink
                to="/mood"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl theme-gradient-btn text-white font-semibold shadow-sm transition hover:shadow-lg"
              >
                <Smile className="w-4 h-4" />
                Mood Tracker
              </NavLink>
              <NavLink
                to="/journal"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl glass-card border border-slate-300/40 text-slate-900 font-semibold transition hover:bg-slate-50"
              >
                <BookOpen className="w-4 h-4 theme-text-accent" />
                Journal
              </NavLink>
              <NavLink
                to="/meditate"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl glass-card border border-slate-300/40 text-slate-900 font-semibold transition hover:bg-slate-50"
              >
                <Compass className="w-4 h-4 theme-text-accent" />
                Meditate
              </NavLink>
              <NavLink
                to="/music"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl glass-card border border-slate-300/40 text-slate-900 font-semibold transition hover:bg-slate-50"
              >
                <Music className="w-4 h-4 text-cyan-400" />
                Music
              </NavLink>
            </div>
          </div>

          <div className="h-72 w-full rounded-3xl overflow-hidden bg-slate-950/60 border border-slate-200/10">
            <ThreeZenCanvas variant="hero" className="w-full h-full" />
          </div>
        </div>
      </ThreeDCard>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Explore the rest of the app</h2>
            <p className="text-slate-400 text-sm">Every page is separate so you can move forward one step at a time.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 w-full min-w-0">
          {[
            { title: 'Mood', path: '/mood', icon: Smile, description: 'Log how you feel and build emotional awareness.' },
            { title: 'Journal', path: '/journal', icon: BookOpen, description: 'Capture thoughts, gratitude, and daily reflections.' },
            { title: 'Meditate', path: '/meditate', icon: Compass, description: 'Start a calm breathing or relaxation session.' },
            { title: 'Music', path: '/music', icon: Music, description: 'Play soothing soundscapes and focus tracks.' },
            { title: 'Community', path: '/community', icon: Users, description: 'Join the sanctuary and connect with others.' },
            { title: 'Games', path: '/games', icon: Gamepad2, description: 'Try mindful games and brain breaks.' },
            { title: 'Plant', path: '/plant', icon: Sprout, description: 'Grow your virtual plant with healthy habits.' },
            { title: 'Goals', path: '/goals', icon: Target, description: 'Track your wellness goals and progress.' },
            { title: 'Resources', path: '/resources', icon: FileText, description: 'Browse guided resources and tools.' },
            { title: 'Webinars', path: '/webinars', icon: Video, description: 'Watch wellness talks and live sessions.' },
            { title: 'Analytics', path: '/analytics', icon: BarChart2, description: 'See your trends and self-care progress.' },
            { title: 'Profile', path: '/profile', icon: User, description: 'Manage your profile and settings.' }
          ].map(item => (
            <NavLink
              key={item.title}
              to={item.path}
              className="glass-card p-5 rounded-3xl border border-white/10 shadow-sm transition hover:-translate-y-1 hover:border-emerald-400/40 min-w-0"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-center text-emerald-400 shadow-inner">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Go</span>
              </div>
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-sm text-slate-400 mt-2">{item.description}</p>
            </NavLink>
          ))}
        </div>
      </section>
    </div>
  );
};
