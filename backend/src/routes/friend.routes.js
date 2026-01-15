import express from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getPendingRequests,
  removeFriend
} from '../controllers/friend.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/request', authMiddleware, sendFriendRequest);
router.post('/request/:requestId/accept', authMiddleware, acceptFriendRequest);
router.post('/request/:requestId/reject', authMiddleware, rejectFriendRequest);
router.get('/:id', authMiddleware, getFriends);
router.get('/requests/pending', authMiddleware, getPendingRequests);
router.delete('/:friendId', authMiddleware, removeFriend);

export default router;
