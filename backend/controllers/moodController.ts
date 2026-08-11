import { Request, Response, NextFunction } from 'express';
import { db } from '../../server/db';

export const getMoodEntries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const entries = await db.getMoodEntries(userId);
    res.json(entries);
  } catch (err) {
    next(err);
  }
};

export const createMoodEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { profile_id, mood, intensity, note } = req.body;
    if (!profile_id || !mood) {
      return res.status(400).json({ error: 'profile_id and mood are required' });
    }
    const entry = await db.addMoodEntry(profile_id, mood, intensity || 3, note || '');
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
};
