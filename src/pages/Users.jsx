import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Edit2, Download, Check, X, Eye } from 'lucide-react';
import Modal from '../Components/Common/Modal';
import './Pages.css';

const Users = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userDocuments, setUserDocuments] = useState({});
  const [loadingDocs, setLoadingDocs] = useState({});
  
  const [viewDocModalOpen, setViewDocModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';
        
        const response = await fetch(`${baseUrl}/profiles/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const mappedUsers = data.map(u => {
            const fieldsToCheck = [
              u.name, u.email, u.phone, u.nationality,
              u.gender, u.maritalStatus, u.passportNumber,
              u.guardianName, u.guardianMobile, u.guardianEmail, u.guardianRelation,
              u.addressStreet, u.addressCountry, u.addressState, u.addressCity, u.addressPostalCode
            ];
            const filledCount = fieldsToCheck.filter(f => f && String(f).trim() !== '').length;
            const calculatedCompletion = Math.round((filledCount / fieldsToCheck.length) * 100) + '%';

            return {
              id: u.id,
              name: u.name,
              email: u.email,
              phone: u.phone || 'N/A',
              nationality: u.nationality || 'N/A',
              completion: calculatedCompletion,

            status: 'Active',
            profileData: {
              personal: { 
                gender: u.gender || '', 
                maritalStatus: u.maritalStatus || '', 
                passportNumber: u.passportNumber || '' 
              },
              guardian: { 
                name: u.guardianName || '', 
                mobile: u.guardianMobile || '', 
                email: u.guardianEmail || '', 
                relation: u.guardianRelation || '' 
              },
              address: { 
                street: u.addressStreet || '', 
                apartment: u.addressApartment || '', 
                country: u.addressCountry || '', 
                state: u.addressState || '', 
                city: u.addressCity || '', 
                postalCode: u.addressPostalCode || '' 
              }
            }
          };
          });
          setUsers(mappedUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const fetchUserDocuments = async (userId) => {
    if (userDocuments[userId]) return; // already fetched
    
    setLoadingDocs(prev => ({ ...prev, [userId]: true }));
    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';
      const response = await fetch(`${baseUrl}/documents/admin/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const docs = await response.json();
        setUserDocuments(prev => ({ ...prev, [userId]: docs }));
      }
    } catch (error) {
      console.error('Failed to fetch user documents', error);
    } finally {
      setLoadingDocs(prev => ({ ...prev, [userId]: false }));
    }
  };

  const toggleRow = (id) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
      fetchUserDocuments(id);
    }
  };

  const updateDocStatus = async (userId, docId, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';
      const response = await fetch(`${baseUrl}/documents/admin/${docId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        setUserDocuments(prev => ({
          ...prev,
          [userId]: prev[userId].map(doc => doc.id === docId ? { ...doc, status } : doc)
        }));
      } else {
        alert('Failed to update document status');
      }
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  const handleDownloadDoc = (docId, fileName) => {
    const token = localStorage.getItem('adminToken');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';
    const url = `${baseUrl}/documents/admin/${docId}/download`;
    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.blob())
    .then(blob => {
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Optionally revoke the object URL later to free memory
    })
    .catch(error => console.error('Download error:', error));
  };

  const handleViewDoc = (docId, fileName) => {
    const token = localStorage.getItem('adminToken');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';
    const url = `${baseUrl}/documents/admin/${docId}/download`;
    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.blob())
    .then(blob => {
      const blobUrl = window.URL.createObjectURL(blob);
      setViewingDoc({ url: blobUrl, type: blob.type, name: fileName, id: docId });
      setViewDocModalOpen(true);
    })
    .catch(error => console.error('View error:', error));
  };

  const handleEditClick = (user) => {
    setEditingUser(JSON.parse(JSON.stringify(user))); // Deep copy for editing
    setIsEditModalOpen(true);
  };

  const handleEditChange = (section, field, value) => {
    if (section === 'main') {
      setEditingUser(prev => ({ ...prev, [field]: value }));
    } else {
      setEditingUser(prev => ({
        ...prev,
        profileData: {
          ...prev.profileData,
          [section]: {
            ...prev.profileData[section],
            [field]: value
          }
        }
      }));
    }
  };

  const saveEdits = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';
      
      const payload = {
        phone: editingUser.phone,
        gender: editingUser.profileData.personal.gender,
        nationality: editingUser.nationality,
        maritalStatus: editingUser.profileData.personal.maritalStatus,
        passportNumber: editingUser.profileData.personal.passportNumber,
        guardianName: editingUser.profileData.guardian.name,
        guardianMobile: editingUser.profileData.guardian.mobile,
        guardianEmail: editingUser.profileData.guardian.email,
        guardianRelation: editingUser.profileData.guardian.relation,
        addressStreet: editingUser.profileData.address.street,
        addressApartment: editingUser.profileData.address.apartment,
        addressCountry: editingUser.profileData.address.country,
        addressState: editingUser.profileData.address.state,
        addressCity: editingUser.profileData.address.city,
        addressPostalCode: editingUser.profileData.address.postalCode
      };

      const response = await fetch(`${baseUrl}/profiles/admin/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
        setIsEditModalOpen(false);
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    }
  };

  return (
    <div className="users-page fade-in">
      <div className="page-header">
        <h1>Student Directory</h1>
        <p>Manage and view profiles for public applicants and students.</p>
      </div>

      <div className="card">
        <div className="table-container">
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading students...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Nationality</th>
                  <th>Completion</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      No students found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <React.Fragment key={user.id}>
                      <tr>
                        <td><strong>{user.name}</strong></td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{user.nationality}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '6px', background: 'var(--color-gray-200)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: user.completion, background: 'var(--color-brand-primary)' }}></div>
                            </div>
                            <span style={{ fontSize: '0.8rem' }}>{user.completion}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${user.status.toLowerCase()}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="btn-small" 
                              onClick={() => toggleRow(user.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
                            >
                              {expandedRow === user.id ? <><ChevronUp size={14} /> Hide</> : <><ChevronDown size={14} /> View</>}
                            </button>
                            <button 
                              className="btn-small btn-outline" 
                              onClick={() => handleEditClick(user)}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-gray-300)', color: 'var(--color-text-primary)' }}
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {expandedRow === user.id && (
                        <tr className="expanded-row-details">
                          <td colSpan="7">
                            <div className="details-grid" style={{ 
                              display: 'grid', 
                              gridTemplateColumns: 'repeat(3, 1fr)', 
                              gap: '24px', 
                              padding: '24px', 
                              background: 'rgba(10, 30, 63, 0.02)',
                              borderBottom: '1px solid var(--color-gray-200)'
                            }}>
                              {/* Personal Details */}
                              <div className="details-section">
                                <h4 style={{ color: 'var(--color-brand-primary)', marginBottom: '12px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Personal Details</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                                  <p><strong>Gender:</strong> {user.profileData.personal.gender || 'N/A'}</p>
                                  <p><strong>Marital Status:</strong> {user.profileData.personal.maritalStatus || 'N/A'}</p>
                                  <p><strong>Passport Number:</strong> {user.profileData.personal.passportNumber || 'N/A'}</p>
                                </div>
                              </div>
                              
                              {/* Guardian Details */}
                              <div className="details-section">
                                <h4 style={{ color: 'var(--color-brand-primary)', marginBottom: '12px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Guardian Details</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                                  <p><strong>Name:</strong> {user.profileData.guardian.name || 'N/A'}</p>
                                  <p><strong>Relation:</strong> {user.profileData.guardian.relation || 'N/A'}</p>
                                  <p><strong>Mobile:</strong> {user.profileData.guardian.mobile || 'N/A'}</p>
                                  <p><strong>Email:</strong> {user.profileData.guardian.email || 'N/A'}</p>
                                </div>
                              </div>
                              
                              {/* Address Details */}
                              <div className="details-section">
                                <h4 style={{ color: 'var(--color-brand-primary)', marginBottom: '12px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Address</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                                  <p><strong>Street:</strong> {user.profileData.address.street} {user.profileData.address.apartment}</p>
                                  <p><strong>City/State:</strong> {user.profileData.address.city}, {user.profileData.address.state}</p>
                                  <p><strong>Country/Zip:</strong> {user.profileData.address.country}, {user.profileData.address.postalCode}</p>
                                </div>
                              </div>

                              {/* Documents Details */}
                              <div className="details-section" style={{ gridColumn: '1 / -1', marginTop: '12px', borderTop: '1px solid var(--color-gray-200)', paddingTop: '24px' }}>
                                <h4 style={{ color: 'var(--color-brand-primary)', marginBottom: '16px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Uploaded Documents</h4>
                                
                                {loadingDocs[user.id] ? (
                                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Loading documents...</div>
                                ) : (
                                  <div style={{ background: '#fff', border: '1px solid var(--color-gray-200)', borderRadius: '8px', overflow: 'hidden' }}>
                                    <table style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
                                      <thead style={{ background: 'var(--color-bg-secondary)' }}>
                                        <tr>
                                          <th style={{ padding: '12px 16px', fontSize: '0.85rem' }}>Document Name</th>
                                          <th style={{ padding: '12px 16px', fontSize: '0.85rem' }}>Size</th>
                                          <th style={{ padding: '12px 16px', fontSize: '0.85rem' }}>Date</th>
                                          <th style={{ padding: '12px 16px', fontSize: '0.85rem' }}>Status</th>
                                          <th style={{ padding: '12px 16px', fontSize: '0.85rem' }}>Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(!userDocuments[user.id] || userDocuments[user.id].length === 0) ? (
                                          <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                              No documents uploaded by this user.
                                            </td>
                                          </tr>
                                        ) : (
                                          userDocuments[user.id].map(doc => (
                                            <tr key={doc.id} style={{ borderTop: '1px solid var(--color-gray-200)' }}>
                                              <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}><strong>{doc.name}</strong></td>
                                              <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{(doc.size / 1024 / 1024).toFixed(2)} MB</td>
                                              <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{new Date(doc.createdAt).toISOString().split('T')[0]}</td>
                                              <td style={{ padding: '12px 16px' }}>
                                                <span className={`badge ${doc.status.toLowerCase()}`}>{doc.status}</span>
                                              </td>
                                              <td style={{ padding: '12px 16px' }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                  <button 
                                                    className="btn-small btn-outline" 
                                                    onClick={() => handleViewDoc(doc.id, doc.name)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.8rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-gray-300)', color: 'var(--color-text-primary)' }}
                                                    title="View"
                                                  >
                                                    <Eye size={14} />
                                                  </button>
                                                  <button 
                                                    className="btn-small btn-outline" 
                                                    onClick={() => handleDownloadDoc(doc.id, doc.name)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.8rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-gray-300)', color: 'var(--color-text-primary)' }}
                                                    title="Download"
                                                  >
                                                    <Download size={14} />
                                                  </button>
                                                  
                                                  <button 
                                                    className="btn-small" 
                                                    onClick={() => updateDocStatus(user.id, doc.id, 'Verified')} 
                                                    disabled={doc.status === 'Verified'}
                                                    style={{ 
                                                      display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.8rem',
                                                      background: doc.status === 'Verified' ? '#f3f4f6' : 'rgba(34, 197, 94, 0.1)', 
                                                      border: `1px solid ${doc.status === 'Verified' ? '#e5e7eb' : 'rgba(34, 197, 94, 0.2)'}`, 
                                                      color: doc.status === 'Verified' ? '#9ca3af' : '#16a34a',
                                                      cursor: doc.status === 'Verified' ? 'not-allowed' : 'pointer'
                                                    }}
                                                    title="Verify"
                                                  >
                                                    <Check size={14} />
                                                  </button>
                                                  <button 
                                                    className="btn-small" 
                                                    onClick={() => updateDocStatus(user.id, doc.id, 'Rejected')} 
                                                    disabled={doc.status === 'Rejected'}
                                                    style={{ 
                                                      display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.8rem',
                                                      background: doc.status === 'Rejected' ? '#f3f4f6' : 'rgba(239, 68, 68, 0.1)', 
                                                      border: `1px solid ${doc.status === 'Rejected' ? '#e5e7eb' : 'rgba(239, 68, 68, 0.2)'}`, 
                                                      color: doc.status === 'Rejected' ? '#9ca3af' : '#dc2626',
                                                      cursor: doc.status === 'Rejected' ? 'not-allowed' : 'pointer'
                                                    }}
                                                    title="Reject"
                                                  >
                                                    <X size={14} />
                                                  </button>
                                                </div>
                                              </td>
                                            </tr>
                                          ))
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Student Profile">
        {editingUser && (
          <form onSubmit={saveEdits} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Personal Details</h4>
            <div className="form-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                <input type="text" value={editingUser.name} onChange={(e) => handleEditChange('main', 'name', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
                <input type="email" value={editingUser.email} onChange={(e) => handleEditChange('main', 'email', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone Number</label>
                <input type="text" value={editingUser.phone} onChange={(e) => handleEditChange('main', 'phone', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Gender</label>
                <select value={editingUser.profileData.personal.gender} onChange={(e) => handleEditChange('personal', 'gender', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nationality</label>
                <input type="text" value={editingUser.nationality} onChange={(e) => handleEditChange('main', 'nationality', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Marital Status</label>
                <select value={editingUser.profileData.personal.maritalStatus} onChange={(e) => handleEditChange('personal', 'maritalStatus', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <option value="" disabled>Select Marital Status</option>
                  <option value="Unmarried">Unmarried</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Passport Number</label>
                <input type="text" value={editingUser.profileData.personal.passportNumber} onChange={(e) => handleEditChange('personal', 'passportNumber', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
            </div>

            <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginTop: '1rem' }}>Guardian Details</h4>
            <div className="form-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Guardian Name</label>
                <input type="text" value={editingUser.profileData.guardian.name} onChange={(e) => handleEditChange('guardian', 'name', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Guardian Mobile Number</label>
                <input type="text" value={editingUser.profileData.guardian.mobile} onChange={(e) => handleEditChange('guardian', 'mobile', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Guardian Email</label>
                <input type="email" value={editingUser.profileData.guardian.email || ''} onChange={(e) => handleEditChange('guardian', 'email', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Relation</label>
                <select value={editingUser.profileData.guardian.relation || ''} onChange={(e) => handleEditChange('guardian', 'relation', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <option value="" disabled>Father / Mother / etc.</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Legal Guardian">Legal Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginTop: '1rem' }}>Address Details</h4>
            <div className="form-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Street Address</label>
                <input type="text" value={editingUser.profileData.address.street || ''} onChange={(e) => handleEditChange('address', 'street', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Apartment, suite, etc. (optional)</label>
                <input type="text" value={editingUser.profileData.address.apartment || ''} onChange={(e) => handleEditChange('address', 'apartment', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Country</label>
                <input type="text" value={editingUser.profileData.address.country || ''} onChange={(e) => handleEditChange('address', 'country', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>State / Province</label>
                <input type="text" value={editingUser.profileData.address.state || ''} onChange={(e) => handleEditChange('address', 'state', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>City</label>
                <input type="text" value={editingUser.profileData.address.city || ''} onChange={(e) => handleEditChange('address', 'city', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Postal / Zip Code</label>
                <input type="text" value={editingUser.profileData.address.postalCode || ''} onChange={(e) => handleEditChange('address', 'postalCode', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding: '0.5rem 1rem', background: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={viewDocModalOpen} onClose={() => setViewDocModalOpen(false)} title={viewingDoc?.name || "View Document"}>
        {viewingDoc && (
          <div style={{ width: '100%', height: '75vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
            {viewingDoc.type.startsWith('image/') ? (
              <img src={viewingDoc.url} alt={viewingDoc.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : viewingDoc.type === 'application/pdf' ? (
              <iframe src={viewingDoc.url} style={{ width: '100%', height: '100%', border: 'none' }} title={viewingDoc.name} />
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>This file type cannot be previewed in the browser.</p>
                <button className="btn-primary" onClick={() => handleDownloadDoc(viewingDoc.id, viewingDoc.name)}>
                  Download Instead
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;
