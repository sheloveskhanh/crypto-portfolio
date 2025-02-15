import React, { useState, useEffect } from 'react';
import './ActionModal.css';

const ActionModal = ({ onClose, onSave, coin, portfolio }) => {
  const [selectedCoin, setSelectedCoin] = useState(coin || {});
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [useCurrentPrice, setUseCurrentPrice] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(null); // ✅ Fixed incorrect state variable
  const [transactionType, setTransactionType] = useState('buy'); // Default to Buy
  const [usdAmount, setUsdAmount] = useState(''); // User enters USD
  const [coinAmount, setCoinAmount] = useState(''); // Converted coin amount

  useEffect(() => {
    if (useCurrentPrice && selectedCoin?.current_price) {
      setPurchasePrice(selectedCoin.current_price);
    }
  }, [useCurrentPrice, selectedCoin]);

  useEffect(() => {
    if (selectedCoin?.id) {
      fetchCurrentPrice(selectedCoin.id);
    }
  }, [selectedCoin]);

  const fetchCurrentPrice = async (coinId) => {
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
      const data = await response.json();
      setCurrentPrice(data[coinId].usd);
    } catch (error) {
      console.error('Error fetching current price:', error);
    }
  };

  const handleSave = () => {
    if (!selectedCoin?.id || !usdAmount || isNaN(usdAmount) || usdAmount <= 0) {
      alert('Please enter a valid USD amount.');
      return;
    }
  
    if (!purchasePrice || isNaN(purchasePrice) || purchasePrice <= 0) {
      alert('Please enter a valid purchase price.');
      return;
    }
  
    // ✅ Prevent Selling More Than Owned
    const existingCoin = portfolio.find((c) => c.id === selectedCoin.id);
    if (transactionType === 'sell' && parseFloat(coinAmount) > (existingCoin?.amount || 0)) {
      alert(`You cannot sell more than you own. Available: ${existingCoin?.amount || 0}`);
      return;
    }
  
    const transaction = {
      type: transactionType,
      coin: selectedCoin,
      amount: parseFloat(coinAmount),
      purchasePrice: parseFloat(purchasePrice),
    };
  
    console.log("Transaction to Save:", transaction);
  
    onSave(transaction); 
    onClose();
  };

  const handleUsdChange = (e) => {
    const usdValue = e.target.value;
    setUsdAmount(usdValue);

    if (selectedCoin?.current_price) {
      const calculatedCoinAmount = parseFloat(usdValue) / selectedCoin.current_price;
      setCoinAmount(calculatedCoinAmount.toFixed(6));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{transactionType === 'buy' ? 'Buy' : 'Sell'} Transaction</h2>

        {/* Buy & Sell Buttons */}
        <div className="buy-sell-buttons">
          <button
            className={`buy-button ${transactionType === 'buy' ? 'active' : ''}`}
            onClick={() => setTransactionType('buy')}
          >
            Buy
          </button>
          <button
            className={`sell-button ${transactionType === 'sell' ? 'active' : ''}`}
            onClick={() => setTransactionType('sell')}
          >
            Sell
          </button>
        </div>

        {/* Coin Selection Dropdown */}
        <label>
          Select Coin:
          <select
            value={selectedCoin?.id || ''}
            onChange={(e) => {
              const coin = portfolio.find((c) => c.id === e.target.value);
              setSelectedCoin(coin);
              setPurchasePrice(coin?.current_price || '');
            }}
          >
            <option value="" disabled>Select a coin</option>
            {portfolio.map((coin) => (
              <option key={coin.id} value={coin.id}>
                {coin.name} ({coin.symbol.toUpperCase()})
              </option>
            ))}
          </select>
        </label>

        {/* USD Input & Converted Coin Amount */}
        <label>
          Amount (USD):
          <input
            type="number"
            value={usdAmount}
            onChange={handleUsdChange}
            placeholder="Enter USD amount"
          />
          <p className="coin-amount">≈ {coinAmount} {selectedCoin?.symbol?.toUpperCase()}</p>
        </label>

        {/* Purchase Price */}
        <label>
          Purchase Price:
          <input
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            disabled={useCurrentPrice}
          />
        </label>

        {/* Use Current Price Checkbox */}
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={useCurrentPrice}
            onChange={(e) => setUseCurrentPrice(e.target.checked)}
          />
          Use Current Price
        </label>

        {/* Modal Buttons */}
        <div className="modal-buttons">
          <button className="save-button" onClick={handleSave}>Save</button>
          <button className="close-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
