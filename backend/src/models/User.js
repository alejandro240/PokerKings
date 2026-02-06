import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    trim: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    lowercase: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  chips: {
    type: DataTypes.BIGINT,
    defaultValue: 1000
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: 'default-avatar.png'
  },
  highestWinning: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  totalWinnings: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  gamesPlayed: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  gamesWon: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastFreeChipsDate: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  isBot: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Indica si es un usuario bot automático'
  }
}, {
  timestamps: true,
  tableName: 'users'
});

export default User;
