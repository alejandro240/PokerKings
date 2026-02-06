import { Table, User, Game } from '../models/index.js';

export const getTables = async (req, res) => {
  try {
    const tables = await Table.findAll({
      where: { status: ['waiting', 'playing'] }
    });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTable = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
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
    const { name, smallBlind, bigBlind, maxPlayers, isPrivate, tableColor, botsCount } = req.body;
    const table = await Table.create({
      name,
      smallBlind,
      bigBlind,
      maxPlayers: maxPlayers || 6,
      isPrivate: isPrivate || false,
      tableColor: tableColor || '#1a4d2e',
      botsCount: botsCount || 0
    });
    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinTable = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    const user = await User.findByPk(req.userId);

    if (table.currentPlayers >= table.maxPlayers) {
      return res.status(400).json({ message: 'Table is full' });
    }

    const buyIn = table.bigBlind * 100;
    if (user.chips < buyIn) {
      return res.status(400).json({ message: 'Insufficient chips' });
    }

    user.chips -= buyIn;
    await user.save();

    table.currentPlayers += 1;
    await table.save();

    res.json({ message: 'Joined table successfully', table });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const leaveTable = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    table.currentPlayers = Math.max(0, table.currentPlayers - 1);
    await table.save();
    res.json({ message: 'Left table successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
