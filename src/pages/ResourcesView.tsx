import React, { useState, useEffect } from 'react';
import { useWellness } from '../context/WellnessContext';
import { api } from '../services/api';
import { ResourceItem } from '../types';
import { FileText, Bookmark, CheckCircle, Search, BookOpen, Clock, Tag, ExternalLink } from 'lucide-react';

export const ResourcesView: React.FC = () => {
  const { profile, refreshUserData } = useWellness();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeItem, setActiveItem] = useState<ResourceItem | null>(null);

  useEffect(() => {
    loadResources();
  }, [profile]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await api.getResources(profile?.id);
      setResources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (resourceId: string, action: 'complete' | 'bookmark') => {
    if (!profile) return;
    try {
      await api.toggleResourceProgress(profile.id, resourceId, action);
      await loadResources();
      await refreshUserData();
    } catch (err) {
      console.error(err);
    }
  };

  const categories = [
    { id: 'all', label: 'All Resources' },
    { id: 'Article', label: 'Articles' },
    { id: 'Guide', label: 'Guides' },
    { id: 'Audio', label: 'Audio Drills' }
  ];

  const filteredResources = resources.filter(res => {
    const matchesCategory = selectedCategory === 'all' || res.type === selectedCategory || res.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="theme-hero-card rounded-3xl p-6 sm:p-8 text-white shadow-xl border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 theme-text-accent border theme-border-accent text-xs font-semibold">
            <BookOpen className="w-4 h-4" /> Psychoeducation & Guides
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Mental Wellness Knowledge Hub</h1>
          <p className="text-slate-200 text-sm max-w-xl">
            Evidence-based guides, coping strategies, articles, and interactive exercises to build emotional resilience.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 touch-scroll">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition ${
                selectedCategory === cat.id
                  ? 'theme-gradient-btn text-white shadow-md scale-105'
                  : 'glass-card text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search guides or tags..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 glass-card rounded-2xl border border-white/10">
          Loading learning resources...
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="p-12 text-center glass-card rounded-3xl border border-white/10 space-y-2">
          <FileText className="w-10 h-10 text-slate-500 mx-auto" />
          <p className="text-slate-200 font-bold">No resources match your search.</p>
          <button
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
            className="text-xs theme-text-accent underline font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map(res => (
            <div
              key={res.id}
              className="glass-card border border-white/10 hover:border-white/20 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xl transition group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold theme-text-accent bg-white/10 px-2.5 py-1 rounded-md border theme-border-accent">
                    {res.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{res.read_time}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition line-clamp-2">
                  {res.title}
                </h3>

                <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">
                  {res.summary}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(Array.isArray(res.tags)
                    ? res.tags
                    : typeof res.tags === 'string'
                    ? (res.tags as string).split(',')
                    : []
                  ).map(tag => (
                    <span key={tag} className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" /> #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => setActiveItem(res)}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  Read Guide <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(res.id, 'bookmark')}
                    className={`p-2 rounded-xl transition ${
                      res.bookmarked
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Bookmark Resource"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleAction(res.id, 'complete')}
                    className={`p-2 rounded-xl transition ${
                      res.completed
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400 hover:text-emerald-400'
                    }`}
                    title="Mark Completed"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL RESOURCE READ MODAL */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-800">
                  {activeItem.category}
                </span>
                <h2 className="text-xl font-bold text-white mt-2">{activeItem.title}</h2>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="text-slate-400 hover:text-white text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="prose prose-invert max-w-none text-slate-300 text-sm space-y-4 leading-relaxed">
              <p className="text-base font-semibold text-emerald-200 bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
                {activeItem.summary}
              </p>
              
              <div className="space-y-3 pt-2">
                <p>{activeItem.content}</p>
                <p>
                  Practicing this technique regularly helps build emotional awareness and resilience.
                  Remember that mindfulness is a muscle that strengthens with small, daily practice.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Est. Time: {activeItem.read_time}</span>
              <button
                onClick={() => {
                  handleAction(activeItem.id, 'complete');
                  setActiveItem(null);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Mark Completed (+20 Pts)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
