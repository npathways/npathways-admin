import React, { useEffect, useState } from 'react';
import { FiUsers, FiCalendar, FiTarget, FiMessageSquare, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import './Pages.css';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/leads');
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data = await response.json();
      setLeads(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
    try {
      const response = await fetch(`http://localhost:5000/api/leads/${id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineStage: newStage }),
      });
      if (!response.ok) throw new Error('Update failed');
      
      // Update local state
      setLeads(leads.map(l => l._id === id ? { ...l, pipelineStage: newStage } : l));
    } catch (err) {
      alert('Error updating stage: ' + err.message);
    }
  };

  const stages = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

  if (loading) return (
    <div className="loading-state">
      <FiRefreshCw className="spin" />
      <p>Syncing global inquiries...</p>
    </div>
  );

  return (
    <div className="leads-page premium-layout">
      <div className="page-header-premium">
        <div className="header-text">
          <h1>Inquiry Hub</h1>
          <p>Real-time lead intelligence and conversion tracking.</p>
        </div>
        <button onClick={fetchLeads} className="refresh-btn">
          <FiRefreshCw /> Refresh Data
        </button>
      </div>

      <div className="stats-grid-premium">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card-premium">
            <div className="stat-icon-box" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <h2 className="stat-value">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="card custom-table-wrapper">
        <div className="table-header-minimal">
          <h3>Recent Global Leads</h3>
          <div className="table-actions">
            <span>Showing {leads.length} entries</span>
          </div>
        </div>
        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Service Intent</th>
                <th>Category</th>
                <th>Source</th>
                <th>Pipeline Stage</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
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
              ))}
            </tbody>
          </table>
        </div>
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
