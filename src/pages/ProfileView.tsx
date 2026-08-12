import React, { useState, useEffect } from 'react';
import { useWellness } from '../context/WellnessContext';
import { api } from '../services/api';
import { Achievement } from '../types';
import { Award, Flame, Settings, RotateCcw, Check, ShieldCheck, Sprout, Moon, Sun, Palette } from 'lucide-react';
import { ThreeZenCanvas } from '../components/ThreeZenCanvas';

export const ProfileView: React.FC = () => {
  const { profile, updateProfileData, setIsOnboardingOpen, bgTheme, setBgTheme, colorMode, toggleColorMode } = useWellness();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setAgeRange(profile.age_range || '');
      loadAchievements();
    }
  }, [profile]);

  const loadAchievements = async () => {
    if (!profile) return;
    try {
      const data = await api.getAchievements(profile.id);
      setAchievements(data);
    } catch (err) {
      console.error('Error loading achievements:', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    try {
      await updateProfileData({
        display_name: displayName,
        age_range: ageRange
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset your local profile and re-run onboarding?')) {
      localStorage.removeItem('mindrelax_profile_id');
      window.location.reload();
    }
  };

  if (!profile) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 theme-hero-card text-white p-6 sm:p-8 rounded-3xl shadow-2xl border">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl theme-gradient-btn text-white font-black text-2xl shadow-lg flex items-center justify-center">
            {profile.display_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{profile.display_name}</h1>
            <p className="text-slate-200 text-xs sm:text-sm">
              Level {profile.plant_level || 1} Wellness Explorer • MindRelax Member
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-card border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Streak</p>
              <p className="text-sm font-bold text-white">{profile.streak} Days</p>
            </div>
          </div>

          <div className="glass-card border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-2">
            <Award className="w-5 h-5 theme-text-accent" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Points</p>
              <p className="text-sm font-bold theme-text-accent">{profile.wellness_points} Pts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Settings Form */}
        <div className="lg:col-span-2 glass-card border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 theme-text-accent" /> Personal Details
            </h2>
            {saveSuccess && (
              <span className="text-xs theme-text-accent font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                Age Range
              </label>
              <select
                value={ageRange}
                onChange={e => setAgeRange(e.target.value)}
                className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="" className="bg-slate-900 text-white">Select age range</option>
                <option value="Under 18" className="bg-slate-900 text-white">Under 18</option>
                <option value="18-24" className="bg-slate-900 text-white">18-24</option>
                <option value="25-34" className="bg-slate-900 text-white">25-34</option>
                <option value="35-44" className="bg-slate-900 text-white">35-44</option>
                <option value="45-54" className="bg-slate-900 text-white">45-54</option>
                <option value="55+" className="bg-slate-900 text-white">55+</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-2">
                Your Active Wellness Goals
              </label>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(profile.wellness_goals)
                  ? profile.wellness_goals
                  : typeof profile.wellness_goals === 'string'
                  ? (profile.wellness_goals as string).split(',')
                  : ['Relaxation', 'Better sleep', 'Stress relief']
                ).map((goal, idx) => (
                  <span key={idx} className="text-xs bg-white/10 theme-text-accent border theme-border-accent px-3 py-1 rounded-full font-medium">
                    {goal}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 theme-gradient-btn text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>

          {/* Reset Options */}
          <div className="pt-6 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase text-rose-400">Account Preferences</h3>
            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <div>
                <p className="text-sm font-bold text-white">Re-run Onboarding Setup</p>
                <p className="text-xs text-slate-400">Update your preferences and display name.</p>
              </div>
              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
              >
                Onboarding
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-rose-950/20 rounded-2xl border border-rose-900/40">
              <div>
                <p className="text-sm font-bold text-rose-200">Reset Local Profile</p>
                <p className="text-xs text-rose-300/70">Clears local profile session and reloads.</p>
              </div>
              <button
                onClick={handleResetData}
                className="px-3.5 py-1.5 bg-rose-900/80 hover:bg-rose-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Palette className="w-5 h-5 theme-text-accent" /> Theme & Appearance
              </h2>
              <button
                type="button"
                onClick={toggleColorMode}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 text-slate-100 text-xs font-bold transition hover:bg-white/20"
              >
                {colorMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {colorMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>

            <p className="text-slate-400 text-sm">Choose a theme for your sanctuary and personalize the mood of the app.</p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'emerald', label: 'Emerald', color: 'bg-emerald-400/25 border-emerald-400' },
                { id: 'cosmic', label: 'Cosmic', color: 'bg-violet-500/25 border-violet-500' },
                { id: 'ocean', label: 'Ocean', color: 'bg-sky-400/25 border-sky-400' },
                { id: 'sunset', label: 'Sunset', color: 'bg-rose-400/25 border-rose-400' },
                { id: 'zen', label: 'Zen', color: 'bg-lime-400/25 border-lime-400' }
              ].map(themeOption => (
                <button
                  key={themeOption.id}
                  type="button"
                  onClick={() => setBgTheme(themeOption.id as any)}
                  className={`border rounded-2xl p-3 text-center text-xs font-semibold transition ${themeOption.color} ${bgTheme === themeOption.id ? 'border-2 border-white shadow-lg' : 'border-white/10'}`}
                >
                  <div className={`mx-auto mb-2 h-10 w-10 rounded-full ${themeOption.color}`} />
                  {themeOption.label}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sprout className="w-5 h-5 theme-text-accent" /> Personal Avatar
              </h2>
              <p className="text-slate-400 text-sm mt-1">Animated character that moves with your theme.</p>
            </div>
            <div className="h-72 bg-slate-950/60">
              <ThreeZenCanvas variant="character" className="w-full h-full" />
            </div>
          </div>

          <div className="glass-card border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 theme-text-accent" /> Badges & Milestones
            </h2>

            <div className="space-y-3">
              {!Array.isArray(achievements) || achievements.length === 0 ? (
                <p className="text-slate-400 text-xs text-center py-6">No badges loaded yet.</p>
              ) : (
                achievements.map((ach) => {
                  const badgeClasses = ach.unlocked
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-950 border-slate-800 text-slate-500 opacity-60';

                  return (
                    <div
                      key={ach.id}
                      className={`p-3.5 rounded-2xl border transition flex items-center gap-3 ${badgeClasses}`}
                    >
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{ach.title}</p>
                        <p className="text-[10px] text-slate-400">{ach.description}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
