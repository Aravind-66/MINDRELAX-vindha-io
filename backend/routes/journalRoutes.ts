import { Router } from 'express';
import { getJournalEntries, createJournalEntry, deleteJournalEntry } from '../controllers/journalController';

const router = Router();

router.get('/:userId', getJournalEntries);
router.post('/', createJournalEntry);
router.delete('/:id', deleteJournalEntry);

export default router;
