import { Request, Response, NextFunction } from 'express';
import { db } from '../../server/db';

export const getJournalEntries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const entries = await db.getJournalEntries(userId);
    res.json(entries);
  } catch (err) {
    next(err);
  }
};

export const createJournalEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { profile_id, title, content, mood, tags, prompt } = req.body;
    if (!profile_id || !title || !content) {
      return res.status(400).json({ error: 'profile_id, title, and content are required' });
    }
    const entry = await db.addJournalEntry(profile_id, { title, content, mood, tags, prompt });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
};

export const deleteJournalEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const profileId = req.query.profile_id as string;
    if (!profileId) {
      return res.status(400).json({ error: 'profile_id is required' });
    }
    const success = await db.deleteJournalEntry(id, profileId);
    res.json({ success });
  } catch (err) {
    next(err);
  }
};
