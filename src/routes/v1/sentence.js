import express from 'express';
import { createSentenceEntry, getSentenceList, getSentenceEntry, patchSentenceEntry, deleteSentenceEntry, getQuestion, getQuestionTime } from '../../controllers/v1/sentenceController.js';

const router = express.Router();

router.get('/get-question', getQuestion);
router.get('/get-question-time', getQuestionTime);
router.get('/', getSentenceList);
router.post('/', createSentenceEntry);
router.get('/:id', getSentenceEntry);
router.patch('/:id', patchSentenceEntry);
router.delete('/:id', deleteSentenceEntry);


export default router;