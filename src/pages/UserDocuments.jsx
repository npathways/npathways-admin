import React, { useState, useEffect } from 'react';
import { Eye, Download, Check, X } from 'lucide-react';
import Modal from '../Components/Common/Modal';
import './Pages.css';

const UserDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';
  const token = localStorage.getItem('adminToken');

  const [viewDocModalOpen, setViewDocModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch users to get names and emails
      const usersRes = await fetch(`${baseUrl}/profiles/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      
      // Fetch all documents
      const docsRes = await fetch(`${baseUrl}/documents/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const docsData = await docsRes.json();
      
      // Map documents to include user info
      if (usersRes.ok && docsRes.ok) {
        const mergedDocs = docsData.map(doc => {
          const user = usersData.find(u => u.id === doc.userId);
          return {
            id: doc.id,
            studentName: user ? user.name : 'Unknown User',
            studentEmail: user ? user.email : 'No email',
            docName: doc.name,
            docSize: `${(doc.size / 1024 / 1024).toFixed(2)} MB`,
            uploadDate: new Date(doc.createdAt).toISOString().split('T')[0],
            status: doc.status
          };
        });
        setDocuments(mergedDocs);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`${baseUrl}/documents/admin/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        setDocuments(documents.map(doc => doc.id === id ? { ...doc, status } : doc));
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  const handleVerify = (id) => updateStatus(id, 'Verified');
  const handleReject = (id) => updateStatus(id, 'Rejected');

  const handleDownload = (id, fileName) => {
    const url = `${baseUrl}/documents/admin/${id}/download`;
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
    })
    .catch(error => console.error('Download error:', error));
  };

  const handleViewDoc = (docId, fileName) => {
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

  return (
    <div className="documents-page fade-in">
      <div className="page-header">
        <h1>Document Verification</h1>
        <p>Review and verify documents uploaded by students from the user portal.</p>
      </div>

      <div className="card">
        <div className="table-container">
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading documents...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Document Details</th>
                  <th>Upload Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong>{doc.studentName}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{doc.studentEmail}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong>{doc.docName}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{doc.docSize}</span>
                      </div>
                    </td>
                    <td>{doc.uploadDate}</td>
                    <td>
                      <span className={`badge ${doc.status.toLowerCase()}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn-small btn-outline" 
                          onClick={() => handleViewDoc(doc.id, doc.docName)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-gray-300)', color: 'var(--color-text-primary)' }}
                          title="View"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button 
                          className="btn-small btn-outline" 
                          onClick={() => handleDownload(doc.id, doc.docName)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-gray-300)', color: 'var(--color-text-primary)' }}
                          title="Download"
                        >
                          <Download size={14} /> Download
                        </button>
                        
                        <button 
                          className="btn-small" 
                          onClick={() => handleVerify(doc.id)} 
                          disabled={doc.status === 'Verified'}
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', 
                            background: doc.status === 'Verified' ? '#f3f4f6' : 'rgba(34, 197, 94, 0.1)', 
                            border: `1px solid ${doc.status === 'Verified' ? '#e5e7eb' : 'rgba(34, 197, 94, 0.2)'}`, 
                            color: doc.status === 'Verified' ? '#9ca3af' : '#16a34a',
                            cursor: doc.status === 'Verified' ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <Check size={14} /> Verify
                        </button>
                        <button 
                          className="btn-small" 
                          onClick={() => handleReject(doc.id)} 
                          disabled={doc.status === 'Rejected'}
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', 
                            background: doc.status === 'Rejected' ? '#f3f4f6' : 'rgba(239, 68, 68, 0.1)', 
                            border: `1px solid ${doc.status === 'Rejected' ? '#e5e7eb' : 'rgba(239, 68, 68, 0.2)'}`, 
                            color: doc.status === 'Rejected' ? '#9ca3af' : '#dc2626',
                            cursor: doc.status === 'Rejected' ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No documents found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

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
                <button className="btn-primary" onClick={() => handleDownload(viewingDoc.id, viewingDoc.name)}>
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

export default UserDocuments;
