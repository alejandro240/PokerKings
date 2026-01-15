import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['purchase', 'win', 'loss', 'bonus'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: String,
  reference: String
}, {
  timestamps: true
});

export default mongoose.model('Transaction', transactionSchema);
