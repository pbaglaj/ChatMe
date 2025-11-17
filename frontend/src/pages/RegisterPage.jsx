import React, { useState } from 'react';
import api from '../services/api'; // Importujemy skonfigurowanego klienta api

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // Do pokazywania odpowiedzi serwera

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      // Wyślij dane do backendu
      const response = await api.post('/register', { username, password });
      setMessage(response.data.message); // Pokaż wiadomość o sukcesie
    } catch (error) {
      // Pokaż błąd, jeśli rejestracja się nie powiodła
      setMessage(error.response.data.message || 'Wystąpił błąd');
    }
  };

  return (
    <div>
      <h2>Rejestracja</h2>
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
        <button type="submit">Zarejestruj</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default RegisterPage;