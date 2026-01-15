import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const shopItems = [
  { id: 1, name: 'Chips Pack Small', chips: 1000, price: 5 },
  { id: 2, name: 'Chips Pack Medium', chips: 5000, price: 20 },
  { id: 3, name: 'Chips Pack Large', chips: 10000, price: 35 },
  { id: 4, name: 'Avatar Pack', chips: 0, price: 10, type: 'avatar' }
];

export const getShopItems = async (req, res) => {
  try {
    res.json(shopItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const purchaseItem = async (req, res) => {
  try {
    const { itemId } = req.body;
    const item = shopItems.find(i => i.id === itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const user = await User.findById(req.userId);
    user.chips += item.chips;
    await user.save();

    await Transaction.create({
      user: user._id,
      type: 'purchase',
      amount: item.chips,
      description: item.name
    });

    res.json({ message: 'Purchase successful', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
