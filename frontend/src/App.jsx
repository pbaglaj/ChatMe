import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage'; 
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import ChatPage from './pages/ChatPage/ChatPage';
import MainPage from './pages/MainPage/MainPage';
import RoomsPage from './pages/RoomsPage/RoomsPage';
import SearchUsersPage from './pages/SearchUsersPage/SearchUsersPage';
import Navbar from './components/NavBar/Navbar';
import { AuthProvider } from './context/AuthContext';

function App() {
  const location = useLocation();
  const hideNavbar = ['/'].includes(location.pathname);

  return (
    <AuthProvider>
      {!hideNavbar && <Navbar />}
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<h2>Logout successful.</h2>} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:user_id" element={<ProfilePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:id" element={<ChatPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/users/search" element={<SearchUsersPage />} />
          <Route path="/" element={<MainPage />} />
          <Route path="*" element={<h2>Page not found</h2>} />
        </Routes>
    </AuthProvider>
  );
}

export default App;