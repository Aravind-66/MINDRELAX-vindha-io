import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

// Seed data interfaces & store structure
export interface DBStore {
  profiles: any[];
  mood_entries: any[];
  journal_entries: any[];
  meditation_sessions: any[];
  community_posts: any[];
  community_comments: any[];
  post_likes: any[];
  friendships: any[];
  goals: any[];
  achievements: any[];
  user_achievements: any[];
  game_sessions: any[];
  plant_progress: any[];
  resources: any[];
  resource_progress: any[];
  webinars: any[];
  notifications: any[];
  chat_messages: any[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'mindrelax_db.json');

// Initialize Pool if DATABASE_URL is present
let pool: pg.Pool | null = null;
if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });
  } catch (err) {
    console.warn('PostgreSQL Pool initialization failed, falling back to embedded store:', err);
    pool = null;
  }
}

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default seed data
const defaultAchievements = [
  { id: 'ach_1', key: 'first_step', title: 'First Step', description: 'Complete your first wellness activity.', icon: 'footprints', points_reward: 50 },
  { id: 'ach_2', key: 'streak_3', title: '3 Day Streak', description: 'Use MindRelax for 3 consecutive days.', icon: 'flame', points_reward: 100 },
  { id: 'ach_3', key: 'streak_7', title: 'Mindful Week', description: 'Complete wellness activities for 7 days.', icon: 'zap', points_reward: 200 },
  { id: 'ach_4', key: 'journal_10', title: 'Journal Explorer', description: 'Create 10 journal entries.', icon: 'book-open', points_reward: 150 },
  { id: 'ach_5', key: 'meditation_10', title: 'Calm Mind', description: 'Complete 10 meditation sessions.', icon: 'sparkles', points_reward: 150 },
  { id: 'ach_6', key: 'plant_3', title: 'Green Thumb', description: 'Grow your virtual plant to level 3.', icon: 'sprout', points_reward: 250 }
];

const defaultResources = [
  {
    id: 'res_1',
    title: 'Understanding Anxiety & Practical Grounding Techniques',
    description: 'Learn how anxiety affects your nervous system and simple 5-4-3-2-1 exercises to return to the present moment.',
    category: 'Anxiety awareness',
    reading_time_mins: 5,
    content: `Anxiety is a natural response from our fight-or-flight nervous system. When stress accumulates, our body signals danger even when we are safe.\n\n### The 5-4-3-2-1 Grounding Method\n1. **Acknowledge 5 things you can see** around you (a clock, a leaf, a window).\n2. **Acknowledge 4 things you can touch** (your coat, your skin, the desk).\n3. **Acknowledge 3 things you hear** (traffic outside, breeze, humming computer).\n4. **Acknowledge 2 things you smell** (coffee, fresh air).\n5. **Acknowledge 1 thing you taste** (mint, water).\n\nPracticing this daily recalibrates your amygdala and helps soothe sudden nervous tension.`,
    created_at: new Date().toISOString()
  },
  {
    id: 'res_2',
    title: 'The Science of Deep Sleep & Nighttime Routines',
    description: 'Discover how light, temperature, and mental offloading dramatically improve your REM sleep quality.',
    category: 'Sleep',
    reading_time_mins: 6,
    content: `Quality sleep is the cornerstone of emotional resilience. Restless nights often stem from an overactive mind attempting to process unresolved daily thoughts.\n\n### Essential Nightly Rituals:\n- **Brain Dump Journaling:** Spend 3 minutes writing down tomorrow's tasks or lingering worries to release cognitive load.\n- **Dim Blue Light:** Turn off screen backlight 45 minutes before sleep.\n- **Cool Room Temperature:** Keep ambient temperature around 65–68°F (18–20°C) to facilitate your body's melatonin synthesis.`,
    created_at: new Date().toISOString()
  },
  {
    id: 'res_3',
    title: 'Mindfulness in Daily Life: Beyond the Cushion',
    description: 'How to bring gentle awareness into washing dishes, drinking tea, and walking.',
    category: 'Mindfulness',
    reading_time_mins: 4,
    content: `Mindfulness does not require sitting silently for hours on a cushion. True mindfulness is simply paying open, non-judgmental attention to whatever you are doing right now.\n\nTry taking your next cup of water or tea with 100% presence—notice the warmth of the mug, the aroma, and the physical sensation of drinking. Every mundane moment can become a sanctuary of peace.`,
    created_at: new Date().toISOString()
  },
  {
    id: 'res_4',
    title: 'Managing Burnout & Setting Healthy Emotional Boundaries',
    description: 'Recognize the early signs of emotional exhaustion and protect your mental energy.',
    category: 'Stress management',
    reading_time_mins: 7,
    content: `Burnout occurs when long-term demands exceed our physical and emotional recovery capacity. Saying "no" to non-essential commitments is an act of self-care.\n\nLearn to recognize warning signs like persistent fatigue, cynicism, or difficulty concentrating, and schedule non-negotiable rest periods every day.`,
    created_at: new Date().toISOString()
  }
];

