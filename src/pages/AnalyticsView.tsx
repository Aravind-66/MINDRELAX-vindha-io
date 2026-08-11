import React, { useState, useEffect } from 'react';
import { useWellness } from '../context/WellnessContext';
import { api } from '../services/api';
import { MoodEntry, MeditationSession, Goal, JournalEntry } from '../types';
import { BarChart2, Smile, Clock, Target, Award, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

export const AnalyticsView: React.FC = () => {
  const { profile, recentMoods, recentMeditations, recentJournals } = useWellness();
  const [moods, setMoods] = useState<MoodEntry[]>(recentMoods);
  const [meditations, setMeditations] = useState<MeditationSession[]>(recentMeditations);
  const [journals, setJournals] = useState<JournalEntry[]>(recentJournals);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      loadData();
    }
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [m, med, g, j] = await Promise.all([
        api.getMoods(profile.id),
        api.getMeditations(profile.id),
        api.getGoals(profile.id),
        api.getJournal(profile.id)
      ]);
      setMoods(m);
      setMeditations(med);
      setGoals(g);
      setJournals(j);
    } catch (err) {
      console.error('Error loading analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  const safeMoods = Array.isArray(moods) ? moods : [];
  const safeMeditations = Array.isArray(meditations) ? meditations : [];
  const safeJournals = Array.isArray(journals) ? journals : [];
  const safeGoals = Array.isArray(goals) ? goals : [];

  const totalMeditationSeconds = safeMeditations.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
  const totalMeditationMinutes = Math.round(totalMeditationSeconds / 60);

  // Chart 1: Mood Distribution Data
  const moodCounts: Record<string, number> = {};
  safeMoods.forEach(m => {
    if (m && m.mood) {
      moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
    }
  });

  const COLORS = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

  const moodPieData = Object.entries(moodCounts).map(([name, value]) => ({
    name,
    value
  }));

  // Chart 2: Weekly Activity Breakdown (Days Mon - Sun)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const activityByDay = daysOfWeek.map(dayName => ({
    day: dayName,
    moods: 0,
    journals: 0,
    meditations: 0
  }));

  safeMoods.forEach(m => {
    if (m && m.created_at) {
      const dayIdx = new Date(m.created_at).getDay();
      if (activityByDay[dayIdx]) activityByDay[dayIdx].moods += 1;
    }
  });

  safeJournals.forEach(j => {
    if (j && j.created_at) {
      const dayIdx = new Date(j.created_at).getDay();
      if (activityByDay[dayIdx]) activityByDay[dayIdx].journals += 1;
    }
  });

  safeMeditations.forEach(med => {
    const medDate = med?.created_at || med?.completed_at;
    if (medDate) {
      const dayIdx = new Date(medDate).getDay();
      if (activityByDay[dayIdx]) activityByDay[dayIdx].meditations += 1;
    }
  });

  const completedGoalsCount = safeGoals.filter(g => g && (g.completed || (g.current_progress || (g as any).progress || 0) >= g.target)).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="theme-hero-card rounded-3xl p-6 sm:p-8 text-white shadow-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 theme-text-accent border theme-border-accent text-xs font-semibold">
            <BarChart2 className="w-4 h-4" /> Real-time Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Wellness Insights & Trends</h1>
          <p className="text-slate-200 text-sm max-w-xl">
            Track your emotional patterns, meditation presence, journal reflections, and habit streaks over time.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card border border-white/10 p-5 rounded-3xl space-y-2 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider">Mood Logs</span>
            <Smile className="w-4 h-4 theme-text-accent" />
          </div>
          <p className="text-2xl font-black text-white">{moods.length}</p>
          <p className="text-[11px] theme-text-accent font-semibold">Check-ins Recorded</p>
        </div>

        <div className="glass-card border border-white/10 p-5 rounded-3xl space-y-2 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider">Mindfulness Time</span>
            <Clock className="w-4 h-4 theme-text-accent" />
          </div>
          <p className="text-2xl font-black text-white">{totalMeditationMinutes} min</p>
          <p className="text-[11px] theme-text-accent font-semibold">{meditations.length} Sessions Completed</p>
        </div>

        <div className="glass-card border border-white/10 p-5 rounded-3xl space-y-2 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider">Reflections</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">{journals.length}</p>
          <p className="text-[11px] text-indigo-400 font-semibold">Journal Entries</p>
        </div>

        <div className="glass-card border border-white/10 p-5 rounded-3xl space-y-2 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider">Wellness Level</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">Level {profile.plant_level || 1}</p>
          <p className="text-[11px] text-purple-400 font-semibold">{profile.wellness_points} Points Earned</p>
        </div>
      </div>

      {/* Analytics Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Weekly Activity Frequency */}
        <div className="glass-card border border-white/10 rounded-3xl p-6 space-y-4 shadow-md">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 theme-text-accent" /> Weekly Activity Log
          </h3>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityByDay}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                />
                <Bar dataKey="moods" fill="#10b981" radius={[4, 4, 0, 0]} name="Moods" />
                <Bar dataKey="journals" fill="#6366f1" radius={[4, 4, 0, 0]} name="Journals" />
                <Bar dataKey="meditations" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Meditations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Mood Distribution Pie */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md flex flex-col justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Smile className="w-5 h-5 text-teal-400" /> Mood Frequency Distribution
          </h3>

          {moodPieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
              No mood data recorded yet. Log your mood to populate charts.
            </div>
          ) : (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moodPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {moodPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-center pt-2">
            {moodPieData.map((m, idx) => (
              <div key={m.name} className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span>{m.name}: {m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
