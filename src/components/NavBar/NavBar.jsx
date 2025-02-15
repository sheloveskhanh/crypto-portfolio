import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from "../../pages/firebaseConfig"; 
import { signOut, onAuthStateChanged } from 'firebase/auth';
import './NavBar.css';
import logo3 from '../../assets/logo3.png';
import { CoinContext } from '../../context/CoinContext';

const NavBar = ({ portfolio }) => {
  const { setCurrency } = useContext(CoinContext);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); 
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate('/login'); 
  };

  const currencyHandler = (event) => {
    switch (event.target.value) {
      case 'usd': setCurrency({ name: 'usd', symbol: '$' }); break;
      case 'eur': setCurrency({ name: 'eur', symbol: '€' }); break;
      case 'czk': setCurrency({ name: 'czk', symbol: 'Kč' }); break;
      default: setCurrency({ name: 'usd', symbol: '$' }); break;
    }
  };

  return (
    <div className="navbar">
      <Link to={'/'}>
        <div className="logo-container">
          <img src={logo3} alt="" className="logo" />
          <div className="text-container">
            <span className="logo-text">Crypto Portfolio</span>
          </div>
        </div>
      </Link>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/services">Services</Link></li>
        {user && <li><Link to="/portfolio">My portfolio</Link></li>}
      </ul>
      <div className="nav-right">
        <select onChange={currencyHandler}>
          <option value="usd">USD</option>
          <option value="eur">EUR</option>
          <option value="czk">CZK</option>
        </select>

        {user ? (
          <div className="auth-info">
            <span className="user-email">{user.email}</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        ) : (
          <>
            <Link to="/register"><button className="register">Register</button></Link>
            <Link to="/login" className="login-button">Login</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default NavBar;