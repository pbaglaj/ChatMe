import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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
      
      setMessage('Zalogowano pomyślnie! Przekierowuję...');
      
      setTimeout(() => {
        login(response.data.token);
      }, 1000); 

    } catch (error) {
      setMessage(error.response?.data?.message || 'Wystąpił błąd');
    }
  };

  return (
    <div>
      <h2>Logowanie</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Użytkownik:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>
        <div>
          <label>Hasło:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <button type="submit">Zaloguj</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default LoginPage;