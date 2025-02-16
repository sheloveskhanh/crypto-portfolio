import mongoose from 'mongoose';

const PortfolioSchema = new mongoose.Schema({
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  dateAdded: { type: Date, default: Date.now }
});

export default mongoose.model('Portfolio', PortfolioSchema);
