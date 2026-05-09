import React from 'react';
import './Pages.css';

const Content = () => {
  const sections = [
    { id: 1, title: 'Summer Bootcamp 2024', type: 'Product', lastUpdated: '2024-05-01' },
    { id: 2, title: 'Career Guidance Page', type: 'Service', lastUpdated: '2024-04-28' },
    { id: 3, title: 'About Us - Story', type: 'Public Page', lastUpdated: '2024-05-05' },
    { id: 4, title: 'Testimonials', type: 'Dynamic Section', lastUpdated: '2024-05-09' },
  ];

  return (
    <div className="content-page">
      <div className="page-header">
        <h1>Content Management</h1>
        <p>Update website copy, images, and product offerings.</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Content Title</th>
                <th>Type</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <tr key={section.id}>
                  <td><strong>{section.title}</strong></td>
                  <td>{section.type}</td>
                  <td>{section.lastUpdated}</td>
                  <td>
                    <button className="btn-small">Edit Content</button>
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

export default Content;
