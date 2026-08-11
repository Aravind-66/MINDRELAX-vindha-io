import { Router } from 'express';
import { getMoodEntries, createMoodEntry } from '../controllers/moodController';

const router = Router();

router.get('/:userId', getMoodEntries);
router.post('/', createMoodEntry);

export default router;
