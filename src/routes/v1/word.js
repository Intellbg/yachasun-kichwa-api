import express from 'express';
import { createWordEntry, getWordList, getWordEntry, patchWordEntry, deleteWordEntry, getQuestion } from '../../controllers/v1/wordController.js';

const router = express.Router();

router.get('/get-question', getQuestion);
router.get('/', getWordList);
router.post('/', createWordEntry);
router.get('/:id', getWordEntry);
router.patch('/:id', patchWordEntry);
router.delete('/:id', deleteWordEntry);


export default router;
