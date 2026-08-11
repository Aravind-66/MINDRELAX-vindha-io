import { Request, Response, NextFunction } from 'express';
import { db } from '../../server/db';

export const getUserAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const profile = await db.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    const moods = await db.getMoodEntries(userId);
    const journals = await db.getJournalEntries(userId);
    const meditations = await db.getMeditationSessions(userId);

    const totalMinutes = Math.round(
      meditations.reduce((acc, m) => acc + (m.duration_seconds || 0), 0) / 60
    );

    res.json({
      userId,
      wellnessPoints: profile.wellness_points,
      streakDays: profile.streak_days,
      totalSessions: meditations.length,
      totalMinutes,
      moodLogsCount: moods.length,
      journalEntriesCount: journals.length,
      lastActive: profile.updated_at,
    });
  } catch (err) {
    next(err);
  }
};
