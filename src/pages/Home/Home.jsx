import React, { useContext, useEffect, useState } from 'react';
import './Home.css';
import { CoinContext } from '../../context/CoinContext';
import { Link } from 'react-router-dom';

const Home = ({ setPortfolio, portfolio }) => {
  const { allCoin, currency } = useContext(CoinContext);
  const [displayCoin, setDisplayCoin] = useState([]);
  const [input, setInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState('add');
  const [notificationVisible, setNotificationVisible] = useState(false);
  const coinsPerPage = 20;
  const totalPages = Math.ceil(displayCoin.length / coinsPerPage);

  useEffect(() => {
    const savedPortfolio = localStorage.getItem('portfolio');
    if (savedPortfolio) {
      try {
        setPortfolio(JSON.parse(savedPortfolio));
      } catch (error) {
        console.error("Error loading portfolio:", error);
        setPortfolio([]);
      }
    }
  }, [setPortfolio]); 

  useEffect(() => {
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
  }, [portfolio]); 

  useEffect(() => {
    if (!input) {
      setDisplayCoin(allCoin);
    }
  }, [allCoin, input]);

  const inputHandler = (event) => {
    const value = event.target.value.toLowerCase();
    setInput(value);
    setDisplayCoin(allCoin.filter(coin => coin.name.toLowerCase().includes(value)));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && currentCoins.length > 0) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const addToPortfolio = (coin) => {
    let updatedPortfolio = [];
    const isCoinInPortfolio = portfolio.some((c) => c.id === coin.id);

    if (isCoinInPortfolio) {
      updatedPortfolio = portfolio.filter((c) => c.id !== coin.id);
      setNotification(`${coin.name} has been removed from your portfolio.`);
      setNotificationType('remove');
    } else {
      updatedPortfolio = [...portfolio, coin];
      setNotification(`${coin.name} has been added to your portfolio.`);
      setNotificationType('add');
    }

    setPortfolio(updatedPortfolio);

    setNotificationVisible(true);

    setTimeout(() => {
      setNotificationVisible(false);
    }, 3000);
  };

  const startIndex = (currentPage - 1) * coinsPerPage;
  const currentCoins = displayCoin.slice(startIndex, startIndex + coinsPerPage);

  return (
    <div className='home'>
      <div className='hero'>
        <h1>Crypto Marketplace</h1>
        <p>Welcome to the world's largest cryptocurrency marketplace.<br />
          Click on the coin's symbol for more details</p>
        <input onChange={inputHandler} list='coinlist' value={input} type="text" placeholder="Search crypto.." required />
        <datalist id='coinlist'>
          {allCoin.slice(0, 50).map((item, index) => (<option key={index} value={item.name} />))}
        </datalist>
      </div>

      {notification && (
        <div className={`notification ${notificationType} ${notificationVisible ? 'show' : 'hidden'}`} aria-live="polite">
          {notification}
        </div>
      )}

      <div className="crypto-table">
        <div className="table-layout">
          <p>#</p>
          <p>Coins</p>
          <p>Price</p>
          <p style={{ textAlign: 'center' }}>24H Change</p>
          <p>Market Cap</p>
          <p className='p'>Add to portfolio</p>
        </div>

        {currentCoins.map((item, index) => (
          <div key={index} className="table-layout">
            <p>{item.market_cap_rank}</p>
            <div>
              <img src={item.image} alt="" />
              <Link to={`/coin/${item.id}`}>
                <p>{item.name + " - " + item.symbol}</p>
              </Link>
            </div>
            <p>{item.current_price.toLocaleString()} {currency.symbol}</p>
            <p className={item.price_change_percentage_24h > 0 ? "green" : "red"}>
              {Math.floor(item.price_change_percentage_24h * 100) / 100}%
            </p>
            <p>{item.market_cap.toLocaleString()} {currency.symbol}</p>
            <button onClick={(e) => { e.preventDefault(); addToPortfolio(item); }}>
              <i className={`fas fa-star ${portfolio.some(coin => coin.id === item.id) ? 'added' : 'not-added'}`}></i>
            </button>
          </div>
        ))}

        <div className="pagination-buttons">
          <button className="pagination-button" onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</button>
          <button className="pagination-button" onClick={handleNextPage} disabled={currentPage === totalPages || currentCoins.length === 0}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
