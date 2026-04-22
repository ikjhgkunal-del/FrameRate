import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  
  // We check if a token exists to decide what buttons to show
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token"); // Wipe the VIP wristband
    localStorage.removeItem("user");
    navigate('/login'); // Send them back to login
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">MovieHub</Link>
      </div>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/reels">Reels</Link></li>
        
        {token ? (
          <>
            <li><Link to="/mylist">My List</Link></li>
            <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register" className="signup-link">Sign Up</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};



export default Navbar;