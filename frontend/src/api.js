import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

export const getBoards = () => api.get('/boards');
export const getBoard = (id) => api.get(`/boards/${id}`);
export const createBoard = (data) => api.post('/boards', data);
export const createList = (data) => api.post('/lists', data);
export const updateList = (id, data) => api.put(`/lists/${id}`, data);
export const deleteList = (id) => api.delete(`/lists/${id}`);
export const reorderLists = (lists) => api.put('/lists/reorder', { lists });

export const createCard = (data) => api.post('/cards', data);
export const updateCard = (id, data) => api.put(`/cards/${id}`, data);
export const deleteCard = (id) => api.delete(`/cards/${id}`);
export const reorderCards = (cards) => api.put('/cards/reorder', { cards });
export const moveCard = (data) => api.put('/cards/move', data);
export const searchCards = (params) => api.get('/search', { params });

export const addChecklist = (data) => api.post('/checklists', data);
export const addChecklistItem = (data) => api.post('/checklists/items', data);
export const toggleChecklistItem = (id, data) => api.put(`/checklists/items/${id}`, data);

// Labels
export const getLabels = () => api.get('/labels');
export const addLabelToCard = (cardId, labelId) => api.post(`/cards/${cardId}/labels`, { labelId });
export const removeLabelFromCard = (cardId, labelId) => api.delete(`/cards/${cardId}/labels/${labelId}`);

// Members
export const getUsers = () => api.get('/users');
export const addMemberToCard = (cardId, userId) => api.post(`/cards/${cardId}/members`, { userId });
export const removeMemberFromCard = (cardId, userId) => api.delete(`/cards/${cardId}/members/${userId}`);

export default api;