const defaultWebinars = [
  {
    id: 'web_1',
    title: 'Navigating Work Stress & Finding Inner Calm',
    description: 'Join clinical psychologist Dr. Elena Vance as she shares evidence-based cognitive strategies for managing workplace anxiety.',
    speaker: 'Dr. Elena Vance',
    speaker_title: 'Clinical Psychologist & Mindfulness Researcher',
    date: '2026-08-20T18:00:00.000Z',
    duration_mins: 45,
    status: 'upcoming',
    video_url: 'https://www.youtube.com/embed/inpok4MKVLM'
  },
  {
    id: 'web_2',
    title: 'Sleep Architecture: Harnessing Rest for Mental Vitality',
    description: 'Learn neuroscientific insights into sleep hygiene, circadian rhythm optimization, and nighttime meditation practices.',
    speaker: 'Prof. Marcus Thorne',
    speaker_title: 'Sleep Specialist & Neuroscientist',
    date: '2026-08-15T19:00:00.000Z',
    duration_mins: 60,
    status: 'upcoming',
    video_url: 'https://www.youtube.com/embed/1ZYbU87A96U'
  },
  {
    id: 'web_3',
    title: 'Masterclass: Art of Breathwork & Nervous System Regulation',
    description: 'Guided session exploring box breathing, diaphragmatic expansion, and vagus nerve stimulation for immediate calmness.',
    speaker: 'Sarah Jenkins, M.S.',
    speaker_title: 'Certified Breathwork Facilitator',
    date: '2026-08-01T15:00:00.000Z',
    duration_mins: 35,
    status: 'recorded',
    video_url: 'https://www.youtube.com/embed/aNXKjGFUlMs'
  }
];

