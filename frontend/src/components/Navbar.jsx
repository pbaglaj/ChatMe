import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <nav style={{ padding: '10px', background: '#eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: 24, color: '#007bff' }}><strong>ChatMe</strong></div>
      <div style={{ display: 'flex', gap: 12 }}>
        {isLoggedIn ? (
          <>
            <Link onClick={logout} to="/login">Wyloguj</Link>
            <Link to={`/profile/${user?.user_id}`}>Twój Profil</Link>
            <Link to="/chat">Czat</Link>
          </>
        ) : (
          <>
            <Link to ="/register">Rejestracja</Link>
            <Link to="/login">Logowanie</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;