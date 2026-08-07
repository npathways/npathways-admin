import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiSave, FiX, FiUser, FiMail, FiPhone, FiTarget, FiLayers, FiCalendar, FiFileText } from 'react-icons/fi';
import { useLeads } from '../context/LeadsContext';
import { useToast } from '../Components/Common/Toast';
import './Pages.css';

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, loading, fetchLeads, updateLeadStage, updateLeadDetails } = useLeads();
  
  const { addToast } = useToast();
  const [lead, setLead] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Follow-ups timeline state
  const [followups, setFollowups] = useState([]);
  const [newFollowupText, setNewFollowupText] = useState('');

  // Metadata Layout Mode: 'grouped' (Static vs Dynamic cards) or 'list' (single combined timeline list)
  const [metadataLayout, setMetadataLayout] = useState('grouped');

  // Creative date formatting helper e.g. "07 August 2026 at 03:42 pm"
  const formatDateCreative = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      
      const day = d.getDate().toString().padStart(2, '0');
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const month = monthNames[d.getMonth()];
      const year = d.getFullYear();
      
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const strTime = hours.toString().padStart(2, '0') + ':' + minutes + ' ' + ampm;
      
      return `${day} ${month} ${year} at ${strTime}`;
    } catch (e) {
      return dateStr;
    }
  };

  const fetchFollowups = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';
      const response = await fetch(`${baseUrl}/leads/${id}/followups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFollowups(data);
      }
    } catch (error) {
      console.error("Error fetching followups:", error);
    }
  };

  const handleAddFollowup = async (e) => {
    e.preventDefault();
    if (!newFollowupText.trim()) return;

    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';
      const response = await fetch(`${baseUrl}/leads/${id}/followups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ note: newFollowupText })
      });
      if (response.ok) {
        const data = await response.json();
        setFollowups(prev => [data, ...prev]);
        setNewFollowupText('');
        addToast('Follow-up logged successfully', 'success');
      } else {
        addToast('Failed to log follow-up', 'error');
      }
    } catch (error) {
      console.error("Error adding followup:", error);
      addToast('Error logging follow-up', 'error');
    }
  };

  useEffect(() => {
    if (leads.length === 0 && !loading) {
      fetchLeads();
    }
  }, [leads.length, loading, fetchLeads]);

  useEffect(() => {
    const foundLead = leads.find(l => l._id === id || l.id === id);
    if (foundLead) {
      setLead(foundLead);
      fetchFollowups(); // fetch timeline follow-ups when lead loads
    }
  }, [id, leads]);

  const handleEditClick = () => {
    setEditFormData({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      countryCode: lead.countryCode || '+91',
      category: lead.category || '',
      selectedProgram: lead.selectedProgram || '',
      examType: lead.examType || '',
      examStatus: lead.examStatus || '',
      grade: lead.grade || '',
      passoutYear: lead.passoutYear || '',
      remarks: lead.remarks || ''
    });
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    const payload = { ...editFormData };
    ["category", "examType", "examStatus", "grade", "passoutYear", "selectedProgram", "remarks"].forEach(key => {
      if (payload[key] === "") payload[key] = null;
    });

    const success = await updateLeadDetails(id, payload);
    if (success) {
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleStageChange = async (newStage) => {
    await updateLeadStage(id, newStage);
  };

  if (loading && !lead) {
    return (
      <div className="leads-page premium-layout" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div className="npath-spinner" style={{ width: '40px', height: '40px' }} />
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading traveler profile...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="leads-page premium-layout">
        <button onClick={() => navigate('/leads')} className="refresh-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', marginBottom: '2rem' }}>
          <FiArrowLeft /> Back to Inquiry Hub
        </button>
        <div className="card text-center" style={{ padding: '3rem', color: '#94a3b8' }}>
          <h3>Lead profile not found</h3>
          <p>The requested inquiry profile does not exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  const stages = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
  const categories = ['Student', 'Parent', 'Working Professional', 'Just Looking Around'];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="leads-page premium-layout">
      {/* Top Navigation & Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: '#fff', padding: '1.25rem 1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <button onClick={() => navigate('/leads')} className="refresh-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
          <FiArrowLeft /> Back to Inquiry Hub
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
          {!isEditing ? (
            <button className="btn-primary" onClick={handleEditClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px' }}>
              <FiEdit2 /> Edit Profile
            </button>
          ) : (
            <>
              <button className="btn-cancel" onClick={() => setIsEditing(false)} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px' }}>
                <FiX /> Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveEdit} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px' }}>
                <FiSave /> {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Side: General Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '2rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="avatar-minimal" style={{ width: '64px', height: '64px', fontSize: '1.75rem', borderRadius: '12px' }}>
                {(lead.name || '?').charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>{lead.name}</h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
                  Inquiry ID: <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{lead._id || lead.id}</code>
                </p>
              </div>
            </div>

            {/* Form Panels split into bold headings */}
            <div className="modal-body-premium" style={{ padding: 0 }}>
              
              {/* Bold Section 1: Personal Information */}
              <div className="detail-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', borderBottom: '2px solid var(--color-brand-primary, #0f172a)', paddingBottom: '0.75rem', width: 'fit-content' }}>
                  <FiUser /> 1. Personal Information
                </h3>
                
                <div className="detail-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="detail-box">
                    <span className="form-label" style={{ fontWeight: '700', color: '#334155' }}>Full Name</span>
                    {isEditing ? (
                      <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} className="premium-input" />
                    ) : (
                      <span style={{ fontWeight: '500' }}>{lead.name}</span>
                    )}
                  </div>
                  
                  <div className="detail-box">
                    <span className="form-label" style={{ fontWeight: '700', color: '#334155' }}>Occupation / Category</span>
                    {isEditing ? (
                      <select name="category" value={editFormData.category} onChange={handleEditChange} className="premium-input">
                        <option value="">Select Occupation</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : (
                      <span className={`category-pill ${lead.category?.toLowerCase().replace(' ', '-') || 'unspecified'}`}>
                        {lead.category || 'Unspecified'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="detail-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                  <div className="detail-box">
                    <span className="form-label" style={{ fontWeight: '700', color: '#334155' }}><FiMail size={14} style={{ marginRight: '4px' }} /> Email Address</span>
                    {isEditing ? (
                      <input type="email" name="email" value={editFormData.email} onChange={handleEditChange} className="premium-input" />
                    ) : (
                      <span>{lead.email}</span>
                    )}
                  </div>

                  <div className="detail-box">
                    <span className="form-label" style={{ fontWeight: '700', color: '#334155' }}><FiPhone size={14} style={{ marginRight: '4px' }} /> Phone Number</span>
                    {isEditing ? (
                      <div className="premium-input-group">
                        <input type="text" name="countryCode" value={editFormData.countryCode} onChange={handleEditChange} className="premium-input" style={{ width: '80px' }} />
                        <input type="text" name="phone" value={editFormData.phone} onChange={handleEditChange} className="premium-input" style={{ flex: 1 }} />
                      </div>
                    ) : (
                      <span>{lead.countryCode || ''} {lead.phone}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bold Section 2: Program & Intent */}
              <div className="detail-section" style={{ borderBottom: 'none', paddingBottom: 0, marginTop: '2.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', borderBottom: '2px solid var(--color-brand-primary, #0f172a)', paddingBottom: '0.75rem', width: 'fit-content' }}>
                  <FiTarget /> 2. Program Intent
                </h3>
                
                <div className="detail-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="detail-box">
                    <span className="form-label" style={{ fontWeight: '700', color: '#334155' }}>Chosen Service / Program</span>
                    {isEditing ? (
                      <input type="text" name="selectedProgram" value={editFormData.selectedProgram} onChange={handleEditChange} className="premium-input" />
                    ) : (
                      <span style={{ fontWeight: '500', color: '#1e293b' }}>{lead.selectedProgram || 'Unspecified'}</span>
                    )}
                  </div>
                  
                  <div className="detail-box">
                    <span className="form-label" style={{ fontWeight: '700', color: '#334155' }}>Passout / Graduation Year</span>
                    {isEditing ? (
                      <input type="text" name="passoutYear" value={editFormData.passoutYear} onChange={handleEditChange} className="premium-input" />
                    ) : (
                      <span>{lead.passoutYear || 'N/A'}</span>
                    )}
                  </div>
                </div>

                <div className="detail-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                  <div className="detail-box">
                    <span className="form-label" style={{ fontWeight: '700', color: '#334155' }}>Academic Grade</span>
                    {isEditing ? (
                      <input type="text" name="grade" value={editFormData.grade} onChange={handleEditChange} className="premium-input" />
                    ) : (
                      <span>{lead.grade || 'N/A'}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Message Panel */}
          {lead.message && (
            <div className="card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '2px solid var(--color-brand-primary, #0f172a)', paddingBottom: '0.75rem', width: 'fit-content' }}>
                <FiFileText /> 3. Custom Message / User Query
              </h3>
              <div style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                color: '#334155',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                minHeight: '100px'
              }}>
                {lead.message}
              </div>
            </div>
          )}

          {/* Legacy Remarks (if exists or is editing) */}
          {(lead.remarks || isEditing) && (
            <div className="card" style={{ padding: '2rem', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '2px solid var(--color-brand-primary, #0f172a)', paddingBottom: '0.75rem', width: 'fit-content' }}>
                Legacy Remarks & Progress Notes
              </h3>
              {isEditing ? (
                <textarea
                  name="remarks"
                  value={editFormData.remarks}
                  onChange={handleEditChange}
                  placeholder="Update legacy remarks notes..."
                  className="premium-input"
                  style={{ height: '100px', resize: 'vertical', width: '100%', padding: '12px' }}
                />
              ) : (
                <div style={{
                  padding: '1.25rem 1.5rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  color: '#334155',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  minHeight: '80px'
                }}>
                  {lead.remarks}
                </div>
              )}
            </div>
          )}

          {/* Follow-up History Timeline Card */}
          <div className="card" style={{ padding: '2rem', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.5rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '2px solid var(--color-brand-primary, #0f172a)', paddingBottom: '0.75rem', width: 'fit-content' }}>
              Timeline of Follow-ups
            </h3>

            {/* Add New Followup Log (Form) */}
            <form onSubmit={handleAddFollowup} style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span className="form-label" style={{ fontWeight: '800', color: '#334155', fontSize: '0.85rem' }}>Log New Follow-up Event</span>
              <textarea
                value={newFollowupText}
                onChange={(e) => setNewFollowupText(e.target.value)}
                placeholder="Write summary of call, discussion details, next follow-up dates..."
                className="premium-input"
                style={{ height: '80px', resize: 'vertical', width: '100%', padding: '10px', fontSize: '0.95rem' }}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem', borderRadius: '6px' }}>
                  Log Follow-up
                </button>
              </div>
            </form>

            {/* Timeline List */}
            {followups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b', fontSize: '0.95rem' }}>
                No follow-ups recorded yet. Use the form above to log the first discussion.
              </div>
            ) : (
              <div 
                style={{ 
                  maxHeight: '420px', 
                  overflowY: 'auto', 
                  paddingRight: '12px',
                  paddingTop: '6px',
                  paddingBottom: '6px'
                }} 
                className="timeline-container"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '24px', borderLeft: '2px solid #cbd5e1', marginLeft: '10px' }}>
                  {followups.map((f, index) => (
                    <div key={f.id} style={{ position: 'relative' }}>
                      {/* Circle Dot Indicator */}
                      <div style={{
                        position: 'absolute',
                        left: '-31px',
                        top: '4px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: '#0f172a',
                        border: '2.5px solid #fff',
                        boxShadow: '0 0 0 2px #cbd5e1'
                      }} />
                      
                      {/* Content Box */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                            Stage: <strong style={{ color: '#0f172a' }}>{f.stage}</strong>
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {new Date(f.createdAt).toLocaleString('en-IN', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.95rem', color: '#334155', background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #f1f5f9', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                          {f.note}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'right' }}>
                          Logged by: <strong>{f.createdBy}</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Dual Save Action Controls (renders only during edit mode) */}
          {isEditing && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', background: '#fff', padding: '1.5rem 2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <button className="btn-cancel" onClick={() => setIsEditing(false)} disabled={isSaving} style={{ padding: '12px 24px', borderRadius: '8px' }}>
                <FiX /> Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveEdit} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 30px', fontSize: '1rem', fontWeight: '700' }}>
                <FiSave /> {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Lead Metadata & Actions Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Status Control Card */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
              <FiLayers style={{ marginRight: '6px' }} /> Pipeline Status
            </h4>

            {/* Premium Radial Progress Gauge Chart */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem 0 1.5rem 0' }}>
              <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background Track Circle */}
                  <circle
                    cx="65"
                    cy="65"
                    r="52"
                    fill="transparent"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                  />
                  {/* Active Indicator Glow Circle */}
                  <circle
                    cx="65"
                    cy="65"
                    r="52"
                    fill="transparent"
                    stroke={
                      lead.pipelineStage === 'New' ? '#3b82f6' :
                      lead.pipelineStage === 'Contacted' ? '#f59e0b' :
                      lead.pipelineStage === 'Qualified' ? '#6366f1' :
                      lead.pipelineStage === 'Converted' ? '#10b981' : '#ef4444'
                    }
                    strokeWidth="8"
                    strokeDasharray="326.7"
                    strokeDashoffset={
                      lead.pipelineStage === 'New' ? 326.7 * (1 - 0.25) :
                      lead.pipelineStage === 'Contacted' ? 326.7 * (1 - 0.50) :
                      lead.pipelineStage === 'Qualified' ? 326.7 * (1 - 0.75) : 0
                    }
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                </svg>

                {/* Inner Center Label Text */}
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '10px' }}>
                  <span style={{
                    fontSize: '1.25rem',
                    fontWeight: '800',
                    color: '#0f172a',
                    lineHeight: '1.1'
                  }}>
                    {
                      lead.pipelineStage === 'New' ? '25%' :
                      lead.pipelineStage === 'Contacted' ? '50%' :
                      lead.pipelineStage === 'Qualified' ? '75%' : '100%'
                    }
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginTop: '4px',
                    color: 
                      lead.pipelineStage === 'New' ? '#3b82f6' :
                      lead.pipelineStage === 'Contacted' ? '#f59e0b' :
                      lead.pipelineStage === 'Qualified' ? '#6366f1' :
                      lead.pipelineStage === 'Converted' ? '#10b981' : '#ef4444',
                  }}>
                    {
                      lead.pipelineStage === 'New' ? 'Captured' :
                      lead.pipelineStage === 'Contacted' ? 'Engaged' :
                      lead.pipelineStage === 'Qualified' ? 'Matched' :
                      lead.pipelineStage === 'Converted' ? 'Success' : 'Closed'
                    }
                  </span>
                </div>
              </div>

              {/* Dynamic Explanatory Description Tag */}
              <div style={{
                marginTop: '1.25rem',
                textAlign: 'center',
                padding: '8px 12px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.8rem',
                color: '#64748b',
                lineHeight: '1.4',
                maxWidth: '220px'
              }}>
                {
                  lead.pipelineStage === 'New' ? 'Inquiry registered. Awaiting manual counselor outreach.' :
                  lead.pipelineStage === 'Contacted' ? 'Initial traveler phone or email engagement active.' :
                  lead.pipelineStage === 'Qualified' ? 'Academic qualification and interest match verified.' :
                  lead.pipelineStage === 'Converted' ? 'Application processed, and traveler enrollment complete!' :
                  'Lead marked inactive. Lost opportunity context.'
                }
              </div>
            </div>
            
            <div className="detail-box" style={{ marginBottom: '1.25rem' }}>
              <span className="form-label" style={{ fontWeight: '700', color: '#334155' }}>Current Stage</span>
              <select
                className={`pipeline-select ${lead.pipelineStage.toLowerCase()}`}
                value={lead.pipelineStage}
                onChange={(e) => handleStageChange(e.target.value)}
                style={{ width: '100%', height: '40px', padding: '0 10px', fontSize: '0.95rem', borderRadius: '6px' }}
              >
                {stages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Segmented Layout Toggle Switch */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <button 
                type="button" 
                onClick={() => setMetadataLayout('grouped')} 
                style={{
                  flex: 1,
                  padding: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '6px',
                  background: metadataLayout === 'grouped' ? '#fff' : 'transparent',
                  color: metadataLayout === 'grouped' ? '#0f172a' : '#64748b',
                  boxShadow: metadataLayout === 'grouped' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Grouped View
              </button>
              <button 
                type="button" 
                onClick={() => setMetadataLayout('list')} 
                style={{
                  flex: 1,
                  padding: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '6px',
                  background: metadataLayout === 'list' ? '#fff' : 'transparent',
                  color: metadataLayout === 'list' ? '#0f172a' : '#64748b',
                  boxShadow: metadataLayout === 'list' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Unified Timeline
              </button>
            </div>

            {/* Layout Rendering */}
            {metadataLayout === 'grouped' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Static Group */}
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', display: 'block', marginBottom: '0.75rem' }}>
                    Registration Metadata (Static)
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', fontWeight: '600' }}>Inquiry Registered On</span>
                      <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>{formatDateCreative(lead.createdAt)}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', fontWeight: '600' }}>Originated From Source</span>
                      <span className="source-badge" style={{ display: 'inline-block', marginTop: '2px' }}>{lead.source || 'Website'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', fontWeight: '600' }}>Captured By</span>
                      <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>{lead.createdBy || 'Website / Legacy'}</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Group */}
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', display: 'block', marginBottom: '0.75rem' }}>
                    Audit History (Dynamic)
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', fontWeight: '600' }}>Last Updated On</span>
                      <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>{lead.updatedAt ? formatDateCreative(lead.updatedAt) : 'Not updated yet'}</span>
                    </div>
                    {lead.updatedBy && (
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', fontWeight: '600' }}>Last Action By</span>
                        <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>{lead.updatedBy}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Unified Timeline List */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid #cbd5e1', paddingLeft: '16px', marginLeft: '8px', marginTop: '8px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#64748b', border: '2px solid #fff', boxShadow: '0 0 0 1px #cbd5e1' }} />
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '800' }}>Inquiry Registered</span>
                  <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>{formatDateCreative(lead.createdAt)}</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#64748b', border: '2px solid #fff', boxShadow: '0 0 0 1px #cbd5e1' }} />
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '800' }}>Lead Source</span>
                  <span className="source-badge" style={{ display: 'inline-block', marginTop: '2px' }}>{lead.source || 'Website'}</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#64748b', border: '2px solid #fff', boxShadow: '0 0 0 1px #cbd5e1' }} />
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '800' }}>Captured By</span>
                  <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>{lead.createdBy || 'Website / Legacy'}</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', border: '2px solid #fff', boxShadow: '0 0 0 1px #cbd5e1' }} />
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '800' }}>Last Updated</span>
                  <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>{lead.updatedAt ? formatDateCreative(lead.updatedAt) : 'Not updated yet'}</span>
                </div>
                {lead.updatedBy && (
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', border: '2px solid #fff', boxShadow: '0 0 0 1px #cbd5e1' }} />
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '800' }}>Last Action By</span>
                    <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>{lead.updatedBy}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Help Box */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: '700' }}>Counselor Actions</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }}>
              Verify details, update stages as you contact the traveler, or add specific internal tags when you make contact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
