import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">ChatMe</div>
      <div className="navbar-links">
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