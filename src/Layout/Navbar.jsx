import { Bell, Search, User, Menu } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  
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
            <span className="user-name">{user.name || 'Admin'}</span>
            <span className="user-role">{user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Administrator'}</span>
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
