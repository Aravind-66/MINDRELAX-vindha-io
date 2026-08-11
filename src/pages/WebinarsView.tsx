import React, { useState, useEffect } from 'react';
import { useWellness } from '../context/WellnessContext';
import { api } from '../services/api';
import { WebinarItem } from '../types';
import { Video, Calendar, Clock, UserCheck, Play, CheckCircle2, Send } from 'lucide-react';

export const WebinarsView: React.FC = () => {
  const { profile } = useWellness();
  const [webinars, setWebinars] = useState<WebinarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [activePlayback, setActivePlayback] = useState<WebinarItem | null>(null);
  const [questions, setQuestions] = useState<{ [id: string]: string[] }>({});
  const [newQuestion, setNewQuestion] = useState('');

  useEffect(() => {
    loadWebinars();
  }, []);

  const loadWebinars = async () => {
    setLoading(true);
    try {
      const data = await api.getWebinars();
      setWebinars(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (id: string) => {
    if (registeredIds.includes(id)) {
      setRegisteredIds(prev => prev.filter(i => i !== id));
    } else {
      setRegisteredIds(prev => [...prev, id]);
    }
  };

  const handleAddQuestion = (webinarId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setQuestions(prev => ({
      ...prev,
      [webinarId]: [...(prev[webinarId] || []), newQuestion.trim()]
    }));
    setNewQuestion('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="theme-hero-card rounded-3xl p-6 sm:p-8 text-white shadow-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 theme-text-accent border theme-border-accent text-xs font-semibold">
            <Video className="w-4 h-4" /> Live Workshops & Video Series
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Expert Mental Health Webinars</h1>
          <p className="text-slate-200 text-sm max-w-xl">
            Join interactive live sessions led by clinical psychologists, mindfulness teachers, and sleep researchers.
          </p>
        </div>
      </div>

      {/* Webinars Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 glass-card rounded-2xl border border-white/10">
          Loading workshops...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {webinars.map(webinar => {
            const isRegistered = registeredIds.includes(webinar.id);
            const isLive = webinar.status === 'live';
            const isUpcoming = webinar.status === 'upcoming';

            return (
              <div
                key={webinar.id}
                className="glass-card border border-white/10 hover:border-white/20 rounded-3xl p-6 flex flex-col justify-between space-y-5 shadow-2xl transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                        isLive
                          ? 'bg-rose-950 text-rose-400 border-rose-800 animate-pulse'
                          : isUpcoming
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      }`}
                    >
                      {isLive ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" /> LIVE NOW
                        </>
                      ) : isUpcoming ? (
                        'Upcoming'
                      ) : (
                        'On Demand'
                      )}
                    </span>

                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{webinar.duration}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug">{webinar.title}</h3>

                  <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                      {webinar.speaker.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{webinar.speaker}</p>
                      <p className="text-[10px] text-slate-400">{webinar.speaker_bio}</p>
                    </div>
                  </div>

                  <p className="text-slate-400 text-xs leading-relaxed">{webinar.description}</p>

                  <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
                    <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{webinar.scheduled_time}</span>
                  </div>
                </div>

                {/* Interactive Q&A List */}
                {Array.isArray(questions[webinar.id]) && questions[webinar.id].length > 0 && (
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                    <span className="font-bold text-emerald-400 text-[10px] uppercase">Your Submitted Q&A:</span>
                    {questions[webinar.id].map((q, idx) => (
                      <p key={idx} className="text-slate-300 italic">"{q}"</p>
                    ))}
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center gap-3">
                    {isUpcoming ? (
                      <button
                        onClick={() => handleRegister(webinar.id)}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                          isRegistered
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                        }`}
                      >
                        {isRegistered ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Registered
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4" /> Reserve Free Spot
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => setActivePlayback(webinar)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-white" /> Watch Workshop
                      </button>
                    )}
                  </div>

                  {/* Ask Question Form */}
                  <form onSubmit={e => handleAddQuestion(webinar.id, e)} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask the speaker a question..."
                      value={newQuestion}
                      onChange={e => setNewQuestion(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl border border-slate-700"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIDEO PLAYBACK SIMULATION MODAL */}
      {activePlayback && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">{activePlayback.title}</h3>
              <button
                onClick={() => setActivePlayback(null)}
                className="text-slate-400 hover:text-white text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Simulated Player Canvas */}
            <div className="aspect-video bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center p-6 space-y-3 relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-emerald-600/30 border border-emerald-500 flex items-center justify-center text-emerald-400 animate-pulse">
                <Play className="w-8 h-8 fill-emerald-400 ml-1" />
              </div>
              <div>
                <p className="text-white font-bold text-base">{activePlayback.title}</p>
                <p className="text-slate-400 text-xs mt-1">Speaker: {activePlayback.speaker}</p>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden absolute bottom-4 left-6 right-6">
                <div className="bg-emerald-500 h-full w-1/3 animate-pulse" />
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">{activePlayback.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};
