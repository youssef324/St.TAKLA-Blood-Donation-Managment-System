'use client';
import { useState, useEffect } from 'react';
import AnimatedPage from '@/components/ui/AnimatedPage';
import Sidebar from '@/components/ui/Sidebar';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { motion } from 'framer-motion';
import { useToast } from '@/context/ToastContext';
import { ROLES, ROLE_NAMES } from '@/utils/constants';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 0,
  });
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('User created successfully!');
      setShowAddModal(false);
      setFormData({ username: '', password: '', role: 0 });
      fetchUsers();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Keep empty for security
      role: user.role,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: editingUser.user_id,
          role: formData.role,
          password: formData.password || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');

      toast.success('User updated successfully!');
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, is_active: !currentStatus }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');

      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[2]}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <AnimatedPage className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                <p className="text-gray-600 mt-2">Manage system users and permissions</p>
              </div>
              <Button onClick={() => {
                setFormData({ username: '', password: '', role: 0 });
                setShowAddModal(true);
              }}>Add User</Button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left p-4 font-semibold text-gray-600">Username</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Role</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Last Login</th>
                      <th className="text-right p-4 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <motion.tr
                        key={user.user_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b hover:bg-red-50/30 transition-colors"
                      >
                        <td className="p-4 font-medium text-gray-800">{user.username}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            user.role === 2 ? 'bg-red-100 text-red-700' :
                            user.role === 1 ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {ROLE_NAMES[user.role]}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-500">
                          {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => handleEditClick(user)}
                          >
                            ✏️ Edit
                          </Button>
                          <Button
                            variant={user.is_active ? 'danger' : 'success'}
                            size="small"
                            onClick={() => toggleUserStatus(user.user_id, user.is_active)}
                          >
                            {user.is_active ? 'Disable' : 'Enable'}
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Add Modal */}
            <Modal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              title="Create New User"
            >
              <form onSubmit={handleCreateUser} className="space-y-4">
                <Input
                  label="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <Select
                  label="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: parseInt(e.target.value) })}
                  options={[
                    { value: 0, label: 'User (Standard)' },
                    { value: 1, label: 'Super User (Staff)' },
                    { value: 2, label: 'Admin (System)' },
                  ]}
                  required
                />
                <Button type="submit" className="w-full mt-6">
                  ✨ Create Account
                </Button>
              </form>
            </Modal>

            {/* Edit Modal */}
            <Modal
              isOpen={showEditModal}
              onClose={() => setShowEditModal(false)}
              title={`Edit User: ${editingUser?.username}`}
            >
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <Input
                  label="Username"
                  value={formData.username}
                  disabled
                  helperText="Username cannot be changed"
                />
                <Select
                  label="Change Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: parseInt(e.target.value) })}
                  options={[
                    { value: 0, label: 'User (Standard)' },
                    { value: 1, label: 'Super User (Staff)' },
                    { value: 2, label: 'Admin (System)' },
                  ]}
                />
                <Input
                  label="Reset Password"
                  type="password"
                  placeholder="Leave empty to keep current password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <Button type="submit" className="w-full mt-6">
                  💾 Save Changes
                </Button>
              </form>
            </Modal>
          </AnimatedPage>
        </div>
      </div>
    </ProtectedRoute>
  );
}