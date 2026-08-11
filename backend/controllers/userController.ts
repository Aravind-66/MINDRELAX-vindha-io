import { Request, Response, NextFunction } from 'express';
import { db } from '../../server/db';

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const profile = await db.getProfile(id);
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updated = await db.saveProfile({ ...req.body, id });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