const defaultCommunityPosts = [
  {
    id: 'post_1',
    author_id: 'user_serene_mind',
    author_name: 'Serene Traveler',
    category: 'Motivation',
    content: 'Just completed a 10-minute box breathing exercise after a hectic workday. My heart rate slowed down and I feel grounded. Remember: it is okay to pause!',
    likes_count: 12,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'post_2',
    author_id: 'user_peaceful_breeze',
    author_name: 'Quiet Oak',
    category: 'Sleep',
    content: 'The rain soundscape in MindRelax combined with 5 minutes of journaling helped me sleep through the night for the first time this month! Grateful for this community.',
    likes_count: 19,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'post_3',
    author_id: 'user_mindful_joy',
    author_name: 'Aria Hope',
    category: 'Personal Growth',
    content: 'My virtual plant just reached Sprout stage! It’s a wonderful reminder that small daily wellness check-ins nurture real growth over time 🌱',
    likes_count: 24,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

const defaultCommunityComments = [
  {
    id: 'comm_1',
    post_id: 'post_1',
    author_id: 'user_peaceful_breeze',
    author_name: 'Quiet Oak',
    content: 'So happy for you! Box breathing is my favorite go-to whenever anxiety creeps in.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

// Helper to load or create embedded DB store
function getLocalStore(): DBStore {
  if (!fs.existsSync(DB_FILE)) {
    const initialStore: DBStore = {
      profiles: [],
      mood_entries: [],
      journal_entries: [],
      meditation_sessions: [],
      community_posts: defaultCommunityPosts,
      community_comments: defaultCommunityComments,
      post_likes: [],
      friendships: [],
      goals: [],
      achievements: defaultAchievements,
      user_achievements: [],
      game_sessions: [],
      plant_progress: [],
      resources: defaultResources,
      resource_progress: [],
      webinars: defaultWebinars,
      notifications: [],
      chat_messages: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialStore, null, 2), 'utf-8');
    return initialStore;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    // Ensure missing collections are defaulted
    if (!parsed.resources) parsed.resources = defaultResources;
    if (!parsed.webinars) parsed.webinars = defaultWebinars;
    if (!parsed.achievements) parsed.achievements = defaultAchievements;
    if (!parsed.community_posts) parsed.community_posts = defaultCommunityPosts;
    if (!parsed.community_comments) parsed.community_comments = defaultCommunityComments;
    return parsed;
  } catch (err) {
    console.error('Failed reading DB file, re-creating:', err);
    return {
      profiles: [],
      mood_entries: [],
      journal_entries: [],
      meditation_sessions: [],
      community_posts: defaultCommunityPosts,
      community_comments: defaultCommunityComments,
      post_likes: [],
      friendships: [],
      goals: [],
      achievements: defaultAchievements,
      user_achievements: [],
      game_sessions: [],
      plant_progress: [],
      resources: defaultResources,
      resource_progress: [],
      webinars: defaultWebinars,
      notifications: [],
      chat_messages: []
    };
  }
}

function saveLocalStore(store: DBStore) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local store:', err);
  }
}

// Database Helper Methods exposed to API routes
export const db = {
  async init() {
    if (pool) {
      try {
        const client = await pool.connect();
        await client.query(`
          CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY,
            display_name TEXT NOT NULL,
            age_range TEXT,
            current_mood TEXT,
            wellness_goals TEXT[],
            preferred_activities TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            streak INT DEFAULT 1,
            wellness_points INT DEFAULT 0,
            plant_level INT DEFAULT 1,
            plant_xp INT DEFAULT 0
          );

          CREATE TABLE IF NOT EXISTS mood_entries (
            id TEXT PRIMARY KEY,
            profile_id TEXT NOT NULL,
            mood TEXT NOT NULL,
            intensity INT DEFAULT 3,
            note TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS journal_entries (
            id TEXT PRIMARY KEY,
            profile_id TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            mood TEXT,
            tags TEXT[],
            prompt TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS meditation_sessions (
            id TEXT PRIMARY KEY,
            profile_id TEXT NOT NULL,
            category TEXT NOT NULL,
            title TEXT NOT NULL,
            duration_seconds INT NOT NULL,
            completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS community_posts (
            id TEXT PRIMARY KEY,
            author_id TEXT NOT NULL,
            author_name TEXT NOT NULL,
            category TEXT NOT NULL,
            content TEXT NOT NULL,
            likes_count INT DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS community_comments (
            id TEXT PRIMARY KEY,
            post_id TEXT NOT NULL,
            author_id TEXT NOT NULL,
            author_name TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS post_likes (
            id TEXT PRIMARY KEY,
            post_id TEXT NOT NULL,
            profile_id TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS friendships (
            id TEXT PRIMARY KEY,
            requester_id TEXT NOT NULL,
            receiver_id TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS goals (
            id TEXT PRIMARY KEY,
            profile_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            target INT DEFAULT 1,
            current_progress INT DEFAULT 0,
            frequency TEXT DEFAULT 'daily',
            start_date TEXT,
            end_date TEXT,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS game_sessions (
            id TEXT PRIMARY KEY,
            profile_id TEXT NOT NULL,
            game_type TEXT NOT NULL,
            score INT DEFAULT 0,
            points_earned INT DEFAULT 0,
            completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS plant_progress (
            id TEXT PRIMARY KEY,
            profile_id TEXT NOT NULL,
            level INT DEFAULT 1,
            xp INT DEFAULT 0,
            last_watered TIMESTAMP WITH TIME ZONE,
            last_fertilized TIMESTAMP WITH TIME ZONE,
            health INT DEFAULT 100
          );

          CREATE TABLE IF NOT EXISTS resource_progress (
            id TEXT PRIMARY KEY,
            profile_id TEXT NOT NULL,
            resource_id TEXT NOT NULL,
            completed BOOLEAN DEFAULT FALSE,
            bookmarked BOOLEAN DEFAULT FALSE,
            completed_at TIMESTAMP WITH TIME ZONE
          );

          CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            profile_id TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT NOT NULL,
            read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS chat_messages (
            id TEXT PRIMARY KEY,
            profile_id TEXT NOT NULL,
            sender TEXT NOT NULL,
            text TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);
        client.release();
        console.log('PostgreSQL database initialized successfully.');
      } catch (err) {
        console.warn('PostgreSQL initialization failed, using local store:', err);
        pool = null;
      }
    }
    // Ensure local store initialized
    getLocalStore();
  },

  // PROFILES
  async getProfile(id: string) {
    if (pool) {
      try {
        const res = await pool.query('SELECT * FROM profiles WHERE id = $1', [id]);
        if (res.rows[0]) return res.rows[0];
      } catch (e) { console.error(e); }
    }
    const store = getLocalStore();
    return store.profiles.find(p => p.id === id) || null;
  },

  async saveProfile(profileData: any) {
    const now = new Date().toISOString();
    const existing = await this.getProfile(profileData.id);
    const profile = {
      id: profileData.id,
      display_name: profileData.display_name || 'Mindful Friend',
      age_range: profileData.age_range || '',
      current_mood: profileData.current_mood || 'Neutral',
      wellness_goals: profileData.wellness_goals || [],
      preferred_activities: profileData.preferred_activities || [],
      created_at: existing ? existing.created_at : now,
      updated_at: now,
      streak: profileData.streak ?? (existing ? existing.streak : 1),
      wellness_points: profileData.wellness_points ?? (existing ? existing.wellness_points : 50),
      plant_level: profileData.plant_level ?? (existing ? existing.plant_level : 1),
      plant_xp: profileData.plant_xp ?? (existing ? existing.plant_xp : 0)
    };

    if (pool) {
      try {
        await pool.query(`
          INSERT INTO profiles (id, display_name, age_range, current_mood, wellness_goals, preferred_activities, created_at, updated_at, streak, wellness_points, plant_level, plant_xp)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            age_range = EXCLUDED.age_range,
            current_mood = EXCLUDED.current_mood,
            wellness_goals = EXCLUDED.wellness_goals,
            preferred_activities = EXCLUDED.preferred_activities,
            updated_at = EXCLUDED.updated_at,
            streak = EXCLUDED.streak,
            wellness_points = EXCLUDED.wellness_points,
            plant_level = EXCLUDED.plant_level,
            plant_xp = EXCLUDED.plant_xp
        `, [
          profile.id, profile.display_name, profile.age_range, profile.current_mood,
          profile.wellness_goals, profile.preferred_activities, profile.created_at,
          profile.updated_at, profile.streak, profile.wellness_points, profile.plant_level, profile.plant_xp
        ]);
      } catch (e) { console.error(e); }
    }

    const store = getLocalStore();
    const idx = store.profiles.findIndex(p => p.id === profile.id);
    if (idx >= 0) store.profiles[idx] = profile;
    else store.profiles.push(profile);
    saveLocalStore(store);

    return profile;
  },

  async addPointsAndXP(profileId: string, points: number, plantXp: number = 0) {
    const p = await this.getProfile(profileId);
    if (!p) return null;
    let newPoints = (p.wellness_points || 0) + points;
    let newXp = (p.plant_xp || 0) + plantXp;
    let newLevel = p.plant_level || 1;

    // Plant level threshold calculation (Level 1: 0, L2: 100, L3: 250, L4: 500, L5: 900, L6: 1500)
    const thresholds = [0, 0, 100, 250, 500, 900, 1500];
    while (newLevel < 6 && newXp >= thresholds[newLevel + 1]) {
      newLevel++;
      // Award level up bonus notification
      await this.addNotification(profileId, `🎉 Your plant grew to Level ${newLevel}!`, 'plant');
    }

    p.wellness_points = newPoints;
    p.plant_xp = newXp;
    p.plant_level = newLevel;
    return await this.saveProfile(p);
  },

  // MOODS
  async getMoodEntries(profileId: string) {
    if (pool) {
      try {
        const res = await pool.query('SELECT * FROM mood_entries WHERE profile_id = $1 ORDER BY created_at DESC', [profileId]);
        return res.rows;
      } catch (e) { console.error(e); }
    }
    const store = getLocalStore();
    return store.mood_entries
      .filter(m => m.profile_id === profileId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async addMoodEntry(profileId: string, mood: string, intensity: number = 3, note: string = '') {
    const entry = {
      id: 'mood_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      profile_id: profileId,
      mood,
      intensity,
      note,
      created_at: new Date().toISOString()
    };

    if (pool) {
      try {
        await pool.query('INSERT INTO mood_entries (id, profile_id, mood, intensity, note, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
          [entry.id, entry.profile_id, entry.mood, entry.intensity, entry.note, entry.created_at]);
      } catch (e) { console.error(e); }
    }

    const store = getLocalStore();
    store.mood_entries.push(entry);
    saveLocalStore(store);

    // Update profile current_mood and award points
    await this.addPointsAndXP(profileId, 15, 20);
    const p = await this.getProfile(profileId);
    if (p) {
      p.current_mood = mood;
      await this.saveProfile(p);
    }

    return entry;
  },

  // JOURNAL
  async getJournalEntries(profileId: string) {
    if (pool) {
      try {
        const res = await pool.query('SELECT * FROM journal_entries WHERE profile_id = $1 ORDER BY created_at DESC', [profileId]);
        return res.rows;
      } catch (e) { console.error(e); }
    }
    const store = getLocalStore();
    return store.journal_entries
      .filter(j => j.profile_id === profileId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async addJournalEntry(profileId: string, data: { title: string; content: string; mood?: string; tags?: string[]; prompt?: string }) {
    const entry = {
      id: 'jour_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      profile_id: profileId,
      title: data.title,
      content: data.content,
      mood: data.mood || '',
      tags: data.tags || [],
      prompt: data.prompt || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (pool) {
      try {
        await pool.query(
          'INSERT INTO journal_entries (id, profile_id, title, content, mood, tags, prompt, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [entry.id, entry.profile_id, entry.title, entry.content, entry.mood, entry.tags, entry.prompt, entry.created_at, entry.updated_at]
        );
      } catch (e) { console.error(e); }
    }

    const store = getLocalStore();
    store.journal_entries.push(entry);
    saveLocalStore(store);

    await this.addPointsAndXP(profileId, 30, 35);
    return entry;
  },

  async updateJournalEntry(id: string, profileId: string, data: { title?: string; content?: string; mood?: string; tags?: string[] }) {
    const entries = await this.getJournalEntries(profileId);
    const entry = entries.find((e: any) => e.id === id);
    if (!entry) return null;

    entry.title = data.title ?? entry.title;
    entry.content = data.content ?? entry.content;
    entry.mood = data.mood ?? entry.mood;
    entry.tags = data.tags ?? entry.tags;
    entry.updated_at = new Date().toISOString();

    if (pool) {
      try {
        await pool.query(
          'UPDATE journal_entries SET title=$1, content=$2, mood=$3, tags=$4, updated_at=$5 WHERE id=$6 AND profile_id=$7',
          [entry.title, entry.content, entry.mood, entry.tags, entry.updated_at, id, profileId]
        );
      } catch (e) { console.error(e); }
    }

    const store = getLocalStore();
    const idx = store.journal_entries.findIndex((j: any) => j.id === id);
    if (idx >= 0) store.journal_entries[idx] = entry;
    saveLocalStore(store);

    return entry;
  },

  async deleteJournalEntry(id: string, profileId: string) {
    if (pool) {
      try {
        await pool.query('DELETE FROM journal_entries WHERE id=$1 AND profile_id=$2', [id, profileId]);
      } catch (e) { console.error(e); }
    }
    const store = getLocalStore();
    store.journal_entries = store.journal_entries.filter((j: any) => !(j.id === id && j.profile_id === profileId));
    saveLocalStore(store);
    return { success: true };
  },

  // MEDITATION
  async getMeditationSessions(profileId: string) {
    if (pool) {
      try {
        const res = await pool.query('SELECT * FROM meditation_sessions WHERE profile_id = $1 ORDER BY completed_at DESC', [profileId]);
        return res.rows;
      } catch (e) { console.error(e); }
    }
    const store = getLocalStore();
    return store.meditation_sessions
      .filter((m: any) => m.profile_id === profileId)
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
  },

  async completeMeditationSession(profileId: string, category: string, title: string, durationSeconds: number) {
    const session = {
      id: 'med_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      profile_id: profileId,
      category,
      title,
      duration_seconds: durationSeconds,
      completed_at: new Date().toISOString()
    };

    if (pool) {
      try {
        await pool.query(
          'INSERT INTO meditation_sessions (id, profile_id, category, title, duration_seconds, completed_at) VALUES ($1, $2, $3, $4, $5, $6)',
          [session.id, session.profile_id, session.category, session.title, session.duration_seconds, session.completed_at]
        );
      } catch (e) { console.error(e); }
    }

    const store = getLocalStore();
    store.meditation_sessions.push(session);
    saveLocalStore(store);

    // Calculate points based on duration (e.g., 1 min = 10 pts, + 25 xp)
    const points = Math.max(20, Math.floor((durationSeconds / 60) * 10));
    const xp = Math.max(25, Math.floor((durationSeconds / 60) * 15));
    await this.addPointsAndXP(profileId, points, xp);

    return session;
  },

  // COMMUNITY POSTS
  async getCommunityPosts(profileId?: string) {
    let posts = [];
    if (pool) {
      try {
        const res = await pool.query('SELECT * FROM community_posts ORDER BY created_at DESC');
        posts = res.rows;
      } catch (e) { console.error(e); }
    } else {
      const store = getLocalStore();
      posts = store.community_posts;
    }

    // Attach comments count & like status
    const store = getLocalStore();
    return posts.map((post: any) => {
      const comments = store.community_comments.filter((c: any) => c.post_id === post.id);
      const isLiked = profileId ? store.post_likes.some((l: any) => l.post_id === post.id && l.profile_id === profileId) : false;
      return {
        ...post,
        comments_count: comments.length,
        is_liked: isLiked
      };
    });
  },

  async addCommunityPost(authorId: string, authorName: string, category: string, content: string) {
    if (!content || content.trim().length < 5) throw new Error('Post content is too short.');
    if (content.length > 2000) throw new Error('Post content exceeds limit.');

    const post = {
      id: 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      author_id: authorId,
      author_name: authorName,
      category,
      content,
      likes_count: 0,
      created_at: new Date().toISOString()
    };

    if (pool) {
      try {
        await pool.query(
          'INSERT INTO community_posts (id, author_id, author_name, category, content, likes_count, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [post.id, post.author_id, post.author_name, post.category, post.content, post.likes_count, post.created_at]
        );
      } catch (e) { console.error(e); }
    }

    const store = getLocalStore();
    store.community_posts.unshift(post);
    saveLocalStore(store);

    await this.addPointsAndXP(authorId, 20, 15);
    return post;
  },

  async deleteCommunityPost(postId: string, authorId: string) {
    if (pool) {
      try {
        await pool.query('DELETE FROM community_posts WHERE id=$1 AND author_id=$2', [postId, authorId]);
      } catch (e) { console.error(e); }
    }
    const store = getLocalStore();
    store.community_posts = store.community_posts.filter((p: any) => !(p.id === postId && p.author_id === authorId));
    store.community_comments = store.community_comments.filter((c: any) => c.post_id !== postId);
    saveLocalStore(store);
    return { success: true };
  },

  async toggleLikePost(postId: string, profileId: string) {
    const store = getLocalStore();
    const existingIndex = store.post_likes.findIndex((l: any) => l.post_id === postId && l.profile_id === profileId);

    let liked = false;
    if (existingIndex >= 0) {
      store.post_likes.splice(existingIndex, 1);
    } else {
      store.post_likes.push({ id: 'like_' + Date.now(), post_id: postId, profile_id: profileId, created_at: new Date().toISOString() });
      liked = true;
    }

    // Update post likes count
    const post = store.community_posts.find((p: any) => p.id === postId);
    if (post) {
      post.likes_count = store.post_likes.filter((l: any) => l.post_id === postId).length;
    }
    saveLocalStore(store);

    if (pool) {
      try {
        if (liked) {
          await pool.query('INSERT INTO post_likes (id, post_id, profile_id) VALUES ($1, $2, $3)', ['like_' + Date.now(), postId, profileId]);
        } else {
          await pool.query('DELETE FROM post_likes WHERE post_id=$1 AND profile_id=$2', [postId, profileId]);
        }
        await pool.query('UPDATE community_posts SET likes_count=(SELECT COUNT(*) FROM post_likes WHERE post_id=$1) WHERE id=$1', [postId]);
      } catch (e) { console.error(e); }
    }

    return { liked, likes_count: post ? post.likes_count : 0 };
  },

  async getComments(postId: string) {
    const store = getLocalStore();
    return store.community_comments
      .filter((c: any) => c.post_id === postId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  async addComment(postId: string, authorId: string, authorName: string, content: string) {
    if (!content || !content.trim()) throw new Error('Comment cannot be empty.');
    const comment = {
      id: 'comm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      post_id: postId,
      author_id: authorId,
      author_name: authorName,
      content,
      created_at: new Date().toISOString()
    };

    if (pool) {
      try {
        await pool.query(
          'INSERT INTO community_comments (id, post_id, author_id, author_name, content, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
          [comment.id, comment.post_id, comment.author_id, comment.author_name, comment.content, comment.created_at]
        );
      } catch (e) { console.error(e); }
    }

    const store = getLocalStore();
    store.community_comments.push(comment);
    saveLocalStore(store);

    await this.addPointsAndXP(authorId, 10, 10);
    return comment;
  },

  async deleteComment(commentId: string, authorId: string) {
    const store = getLocalStore();
    store.community_comments = store.community_comments.filter((c: any) => !(c.id === commentId && c.author_id === authorId));
    saveLocalStore(store);
    return { success: true };
  },

  // FRIENDS
  async getFriends(profileId: string) {
    const store = getLocalStore();
    const friendships = store.friendships.filter(f => (f.requester_id === profileId || f.receiver_id === profileId));
    return friendships.map(f => {
      const otherId = f.requester_id === profileId ? f.receiver_id : f.requester_id;
      const otherProfile = store.profiles.find(p => p.id === otherId);
      return {
        ...f,
        friend_id: otherId,
        friend_name: otherProfile ? otherProfile.display_name : 'Mindful Peer',
        friend_streak: otherProfile ? otherProfile.streak : 1,
        friend_mood: otherProfile ? otherProfile.current_mood : 'Neutral'
      };
    });
  },

  async sendFriendRequest(requesterId: string, targetNameOrId: string) {
    const store = getLocalStore();
    const targetProfile = store.profiles.find(p => p.id === targetNameOrId || p.display_name.toLowerCase() === targetNameOrId.toLowerCase());
    if (!targetProfile) throw new Error('User not found. Try searching display name.');
    if (targetProfile.id === requesterId) throw new Error('Cannot send friend request to yourself.');

    const existing = store.friendships.find(f =>
      (f.requester_id === requesterId && f.receiver_id === targetProfile.id) ||
      (f.receiver_id === requesterId && f.requester_id === targetProfile.id)
    );
    if (existing) return existing;

    const friendship = {
      id: 'fr_' + Date.now(),
      requester_id: requesterId,
      receiver_id: targetProfile.id,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    store.friendships.push(friendship);
    saveLocalStore(store);

    await this.addNotification(targetProfile.id, `👋 ${targetProfile.display_name} sent you a friend request!`, 'general');
    return friendship;
  },

  async respondFriendRequest(friendshipId: string, profileId: string, accept: boolean) {
    const store = getLocalStore();
    const f = store.friendships.find(item => item.id === friendshipId && item.receiver_id === profileId);
    if (!f) throw new Error('Friend request not found.');

    f.status = accept ? 'accepted' : 'rejected';
    saveLocalStore(store);

    if (accept) {
      await this.addPointsAndXP(profileId, 25, 20);
      await this.addPointsAndXP(f.requester_id, 25, 20);
    }
    return f;
  },

  // GOALS
  async getGoals(profileId: string) {
    const store = getLocalStore();
    return store.goals.filter(g => g.profile_id === profileId);
  },

  async addGoal(profileId: string, data: { title: string; description?: string; target: number; frequency: string }) {
    const goal = {
      id: 'goal_' + Date.now(),
      profile_id: profileId,
      title: data.title,
      description: data.description || '',
      target: data.target || 1,
      current_progress: 0,
      frequency: data.frequency || 'daily',
      start_date: new Date().toISOString(),
      status: 'active',
      created_at: new Date().toISOString()
    };

    const store = getLocalStore();
    store.goals.push(goal);
    saveLocalStore(store);

    return goal;
  },

  async updateGoalProgress(goalId: string, profileId: string, increment: number = 1) {
    const store = getLocalStore();
    const g = store.goals.find(item => item.id === goalId && item.profile_id === profileId);
    if (!g) return null;

    g.current_progress += increment;
    if (g.current_progress >= g.target && g.status !== 'completed') {
      g.status = 'completed';
      await this.addPointsAndXP(profileId, 50, 40);
      await this.addNotification(profileId, `🎯 Goal Completed: "${g.title}"! (+50 pts)`, 'achievement');
    }
    saveLocalStore(store);
    return g;
  },

  async deleteGoal(goalId: string, profileId: string) {
    const store = getLocalStore();
    store.goals = store.goals.filter(g => !(g.id === goalId && g.profile_id === profileId));
    saveLocalStore(store);
    return { success: true };
  },

  // GAMES
  async saveGameSession(profileId: string, gameType: string, score: number, pointsEarned: number) {
    const session = {
      id: 'game_' + Date.now(),
      profile_id: profileId,
      game_type: gameType,
      score,
      points_earned: pointsEarned,
      completed_at: new Date().toISOString()
    };

    const store = getLocalStore();
    store.game_sessions.push(session);
    saveLocalStore(store);

    await this.addPointsAndXP(profileId, pointsEarned, Math.floor(pointsEarned * 0.8));
    return session;
  },

  // RESOURCES
  async getResources(profileId?: string) {
    const store = getLocalStore();
    return store.resources.map(r => {
      const prog = profileId ? store.resource_progress.find(p => p.resource_id === r.id && p.profile_id === profileId) : null;
      return {
        ...r,
        completed: prog ? prog.completed : false,
        bookmarked: prog ? prog.bookmarked : false
      };
    });
  },

  async toggleResourceProgress(profileId: string, resourceId: string, action: 'complete' | 'bookmark') {
    const store = getLocalStore();
    let prog = store.resource_progress.find(p => p.resource_id === resourceId && p.profile_id === profileId);
    if (!prog) {
      prog = { id: 'prog_' + Date.now(), profile_id: profileId, resource_id: resourceId, completed: false, bookmarked: false };
      store.resource_progress.push(prog);
    }

    if (action === 'complete') {
      prog.completed = !prog.completed;
      if (prog.completed) {
        await this.addPointsAndXP(profileId, 25, 20);
      }
    } else if (action === 'bookmark') {
      prog.bookmarked = !prog.bookmarked;
    }

    saveLocalStore(store);
    return prog;
  },

  // WEBINARS
  async getWebinars() {
    const store = getLocalStore();
    return store.webinars;
  },

  // NOTIFICATIONS
  async getNotifications(profileId: string) {
    const store = getLocalStore();
    return store.notifications
      .filter(n => n.profile_id === profileId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async addNotification(profileId: string, message: string, type: 'streak' | 'reminder' | 'achievement' | 'plant' | 'general' = 'general') {
    const store = getLocalStore();
    const notif = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      profile_id: profileId,
      message,
      type,
      read: false,
      created_at: new Date().toISOString()
    };
    store.notifications.unshift(notif);
    saveLocalStore(store);
    return notif;
  },

  async markNotificationRead(id: string, profileId: string) {
    const store = getLocalStore();
    const n = store.notifications.find(item => item.id === id && item.profile_id === profileId);
    if (n) n.read = true;
    saveLocalStore(store);
    return { success: true };
  },

  // CHAT HISTORY
  async getChatHistory(profileId: string) {
    const store = getLocalStore();
    return store.chat_messages
      .filter(m => m.profile_id === profileId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  async addChatMessage(profileId: string, sender: 'user' | 'minda', text: string) {
    const store = getLocalStore();
    const msg = {
      id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      profile_id: profileId,
      sender,
      text,
      created_at: new Date().toISOString()
    };
    store.chat_messages.push(msg);
    saveLocalStore(store);
    return msg;
  },

  // ACHIEVEMENTS
  async getAchievements(profileId: string) {
    const store = getLocalStore();
    const moods = store.mood_entries.filter(m => m.profile_id === profileId);
    const journals = store.journal_entries.filter(j => j.profile_id === profileId);
    const meditations = store.meditation_sessions.filter(m => m.profile_id === profileId);
    const p = store.profiles.find(item => item.id === profileId);

    const unlockedKeys = new Set<string>();
    if (moods.length + journals.length + meditations.length >= 1) unlockedKeys.add('first_step');
    if (p && p.streak >= 3) unlockedKeys.add('streak_3');
    if (p && p.streak >= 7) unlockedKeys.add('streak_7');
    if (journals.length >= 10) unlockedKeys.add('journal_10');
    if (meditations.length >= 10) unlockedKeys.add('meditation_10');
    if (p && p.plant_level >= 3) unlockedKeys.add('plant_3');

    return store.achievements.map(a => ({
      ...a,
      unlocked: unlockedKeys.has(a.key)
    }));
  }
};
