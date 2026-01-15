import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  players: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cards: [String],
    bet: Number,
    folded: Boolean,
    position: Number
  }],
  communityCards: [String],
  pot: {
    type: Number,
    default: 0
  },
  currentBet: {
    type: Number,
    default: 0
  },
  currentPlayerIndex: {
    type: Number,
    default: 0
  },
  phase: {
    type: String,
    enum: ['preflop', 'flop', 'turn', 'river', 'showdown'],
    default: 'preflop'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['active', 'finished'],
    default: 'active'
  }
}, {
  timestamps: true
});

export default mongoose.model('Game', gameSchema);
