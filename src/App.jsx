import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './Layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';
import CreateLead from './pages/CreateLead';
import Users from './pages/Users';
import UserDocuments from './pages/UserDocuments';
import AdminManagement from './pages/AdminManagement';
import Login from './pages/Login';
import './App.css';

import { LeadsProvider } from './context/LeadsContext';

import { ToastProvider } from './Components/Common/Toast';

// Mock Protected Route Component
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const hasToken = !!localStorage.getItem('adminToken');
  return (isAuthenticated && hasToken) ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <LeadsProvider>
          <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="leads/new" element={<CreateLead />} />
            <Route path="leads/:id" element={<LeadDetail />} />
            <Route path="users" element={<Users />} />
            <Route path="documents" element={<UserDocuments />} />
            <Route path="admins" element={<AdminManagement />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          </Routes>
        </LeadsProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
