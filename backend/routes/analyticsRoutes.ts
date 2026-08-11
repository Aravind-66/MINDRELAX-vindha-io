import { Router } from 'express';
import { getUserAnalytics } from '../controllers/analyticsController';

const router = Router();

router.get('/:userId', getUserAnalytics);

export default router;
