import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './MainPage.css';
function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await api.post('/login', { username, password });
      
      setMessage('Login successful! Redirecting...');
      
      setTimeout(() => {
        login(response.data.token);
      }, 1000); 

    } catch (error) {
      setMessage(error.response?.data?.message || 'An error occurred during login.');
    }
  };

  return (
    <div className='main-page-container'>
      <div>
        <h2 style={{ fontSize: 48 }}>Welcome to <span style={{ fontSize: 64, color: '#007bff' }}>ChatMe</span></h2>
        <p style={{ fontSize: 24 }}>Connect with friends and the world around you.</p>
        <p style={{ fontSize: 12, color: 'gray' }}>Please log in to continue.</p>
      </div>
      <div className='form-container'>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className='visually-hidden'>Username:</label>
            <input 
              type="text" 
              value={username} 
              placeholder='Username'
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className='visually-hidden'>Password:</label>
            <input 
              type="password" 
              value={password}
              placeholder='Password' 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
        <button type="submit" className="main-page-button">Log In</button>
        </form>
        {message && <p>{message}</p>}
        <p><small>Don't have an account? <a href="/register">Register here</a></small></p>
      </div>
    </div>
  );
}

export default LoginPage;