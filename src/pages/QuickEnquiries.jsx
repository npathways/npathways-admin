import React, { useEffect, useState } from 'react';
import { FiMessageCircle, FiCalendar, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import './Pages.css';

import { useQuickEnquiries } from '../context/QuickEnquiriesContext';

const QuickEnquiries = () => {
  const { enquiries, loading, isRefreshing, fetchEnquiries, updateEnquiryStatus } = useQuickEnquiries();
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const stages = ['New', 'Contacted', 'Resolved'];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEnquiries = enquiries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(enquiries.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const updateStatus = async (id, newStatus) => {
    await updateEnquiryStatus(id, newStatus);
  };

  return (
    <div className="leads-page premium-layout">
      <div className="page-header-premium">
        <div className="header-text">
          <h1>Quick Enquiries</h1>
          <p>Manage instant inquiries from the website floating button.</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={fetchEnquiries} 
            className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
            disabled={isRefreshing}
          >
            {isRefreshing ? <div className="npath-spinner npath-spinner-sm" /> : <FiRefreshCw />} 
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      <div className="card custom-table-wrapper" style={{ marginTop: '2rem' }}>
        <div className="table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Requested Service</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && enquiries.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="table-loader-localized">
                      <div className="npath-spinner" />
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : currentEnquiries.length > 0 ? (
                currentEnquiries.map((enq) => (
                  <tr key={enq.id}>
                    <td>
                      <div className="lead-profile-cell">
                        <div className="avatar-minimal">{enq.name.charAt(0)}</div>
                        <div className="profile-details">
                          <span className="lead-name">{enq.name}</span>
                          <span className="lead-email">{enq.email}</span>
                          <span className="lead-email">{enq.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="service-intent">
                        <FiMessageCircle className="intent-icon" />
                        <span>{enq.service}</span>
                      </div>
                    </td>
                    <td>
                      <select 
                        className={`pipeline-select ${enq.status.toLowerCase()}`}
                        value={enq.status}
                        onChange={(e) => updateStatus(enq.id, e.target.value)}
                      >
                        {stages.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <div className="date-cell">
                        <span className="date-main">{formatDate(enq.createdAt)}</span>
                      </div>
                    </td>
                    <td>
                      <button 
                        className="view-btn-minimal" 
                        onClick={() => setSelectedEnquiry(enq)}
                      >
                        <FiExternalLink /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No quick enquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {enquiries.length > itemsPerPage && (
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

      {selectedEnquiry && (
        <div className="modal-overlay" onClick={() => setSelectedEnquiry(null)}>
          <div className="modal-content-premium" onClick={e => e.stopPropagation()}>
            <div className="modal-header-premium">
              <div className="header-title">
                <div className="header-avatar">{selectedEnquiry.name.charAt(0)}</div>
                <div>
                  <h2>{selectedEnquiry.name}</h2>
                  <p>{selectedEnquiry.email}</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setSelectedEnquiry(null)}>&times;</button>
            </div>
            <div className="modal-body-premium">
              <div className="detail-section">
                <h4>Details</h4>
                <div className="detail-row">
                  <div className="detail-box"><span>Phone</span>{selectedEnquiry.phone}</div>
                  <div className="detail-box"><span>Service</span>{selectedEnquiry.service}</div>
                  <div className="detail-box"><span>Status</span>{selectedEnquiry.status}</div>
                  <div className="detail-box"><span>Date</span>{formatDate(selectedEnquiry.createdAt)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickEnquiries;
