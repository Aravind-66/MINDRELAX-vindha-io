import React, { useState, useEffect } from 'react';
import { useWellness } from '../context/WellnessContext';
import { api } from '../services/api';
import { JournalEntry, MoodType } from '../types';
import { BookOpen, Search, Plus, Trash2, Edit2, X, Filter } from 'lucide-react';

export const JournalView: React.FC = () => {
  const { profile, refreshUserData } = useWellness();
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [mood, setMood] = useState<MoodType | ''>('Happy');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [activePrompt, setActivePrompt] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const reflectivePrompts = [
    "What made you feel grounded today?",
    "What is something you are grateful for right now?",
    "What thought can you gently let go of?",
    "Describe a quiet moment today when you felt calm.",
    "What positive word can you offer yourself?"
  ];

  useEffect(() => {
    if (profile) loadJournal();
    setActivePrompt(reflectivePrompts[Math.floor(Math.random() * reflectivePrompts.length)]);
  }, [profile]);

  const loadJournal = async () => {
    if (!profile) return;
    try {
      const data = await api.getJournal(profile.id);
      setJournals(data);
    } catch (e) {
      console.error('Error loading journals:', e);
    }
  };

  const handleOpenEditor = (entry?: JournalEntry) => {
    if (entry) {
      setEditingId(entry.id);
      setTitle(entry.title);
      setContent(entry.content);
      setMood(entry.mood || 'Happy');
      setTags(entry.tags || []);
    } else {
      setEditingId(null);
      setTitle('');
      setContent('');
      setMood('Happy');
      setTags([]);
    }
    setIsEditorOpen(true);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter(item => item !== t));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !title.trim() || !content.trim() || submitting) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await api.updateJournal(editingId, profile.id, { title, content, mood, tags });
      } else {
        await api.createJournal(profile.id, {
          title,
          content,
          mood,
          tags,
          prompt: activePrompt
        });
      }
      setIsEditorOpen(false);
      await loadJournal();
      await refreshUserData();
    } catch (err) {
      console.error('Error saving journal entry:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!profile || !confirm('Are you sure you want to delete this journal entry?')) return;
    try {
      await api.deleteJournal(id, profile.id);
      await loadJournal();
    } catch (err) {
      console.error('Error deleting journal entry:', err);
    }
  };

  const applyPromptToTitle = (p: string) => {
    setActivePrompt(p);
    if (!title) setTitle(p);
  };

  const safeJournals = Array.isArray(journals) ? journals : [];

  const filteredJournals = safeJournals.filter(j => {
    if (!j) return false;
    const matchesSearch = (j.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (j.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    const entryTags = Array.isArray(j.tags)
      ? j.tags
      : typeof j.tags === 'string'
      ? (j.tags as string).split(',')
      : [];
    const matchesTag = selectedTag ? entryTags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(safeJournals.flatMap(j => {
    if (!j) return [];
    if (Array.isArray(j.tags)) return j.tags;
    if (typeof j.tags === 'string') return (j.tags as string).split(',');
    return [];
  })));

  return (
    <div className="space-y-8 animate-in fade-in duration-300 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="theme-hero-card rounded-3xl p-6 sm:p-8 text-white shadow-2xl border flex items-center justify-between">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-white/10 theme-text-accent border theme-border-accent backdrop-blur-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Mindful Journal</h1>
          </div>
          <p className="text-slate-200 text-sm">
            Express yourself freely in a quiet, distraction-free space. Daily writing clears mental bandwidth and releases stress.
          </p>
        </div>

        <button
          onClick={() => handleOpenEditor()}
          className="hidden sm:flex items-center gap-2 px-6 py-3 theme-gradient-btn text-white font-bold text-sm rounded-2xl shadow-lg transition scale-100 hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Reflective Prompts Bar */}
      <div className="glass-card p-5 rounded-3xl space-y-3">
        <div className="flex items-center gap-2 theme-text-accent font-bold text-sm">
          <BookOpen className="w-4 h-4 theme-text-accent" />
          <span>Today's Reflective Prompts</span>
        </div>
        <div className="flex gap-2 overflow-x-auto touch-scroll pb-1">
          {reflectivePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPromptToTitle(p)}
              className="px-3.5 py-2 bg-white/5 hover:bg-white/15 text-slate-200 text-xs font-semibold rounded-2xl border border-white/10 whitespace-nowrap transition"
            >
              "{p}"
            </button>
          ))}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 touch-scroll">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <button
              onClick={() => setSelectedTag('')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition ${!selectedTag ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
            >
              All
            </button>
            {allTags.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition ${selectedTag === t ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
              >
                #{t}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => handleOpenEditor()}
          className="sm:hidden w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold text-sm rounded-2xl shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-2xl glass-modal border border-slate-300 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900 my-auto">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">{editingId ? 'Edit Entry' : 'New Journal Entry'}</h3>
              <button onClick={() => setIsEditorOpen(false)} className="p-1.5 text-slate-500 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1 bg-white">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Grateful for today's quiet evening"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-300 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Content</label>
                <textarea
                  rows={8}
                  placeholder="Write freely..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-300 text-sm leading-relaxed text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Tags & Mood */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Mood Tag</label>
                  <select
                    value={mood}
                    onChange={e => setMood(e.target.value as MoodType)}
                    className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Very Happy">Very Happy</option>
                    <option value="Happy">Happy</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Sad">Sad</option>
                    <option value="Stressed">Stressed</option>
                    <option value="Anxious">Anxious</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Add Custom Tags</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. gratitude, nature"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl hover:bg-indigo-100"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.map(t => (
                      <span key={t} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200">
                        #{t}
                        <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-rose-600">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-5 py-2.5 text-slate-600 text-sm font-semibold hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 theme-gradient-btn text-white font-bold text-sm rounded-2xl shadow-sm transition"
                >
                  {submitting ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Journal Cards List */}
      <div className="space-y-4">
        {filteredJournals.length === 0 ? (
          <div className="glass-card p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
            <p className="text-slate-800 font-bold">No journal entries found.</p>
            <p className="text-xs text-slate-500 font-medium">Click "New Entry" above to start capturing your thoughts.</p>
          </div>
        ) : (
          filteredJournals.map(entry => (
            <div
              key={entry.id}
              className="glass-card p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 text-lg">{entry.title}</h3>
                    {entry.mood && (
                      <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold px-2.5 py-0.5 rounded-full">
                        {entry.mood}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {new Date(entry.created_at).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditor(entry)}
                    className="p-2 text-slate-500 hover:text-indigo-600 rounded-xl hover:bg-slate-100 transition"
                    aria-label="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{entry.content}</p>

              {(() => {
                const entryTags = Array.isArray(entry.tags)
                  ? entry.tags
                  : typeof entry.tags === 'string'
                  ? (entry.tags as string).split(',')
                  : [];
                if (entryTags.length === 0) return null;
                return (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {entryTags.map(t => (
                      <span key={t} className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                        #{t}
                      </span>
                    ))}
                  </div>
                );
              })()}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
