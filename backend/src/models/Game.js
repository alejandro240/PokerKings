import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tableId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'tables', key: 'id' }
  },
  winnerId: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' }
  },
  pot: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  phase: {
    type: DataTypes.ENUM('preflop', 'flop', 'turn', 'river', 'showdown'),
    defaultValue: 'preflop'
  },
  communityCards: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('active', 'finished'),
    defaultValue: 'active'
  },
  startTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  endTime: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  tableName: 'games'
});

export default Game;
