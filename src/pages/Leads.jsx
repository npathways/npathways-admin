import React from 'react';
import './Pages.css';

const Leads = () => {
  const leads = [
    { id: 1, name: 'Alice Wong', interest: 'Global Bootcamp', date: '2024-05-08', source: 'Contact Form' },
    { id: 2, name: 'Bob Harris', interest: 'Career Assessment', date: '2024-05-07', source: 'Pop-up' },
    { id: 3, name: 'Charlie Davis', interest: 'Visa Assistance', date: '2024-05-06', source: 'Direct' },
    { id: 4, name: 'Diana Prince', interest: 'Parent Counseling', date: '2024-05-05', source: 'Referral' },
  ];

  return (
    <div className="leads-page">
      <div className="page-header">
        <h1>Lead Management</h1>
        <p>Track and convert inquiries from the Npathways website.</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Lead Name</th>
                <th>Interest</th>
                <th>Date</th>
                <th>Source</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td><strong>{lead.name}</strong></td>
                  <td>{lead.interest}</td>
                  <td>{lead.date}</td>
                  <td>{lead.source}</td>
                  <td>
                    <button className="btn-small">Follow Up</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leads;
