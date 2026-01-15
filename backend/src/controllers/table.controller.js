import Table from '../models/Table.js';
import User from '../models/User.js';

export const getTables = async (req, res) => {
  try {
    const tables = await Table.find().populate('players.user', 'username avatar');
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id).populate('players.user', 'username avatar');
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTable = async (req, res) => {
  try {
    const { name, smallBlind, bigBlind, maxPlayers } = req.body;
    const table = await Table.create({
      name,
      smallBlind,
      bigBlind,
      maxPlayers: maxPlayers || 6
    });
    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    const user = await User.findById(req.userId);

    if (table.players.length >= table.maxPlayers) {
      return res.status(400).json({ message: 'Table is full' });
    }

    const buyIn = table.bigBlind * 100;
    if (user.chips < buyIn) {
      return res.status(400).json({ message: 'Insufficient chips' });
    }

    table.players.push({
      user: user._id,
      position: table.players.length,
      chips: buyIn,
      isActive: true
    });

    await table.save();
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const leaveTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    table.players = table.players.filter(p => p.user.toString() !== req.userId);
    await table.save();
    res.json({ message: 'Left table successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
