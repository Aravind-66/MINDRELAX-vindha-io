import React, { useState, useEffect } from 'react';
import { useWellness } from '../context/WellnessContext';
import { api } from '../services/api';
import { MoodEntry, MoodType } from '../types';
import { Smile, TrendingUp, Check, Sun, Heart, CloudRain, Flame, Zap, Coffee, Compass } from 'lucide-react';

export const MoodView: React.FC = () => {
  const { profile, refreshUserData } = useWellness();
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodType>('Happy');
  const [intensity, setIntensity] = useState<number>(3);
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (profile) loadMoods();
  }, [profile]);

  const loadMoods = async () => {
    if (!profile) return;
    try {
      const data = await api.getMoods(profile.id);
      setMoods(data);
    } catch (e) {
      console.error('Error loading moods:', e);
    }
  };

  const handleSaveMood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || submitting) return;
    setSubmitting(true);
    try {
      await api.logMood(profile.id, selectedMood, intensity, note);
      setSubmitted(true);
      setNote('');
      await loadMoods();
      await refreshUserData();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (e) {
      console.error('Error logging mood:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const moodOptions: { label: MoodType; icon: any; color: string }[] = [
    { label: 'Very Happy', icon: Sun, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
    { label: 'Happy', icon: Heart, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    { label: 'Neutral', icon: Compass, color: 'text-slate-300 border-slate-700 bg-slate-800/80' },
    { label: 'Sad', icon: CloudRain, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
    { label: 'Stressed', icon: Flame, color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
    { label: 'Anxious', icon: Zap, color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
    { label: 'Angry', icon: Flame, color: 'text-red-400 border-red-500/30 bg-red-500/10' },
    { label: 'Tired', icon: Coffee, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' }
  ];

  const moodCounts: Record<string, number> = {};
  moods.forEach(m => {
    moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
  });

  const totalEntries = moods.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="theme-hero-card rounded-3xl p-6 sm:p-8 text-white shadow-2xl border">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-white/10 theme-text-accent border theme-border-accent backdrop-blur-md">
            <Smile className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Mood Tracker</h1>
        </div>
        <p className="text-slate-200 text-sm max-w-xl">
          Log your emotional state day by day. Consistent tracking builds mental self-awareness and emotional resilience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mood Logger Form */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-8 rounded-3xl space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight">How are you feeling right now?</h2>

          <form onSubmit={handleSaveMood} className="space-y-6">
            {/* Mood selector grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {moodOptions.map(m => {
                const isSelected = selectedMood === m.label;
                const Icon = m.icon;
                return (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setSelectedMood(m.label)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition ${m.color} ${
                      isSelected ? 'ring-2 ring-white/60 scale-105 shadow-lg font-bold' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-2" />
                    <span className="text-xs font-semibold">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Intensity slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                <span>Mood Intensity</span>
                <span className="theme-text-accent">Level {intensity} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={intensity}
                onChange={e => setIntensity(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Optional note */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Reflection Note (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="What contributed to your mood today?"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full p-4 bg-slate-950/40 rounded-2xl border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full theme-gradient-btn py-3.5 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
            >
              {submitted ? (
                <>
                  <Check className="w-5 h-5 text-emerald-200" />
                  <span>Mood Logged!</span>
                </>
              ) : (
                <span>{submitting ? 'Saving...' : 'Save Mood Log (+15 Pts)'}</span>
              )}
            </button>
          </form>
        </div>

        {/* Mood Insights & Distribution */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <TrendingUp className="w-5 h-5 theme-text-accent" />
              <span>Mood Analytics</span>
            </div>

            <p className="text-xs text-slate-500 font-semibold">Distribution across {totalEntries} total logged entries:</p>

            <div className="space-y-3">
              {moodOptions.map(m => {
                const count = moodCounts[m.label] || 0;
                const percentage = totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0;
                const Icon = m.icon;
                return (
                  <div key={m.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5"><Icon className="w-3.5 h-3.5 theme-text-accent" /> {m.label}</span>
                      <span className="text-slate-500">{count} times ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mood History List */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recent Mood Log</h2>
          <span className="text-xs text-slate-500 font-semibold">{moods.length} entries recorded</span>
        </div>

        {!Array.isArray(moods) || moods.length === 0 ? (
          <div className="text-center py-12 text-slate-500 space-y-2">
            <Smile className="w-12 h-12 mx-auto text-slate-400" />
            <p className="text-sm font-bold text-slate-700">No mood entries logged yet.</p>
            <p className="text-xs text-slate-500 font-medium">Log your first mood above to start tracking your journey.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {moods.map(entry => {
              const moodOpt = moodOptions.find(o => o.label === entry.mood) || { icon: Smile, color: 'text-slate-700' };
              const Icon = moodOpt.icon;
              return (
                <div
                  key={entry.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 theme-text-accent">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{entry.mood}</span>
                        <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          Intensity: {entry.intensity}/5
                        </span>
                      </div>
                      {entry.note && (
                        <p className="text-xs text-slate-600 italic font-medium">"{entry.note}"</p>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500 font-semibold shrink-0">
                    {new Date(entry.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
