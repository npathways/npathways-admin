import React, { useEffect, useState } from 'react';
import { FiUsers, FiCalendar, FiTarget, FiMessageSquare, FiRefreshCw, FiExternalLink, FiPlus, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import './Pages.css';

import { useLeads } from '../context/LeadsContext';

const Leads = () => {
  const { leads, loading, isRefreshing, fetchLeads, updateLeadStage, updateLeadDetails, addLead } = useLeads();
  const [selectedLead, setSelectedLead] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStage, setFilterStage] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 5;

  // Modals state
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '', email: '', phone: '', countryCode: '+91', selectedProgram: '', 
    category: '', grade: '', passoutYear: '', examType: '', examStatus: '', source: 'Manual Entry'
  });

  const stages = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
  const categories = ['All', 'Student', 'Parent', 'Working Professional'];

  // Filter logic
  const filteredLeads = leads.filter(lead => {
    const safeName = lead.name || '';
    const safeEmail = lead.email || '';
    const safeProgram = lead.selectedProgram || '';
    
    const matchesSearch = 
      safeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeProgram.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStage]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const stats = [
    { label: 'Total Inquiries', value: leads.length, icon: <FiMessageSquare />, color: '#000' },
    { label: 'Students', value: leads.filter(l => l.category === 'Student').length, icon: <FiUsers />, color: '#2563eb' },
    { label: 'Parents', value: leads.filter(l => l.category === 'Parent').length, icon: <FiUsers />, color: '#7c3aed' },
    { label: 'Today', value: leads.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length, icon: <FiCalendar />, color: '#10b981' },
  ];

  const updateStage = async (id, newStage) => {
    await updateLeadStage(id, newStage);
  };

  // --- Edit Handlers ---
  const handleEditClick = () => {
    setEditFormData({
      name: selectedLead.name || '',
      email: selectedLead.email || '',
      phone: selectedLead.phone || '',
      countryCode: selectedLead.countryCode || '',
      category: selectedLead.category || '',
      grade: selectedLead.grade || '',
      selectedProgram: selectedLead.selectedProgram || '',
      examType: selectedLead.examType || '',
      examStatus: selectedLead.examStatus || '',
      passoutYear: selectedLead.passoutYear || ''
    });
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    const payload = { ...editFormData };
    ["category", "examType", "examStatus", "grade", "passoutYear", "selectedProgram"].forEach(key => {
      if (payload[key] === "") payload[key] = null;
    });
    
    const success = await updateLeadDetails(selectedLead._id, payload);
    if (success) {
      setSelectedLead({ ...selectedLead, ...payload });
      setIsEditing(false);
    }
  };

  // --- Add Handlers ---
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...addFormData };
    ["category", "examType", "examStatus", "grade", "passoutYear", "selectedProgram"].forEach(key => {
      if (payload[key] === "") payload[key] = null;
    });

    const success = await addLead(payload);
    if (success) {
      setShowAddModal(false);
      setAddFormData({
        name: '', email: '', phone: '', countryCode: '+91', selectedProgram: '', 
        category: '', grade: '', passoutYear: '', examType: '', examStatus: '', source: 'Manual Entry'
      });
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
          [1,2,3,4].map(i => (
            <div key={i} className="stat-card-premium skeleton-pulse" style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="npath-spinner npath-spinner-sm" />
            </div>
          ))
        ) : (
          stats.map((stat, i) => (
            <div key={i} className="stat-card-premium">
              <div className="stat-icon-box" style={{ color: stat.color }}>{stat.icon}</div>
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
          <div className="entry-count-badge">Found {filteredLeads.length} Inquiries</div>
        </div>
      </div>

      <div className="card custom-table-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #f0f0f0', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Latest Inquiries</h3>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <FiPlus /> Add Lead
          </button>
        </div>
        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Lead Profile</th>
                <th>Program/Service</th>
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
                      <div className="npath-spinner" /><span>Syncing data...</span>
                    </div>
                  </td>
                </tr>
              ) : currentLeads.length > 0 ? (
                currentLeads.map((lead) => (
                  <tr key={lead._id}>
                    <td>
                      <div className="lead-profile-cell">
                        <div className="avatar-minimal">{(lead.name || '?').charAt(0)}</div>
                        <div className="profile-details">
                          <span className="lead-name">{lead.name}</span>
                          <span className="lead-email">{lead.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="service-intent">
                        <FiTarget className="intent-icon" />
                        <span>{lead.selectedProgram || 'Unspecified'}</span>
                      </div>
                    </td>
                    <td>
                      {lead.category ? (
                        <span className={`category-pill ${lead.category.toLowerCase().replace(' ', '-')}`}>
                          {lead.category}
                        </span>
                      ) : <span className="category-pill unspecified">Unspecified</span>}
                    </td>
                    <td><span className="source-badge">{lead.source || 'Website'}</span></td>
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
                        onClick={() => { setSelectedLead(lead); setIsEditing(false); }}
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
        
        {filteredLeads.length > itemsPerPage && (
          <div className="pagination-wrapper-premium">
            <button className="pagination-btn" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button key={number} onClick={() => paginate(number)} className={`pagination-number-btn ${currentPage === number ? 'active' : ''}`}>{number}</button>
              ))}
            </div>
            <button className="pagination-btn" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
          </div>
        )}
      </div>

      {/* View / Edit Modal */}
      {selectedLead && (
        <div className="modal-overlay" onClick={() => setSelectedLead(null)}>
          <div className="modal-content-premium" onClick={e => e.stopPropagation()}>
            <div className="modal-header-premium">
              <div className="header-title">
                <div className="header-avatar">{(selectedLead.name || '?').charAt(0)}</div>
                <div>
                  <h2>{selectedLead.name}</h2>
                  <p>{selectedLead.email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {!isEditing && (
                  <button className="refresh-btn" onClick={handleEditClick} style={{ padding: '8px 12px' }}><FiEdit2 /> Edit</button>
                )}
                <button className="close-btn" onClick={() => setSelectedLead(null)}>&times;</button>
              </div>
            </div>
            
            <div className="modal-body-premium">
              <div className="detail-section">
                <h4>Contact & Identity</h4>
                <div className="detail-row">
                  <div className="detail-box">
                    <span className="form-label">Phone</span>
                    {isEditing ? (
                      <div className="premium-input-group">
                        <input type="text" name="countryCode" value={editFormData.countryCode} onChange={handleEditChange} className="premium-input" style={{ width: '80px' }} placeholder="+91" />
                        <input type="text" name="phone" value={editFormData.phone} onChange={handleEditChange} className="premium-input" />
                      </div>
                    ) : `${selectedLead.countryCode || ''} ${selectedLead.phone || ''}`}
                  </div>
                  <div className="detail-box">
                    <span className="form-label">Category</span>
                    {isEditing ? (
                      <select name="category" value={editFormData.category} onChange={handleEditChange} className="premium-input">
                        <option value="">Select Category</option>
                        {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : (selectedLead.category || 'N/A')}
                  </div>
                  {(selectedLead.grade || isEditing) && (
                    <div className="detail-box">
                      <span className="form-label">Current Grade</span>
                      {isEditing ? <input type="text" name="grade" value={editFormData.grade} onChange={handleEditChange} className="premium-input" /> : selectedLead.grade}
                    </div>
                  )}
                </div>
              </div>
              <div className="detail-section">
                <h4>Academic Intent</h4>
                <div className="detail-row">
                  <div className="detail-box">
                    <span className="form-label">Desired Program</span>
                    {isEditing ? <input type="text" name="selectedProgram" value={editFormData.selectedProgram} onChange={handleEditChange} className="premium-input" /> : (selectedLead.selectedProgram || 'N/A')}
                  </div>
                  <div className="detail-box">
                    <span className="form-label">Entrance Exam</span>
                    {isEditing ? (
                      <select name="examType" value={editFormData.examType} onChange={handleEditChange} className="premium-input">
                        <option value="">Select Exam</option>
                        {["CAT", "GMAT", "GRE", "XAT", "NMAT", "SNAP", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : (selectedLead.examType || 'N/A')}
                  </div>
                  <div className="detail-box">
                    <span className="form-label">Status</span>
                    {isEditing ? (
                      <select name="examStatus" value={editFormData.examStatus} onChange={handleEditChange} className="premium-input">
                        <option value="">Select Status</option>
                        {["Applied", "Yet to Apply", "Planning to Apply"].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : (selectedLead.examStatus || 'N/A')}
                  </div>
                </div>
              </div>
              <div className="detail-section">
                <h4>Additional Info</h4>
                <div className="detail-row">
                  <div className="detail-box">
                    <span className="form-label">Passout Year</span>
                    {isEditing ? <input type="text" name="passoutYear" value={editFormData.passoutYear} onChange={handleEditChange} className="premium-input" /> : (selectedLead.passoutYear || 'N/A')}
                  </div>
                  <div className="detail-box"><span className="form-label">Source</span>{selectedLead.source || 'Website'}</div>
                  <div className="detail-box"><span className="form-label">Inquiry Date</span>{formatDate(selectedLead.createdAt)}</div>
                </div>
              </div>
            </div>
            {isEditing && (
              <div className="modal-footer-premium" style={{ padding: '0 2rem 2rem 2rem', marginTop: 0, borderTop: 'none' }}>
                <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSaveEdit}>Save Changes</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content-premium" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header-premium">
              <div className="header-title"><h2>Add New Lead Manually</h2></div>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><FiX size={24} /></button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="modal-body-premium">
              <div className="detail-section">
                <h4>Basic Info</h4>
                <div className="detail-row">
                  <div className="detail-box">
                    <span className="form-label">Name *</span>
                    <input type="text" name="name" value={addFormData.name} onChange={handleAddChange} required className="premium-input" />
                  </div>
                  <div className="detail-box">
                    <span className="form-label">Email *</span>
                    <input type="email" name="email" value={addFormData.email} onChange={handleAddChange} required className="premium-input" />
                  </div>
                </div>
                <div className="detail-row" style={{ marginTop: '16px' }}>
                  <div className="detail-box" style={{ flex: 1 }}>
                    <span className="form-label">Phone *</span>
                    <div className="premium-input-group">
                      <input type="text" name="countryCode" value={addFormData.countryCode} onChange={handleAddChange} className="premium-input" style={{ width: '80px' }} />
                      <input type="text" name="phone" value={addFormData.phone} onChange={handleAddChange} required className="premium-input" />
                    </div>
                  </div>
                  <div className="detail-box" style={{ flex: 1 }}>
                    <span className="form-label">Category</span>
                    <select name="category" value={addFormData.category} onChange={handleAddChange} className="premium-input">
                      <option value="">Select Category</option>
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="detail-section" style={{ marginTop: '24px' }}>
                <h4>Program & Status</h4>
                <div className="detail-row">
                  <div className="detail-box">
                    <span className="form-label">Program / Service</span>
                    <input type="text" name="selectedProgram" value={addFormData.selectedProgram} onChange={handleAddChange} className="premium-input" />
                  </div>
                  <div className="detail-box">
                    <span className="form-label">Entrance Exam</span>
                    <select name="examType" value={addFormData.examType} onChange={handleAddChange} className="premium-input">
                      <option value="">Select Exam</option>
                      {["CAT", "GMAT", "GRE", "XAT", "NMAT", "SNAP", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="detail-box">
                    <span className="form-label">Exam Status</span>
                    <select name="examStatus" value={addFormData.examStatus} onChange={handleAddChange} className="premium-input">
                      <option value="">Select Status</option>
                      {["Applied", "Yet to Apply", "Planning to Apply"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="detail-section" style={{ marginTop: '24px' }}>
                <h4>Additional Info</h4>
                <div className="detail-row">
                  <div className="detail-box">
                    <span className="form-label">Current Grade</span>
                    <input type="text" name="grade" value={addFormData.grade} onChange={handleAddChange} className="premium-input" />
                  </div>
                  <div className="detail-box">
                    <span className="form-label">Passout Year</span>
                    <input type="text" name="passoutYear" value={addFormData.passoutYear} onChange={handleAddChange} className="premium-input" />
                  </div>
                  <div className="detail-box">
                    <span className="form-label">Source</span>
                    <input type="text" name="source" value={addFormData.source} onChange={handleAddChange} className="premium-input" />
                  </div>
                </div>
              </div>

              <div className="modal-footer-premium">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
