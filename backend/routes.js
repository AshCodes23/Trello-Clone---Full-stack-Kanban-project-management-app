import express from 'express';
import { getBoards, getBoard, createBoard } from './controllers/boardController.js';
import { createList, updateList, deleteList, reorderLists } from './controllers/listController.js';
import { createCard, updateCard, deleteCard, reorderCards, moveCard, searchCards } from './controllers/cardController.js';
import { addChecklist, addChecklistItem, toggleChecklistItem } from './controllers/checklistController.js';
import { getLabels, addLabelToCard, removeLabelFromCard } from './controllers/labelController.js';
import { getUsers, addMemberToCard, removeMemberFromCard } from './controllers/memberController.js';

const router = express.Router();

// Boards
router.get('/boards', getBoards);
router.get('/boards/:id', getBoard);
router.post('/boards', createBoard);

// Lists
router.post('/lists', createList);
router.put('/lists/reorder', reorderLists);
router.put('/lists/:id', updateList);
router.delete('/lists/:id', deleteList);

// Cards
router.get('/search', searchCards);
router.post('/cards', createCard);
router.put('/cards/reorder', reorderCards);
router.put('/cards/move', moveCard);
router.put('/cards/:id', updateCard);
router.delete('/cards/:id', deleteCard);

// Labels
router.get('/labels', getLabels);
router.post('/cards/:id/labels', addLabelToCard);
router.delete('/cards/:id/labels/:labelId', removeLabelFromCard);

// Members
router.get('/users', getUsers);
router.post('/cards/:id/members', addMemberToCard);
router.delete('/cards/:id/members/:userId', removeMemberFromCard);

// Checklists
router.post('/checklists', addChecklist);
router.post('/checklists/items', addChecklistItem);
router.put('/checklists/items/:id', toggleChecklistItem);

export default router;
