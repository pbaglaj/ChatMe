import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

function Navbar() {
  return (
    <nav style={{ padding: '10px', background: '#eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: 24, color: '#007bff' }}><strong>ChatMe</strong></div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Link to="/register">Rejestracja</Link>
        <Link to="/login">Logowanie</Link>
        <Link to="/profile">Profil (Test JWT)</Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/" element={<h2>Witaj! Wybierz opcję z menu.</h2>} />
        </Routes>
      </div>
    </>
  );
}

export default App;