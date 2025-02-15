import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { auth } from './pages/firebaseConfig';  
import { onAuthStateChanged } from "firebase/auth"; 
import NavBar from './components/navBar/NavBar';
import Home from './pages/Home/Home';
import Coin from './pages/Coin/Coin';
import Portfolio from './pages/Portfolio/Portfolio';
import Register from './pages/Register/Register';
import Login from './pages/LogIn/LogIn';

const App = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);  
    });

    return () => unsubscribe(); 
  }, []);

  return (
    <div className='app'>
      <NavBar user={user} setUser={setUser} portfolio={portfolio} />
      <Routes>
        <Route path='/' element={<Home setPortfolio={setPortfolio} portfolio={portfolio} />} />
        <Route path='/coin/:coinId' element={<Coin />} />
        <Route path='/portfolio' element={<Portfolio user={user} portfolio={portfolio} setPortfolio={setPortfolio} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
      </Routes>
    </div>
  );
};

export default App;
