import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import MainPage from './pages/MainPage';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<h2>Logout successful.</h2>} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:user_id" element={<ProfilePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:id" element={<ChatPage />} />
          <Route path="/" element={<MainPage />} />
          <Route path="*" element={<h2>Page not found</h2>} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;