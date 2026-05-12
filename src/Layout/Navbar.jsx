import { Bell, Search, User, Menu } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  return (
    <header className="navbar glass">
      <div className="navbar-left">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <div className="navbar-left-spacer"></div>
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
