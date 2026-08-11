import React, { useState } from 'react';
import { useWellness } from '../context/WellnessContext';
import { Compass, ArrowRight, User } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, createInitialProfile } = useWellness();
  const [displayName, setDisplayName] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOnboardingOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = displayName.trim() || 'Mindful Friend';
    setSubmitting(true);
    try {
      await createInitialProfile({
        display_name: finalName
      });
    } catch (err) {
      console.error('Error in onboarding profile submission:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto">
      <div className="w-full max-w-md glass-modal border border-slate-300/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-900 max-h-[90vh] my-auto">
        {/* Header */}
        <div className="theme-hero-card p-8 text-center relative border-b border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 theme-text-accent flex items-center justify-center mx-auto mb-4 border theme-border-accent">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Welcome</h2>
          <p className="text-slate-600 text-xs mt-1 font-medium">A calm, personal space for your mental wellness.</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white/90">
          <div className="space-y-2">
            <label htmlFor="user-name-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              What should we call you?
            </label>
            <div className="relative">
              <input
                id="user-name-input"
                type="text"
                placeholder="Enter your name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition placeholder:text-slate-400"
                autoFocus
              />
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full theme-gradient-btn flex items-center justify-center gap-2 py-3.5 text-white font-bold text-sm rounded-2xl shadow-md transition scale-100 hover:scale-[1.02] active:scale-98 disabled:opacity-50"
          >
            <span>{submitting ? 'Setting up...' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-center text-slate-500 font-medium">
            No password or registration required. Your preferences stay local and secure.
          </p>
        </form>
      </div>
    </div>
  );
};
