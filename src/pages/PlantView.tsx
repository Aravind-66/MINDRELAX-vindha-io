import React, { useState } from 'react';
import { useWellness } from '../context/WellnessContext';
import { Sprout, Droplets, Sun, Award, Heart, CheckCircle2, TreePine, Flower2, Leaf } from 'lucide-react';
import { motion } from 'motion/react';
import { ThreeDPlantCanvas } from '../components/ThreeDPlantCanvas';
import { ThreeDCard } from '../components/ThreeDCard';

export const PlantView: React.FC = () => {
  const { profile, updateProfileData, refreshProfile } = useWellness();
  const [careAction, setCareAction] = useState<string | null>(null);
  const [wateringAnim, setWateringAnim] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!profile) return null;

  const currentXp = profile.plant_xp || 0;
  const currentLevel = profile.plant_level || 1;
  const xpForNextLevel = currentLevel * 100;
  const progressPercent = Math.min(100, Math.round((currentXp / xpForNextLevel) * 100));

  const plantStages = [
    { level: 1, name: 'Tiny Seedling', desc: 'A fragile sprout beginning its wellness journey.', icon: Sprout },
    { level: 2, name: 'Growing Bud', desc: 'Leaves are opening as your daily mindfulness grows.', icon: Leaf },
    { level: 3, name: 'Flourishing Fern', desc: 'Strong stems and vibrant green fronds reflecting peace.', icon: TreePine },
    { level: 4, name: 'Blooming Lotus', desc: 'Radiant flowers symbolizing self-compassion & joy.', icon: Flower2 },
    { level: 5, name: 'Sanctuary Tree', desc: 'A majestic tree offering shade, strength, and serenity.', icon: TreePine }
  ];

  const currentStage = plantStages.find(s => s.level === currentLevel) || plantStages[plantStages.length - 1];
  const StageIcon = currentStage.icon;

  const handleCare = async (action: 'water' | 'sunlight' | 'fertilize') => {
    setCareAction(action);
    setWateringAnim(true);

    let xpGained = 20;
    let pointsGained = 15;
    let actionText = 'Watered with love!';

    if (action === 'sunlight') {
      xpGained = 25;
      pointsGained = 15;
      actionText = 'Basked in warm sunlight!';
    } else if (action === 'fertilize') {
      xpGained = 35;
      pointsGained = 25;
      actionText = 'Fertilized with positive thoughts!';
    }

    let newXp = currentXp + xpGained;
    let newLevel = currentLevel;

    if (newXp >= xpForNextLevel && currentLevel < 5) {
      newLevel += 1;
      newXp = newXp - xpForNextLevel;
      actionText += ` LEVEL UP! Your plant evolved to Level ${newLevel}!`;
    }

    const newPoints = (profile.wellness_points || 0) + pointsGained;

    try {
      await updateProfileData({
        plant_xp: newXp,
        plant_level: newLevel,
        wellness_points: newPoints
      });
      setMessage(`${actionText} (+${xpGained} XP, +${pointsGained} Points)`);
      await refreshProfile();
    } catch (err) {
      console.error('Error updating plant care data:', err);
    } finally {
      setTimeout(() => {
        setWateringAnim(false);
        setCareAction(null);
      }, 1500);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 theme-hero-card text-white p-6 sm:p-8 rounded-3xl shadow-2xl border">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 theme-text-accent border theme-border-accent text-xs font-semibold">
            <Sprout className="w-4 h-4" /> Virtual Sanctuary Garden
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Your Mindful Plant</h1>
          <p className="text-slate-200 text-sm max-w-lg">
            Nurture your plant through daily wellness actions like journaling, meditation, and mood logging.
          </p>
        </div>

        <div className="glass-card border border-white/10 p-4 rounded-2xl flex items-center gap-4 text-center">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Level</p>
            <p className="text-2xl font-black text-white">{currentLevel}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total XP</p>
            <p className="text-2xl font-black theme-text-accent">{currentXp}</p>
          </div>
        </div>
      </div>

      {/* Main Plant Canvas & Stage Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Plant Visual Display with 3D Canvas */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[420px] shadow-2xl">
          {/* Interactive 3D Plant Environment */}
          <div className="w-full h-56 sm:h-72 relative">
            <ThreeDPlantCanvas level={currentLevel} xp={currentXp} className="w-full h-full" />
          </div>

          {/* Stage Info */}
          <div className="relative z-10 flex flex-col items-center my-2 text-center">
            <span className="text-xs font-bold uppercase tracking-wider theme-text-accent bg-white/10 px-3.5 py-1 rounded-full border theme-border-accent">
              Stage {currentLevel}: {currentStage.name}
            </span>
            <p className="text-slate-200 text-xs sm:text-sm max-w-md mt-2">
              "{currentStage.desc}"
            </p>
          </div>

          {/* XP Progress Bar */}
          <div className="w-full mt-6 space-y-2 relative z-10">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span>XP Progress</span>
              <span>{currentXp} / {xpForNextLevel} XP ({progressPercent}%)</span>
            </div>
            <div className="w-full h-3 bg-slate-950/60 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full theme-gradient-btn rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Feedback Message */}
          {message && (
            <div className="mt-4 p-3 glass-card border theme-border-accent text-emerald-200 text-xs sm:text-sm rounded-xl font-medium flex items-center gap-2 animate-in fade-in relative z-10">
              <CheckCircle2 className="w-4 h-4 theme-text-accent shrink-0" />
              <span>{message}</span>
            </div>
          )}
        </div>

        {/* Daily Care Actions */}
        <div className="glass-card rounded-3xl p-6 space-y-6 shadow-2xl">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-emerald-400" /> Plant Care Actions
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Care for your plant directly to boost its growth and earn wellness points.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleCare('water')}
              disabled={wateringAnim}
              className="w-full p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center gap-3 text-left transition group disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                <Droplets className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Water Plant</p>
                <p className="text-xs text-slate-400">+20 XP • +15 Points</p>
              </div>
            </button>

            <button
              onClick={() => handleCare('sunlight')}
              disabled={wateringAnim}
              className="w-full p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center gap-3 text-left transition group disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                <Sun className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Give Sunshine</p>
                <p className="text-xs text-slate-400">+25 XP • +15 Points</p>
              </div>
            </button>

            <button
              onClick={() => handleCare('fertilize')}
              disabled={wateringAnim}
              className="w-full p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center gap-3 text-left transition group disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                <Flower2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Positive Fertilizer</p>
                <p className="text-xs text-slate-400">+35 XP • +25 Points</p>
              </div>
            </button>
          </div>

          {/* Plant Growth Stages Overview */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Evolution Stages</h4>
            <div className="space-y-2">
              {plantStages.map((stage) => {
                const Icon = stage.icon;
                return (
                  <div
                    key={stage.level}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                      stage.level === currentLevel
                        ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                        : stage.level < currentLevel
                        ? 'bg-slate-950 border-slate-800 text-slate-400 opacity-75'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="font-bold">{stage.name}</p>
                        <p className="text-[10px] text-slate-500">Level {stage.level}</p>
                      </div>
                    </div>
                    {stage.level <= currentLevel && (
                      <Award className={`w-4 h-4 ${stage.level === currentLevel ? 'text-emerald-400' : 'text-slate-500'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
