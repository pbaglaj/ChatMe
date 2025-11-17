import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage'; // Strona do testowania JWT

// Prosty komponent nawigacyjny
function Navbar() {
  return (
    <nav style={{ padding: '10px', background: '#eee' }}>
      <Link to="/register" style={{ margin: '0 10px' }}>Rejestracja</Link>
      <Link to="/login" style={{ margin: '0 10px' }}>Logowanie</Link>
      <Link to="/profile" style={{ margin: '0 10px' }}>Profil (Test JWT)</Link>
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