import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, NotificationItem, MoodEntry, JournalEntry, MeditationSession } from '../types';
import { api } from '../services/api';
import { realtime } from '../services/websocket';

export interface LiveActivityItem {
  id: string;
  message: string;
  timestamp: string;
}

interface WellnessContextType {
  profile: Profile | null;
  loading: boolean;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  refreshProfile: () => Promise<void>;
  createInitialProfile: (data: {
    display_name: string;
    age_range?: string;
    current_mood?: any;
    wellness_goals?: string[];
    preferred_activities?: string[];
  }) => Promise<Profile>;
  updateProfileData: (data: Partial<Profile>) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  recentMoods: MoodEntry[];
  recentJournals: JournalEntry[];
  recentMeditations: MeditationSession[];
  refreshUserData: () => Promise<void>;
  triggerMindaModal: () => void;
  isMindaOpen: boolean;
  setIsMindaOpen: (open: boolean) => void;
  onlineCount: number;
  isRealtimeConnected: boolean;
  liveActivities: LiveActivityItem[];
  bgTheme: 'emerald' | 'cosmic' | 'ocean' | 'sunset' | 'zen';
  setBgTheme: (theme: 'emerald' | 'cosmic' | 'ocean' | 'sunset' | 'zen') => void;
  colorMode: 'dark' | 'light';
  setColorMode: (mode: 'dark' | 'light') => void;
  toggleColorMode: () => void;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'mindrelax_profile_id';
const COLOR_MODE_KEY = 'mindrelax_color_mode';
const BG_THEME_KEY = 'mindrelax_bg_theme';

export const WellnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  const [recentJournals, setRecentJournals] = useState<JournalEntry[]>([]);
  const [recentMeditations, setRecentMeditations] = useState<MeditationSession[]>([]);
  const [isMindaOpen, setIsMindaOpen] = useState<boolean>(false);

