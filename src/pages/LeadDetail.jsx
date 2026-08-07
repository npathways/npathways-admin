import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiSave, FiX, FiUser, FiMail, FiPhone, FiTarget, FiLayers, FiCalendar, FiFileText } from 'react-icons/fi';
import { useLeads } from '../context/LeadsContext';
import './Pages.css';

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, loading, fetchLeads, updateLeadStage, updateLeadDetails } = useLeads();
  
  const [lead, setLead] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (leads.length === 0 && !loading) {
      fetchLeads();
    }
  }, [leads.length, loading, fetchLeads]);

  useEffect(() => {
    const foundLead = leads.find(l => l._id === id || l.id === id);
    if (foundLead) {
      setLead(foundLead);
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

          {/* Remarks / Progress Notes Card */}
          <div className="card" style={{ padding: '2rem', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '2px solid var(--color-brand-primary, #0f172a)', paddingBottom: '0.75rem', width: 'fit-content' }}>
              Internal Remarks & Progress Notes
            </h3>
            {isEditing ? (
              <textarea
                name="remarks"
                value={editFormData.remarks}
                onChange={handleEditChange}
                placeholder="Add notes about candidate conversation, application progress, or advisor remarks..."
                className="premium-input"
                style={{ height: '120px', resize: 'vertical', width: '100%', padding: '12px' }}
              />
            ) : (
              <div style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                color: lead.remarks ? '#334155' : '#94a3b8',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                minHeight: '100px'
              }}>
                {lead.remarks || "No remarks added yet. Click 'Edit Profile' to add internal progress notes."}
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
            
            <div className="detail-box" style={{ marginBottom: '1rem' }}>
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

            <div className="detail-box">
              <span className="form-label" style={{ fontWeight: '700', color: '#334155' }}><FiCalendar size={14} style={{ marginRight: '4px' }} /> Inquiry Date</span>
              <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>{formatDate(lead.createdAt)}</span>
            </div>

            <div className="detail-box" style={{ marginTop: '1rem' }}>
              <span className="form-label" style={{ fontWeight: '700', color: '#334155' }}>Lead Source</span>
              <span className="source-badge" style={{ display: 'inline-block' }}>{lead.source || 'Website'}</span>
            </div>
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
