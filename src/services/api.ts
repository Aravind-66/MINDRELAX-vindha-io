import {
  Profile,
  MoodEntry,
  JournalEntry,
  MeditationSession,
  CommunityPost,
  CommunityComment,
  Friendship,
  Goal,
  Achievement,
  ResourceItem,
  WebinarItem,
  NotificationItem,
  ChatMessage
} from '../types';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });
  if (!res.ok) {
    let errMessage = 'Request failed';
    try {
      const errData = await res.json();
      errMessage = errData.error || errData.message || errMessage;
    } catch {}
    throw new Error(errMessage);
  }
  return res.json();
}

export const api = {
  // PROFILE
  async getProfile(id: string): Promise<Profile> {
    return fetchJSON<Profile>(`/api/profile/${id}`);
  },

  async updateProfile(id: string, data: Partial<Profile>): Promise<Profile> {
    return fetchJSON<Profile>(`/api/profile/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // MOODS
  async getMoods(profileId: string): Promise<MoodEntry[]> {
    return fetchJSON<MoodEntry[]>(`/api/moods/${profileId}`);
  },

  async logMood(profileId: string, mood: string, intensity: number = 3, note: string = ''): Promise<MoodEntry> {
    return fetchJSON<MoodEntry>('/api/moods', {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId, mood, intensity, note })
    });
  },

  // JOURNAL
  async getJournal(profileId: string): Promise<JournalEntry[]> {
    return fetchJSON<JournalEntry[]>(`/api/journal/${profileId}`);
  },

  async createJournal(profileId: string, entry: { title: string; content: string; mood?: string; tags?: string[]; prompt?: string }): Promise<JournalEntry> {
    return fetchJSON<JournalEntry>('/api/journal', {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId, ...entry })
    });
  },

  async updateJournal(id: string, profileId: string, entry: { title?: string; content?: string; mood?: string; tags?: string[] }): Promise<JournalEntry> {
    return fetchJSON<JournalEntry>(`/api/journal/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ profile_id: profileId, ...entry })
    });
  },

  async deleteJournal(id: string, profileId: string): Promise<{ success: boolean }> {
    return fetchJSON<{ success: boolean }>(`/api/journal/${id}?profile_id=${profileId}`, {
      method: 'DELETE'
    });
  },

  // MEDITATION
  async getMeditations(profileId: string): Promise<MeditationSession[]> {
    return fetchJSON<MeditationSession[]>(`/api/meditations/${profileId}`);
  },

  async completeMeditation(profileId: string, category: string, title: string, durationSeconds: number): Promise<MeditationSession> {
    return fetchJSON<MeditationSession>('/api/meditations/complete', {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId, category, title, duration_seconds: durationSeconds })
    });
  },

  // COMMUNITY
  async getCommunityPosts(profileId?: string): Promise<CommunityPost[]> {
    const url = profileId ? `/api/community/posts?profile_id=${profileId}` : '/api/community/posts';
    return fetchJSON<CommunityPost[]>(url);
  },

  async createPost(authorId: string, authorName: string, category: string, content: string): Promise<CommunityPost> {
    return fetchJSON<CommunityPost>('/api/community/posts', {
      method: 'POST',
      body: JSON.stringify({ author_id: authorId, author_name: authorName, category, content })
    });
  },

  async deletePost(id: string, authorId: string): Promise<{ success: boolean }> {
    return fetchJSON<{ success: boolean }>(`/api/community/posts/${id}?author_id=${authorId}`, {
      method: 'DELETE'
    });
  },

  async likePost(id: string, profileId: string): Promise<{ liked: boolean; likes_count: number }> {
    return fetchJSON<{ liked: boolean; likes_count: number }>(`/api/community/posts/${id}/like`, {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId })
    });
  },

  async getComments(postId: string): Promise<CommunityComment[]> {
    return fetchJSON<CommunityComment[]>(`/api/community/posts/${postId}/comments`);
  },

  async addComment(postId: string, authorId: string, authorName: string, content: string): Promise<CommunityComment> {
    return fetchJSON<CommunityComment>(`/api/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ author_id: authorId, author_name: authorName, content })
    });
  },

  async deleteComment(commentId: string, authorId: string): Promise<{ success: boolean }> {
    return fetchJSON<{ success: boolean }>(`/api/community/comments/${commentId}?author_id=${authorId}`, {
      method: 'DELETE'
    });
  },

  // FRIENDS
  async getFriends(profileId: string): Promise<Friendship[]> {
    return fetchJSON<Friendship[]>(`/api/friends/${profileId}`);
  },

  async sendFriendRequest(requesterId: string, targetName: string): Promise<Friendship> {
    return fetchJSON<Friendship>('/api/friends/request', {
      method: 'POST',
      body: JSON.stringify({ requester_id: requesterId, target_name: targetName })
    });
  },

  async respondFriendRequest(requestId: string, profileId: string, accept: boolean): Promise<Friendship> {
    return fetchJSON<Friendship>(`/api/friends/request/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify({ profile_id: profileId, accept })
    });
  },

  // GOALS
  async getGoals(profileId: string): Promise<Goal[]> {
    return fetchJSON<Goal[]>(`/api/goals/${profileId}`);
  },

  async addGoal(profileId: string, goal: { title: string; description?: string; target: number; frequency: string }): Promise<Goal> {
    return fetchJSON<Goal>('/api/goals', {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId, ...goal })
    });
  },

  async updateGoalProgress(goalId: string, profileId: string, increment: number = 1): Promise<Goal> {
    return fetchJSON<Goal>(`/api/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify({ profile_id: profileId, increment })
    });
  },

  async deleteGoal(goalId: string, profileId: string): Promise<{ success: boolean }> {
    return fetchJSON<{ success: boolean }>(`/api/goals/${goalId}?profile_id=${profileId}`, {
      method: 'DELETE'
    });
  },

  // GAMES
  async saveGameSession(profileId: string, gameType: string, score: number, pointsEarned: number) {
    return fetchJSON('/api/games/complete', {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId, game_type: gameType, score, points_earned: pointsEarned })
    });
  },

  // RESOURCES & WEBINARS
  async getResources(profileId?: string): Promise<ResourceItem[]> {
    const url = profileId ? `/api/resources?profile_id=${profileId}` : '/api/resources';
    return fetchJSON<ResourceItem[]>(url);
  },

  async toggleResourceProgress(profileId: string, resourceId: string, action: 'complete' | 'bookmark') {
    return fetchJSON(`/api/resources/${resourceId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId, action })
    });
  },

  async getWebinars(): Promise<WebinarItem[]> {
    return fetchJSON<WebinarItem[]>('/api/webinars');
  },

  // ACHIEVEMENTS & NOTIFICATIONS
  async getAchievements(profileId: string): Promise<Achievement[]> {
    return fetchJSON<Achievement[]>(`/api/achievements/${profileId}`);
  },

  async getNotifications(profileId: string): Promise<NotificationItem[]> {
    return fetchJSON<NotificationItem[]>(`/api/notifications/${profileId}`);
  },

  async markNotificationRead(id: string, profileId: string) {
    return fetchJSON(`/api/notifications/${id}/read`, {
      method: 'PUT',
      body: JSON.stringify({ profile_id: profileId })
    });
  },

  // CHAT ASSISTANT "MINDA"
  async getChatHistory(profileId: string): Promise<ChatMessage[]> {
    return fetchJSON<ChatMessage[]>(`/api/chat/${profileId}`);
  },

  async sendChatMessage(profileId: string, message: string): Promise<ChatMessage> {
    return fetchJSON<ChatMessage>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId, message })
    });
  },

  // MUSIC SERVICE
  async searchTracks(query: string, limit: number = 20): Promise<any[]> {
    return fetchJSON<any[]>(`/api/music/tracks/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  async searchArtists(query: string, limit: number = 10): Promise<any[]> {
    return fetchJSON<any[]>(`/api/music/artists/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  async searchAlbums(query: string, limit: number = 10): Promise<any[]> {
    return fetchJSON<any[]>(`/api/music/albums/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  async getTrack(id: string): Promise<any> {
    return fetchJSON<any>(`/api/music/track/${id}`);
  },

  async getArtist(id: string): Promise<any> {
    return fetchJSON<any>(`/api/music/artist/${id}`);
  },

  async getAlbum(id: string): Promise<any> {
    return fetchJSON<any>(`/api/music/album/${id}`);
  }
};

// React hook for managing loading, error, and data state for API calls
import { useState, useCallback } from 'react';

export interface ApiCallState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApiCall<T, Args extends any[]>(apiFn: (...args: Args) => Promise<T>) {
  const [state, setState] = useState<ApiCallState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const result = await apiFn(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err: any) {
        const errorMessage = err?.message || 'An unknown error occurred';
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        return null;
      }
    },
    [apiFn]
  );

  return { ...state, execute };
}

