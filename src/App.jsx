import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './Layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Content from './pages/Content';
import Leads from './pages/Leads';
import Login from './pages/Login';
import './App.css';

// Mock Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="content" element={<Content />} />
          <Route path="leads" element={<Leads />} />
          <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
