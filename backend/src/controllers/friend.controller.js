import { User, FriendRequest, Friend } from '../models/index.js';

export const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.userId;

    if (senderId === receiverId) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingRequest = await FriendRequest.findOne({
      where: { senderId, receiverId, status: 'pending' }
    });
    if (existingRequest) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    const request = await FriendRequest.create({
      senderId,
      receiverId,
      status: 'pending'
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;

    const request = await FriendRequest.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.receiverId !== userId) {
      return res.status(403).json({ message: 'Cannot accept other users requests' });
    }

    request.status = 'accepted';
    await request.save();

    // Create friendship both ways
    await Friend.create({ userId: request.senderId, friendId: request.receiverId });
    await Friend.create({ userId: request.receiverId, friendId: request.senderId });

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await FriendRequest.findByPk(requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFriends = async (req, res) => {
  try {
    const userId = req.params.id;
    const friends = await Friend.findAll({
      where: { userId },
      include: ['friend']
    });

    const friendsList = friends.map(f => f.friend);
    res.json(friendsList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.userId;
    const requests = await FriendRequest.findAll({
      where: { receiverId: userId, status: 'pending' },
      include: ['sender']
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.userId;

    await Friend.destroy({
      where: { userId, friendId }
    });
    await Friend.destroy({
      where: { userId: friendId, friendId: userId }
    });

    res.json({ message: 'Friend removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
