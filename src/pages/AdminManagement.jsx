import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import Modal from '../Components/Common/Modal';
import { useToast } from '../Components/Common/Toast';
import './Pages.css';

const AdminManagement = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Forms state
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [editingUser, setEditingUser] = useState({ id: '', name: '', email: '', role: 'admin', password: '' });
  const [deletingUser, setDeletingUser] = useState(null);

  // Check if current user is admin
  const adminUserJson = localStorage.getItem('adminUser');
  const currentUser = adminUserJson ? JSON.parse(adminUserJson) : null;
  const isSuperAdmin = currentUser?.role === 'admin';

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';
  const token = localStorage.getItem('adminToken');

  const fetchUsers = async () => {
    if (!isSuperAdmin) return;
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        addToast('Failed to fetch admin users', 'error');
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
      addToast('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      addToast('Please fill in all fields', 'error');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });
      const data = await response.json();
      if (response.ok) {
        addToast('User created successfully', 'success');
        setIsAddModalOpen(false);
        setNewUser({ name: '', email: '', password: '', role: 'admin' });
        fetchUsers();
      } else {
        addToast(data.message || 'Failed to create user', 'error');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      addToast('Error connecting to server', 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser.name || !editingUser.email) {
      addToast('Name and Email are required', 'error');
      return;
    }

    try {
      const updatePayload = {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role
      };
      if (editingUser.password && editingUser.password.trim() !== '') {
        updatePayload.password = editingUser.password;
      }

      const response = await fetch(`${baseUrl}/auth/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatePayload)
      });
      const data = await response.json();
      if (response.ok) {
        addToast('User updated successfully', 'success');
        setIsEditModalOpen(false);
        fetchUsers();
      } else {
        addToast(data.message || 'Failed to update user', 'error');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      addToast('Error connecting to server', 'error');
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingUser) return;
    try {
      const response = await fetch(`${baseUrl}/auth/users/${deletingUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        addToast('User deleted successfully', 'success');
        setIsDeleteModalOpen(false);
        setDeletingUser(null);
        fetchUsers();
      } else {
        addToast(data.message || 'Failed to delete user', 'error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      addToast('Error connecting to server', 'error');
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="content-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '24px', borderRadius: '12px', maxWidth: '500px' }}>
          <ShieldAlert size={48} style={{ marginBottom: '16px' }} />
          <h2>Access Denied</h2>
          <p style={{ marginTop: '8px', color: 'var(--color-text-secondary)' }}>
            You do not have the required permissions to view this page. Access is restricted to Super Administrators only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Access Control</h1>
          <p>Manage admin and staff portal access to the dashboard.</p>
        </div>
        <button 
          className="btn-small" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--color-brand-primary, #0f172a)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={18} />
          <span>Add Admin / Staff</span>
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>Loading administrators...</div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>No administrator accounts found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={18} style={{ color: user.role === 'admin' ? '#3b82f6' : '#10b981' }} />
                        <strong>{user.name}</strong>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role}`} style={{ 
                        textTransform: 'uppercase', 
                        fontSize: '0.75rem', 
                        fontWeight: '600',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: user.role === 'admin' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: user.role === 'admin' ? '#3b82f6' : '#10b981'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button 
                          className="btn-small btn-outline" 
                          onClick={() => {
                            setEditingUser({ id: user.id, name: user.name, email: user.email, role: user.role, password: '' });
                            setIsEditModalOpen(true);
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '0.8rem', background: '#fff', border: '1px solid var(--color-gray-300)', color: 'var(--color-text-primary)', cursor: 'pointer', borderRadius: '6px' }}
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                        <button 
                          className="btn-small" 
                          onClick={() => {
                            setDeletingUser(user);
                            setIsDeleteModalOpen(true);
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', cursor: 'pointer', borderRadius: '6px' }}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Admin / Staff User">
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Name</label>
            <input 
              type="text" 
              placeholder="Full Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-gray-300)' }}
              required 
            />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Email Address</label>
            <input 
              type="email" 
              placeholder="name@npathways.com"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-gray-300)' }}
              required 
            />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-gray-300)' }}
              required 
            />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Role</label>
            <select 
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-gray-300)', background: '#fff' }}
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-small btn-outline" onClick={() => setIsAddModalOpen(false)} style={{ padding: '8px 16px', background: '#fff', border: '1px solid var(--color-gray-300)', cursor: 'pointer', borderRadius: '6px' }}>
              Cancel
            </button>
            <button type="submit" className="btn-small" style={{ padding: '8px 16px', background: 'var(--color-brand-primary, #0f172a)', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '6px' }}>
              Add Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Admin / Staff User">
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Name</label>
            <input 
              type="text" 
              value={editingUser.name}
              onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-gray-300)' }}
              required 
            />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Email Address</label>
            <input 
              type="email" 
              value={editingUser.email}
              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-gray-300)' }}
              required 
            />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>New Password (leave blank to keep current)</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={editingUser.password}
              onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-gray-300)' }}
            />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Role</label>
            <select 
              value={editingUser.role}
              onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-gray-300)', background: '#fff' }}
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-small btn-outline" onClick={() => setIsEditModalOpen(false)} style={{ padding: '8px 16px', background: '#fff', border: '1px solid var(--color-gray-300)', cursor: 'pointer', borderRadius: '6px' }}>
              Cancel
            </button>
            <button type="submit" className="btn-small" style={{ padding: '8px 16px', background: 'var(--color-brand-primary, #0f172a)', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '6px' }}>
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Admin / Staff User">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
            Are you sure you want to delete the user <strong>{deletingUser?.name}</strong> (<em>{deletingUser?.email}</em>)?
          </p>
          <p style={{ fontSize: '0.85rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
            Warning: This action is permanent and will instantly revoke their access to the admin dashboard.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-small btn-outline" onClick={() => setIsDeleteModalOpen(false)} style={{ padding: '8px 16px', background: '#fff', border: '1px solid var(--color-gray-300)', cursor: 'pointer', borderRadius: '6px' }}>
              Cancel
            </button>
            <button type="button" className="btn-small" onClick={handleDeleteSubmit} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '6px' }}>
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminManagement;
