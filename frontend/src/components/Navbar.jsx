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
            <Link onClick={logout} to="/login">Logout</Link>
            <Link to={`/profile/${user?.user_id}`}>Your Profile</Link>
            <Link to="/chat">Chat</Link>
          </>
        ) : (
          <>
            <Link to ="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;