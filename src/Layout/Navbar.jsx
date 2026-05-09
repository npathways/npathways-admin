import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="navbar glass">
      <div className="search-bar">
        <Search size={18} />
        <input type="text" placeholder="Search for leads, users, or content..." />
      </div>

      <div className="navbar-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">Deepak</span>
            <span className="user-role">Administrator</span>
          </div>
          <div className="avatar">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
