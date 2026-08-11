import React, { useState, useEffect } from 'react';
import { useWellness } from '../context/WellnessContext';
import { api } from '../services/api';
import { Goal } from '../types';
import { Target, Plus, CheckCircle, Trash2, Trophy, Zap, AlertCircle } from 'lucide-react';

export const GoalsView: React.FC = () => {
  const { profile, refreshUserData } = useWellness();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState(1);
  const [frequency, setFrequency] = useState('daily');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      loadGoals();
    }
  }, [profile]);

  const loadGoals = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await api.getGoals(profile.id);
      setGoals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !title.trim()) return;
    setSubmitting(true);
    try {
      await api.addGoal(profile.id, {
        title,
        description,
        target: Number(target) || 1,
        frequency
      });
      setTitle('');
      setDescription('');
      setTarget(1);
      setFrequency('daily');
      setIsModalOpen(false);
      await loadGoals();
      await refreshUserData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleIncrement = async (goalId: string) => {
    if (!profile) return;
    try {
      await api.updateGoalProgress(goalId, profile.id, 1);
      await loadGoals();
      await refreshUserData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!profile) return;
    try {
      await api.deleteGoal(goalId, profile.id);
      setGoals(prev => prev.filter(g => g.id !== goalId));
      await refreshUserData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) return null;

  const safeGoals = Array.isArray(goals) ? goals : [];
  const completedCount = safeGoals.filter(g => g && ((g as any).completed || (g.current_progress ?? (g as any).progress ?? 0) >= g.target)).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 theme-hero-card text-white p-6 sm:p-8 rounded-3xl shadow-xl border">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 theme-text-accent border theme-border-accent text-xs font-semibold">
            <Target className="w-4 h-4" /> Wellness Habit Builder
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Daily & Weekly Goals</h1>
          <p className="text-slate-200 text-sm max-w-lg">
            Build sustainable wellness habits. Complete daily goals to level up your plant and earn wellness points.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 theme-gradient-btn text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition scale-100 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Add Custom Goal</span>
        </button>
      </div>

      {/* Progress Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card border border-white/10 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 theme-text-accent flex items-center justify-center font-bold text-xl">
            {safeGoals.length}
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Active Goals</p>
            <p className="text-lg font-bold text-white">Tracked Habits</p>
          </div>
        </div>

        <div className="glass-card border border-white/10 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 theme-text-accent flex items-center justify-center font-bold text-xl">
            {completedCount}
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Completed Today</p>
            <p className="text-lg font-bold theme-text-accent">Achieved Goals</p>
          </div>
        </div>

        <div className="glass-card border border-white/10 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-amber-400 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Streak Bonus</p>
            <p className="text-lg font-bold text-white">{profile.streak} Days Active</p>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-400" /> Your Wellness Goals
        </h2>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
            Loading your goals...
          </div>
        ) : safeGoals.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/50 rounded-3xl border border-slate-800 space-y-3">
            <Target className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No active goals yet</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Start by creating simple goals like "5 minutes meditation" or "Drink 4 glasses of water".
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition mt-2"
            >
              Set First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeGoals.map(goal => {
              const currentProg = goal.current_progress ?? (goal as any).progress ?? 0;
              const isCompleted = (goal as any).completed || currentProg >= (goal.target || 1);
              const pct = Math.min(100, Math.round((currentProg / (goal.target || 1)) * 100));

              return (
                <div
                  key={goal.id}
                  className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-4 ${
                    isCompleted
                      ? 'bg-emerald-950/40 border-emerald-800/80'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">
                          {goal.frequency}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-900/80 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Completed
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-slate-400 text-xs">{goal.description}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                      title="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress Bar & Actions */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Progress</span>
                      <span className="font-bold">{goal.progress} / {goal.target} ({pct}%)</span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-400' : 'bg-teal-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">+25 Wellness Points</span>

                      <button
                        onClick={() => handleIncrement(goal.id)}
                        disabled={isCompleted}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isCompleted
                            ? 'bg-emerald-900/50 text-emerald-400 cursor-default'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" /> Done
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" /> Log Progress
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE GOAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" /> Create Custom Goal
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. 10 Min Meditation, Evening Reflection..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Practice breathing techniques before bed"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Target Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={target}
                    onChange={e => setTarget(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 font-semibold text-sm rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