  // Real-time & Mode states
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const [bgTheme, setBgThemeState] = useState<'emerald' | 'cosmic' | 'ocean' | 'sunset' | 'zen'>(() => {
    const saved = localStorage.getItem(BG_THEME_KEY);
    return saved === 'cosmic' || saved === 'ocean' || saved === 'sunset' || saved === 'zen' ? saved : 'emerald';
  });
  const [colorMode, setColorModeState] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(COLOR_MODE_KEY);
    return saved === 'light' ? 'light' : 'dark';
  });

  const setBgTheme = (theme: 'emerald' | 'cosmic' | 'ocean' | 'sunset' | 'zen') => {
    setBgThemeState(theme);
    localStorage.setItem(BG_THEME_KEY, theme);
  };

  const setColorMode = (mode: 'dark' | 'light') => {
    setColorModeState(mode);
    localStorage.setItem(COLOR_MODE_KEY, mode);
  };

  const toggleColorMode = () => {
    setColorMode(colorMode === 'dark' ? 'light' : 'dark');
  };
  const [liveActivities, setLiveActivities] = useState<LiveActivityItem[]>([
    { id: '1', message: 'A sanctuary member completed a 10 min ocean meditation', timestamp: 'Just now' },
    { id: '2', message: 'Someone logged feeling Very Happy in the Mood Tracker', timestamp: '1m ago' }
  ]);

  useEffect(() => {
    initProfile();

    // Connect real-time WebSocket
    realtime.connect();

    const unsubConn = realtime.on('connection_change', (data: { connected: boolean }) => {
      setIsRealtimeConnected(data.connected);
    });

    const unsubPresence = realtime.on('presence:update', (data: { onlineCount: number }) => {
      if (data?.onlineCount) setOnlineCount(data.onlineCount);
    });

    const unsubActivity = realtime.on('activity:live', (data: { message: string }) => {
      if (data?.message) {
        setLiveActivities(prev => [
          { id: Date.now().toString(), message: data.message, timestamp: 'Just now' },
          ...prev.slice(0, 9)
        ]);
      }
    });

    return () => {
      unsubConn();
      unsubPresence();
      unsubActivity();
    };
  }, []);

  const initProfile = async () => {
    setLoading(true);
    let anonId = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!anonId) {
      // First time user, trigger onboarding modal
      setIsOnboardingOpen(true);
      setLoading(false);
      return;
    }

    try {
      const p = await api.getProfile(anonId);
      if (p) {
        setProfile(p);
        await loadUserData(p.id);
      } else {
        const local = localStorage.getItem('mindrelax_local_profile');
        if (local) {
          try {
            setProfile(JSON.parse(local));
            setIsOnboardingOpen(false);
          } catch {
            setIsOnboardingOpen(true);
          }
        } else {
          setIsOnboardingOpen(true);
        }
      }
    } catch (e) {
      console.warn('Could not fetch existing profile, checking local fallback:', e);
      const local = localStorage.getItem('mindrelax_local_profile');
      if (local) {
        try {
          setProfile(JSON.parse(local));
          setIsOnboardingOpen(false);
        } catch {
          setIsOnboardingOpen(true);
        }
      } else {
        setIsOnboardingOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (profileId: string) => {
    try {
      const [notifs, moods, journals, meds] = await Promise.all([
        api.getNotifications(profileId).catch(() => []),
        api.getMoods(profileId).catch(() => []),
        api.getJournal(profileId).catch(() => []),
        api.getMeditations(profileId).catch(() => [])
      ]);
      setNotifications(notifs);
      setRecentMoods(moods);
      setRecentJournals(journals);
      setRecentMeditations(meds);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const refreshProfile = async () => {
    if (!profile) return;
    try {
      const updated = await api.getProfile(profile.id);
      if (updated) setProfile(updated);
    } catch (e) {
      console.error('Error refreshing profile:', e);
    }
  };

  const refreshUserData = async () => {
    if (!profile) return;
    await Promise.all([refreshProfile(), loadUserData(profile.id)]);
  };

  const createInitialProfile = async (data: {
    display_name: string;
    age_range?: string;
    current_mood?: any;
    wellness_goals?: string[];
    preferred_activities?: string[];
  }): Promise<Profile> => {
    let anonId = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!anonId) {
      anonId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      localStorage.setItem(LOCAL_STORAGE_KEY, anonId);
    }

    const payloadData = {
      display_name: data.display_name,
      age_range: data.age_range || '',
      current_mood: data.current_mood || 'Neutral',
      wellness_goals: data.wellness_goals || [],
      preferred_activities: data.preferred_activities || [],
      streak: 1,
      wellness_points: 50,
      plant_level: 1,
      plant_xp: 0
    };

    let newProfile: Profile;
    try {
      newProfile = await api.updateProfile(anonId, payloadData);
    } catch (err) {
      console.warn('Backend API updateProfile failed, creating local profile fallback:', err);
      newProfile = {
        id: anonId,
        ...payloadData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    try {
      localStorage.setItem('mindrelax_local_profile', JSON.stringify(newProfile));
    } catch {}

    setProfile(newProfile);
    setIsOnboardingOpen(false);
    await loadUserData(newProfile.id).catch(() => {});
    return newProfile;
  };

  const updateProfileData = async (data: Partial<Profile>) => {
    if (!profile) return;
    const updated = await api.updateProfile(profile.id, data);
    setProfile(updated);
  };

  const refreshNotifications = async () => {
    if (!profile) return;
    const notifs = await api.getNotifications(profile.id);
    setNotifications(notifs);
  };

  const markNotificationRead = async (id: string) => {
    if (!profile) return;
    await api.markNotificationRead(id, profile.id);
    setNotifications(prev => (Array.isArray(prev) ? prev : []).map(n => n.id === id ? { ...n, read: true } : n));
  };

  const triggerMindaModal = () => {
    setIsMindaOpen(true);
  };

  const unreadNotifsCount = (Array.isArray(notifications) ? notifications : []).filter(n => !n.read).length;

  return (
    <WellnessContext.Provider
      value={{
        profile,
        loading,
        isOnboardingOpen,
        setIsOnboardingOpen,
        notifications,
        unreadNotifsCount,
        refreshProfile,
        createInitialProfile,
        updateProfileData,
        refreshNotifications,
        markNotificationRead,
        recentMoods,
        recentJournals,
        recentMeditations,
        refreshUserData,
        triggerMindaModal,
        isMindaOpen,
        setIsMindaOpen,
        onlineCount,
        isRealtimeConnected,
        liveActivities,
        bgTheme,
        setBgTheme,
        colorMode,
        setColorMode,
        toggleColorMode
      }}
    >
      {children}
    </WellnessContext.Provider>
  );
};

export const useWellness = () => {
  const ctx = useContext(WellnessContext);
  if (!ctx) throw new Error('useWellness must be used within WellnessProvider');
  return ctx;
};
