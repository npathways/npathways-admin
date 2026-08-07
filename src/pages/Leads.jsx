import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiCalendar, FiTarget, FiMessageSquare, FiRefreshCw, FiExternalLink, FiPlus, FiEdit2, FiSave, FiX, FiUpload } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import './Pages.css';

import { useLeads } from '../context/LeadsContext';

const Leads = () => {
  const navigate = useNavigate();
  const { leads, loading, isRefreshing, fetchLeads, updateLeadStage, updateLeadDetails, addLead, addLeadsBulk } = useLeads();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStage, setFilterStage] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 5;

  // Bulk Import state
  const [importData, setImportData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showImportSummary, setShowImportSummary] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [showImportZone, setShowImportZone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const stages = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
  const categories = ['All', 'Student', 'Parent', 'Working Professional', 'Just Looking Around'];

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





  // --- Bulk Import Handlers ---
  const validateLeadLocal = (lead) => {
    const errors = [];
    if (!lead.name || !lead.name.trim()) {
      errors.push("Name is required");
    }
    if (!lead.email || !lead.email.trim()) {
      errors.push("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(lead.email)) {
      errors.push("Invalid email format");
    }
    if (!lead.phone || !String(lead.phone).trim()) {
      errors.push("Phone is required");
    }
    
    // Validate enums
    if (lead.category && !["Parent", "Student", "Working Professional", "Just Looking Around"].includes(lead.category)) {
      errors.push(`Invalid category: '${lead.category}'. Must be 'Parent', 'Student', 'Working Professional', or 'Just Looking Around'`);
    }
    if (lead.examType && !["CAT", "GMAT", "GRE", "XAT", "NMAT", "SNAP", "Other"].includes(lead.examType)) {
      errors.push(`Invalid exam: '${lead.examType}'`);
    }
    if (lead.examStatus && !["Applied", "Yet to Apply", "Planning to Apply"].includes(lead.examStatus)) {
      errors.push(`Invalid status: '${lead.examStatus}'`);
    }
    if (lead.pipelineStage && !["New", "Contacted", "Qualified", "Converted", "Lost"].includes(lead.pipelineStage)) {
      errors.push(`Invalid stage: '${lead.pipelineStage}'`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

  const parseCSVOrTSVText = (text) => {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0 || !lines[0]) return [];

    const firstLine = lines[0];
    const separator = firstLine.includes('\t') ? '\t' : ',';
    const headers = firstLine.split(separator).map(h => h.trim().replace(/^["']|["']$/g, ''));
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      let values = [];
      if (separator === '\t') {
        values = line.split('\t');
      } else {
        let current = '';
        let inQuotes = false;
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());
      }

      const row = {};
      headers.forEach((header, index) => {
        let val = values[index] !== undefined ? values[index] : '';
        val = val.replace(/^["']|["']$/g, '');
        row[header] = val;
      });
      result.push(row);
    }
    return result;
  };

  const mapHeadersToCamelCase = (row) => {
    const mapping = {
      name: 'name',
      email: 'email',
      country_code: 'countryCode',
      countrycode: 'countryCode',
      countryCode: 'countryCode',
      phone: 'phone',
      selected_program: 'selectedProgram',
      selectedprogram: 'selectedProgram',
      selectedProgram: 'selectedProgram',
      category: 'category',
      grade: 'grade',
      passout_year: 'passoutYear',
      passoutyear: 'passoutYear',
      passoutYear: 'passoutYear',
      exam_type: 'examType',
      examtype: 'examType',
      examType: 'examType',
      exam_status: 'examStatus',
      examstatus: 'examStatus',
      examStatus: 'examStatus',
      source: 'source',
      pipeline_stage: 'pipelineStage',
      pipelinestage: 'pipelineStage',
      pipelineStage: 'pipelineStage',
    };

    const newRow = {};
    Object.keys(row).forEach(key => {
      const cleanKey = key.trim();
      const mappedKey = mapping[cleanKey];
      if (mappedKey) {
        newRow[mappedKey] = row[key];
      } else {
        newRow[cleanKey] = row[key];
      }
    });
    return newRow;
  };

  const processFile = (file) => {
    const fileReader = new FileReader();
    const filename = file.name;
    const fileExt = filename.split('.').pop().toLowerCase();

    fileReader.onload = (event) => {
      try {
        let rawData = [];
        if (fileExt === 'xlsx' || fileExt === 'xls') {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          rawData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        } else {
          const text = event.target.result;
          rawData = parseCSVOrTSVText(text);
        }

        if (rawData.length === 0) {
          alert("The uploaded file is empty or could not be parsed.");
          return;
        }

        const parsedRows = rawData.map((row) => {
          const mappedRow = mapHeadersToCamelCase(row);
          const validation = validateLeadLocal(mappedRow);
          return {
            data: mappedRow,
            isValid: validation.isValid,
            errors: validation.errors
          };
        });

        const total = parsedRows.length;
        const valid = parsedRows.filter(r => r.isValid).length;
        const invalid = total - valid;

        setImportData({
          filename,
          rows: parsedRows,
          summary: { total, valid, invalid }
        });
      } catch (err) {
        console.error("Error parsing file:", err);
        alert(`Failed to parse file: ${err.message}`);
      }
    };

    if (fileExt === 'xlsx' || fileExt === 'xls') {
      fileReader.readAsArrayBuffer(file);
    } else {
      fileReader.readAsText(file);
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
    e.target.value = null;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleConfirmImport = async () => {
    if (!importData) return;
    setIsUploading(true);

    const leadsToImport = importData.rows.filter(r => r.isValid).map(r => r.data);

    if (leadsToImport.length === 0) {
      alert("No valid leads to import.");
      setIsUploading(false);
      return;
    }

    const result = await addLeadsBulk(leadsToImport);
    setIsUploading(false);
    
    setImportResult({
      successCount: result.successCount || 0,
      failCount: (result.failCount || 0) + (importData.summary.invalid),
      errors: [
        ...(result.errors || []).map(e => ({ row: e.row, message: e.message })),
        ...importData.rows
          .map((r, idx) => ({ row: idx + 1, valid: r.isValid, errors: r.errors }))
          .filter(r => !r.valid)
          .map(r => ({ row: r.row, message: `Local validation: ${r.errors.join(', ')}` }))
      ]
    });
    setImportData(null);
    setShowImportSummary(true);
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
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => setShowImportZone(!showImportZone)} 
              className={`btn-primary ${showImportZone ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: showImportZone ? '#2563eb' : '#475569' }}
            >
              <FiUpload /> {showImportZone ? 'Hide Import' : 'Import Leads'}
            </button>
            <button 
              onClick={() => navigate('/leads/new')} 
              className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <FiPlus /> Add Lead
            </button>
          </div>
        </div>

        {showImportZone && (
          <div 
            className={`import-dropzone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-import-input').click()}
            style={{
              border: isDragging ? '2px dashed #2563eb' : '2px dashed #cbd5e1',
              backgroundColor: isDragging ? '#eff6ff' : '#f8fafc',
              borderRadius: '8px',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: '1.5rem',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <FiUpload size={32} style={{ color: isDragging ? '#2563eb' : '#64748b' }} />
            <div style={{ fontWeight: '500', fontSize: '1rem', color: '#1e293b' }}>
              Drag & drop your CSV or Excel file here
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Supports .csv, .tsv, .xlsx, or .xls files
            </div>
            <div style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: '500', marginTop: '0.25rem' }}>
              or click to browse files
            </div>
            <input 
              id="file-import-input"
              type="file" 
              accept=".csv,.tsv,.xlsx,.xls" 
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) processFile(file);
                e.target.value = null;
              }} 
              style={{ display: 'none' }} 
            />
          </div>
        )}
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
                        onClick={() => navigate(`/leads/${lead._id || lead.id}`)}
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





      {/* Import Preview Modal */}
      {importData && (
        <div className="modal-overlay" onClick={() => setImportData(null)}>
          <div className="modal-content-premium" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header-premium">
              <div className="header-title">
                <h2>Import Preview: {importData.filename}</h2>
                <p>Verify your lead list before importing to the system.</p>
              </div>
              <button className="close-btn" onClick={() => setImportData(null)}><FiX size={24} /></button>
            </div>
            
            <div className="modal-body-premium">
              {/* Summary Stats */}
              <div className="stats-grid-premium" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="stat-card-premium" style={{ padding: '0.75rem' }}>
                  <div className="stat-info">
                    <span className="stat-label">Total Leads Found</span>
                    <h3 className="stat-value" style={{ margin: 0 }}>{importData.summary.total}</h3>
                  </div>
                </div>
                <div className="stat-card-premium" style={{ padding: '0.75rem', borderLeft: '4px solid #10b981' }}>
                  <div className="stat-info">
                    <span className="stat-label" style={{ color: '#10b981' }}>Valid (Will Import)</span>
                    <h3 className="stat-value" style={{ margin: 0, color: '#10b981' }}>{importData.summary.valid}</h3>
                  </div>
                </div>
                <div className="stat-card-premium" style={{ padding: '0.75rem', borderLeft: '4px solid #ef4444' }}>
                  <div className="stat-info">
                    <span className="stat-label" style={{ color: '#ef4444' }}>Errors (Will Skip)</span>
                    <h3 className="stat-value" style={{ margin: 0, color: '#ef4444' }}>{importData.summary.invalid}</h3>
                  </div>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="detail-section">
                <h4>Preview (First 5 Rows)</h4>
                <div className="table-container" style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <table className="premium-table" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Category</th>
                        <th>Grade</th>
                        <th>Program</th>
                        <th>Errors / Warnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importData.rows.slice(0, 5).map((row, idx) => (
                        <tr key={idx} style={{ backgroundColor: row.isValid ? 'inherit' : '#fff5f5' }}>
                          <td>
                            {row.isValid ? (
                              <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Valid</span>
                            ) : (
                              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>✗ Error</span>
                            )}
                          </td>
                          <td>{row.data.name || <em style={{ color: '#a0aec0' }}>missing</em>}</td>
                          <td>{row.data.email || <em style={{ color: '#a0aec0' }}>missing</em>}</td>
                          <td>{row.data.phone || <em style={{ color: '#a0aec0' }}>missing</em>}</td>
                          <td>{row.data.category || <em style={{ color: '#a0aec0' }}>n/a</em>}</td>
                          <td>{row.data.grade || <em style={{ color: '#a0aec0' }}>n/a</em>}</td>
                          <td>{row.data.selectedProgram || <em style={{ color: '#a0aec0' }}>n/a</em>}</td>
                          <td style={{ color: '#ef4444', fontSize: '0.8rem' }}>
                            {row.errors.join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {importData.rows.length > 5 && (
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', textAlign: 'right' }}>
                    Showing 5 of {importData.rows.length} rows
                  </p>
                )}
              </div>
            </div>

            <div className="modal-footer-premium">
              <button className="btn-cancel" onClick={() => setImportData(null)}>Cancel</button>
              <button 
                className="btn-primary" 
                onClick={handleConfirmImport}
                disabled={isUploading || importData.summary.valid === 0}
              >
                {isUploading ? 'Importing...' : `Import ${importData.summary.valid} Valid Leads`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Summary / Result Modal */}
      {showImportSummary && importResult && (
        <div className="modal-overlay" onClick={() => setShowImportSummary(false)}>
          <div className="modal-content-premium" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header-premium">
              <div className="header-title">
                <h2>Import Results</h2>
                <p>Import operation completed.</p>
              </div>
              <button className="close-btn" onClick={() => setShowImportSummary(false)}><FiX size={24} /></button>
            </div>
            
            <div className="modal-body-premium">
              <div className="stats-grid-premium" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="stat-card-premium" style={{ padding: '0.75rem', borderLeft: '4px solid #10b981' }}>
                  <div className="stat-info">
                    <span className="stat-label" style={{ color: '#10b981' }}>Successfully Saved</span>
                    <h3 className="stat-value" style={{ margin: 0, color: '#10b981' }}>{importResult.successCount}</h3>
                  </div>
                </div>
                <div className="stat-card-premium" style={{ padding: '0.75rem', borderLeft: '4px solid #ef4444' }}>
                  <div className="stat-info">
                    <span className="stat-label" style={{ color: '#ef4444' }}>Failed / Skipped</span>
                    <h3 className="stat-value" style={{ margin: 0, color: '#ef4444' }}>{importResult.failCount}</h3>
                  </div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="detail-section">
                  <h4>Errors & Validation Details</h4>
                  <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.5rem' }}>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#475569' }}>
                      {importResult.errors.map((err, idx) => (
                        <li key={idx} style={{ marginBottom: '0.4rem' }}>
                          <strong>Row {err.row}:</strong> <span style={{ color: '#ef4444' }}>{err.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer-premium">
              <button className="btn-primary" onClick={() => setShowImportSummary(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
