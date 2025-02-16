import express from 'express';
import Portfolio from '../models/Portfolio.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const portfolio = await Portfolio.find();
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  console.log('POST route hit');
  const { name, symbol, quantity, price } = req.body;
  try {
    const newCrypto = new Portfolio({ name, symbol, quantity, price });
    const savedCrypto = await newCrypto.save();
    res.status(201).json(savedCrypto);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const trimmedId = req.params.id.trim();
    await Portfolio.findByIdAndDelete(trimmedId);
    res.json({ message: "Crypto removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;
