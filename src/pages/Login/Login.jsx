import React, { useState } from "react";
import { auth } from "../../pages/firebaseConfig";  
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false); // NEW STATE
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (setUser) {
        setUser(userCredential.user);
      } else {
        console.error("setUser is undefined!");
      }
      navigate("/portfolio");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Password reset email sent! Check your inbox.");
      setError(""); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (

    <div className="login-page">
    <div className="auth-container">
      <h2>{forgotPasswordMode ? "Reset Password" : "Login"}</h2>
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      {!forgotPasswordMode ? (
    
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="show-password-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit">Login</button>
        </form>
      ) : (

          <form onSubmit={handleForgotPassword}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Reset Email</button>
        </form>
      )}

      {!forgotPasswordMode ? (
        <button className="forgot-password" onClick={() => setForgotPasswordMode(true)}>
          Forgot Password?
        </button>
      ) : (
        <button className="forgot-password back-to-login" onClick={() => setForgotPasswordMode(false)}>
          Back to Login
        </button>
      )}

      <p>
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
    </div>

  );
};

export default Login;
