import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Send, 
  Settings,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Inquiry Hub', icon: <Send size={20} />, path: '/leads' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>NPATHWAYS</h2>
        <span>ADMIN PANEL</span>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path}
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
