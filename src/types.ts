export type MoodType = 'Very Happy' | 'Happy' | 'Neutral' | 'Sad' | 'Stressed' | 'Anxious' | 'Angry' | 'Tired';

export interface Profile {
  id: string;
  display_name: string;
  age_range?: string;
  current_mood?: MoodType;
  wellness_goals: string[];
  preferred_activities: string[];
  created_at: string;
  updated_at: string;
  streak: number;
  wellness_points: number;
  plant_level: number;
  plant_xp: number;
}

export interface MoodEntry {
  id: string;
  profile_id: string;
  mood: MoodType;
  intensity: number; // 1 - 5
  note?: string;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  profile_id: string;
  title: string;
  content: string;
  mood?: MoodType;
  tags: string[];
  prompt?: string;
  created_at: string;
  updated_at: string;
}

export interface MeditationSession {
  id: string;
  profile_id: string;
  category: 'Breathing' | 'Sleep' | 'Stress relief' | 'Focus' | 'Relaxation' | 'Mindfulness';
  title: string;
  duration_seconds: number;
  completed_at: string;
  created_at?: string;
}

export interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  category: 'Motivation' | 'Meditation' | 'Stress' | 'Personal Growth' | 'Sleep' | 'General Wellness';
  content: string;
  likes_count: number;
  comments_count?: number;
  is_liked?: boolean;
  created_at: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface Friendship {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  friend_name?: string;
  created_at: string;
}

export interface Goal {
  id: string;
  profile_id: string;
  title: string;
  description?: string;
  target: number;
  current_progress: number;
  progress?: number;
  completed?: boolean;
  frequency: 'daily' | 'weekly' | 'custom';
  start_date: string;
  end_date?: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  points_reward: number;
  unlocked?: boolean;
  unlocked_at?: string;
}

export interface GameSession {
  id: string;
  profile_id: string;
  game_type: 'breathing' | 'focus' | 'memory' | 'calm_tap' | 'reaction';
  score: number;
  points_earned: number;
  completed_at: string;
}

export interface PlantProgress {
  id: string;
  profile_id: string;
  level: number; // 1 - 6
  xp: number;
  last_watered?: string;
  last_fertilized?: string;
  health: number; // 0 - 100
}

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  reading_time_mins: number;
  content: string;
  created_at: string;
  completed?: boolean;
  bookmarked?: boolean;
  type?: string;
  summary?: string;
  tags?: string[];
  read_time?: string;
}

export interface WebinarItem {
  id: string;
  title: string;
  description: string;
  speaker: string;
  speaker_title: string;
  date: string;
  duration_mins: number;
  status: 'upcoming' | 'live' | 'recorded';
  video_url?: string;
  registered?: boolean;
  duration?: string;
  speaker_bio?: string;
  scheduled_time?: string;
}

export interface NotificationItem {
  id: string;
  profile_id: string;
  message: string;
  type: 'streak' | 'reminder' | 'achievement' | 'plant' | 'general';
  read: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  profile_id: string;
  sender: 'user' | 'minda';
  text: string;
  created_at: string;
}

export interface DailyActivityStats {
  date: string;
  moods_logged: number;
  meditation_mins: number;
  journal_entries: number;
  games_played: number;
  points_earned: number;
}
