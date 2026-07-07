import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '../Components/Common/Toast';

const QuickEnquiriesContext = createContext();

export const QuickEnquiriesProvider = ({ children }) => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  const fetchEnquiries = async (options = {}) => {
    if (localStorage.getItem('isAuthenticated') !== 'true') return;
    const silent = options === true || options.silent === true;
    
    try {
      if (!silent) {
        if (enquiries.length === 0) setLoading(true);
        else setIsRefreshing(true);
      }

      const token = localStorage.getItem('adminToken');
      if (!token) {
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
        return;
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787/api';
      
      const response = await fetch(`${baseUrl}/quick-enquiries`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('isAuthenticated');
        addToast('Session expired. Please login again.', 'error');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) throw new Error('Server responded with an error');
      
      const data = await response.json();
      const hasChanged = JSON.stringify(data) !== JSON.stringify(enquiries);
      setEnquiries(data);

      if (!silent) {
        if (hasChanged) {
          addToast('Data updated successfully', 'success');
        } else {
          addToast('Data is already up to date', 'info');
        }
      }
    } catch (err) {
      setError(err.message);
      const isConnectionError = err.message.includes('fetch') || err.message.includes('NetworkError');
      addToast(isConnectionError ? 'Lost connection to backend' : 'Failed to sync data from DB', 'error');
      console.error('Error fetching quick enquiries:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const updateEnquiryStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787/api';
      
      const response = await fetch(`${baseUrl}/quick-enquiries/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
        return false;
      }

      if (!response.ok) throw new Error('Update failed');
      
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
      addToast(`Status updated to ${newStatus}`, 'success');
      return true;
    } catch (err) {
      addToast('Update failed', 'error');
      console.error('Error updating status:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  return (
    <QuickEnquiriesContext.Provider value={{ 
      enquiries, 
      loading, 
      isRefreshing, 
      error, 
      fetchEnquiries, 
      updateEnquiryStatus 
    }}>
      {children}
    </QuickEnquiriesContext.Provider>
  );
};

export const useQuickEnquiries = () => {
  const context = useContext(QuickEnquiriesContext);
  if (!context) {
    throw new Error('useQuickEnquiries must be used within a QuickEnquiriesProvider');
  }
  return context;
};
