import React, { useEffect, useState } from 'react';
import { FiUsers, FiCalendar, FiTarget, FiMessageSquare, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import './Pages.css';

import { useLeads } from '../context/LeadsContext';

const Leads = () => {
  const { leads, loading, isRefreshing, error, fetchLeads, updateLeadStage } = useLeads();
  const [selectedLead, setSelectedLead] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStage, setFilterStage] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 5;

  const stages = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
  const categories = ['All', 'Student', 'Parent', 'Working Professional'];

  // Filter logic
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.selectedProgram.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'All' || lead.category === filterCategory;
    const matchesStage = filterStage === 'All' || lead.pipelineStage === filterStage;

    return matchesSearch && matchesCategory && matchesStage;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStage]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const stats = [
    { label: 'Total Inquiries', value: leads.length, icon: <FiMessageSquare />, color: '#000' },
    { label: 'Students', value: leads.filter(l => l.category === 'Student').length, icon: <FiUsers />, color: '#2563eb' },
    { label: 'Parents', value: leads.filter(l => l.category === 'Parent').length, icon: <FiUsers />, color: '#7c3aed' },
    { label: 'Today', value: leads.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length, icon: <FiCalendar />, color: '#10b981' },
  ];

  const updateStage = async (id, newStage) => {
    const success = await updateLeadStage(id, newStage);
    if (!success) {
      alert('Error updating stage. Please try again.');
    }
  };





  return (
    <div className="leads-page premium-layout">
      <div className="page-header-premium">
        <div className="header-text">
          <h1>Inquiry Hub</h1>
          <p>Real-time lead intelligence and conversion tracking.</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          >
            <FiTarget /> {showFilters ? 'Hide Filters' : 'Filter & Search'}
          </button>
          <button 
            onClick={fetchLeads} 
            className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
            disabled={isRefreshing}
          >
            {isRefreshing ? <div className="npath-spinner npath-spinner-sm" /> : <FiRefreshCw />} 
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      <div className="stats-grid-premium">
        {loading && leads.length === 0 ? (
          // Skeleton Stats
          [1,2,3,4].map(i => (
            <div key={i} className="stat-card-premium skeleton-pulse" style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="npath-spinner npath-spinner-sm" />
            </div>
          ))
        ) : (
          stats.map((stat, i) => (
            <div key={i} className="stat-card-premium">
              <div className="stat-icon-box" style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-info">
                <span className="stat-label">{stat.label}</span>
                <h2 className="stat-value">{stat.value}</h2>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={`filter-bar-premium sticky-filter-bar ${showFilters ? 'visible' : 'hidden'}`}>
        <div className="search-box-premium">
          <FiTarget className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name, email or program..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="table-filters">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
          <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
            <option value="All">All Stages</option>
            {stages.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="entry-count-badge">
            Found {filteredLeads.length} Inquiries
          </div>
        </div>
      </div>

      <div className="card custom-table-wrapper">
        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Lead Profile</th>
                <th>Program</th>
                <th>Category</th>
                <th>Source</th>
                <th>Stage</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && leads.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="table-loader-localized">
                      <div className="npath-spinner" />
                      <span>Syncing data...</span>
                    </div>
                  </td>
                </tr>
              ) : currentLeads.length > 0 ? (
                currentLeads.map((lead) => (
                  <tr key={lead._id}>
                    <td>
                      <div className="lead-profile-cell">
                        <div className="avatar-minimal">{lead.name.charAt(0)}</div>
                        <div className="profile-details">
                          <span className="lead-name">{lead.name}</span>
                          <span className="lead-email">{lead.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="service-intent">
                        <FiTarget className="intent-icon" />
                        <span>{lead.selectedProgram}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`category-pill ${lead.category.toLowerCase().replace(' ', '-')}`}>
                        {lead.category}
                      </span>
                    </td>
                    <td>
                      <span className="source-badge">{lead.source || 'Website'}</span>
                    </td>
                    <td>
                      <select 
                        className={`pipeline-select ${lead.pipelineStage.toLowerCase()}`}
                        value={lead.pipelineStage}
                        onChange={(e) => updateStage(lead._id, e.target.value)}
                      >
                        {stages.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <div className="date-cell">
                        <span className="date-main">{formatDate(lead.createdAt)}</span>
                        <span className="date-source">via {lead.source || 'Direct'}</span>
                      </div>
                    </td>
                    <td>
                      <button 
                        className="view-btn-minimal" 
                        onClick={() => setSelectedLead(lead)}
                      >
                        <FiExternalLink /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No matching inquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {filteredLeads.length > itemsPerPage && (
          <div className="pagination-wrapper-premium">
            <button 
              className="pagination-btn" 
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`pagination-number-btn ${currentPage === number ? 'active' : ''}`}
                >
                  {number}
                </button>
              ))}
            </div>
            <button 
              className="pagination-btn" 
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {selectedLead && (
        <div className="modal-overlay" onClick={() => setSelectedLead(null)}>
          <div className="modal-content-premium" onClick={e => e.stopPropagation()}>
            <div className="modal-header-premium">
              <div className="header-title">
                <div className="header-avatar">{selectedLead.name.charAt(0)}</div>
                <div>
                  <h2>{selectedLead.name}</h2>
                  <p>{selectedLead.email}</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setSelectedLead(null)}>&times;</button>
            </div>
            <div className="modal-body-premium">
              <div className="detail-section">
                <h4>Contact & Identity</h4>
                <div className="detail-row">
                  <div className="detail-box"><span>Phone</span>{selectedLead.countryCode} {selectedLead.phone}</div>
                  <div className="detail-box"><span>Category</span>{selectedLead.category}</div>
                  {selectedLead.grade && <div className="detail-box"><span>Current Grade</span>{selectedLead.grade}</div>}
                </div>
              </div>
              <div className="detail-section">
                <h4>Academic Intent</h4>
                <div className="detail-row">
                  <div className="detail-box"><span>Desired Program</span>{selectedLead.selectedProgram}</div>
                  <div className="detail-box"><span>Entrance Exam</span>{selectedLead.examType}</div>
                  <div className="detail-box"><span>Status</span>{selectedLead.examStatus}</div>
                </div>
              </div>
              <div className="detail-section">
                <h4>Additional Info</h4>
                <div className="detail-row">
                  <div className="detail-box"><span>Passout Year</span>{selectedLead.passoutYear}</div>
                  <div className="detail-box"><span>Source</span>{selectedLead.source || 'Website'}</div>
                  <div className="detail-box"><span>Inquiry Date</span>{formatDate(selectedLead.createdAt)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
