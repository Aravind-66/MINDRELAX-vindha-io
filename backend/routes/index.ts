import { Router } from 'express';
import healthRoutes from './healthRoutes';
import userRoutes from './userRoutes';
import journalRoutes from './journalRoutes';
import moodRoutes from './moodRoutes';
import analyticsRoutes from './analyticsRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/journals', journalRoutes);
router.use('/moods', moodRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
