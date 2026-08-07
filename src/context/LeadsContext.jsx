import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '../Components/Common/Toast';

const LeadsContext = createContext();

export const LeadsProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  const fetchLeads = async (options = {}) => {
    // Check if we are authenticated before even trying
    if (localStorage.getItem('isAuthenticated') !== 'true') {
      return;
    }

    // Only skip loading if options.silent is explicitly true
    const silent = options === true || options.silent === true;
    
    try {
      if (!silent) {
        if (leads.length === 0) setLoading(true);
        else setIsRefreshing(true);
      }

      const token = localStorage.getItem('adminToken');
      
      // If no token but supposedly authenticated, clear and redirect
      if (!token) {
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
        return;
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787/api';
      
      const response = await fetch(`${baseUrl}/leads`, {
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
      
      // Check if data has actually changed
      const hasChanged = JSON.stringify(data) !== JSON.stringify(leads);
      
      setLeads(data);

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
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const updateLeadStage = async (id, newStage) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787/api';
      
      const response = await fetch(`${baseUrl}/leads/${id}/stage`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pipelineStage: newStage }),
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
        return false;
      }

      if (!response.ok) throw new Error('Update failed');
      
      const data = await response.json();
      // Update local state with the fully updated lead containing audit details (updatedBy, updatedAt)
      setLeads(prev => prev.map(l => l._id === id ? data.lead : l));
      addToast(`Lead stage updated to ${newStage}`, 'success');
      return true;
    } catch (err) {
      addToast('Update failed', 'error');
      console.error('Error updating stage:', err);
      return false;
    }
  };

  const updateLeadDetails = async (id, updateData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787/api';
      
      const response = await fetch(`${baseUrl}/leads/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error('Update failed');
      
      const data = await response.json();
      setLeads(prev => prev.map(l => l._id === id ? data.lead : l));
      addToast('Lead details updated', 'success');
      return true;
    } catch (err) {
      addToast('Update failed', 'error');
      console.error('Error updating lead details:', err);
      return false;
    }
  };

  const addLead = async (leadData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787/api';
      
      const response = await fetch(`${baseUrl}/leads`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(leadData),
      });

      if (!response.ok) throw new Error('Add failed');
      
      const data = await response.json();
      setLeads(prev => [data.lead, ...prev]);
      addToast('Lead created successfully', 'success');
      return true;
    } catch (err) {
      addToast('Failed to create lead', 'error');
      console.error('Error creating lead:', err);
      return false;
    }
  };

  const addLeadsBulk = async (leadsData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787/api';
      
      const response = await fetch(`${baseUrl}/leads/bulk`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(leadsData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Bulk upload failed');
      }

      if (data.inserted && data.inserted.length > 0) {
        setLeads(prev => [...data.inserted, ...prev]);
      }
      return data;
    } catch (err) {
      console.error('Error in bulk import:', err);
      addToast(err.message || 'Bulk upload failed', 'error');
      return { successCount: 0, failCount: leadsData.length, errors: [{ message: err.message }] };
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <LeadsContext.Provider value={{ 
      leads, 
      loading, 
      isRefreshing, 
      error, 
      fetchLeads, 
      updateLeadStage,
      updateLeadDetails,
      addLead,
      addLeadsBulk
    }}>
      {children}
    </LeadsContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadsProvider');
  }
  return context;
};
