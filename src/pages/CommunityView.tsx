import React, { useState, useEffect } from 'react';
import { useWellness } from '../context/WellnessContext';
import { api } from '../services/api';
import { realtime } from '../services/websocket';
import { CommunityPost, CommunityComment } from '../types';
import { Users, Heart, MessageCircle, Trash2, Plus, Filter, AlertCircle, Radio } from 'lucide-react';
import { LiveActivityTicker } from '../components/LiveActivityTicker';
import { ThreeDCard } from '../components/ThreeDCard';

export const CommunityView: React.FC = () => {
  const { profile, refreshUserData } = useWellness();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);

  // New Post Form
  const [postCategory, setPostCategory] = useState<string>('General Wellness');
  const [postContent, setPostContent] = useState<string>('');
  const [postError, setPostError] = useState<string>('');
  const [submittingPost, setSubmittingPost] = useState<boolean>(false);

  // Expanded Post Comments
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, CommunityComment[]>>({});
  const [commentInput, setCommentInput] = useState<string>('');
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);

  const categories = ['All', 'Motivation', 'Meditation', 'Stress', 'Personal Growth', 'Sleep', 'General Wellness'];

  useEffect(() => {
    loadPosts();

    const unsubPost = realtime.on('community:post_created', () => {
      loadPosts();
    });

    const unsubLiked = realtime.on('community:post_liked', (data: { postId: string; likes_count: number }) => {
      if (data?.postId) {
        setPosts(prev =>
          prev.map(p => (p.id === data.postId ? { ...p, likes_count: data.likes_count } : p))
        );
      }
    });

    const unsubComment = realtime.on('community:comment_added', async (data: { postId: string }) => {
      if (data?.postId) {
        setPosts(prev =>
          prev.map(p => (p.id === data.postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p))
        );
        if (expandedPostId === data.postId) {
          try {
            const comments = await api.getComments(data.postId);
            setCommentsMap(prev => ({ ...prev, [data.postId]: comments }));
          } catch (e) {
            console.error('Error fetching comments:', e);
          }
        }
      }
    });

    return () => {
      unsubPost();
      unsubLiked();
      unsubComment();
    };
  }, [profile, expandedPostId]);

  const loadPosts = async () => {
    try {
      const data = await api.getCommunityPosts(profile?.id);
      setPosts(data);
    } catch (e) {
      console.error('Error loading community posts:', e);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setPostError('');

    if (!postContent || postContent.trim().length < 5) {
      setPostError('Post content must be at least 5 characters.');
      return;
    }

    setSubmittingPost(true);
    try {
      await api.createPost(profile.id, profile.display_name, postCategory, postContent.trim());
      setPostContent('');
      setIsPostModalOpen(false);
      await loadPosts();
      await refreshUserData();
    } catch (err: any) {
      setPostError(err.message || 'Failed to create post.');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!profile || !confirm('Delete your post?')) return;
    try {
      await api.deletePost(postId, profile.id);
      await loadPosts();
    } catch (e) {
      console.error('Error deleting post:', e);
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!profile) return;
    try {
      const res = await api.likePost(postId, profile.id);
      setPosts(prev =>
        (Array.isArray(prev) ? prev : []).map(p =>
          p.id === postId ? { ...p, is_liked: res.liked, likes_count: res.likes_count } : p
        )
      );
    } catch (e) {
      console.error('Error toggling like:', e);
    }
  };

  const toggleExpandComments = async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }
    setExpandedPostId(postId);
    try {
      const comments = await api.getComments(postId);
      setCommentsMap(prev => ({ ...prev, [postId]: comments }));
    } catch (e) {
      console.error('Error fetching comments:', e);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!profile || !commentInput.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const newComm = await api.addComment(postId, profile.id, profile.display_name, commentInput.trim());
      setCommentsMap(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComm]
      }));
      setCommentInput('');
      setPosts(prev =>
        (Array.isArray(prev) ? prev : []).map(p => (p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p))
      );
    } catch (e) {
      console.error('Error adding comment:', e);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    if (!profile) return;
    try {
      await api.deleteComment(commentId, profile.id);
      setCommentsMap(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(c => c.id !== commentId)
      }));
    } catch (e) {
      console.error('Error deleting comment:', e);
    }
  };

  const safePosts = Array.isArray(posts) ? posts : [];
  const filteredPosts = activeCategory === 'All' ? safePosts : safePosts.filter(p => p && p.category === activeCategory);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Real-Time Live Ticker */}
      <LiveActivityTicker />

      {/* Header */}
      <div className="theme-hero-card rounded-3xl p-6 sm:p-8 text-white shadow-2xl border flex items-center justify-between">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-white/10 theme-text-accent border theme-border-accent backdrop-blur-md">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Mindful Community</h1>
          </div>
          <p className="text-slate-200 text-sm">
            Share reflections, meditation milestones, and mutual support in a warm, moderated community space.
          </p>
        </div>

        <button
          onClick={() => setIsPostModalOpen(true)}
          className="hidden sm:flex items-center gap-2 px-6 py-3 theme-gradient-btn text-white font-bold text-sm rounded-2xl shadow-lg transition scale-100 hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Create Post</span>
        </button>
      </div>

      {/* Categories Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto touch-scroll pb-1">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition border ${
              activeCategory === cat
                ? 'theme-gradient-btn text-white shadow-md scale-105'
                : 'glass-card border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <button
        onClick={() => setIsPostModalOpen(true)}
        className="sm:hidden w-full flex items-center justify-center gap-2 px-6 py-3 theme-gradient-btn text-white font-bold text-sm rounded-2xl shadow-md"
      >
        <Plus className="w-5 h-5" />
        <span>Create Post</span>
      </button>

      {/* Create Post Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-modal border border-white/15 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
            <div className="p-6 theme-hero-card border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">Share with the Community</h3>
              <button onClick={() => setIsPostModalOpen(false)} className="text-slate-300 hover:text-white">×</button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
              {postError && (
                <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-xl flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{postError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-slate-300">Category</label>
                <select
                  value={postCategory}
                  onChange={e => setPostCategory(e.target.value)}
                  className="w-full p-3 bg-slate-950/40 border border-white/10 rounded-2xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-slate-300">Reflection Content</label>
                <textarea
                  rows={4}
                  placeholder="Share your mindful experience, thoughts, or encouragement..."
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  className="w-full p-4 bg-slate-950/40 border border-white/10 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-5 py-2.5 text-slate-400 text-sm font-semibold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPost}
                  className="px-6 py-2.5 theme-gradient-btn text-white font-bold text-sm rounded-2xl shadow-md transition"
                >
                  {submittingPost ? 'Publishing...' : 'Publish Post (+20 pts)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Posts Stream */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="glass-card p-12 rounded-3xl border border-white/10 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-500 mx-auto" />
            <p className="text-slate-200 font-bold">No community posts in this category yet.</p>
            <p className="text-xs text-slate-400">Be the first to share an inspiring reflection!</p>
          </div>
        ) : (
          filteredPosts.map(post => {
            const isMyPost = profile && post.author_id === profile.id;
            const isExpanded = expandedPostId === post.id;
            const comments = commentsMap[post.id] || [];

            return (
              <div
                key={post.id}
                className="glass-card p-6 rounded-3xl border border-white/10 shadow-md space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 theme-text-accent border theme-border-accent flex items-center justify-center font-bold text-sm">
                      {post.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{post.author_name}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          {post.category}
                        </span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {isMyPost && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition"
                      aria-label="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800 flex items-center gap-6 text-xs text-slate-400 font-semibold">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-1.5 transition ${post.is_liked ? 'text-rose-400 font-bold' : 'hover:text-white'}`}
                  >
                    <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{post.likes_count || 0} Likes</span>
                  </button>

                  <button
                    onClick={() => toggleExpandComments(post.id)}
                    className="flex items-center gap-1.5 hover:text-white transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments_count || 0} Comments</span>
                  </button>
                </div>

                {/* Expanded Comments Section */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-800 space-y-3 animate-in fade-in duration-200">
                    <div className="space-y-2">
                      {comments.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No comments yet. Be the first to reply!</p>
                      ) : (
                        comments.map(c => (
                          <div key={c.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex items-start justify-between gap-2">
                            <div>
                              <span className="font-bold text-emerald-400 mr-2">{c.author_name}:</span>
                              <span className="text-slate-300">{c.content}</span>
                            </div>
                            {profile && c.author_id === profile.id && (
                              <button
                                onClick={() => handleDeleteComment(c.id, post.id)}
                                className="text-slate-500 hover:text-rose-400"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add comment input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a supportive reply..."
                        value={commentInput}
                        onChange={e => setCommentInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                        className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentInput.trim() || submittingComment}
                        className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-500 disabled:opacity-50"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
