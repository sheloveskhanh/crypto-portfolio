import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../../pages/firebaseConfig"; // Ensure the correct relative path
import { onAuthStateChanged } from 'firebase/auth';
import './Portfolio.css';
import { CoinContext } from '../../context/CoinContext';
import ActionModal from '../../components/ActionModal/ActionModal';

const Portfolio = ({ portfolio = [], setPortfolio }) => {
  const { currency } = useContext(CoinContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [currentPrices, setCurrentPrices] = useState({});
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 🔹 Check if user is authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/login'); // Redirect to login if not logged in
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, [navigate]);

  useEffect(() => {
    const savedPortfolio = localStorage.getItem('portfolio');

    if (savedPortfolio) {
      try {
        const parsedPortfolio = JSON.parse(savedPortfolio);
        console.log("Loaded portfolio from localStorage:", parsedPortfolio);

        if (Array.isArray(parsedPortfolio)) {
          setPortfolio(parsedPortfolio); // ✅ Ensure it's correctly set
        } else {
          console.error("Invalid portfolio data format:", parsedPortfolio);
          setPortfolio([]); // ✅ Reset if corrupted
        }
      } catch (error) {
        console.error("Error parsing portfolio from localStorage:", error);
        setPortfolio([]); // ✅ Prevent crash
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    if (portfolio.length > 0) {
      fetchCurrentPrices();
    }
  }, [portfolio]);

  const fetchCurrentPrices = async () => {
    const coinIds = portfolio.map((coin) => coin.id).join(',');
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`);
      const data = await response.json();
      setCurrentPrices(data);
    } catch (error) {
      console.error('Error fetching current prices:', error);
    }
  };

  const removeFromPortfolio = (coinId) => {
    const updatedPortfolio = portfolio.filter((item) => item.id !== coinId);
    setPortfolio(updatedPortfolio);
    localStorage.setItem('portfolio', JSON.stringify(updatedPortfolio));
  };

  const openModal = (coin) => {
    setSelectedCoin(coin);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = (transaction) => {
    console.log("Transaction Received:", transaction);

    let updatedPortfolio = portfolio.map((item) => {
      if (item.id === transaction.coin.id) {
        return {
          ...item,
          amount: transaction.type === 'buy'
            ? (item.amount || 0) + transaction.amount
            : Math.max(0, (item.amount || 0) - transaction.amount),
          purchase_price: transaction.purchasePrice,
        };
      }
      return item;
    });

    if (!portfolio.some((item) => item.id === transaction.coin.id) && transaction.type === 'buy') {
      updatedPortfolio = [...portfolio, {
        ...transaction.coin,
        amount: transaction.amount,
        purchase_price: transaction.purchasePrice,
      }];
    }

    console.log("Updated Portfolio Before Saving:", updatedPortfolio);

    setPortfolio([...updatedPortfolio]);

    setTimeout(() => {
      localStorage.setItem('portfolio', JSON.stringify(updatedPortfolio));
      console.log("Portfolio saved to localStorage:", updatedPortfolio);
    }, 100);
  };

  const totalBalance = portfolio.reduce((acc, item) => {
    const currentPrice = currentPrices[item.id]?.usd || 0;
    return acc + currentPrice * (item.amount || 0);
  }, 0);

  const unrealizedPnL = portfolio.reduce((acc, item) => {
    const currentPrice = currentPrices[item.id]?.usd || 0;
    const buyPrice = item.purchase_price || currentPrice || 0;
    return acc + ((currentPrice - buyPrice) * (item.amount || 0));
  }, 0);

  const totalProfitLossPercentage = totalBalance ? (unrealizedPnL / totalBalance) * 100 : 0;

  return (
    <div className='portfolio'>
      <div className="portfolio-header">
        <h2>My Portfolio</h2>
      </div>

      {portfolio.length === 0 ? (
        <p className="empty-portfolio">Your portfolio is empty. Start adding coins!</p>
      ) : (
        <>
          <div className="portfolio-summary">
            <p className="balance">Holdings: {totalBalance.toLocaleString()} {currency.symbol}</p>
          </div>
          <p className="unrealized-pnl">
            Unrealized PnL: {unrealizedPnL >= 0 ? '+' : ''}{unrealizedPnL.toLocaleString()} {currency.symbol}
            <span className={`profit-loss ${unrealizedPnL >= 0 ? 'up' : 'down'}`}>
              {unrealizedPnL >= 0 ? '↑' : '↓'} {totalProfitLossPercentage.toFixed(2)}%
            </span>
          </p>
          <div className="crypto-table2">
            <div className="table-layout2 header">
              <p>Coins</p>
              <p className="right-align">Price</p>
              <p className="right-align">Buy Price</p>
              <p className="right-align">Amount</p>
              <p className="right-align">PnL</p>
              <p className="center-align action-header">Action</p>
              <p className="center-align delete-header">Delete</p>
            </div>

            {portfolio.map((item, index) => {
              const currentPrice = currentPrices[item.id]?.usd || 0;
              const buyPrice = item.purchase_price || currentPrice || 0;
              const amount = item.amount || 0;

              const pnl = ((currentPrice - buyPrice) * amount).toFixed(2);
              const roi = buyPrice > 0 ? (((currentPrice - buyPrice) / buyPrice) * 100).toFixed(2) : "N/A";

              return (
                <div key={index} className="table-layout2">
                  <div>
                    <img src={item.image} alt="" />
                    <p>{item.name} - {item.symbol.toUpperCase()}</p>
                  </div>
                  <p className="right-align">{currentPrice.toLocaleString() || "N/A"} {currency.symbol}</p>
                  <p className="right-align">{buyPrice.toLocaleString()} {currency.symbol}</p>
                  <p className="right-align">{amount}</p>
                  <p className={`right-align ${pnl >= 0 ? "green" : "red"}`}>
                    {pnl} {currency.symbol} ({roi}%)
                  </p>
                  <button className="action2-button" onClick={() => openModal(item)}>Open</button>
                  <button className="remove-button" onClick={() => removeFromPortfolio(item.id)}>Delete</button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {isModalOpen && (
        <ActionModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTransaction}
          coin={selectedCoin}
          portfolio={portfolio}
        />
      )}
    </div>
  );
};

export default Portfolio;
