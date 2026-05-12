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
    // Only skip loading if options.silent is explicitly true
    const silent = options === true || options.silent === true;
    
    try {
      if (!silent) {
        if (leads.length === 0) setLoading(true);
        else setIsRefreshing(true);
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/leads`);
      if (!response.ok) throw new Error('Server responded with an error');
      
      const data = await response.json();
      console.log('DEBUG: Leads data fetched:', data);
      
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
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/leads/${id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineStage: newStage }),
      });
      if (!response.ok) throw new Error('Update failed');
      
      // Update local state
      setLeads(prev => prev.map(l => l._id === id ? { ...l, pipelineStage: newStage } : l));
      addToast(`Lead stage updated to ${newStage}`, 'success');
      return true;
    } catch (err) {
      addToast('Update failed', 'error');
      console.error('Error updating stage:', err);
      return false;
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
      updateLeadStage 
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
