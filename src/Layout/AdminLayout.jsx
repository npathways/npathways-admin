import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './Layout.css';

const AdminLayout = () => {
  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-body">
        <Navbar />
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
