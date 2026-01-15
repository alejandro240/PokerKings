import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  maxPlayers: {
    type: Number,
    default: 6
  },
  smallBlind: {
    type: Number,
    required: true
  },
  bigBlind: {
    type: Number,
    required: true
  },
  players: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    position: Number,
    chips: Number,
    isActive: Boolean
  }],
  currentGame: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  },
  status: {
    type: String,
    enum: ['waiting', 'playing', 'finished'],
    default: 'waiting'
  }
}, {
  timestamps: true
});

export default mongoose.model('Table', tableSchema);
