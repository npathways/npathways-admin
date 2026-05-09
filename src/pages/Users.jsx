import React from 'react';
import './Pages.css';

const Users = () => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Student', status: 'Active' },
    { id: 2, name: 'Sarah Smith', email: 'sarah@example.com', role: 'Parent', status: 'Inactive' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Admin', status: 'Active' },
    { id: 4, name: 'Elena Rossi', email: 'elena@example.com', role: 'Mentor', status: 'Active' },
  ];

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage access levels and profiles for all Npathways users.</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`badge ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-small">Edit</button>
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

export default Users;
