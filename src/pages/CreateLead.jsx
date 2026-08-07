import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUser, FiMail, FiPhone, FiTarget, FiFileText, FiTag } from 'react-icons/fi';
import { useLeads } from '../context/LeadsContext';
import './Pages.css';

const CreateLead = () => {
  const navigate = useNavigate();
  const { addLead } = useLeads();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+91',
    selectedProgram: '',
    category: '',
    grade: '',
    passoutYear: '',
    examType: '',
    examStatus: '',
    message: '',
    remarks: '',
    source: 'Manual Entry'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const executeSubmit = async () => {
    setIsSaving(true);
    const payload = { ...formData };
    ["category", "examType", "examStatus", "grade", "passoutYear", "selectedProgram", "message", "remarks"].forEach(key => {
      if (payload[key] === "") payload[key] = null;
    });

    const success = await addLead(payload);
    setIsSaving(false);
    if (success) {
      navigate('/leads');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await executeSubmit();
  };

  const categories = ['Student', 'Parent', 'Working Professional', 'Just Looking Around'];

  return (
    <div className="leads-page premium-layout">
      {/* Top Header with Double Action Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: '#fff', padding: '1.25rem 1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <button onClick={() => navigate('/leads')} className="refresh-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
          <FiArrowLeft /> Back to Inquiry Hub
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>Enlist New Candidate</h2>
          <button 
            type="button" 
            className="btn-primary" 
            disabled={isSaving} 
            onClick={executeSubmit}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', fontWeight: '600' }}
          >
            <FiSave size={16} />
            <span>{isSaving ? 'Registering...' : 'Register Candidate'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Side: General Profile Cards divided into bold sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 1: Contact Information */}
          <div className="card" style={{ padding: '2rem', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', borderBottom: '2px solid var(--color-brand-primary, #0f172a)', paddingBottom: '0.75rem', width: 'fit-content' }}>
              <FiUser /> 1. Contact Information
            </h3>
            
            <div className="modal-body-premium" style={{ padding: 0 }}>
              <div className="detail-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <div className="detail-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="detail-box">
                    <span className="form-label" style={{ fontWeight: '700', color: '#334155' }}>Full Name *</span>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="premium-input" placeholder="e.g. Rajiv Kumar" />
                  </div>
                  
                  <div className="detail-box">
                    <span className="form-label" style={{ fontWeight: '700', color: '#334155' }}>Occupation / Category *</span>
                    <select name="category" value={formData.category} onChange={handleChange} required className="premium-input">
                      <option value="">Select Occupation</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="detail-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                  <div className="detail-box">
                    <span className="form-label" style={{ fontWeight: '700', color: '#334155' }}><FiMail size={14} style={{ marginRight: '4px' }} /> Email Address *</span>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="premium-input" placeholder="name@example.com" />
                  </div>

                  <div className="detail-box">
                    <span className="form-label" style={{ fontWeight: '700', color: '#334155' }}><FiPhone size={14} style={{ marginRight: '4px' }} /> Phone Number *</span>
                    <div className="premium-input-group">
                      <input type="text" name="countryCode" value={formData.countryCode} onChange={handleChange} required className="premium-input" style={{ width: '80px' }} />
                      <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="premium-input" placeholder="00000 00000" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Program & Academics */}
          <div className="card" style={{ padding: '2rem', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', borderBottom: '2px solid var(--color-brand-primary, #0f172a)', paddingBottom: '0.75rem', width: 'fit-content' }}>
              <FiTarget /> 2. Program & Academics
            </h3>
            
            <div className="modal-body-premium" style={{ padding: 0 }}>
              <div className="detail-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <div className="detail-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="detail-box">
                    <span className="form-label" style={{ fontWeight: '700', color: '#334155' }}>Chosen Service / Program</span>
                    <input type="text" name="selectedProgram" value={formData.selectedProgram} onChange={handleChange} className="premium-input" placeholder="e.g. Study Abroad" />
                  </div>
                  
                  <div className="detail-box">
                    <span className="form-label" style={{ fontWeight: '700', color: '#334155' }}>Passout / Graduation Year</span>
                    <input type="text" name="passoutYear" value={formData.passoutYear} onChange={handleChange} className="premium-input" placeholder="e.g. 2026" />
                  </div>
                </div>

                <div className="detail-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                  <div className="detail-box">
                    <span className="form-label" style={{ fontWeight: '700', color: '#334155' }}>Academic Grade</span>
                    <input type="text" name="grade" value={formData.grade} onChange={handleChange} className="premium-input" placeholder="e.g. 12th Grade" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Custom Message & User Query */}
          <div className="card" style={{ padding: '2rem', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '2px solid var(--color-brand-primary, #0f172a)', paddingBottom: '0.75rem', width: 'fit-content' }}>
              <FiFileText /> 3. Custom Inquiry Message
            </h3>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Candidate query, custom requirements, or shared query from student..."
              className="premium-input"
              style={{ height: '100px', resize: 'vertical', width: '100%', padding: '12px' }}
            />
          </div>

          {/* Section 4: Internal Remarks & Progress Notes */}
          <div className="card" style={{ padding: '2rem', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '2px solid var(--color-brand-primary, #0f172a)', paddingBottom: '0.75rem', width: 'fit-content' }}>
              Internal Remarks & Follow-up Notes
            </h3>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Add initial notes about candidate discussion or follow-up schedule..."
              className="premium-input"
              style={{ height: '120px', resize: 'vertical', width: '100%', padding: '12px' }}
            />
          </div>

          {/* Bottom Save Action Panel */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', background: '#fff', padding: '1.5rem 2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <button type="button" onClick={() => navigate('/leads')} className="btn-cancel" style={{ padding: '12px 24px', borderRadius: '8px' }}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isSaving} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 30px', fontSize: '1rem', fontWeight: '700' }}
            >
              <FiSave size={18} /> 
              <span>{isSaving ? 'Registering...' : 'Register Candidate'}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Lead Metadata Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Status Control Card */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <FiTag /> 5. Metadata
            </h3>
            <div className="detail-box">
              <span className="form-label" style={{ fontWeight: '700', color: '#334155' }}>Lead Source</span>
              <input type="text" name="source" value={formData.source} onChange={handleChange} className="premium-input" />
            </div>
          </div>

          {/* Quick Help Box */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: '700' }}>Adding Manually</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }}>
              Filling out this form manually registers a candidate into the central Inquiry Hub. A welcome email notification is automatically dispatched upon successful registration.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateLead;
