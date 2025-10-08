import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUsers, updateUserRole, deleteUser } from '../../services/userService';
import { UserData, UserRole } from '../../types/user';
import styles from './users.module.css';

export default function UsersPage() {
  const { userData } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is admin
  if (!userData || userData.role !== 'admin') {
    return (
      <Layout title="Access Denied">
        <div className={styles.container}>
          <h1>Access Denied</h1>
          <p>You do not have permission to access this page.</p>
        </div>
      </Layout>
    );
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    try {
      await updateUserRole(uid, newRole);
      await loadUsers();
      alert('User role updated successfully!');
    } catch (err: any) {
      alert(`Failed to update role: ${err.message}`);
    }
  };

  const handleDeleteUser = async (uid: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteUser(uid);
      await loadUsers();
      alert('User deleted successfully!');
    } catch (err: any) {
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout title="Manage Users">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Manage Users</h1>
          <a href="/admin/invite" className={styles.inviteButton}>
            + Invite New User
          </a>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <div className={styles.loading}>Loading users...</div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.usersTable}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Last Login</th>
                  <th>Invited By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.uid}>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                        className={styles.roleSelect}
                        disabled={user.uid === userData.uid}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{formatDate(user.lastLogin)}</td>
                    <td>{user.invitedBy || 'N/A'}</td>
                    <td>
                      {user.uid !== userData.uid && (
                        <button
                          onClick={() => handleDeleteUser(user.uid, user.email)}
                          className={styles.deleteButton}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className={styles.noUsers}>
                No users found. Start by inviting users.
              </div>
            )}
          </div>
        )}

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <h3>{users.length}</h3>
            <p>Total Users</p>
          </div>
          <div className={styles.statCard}>
            <h3>{users.filter((u) => u.role === 'admin').length}</h3>
            <p>Admins</p>
          </div>
          <div className={styles.statCard}>
            <h3>{users.filter((u) => u.role === 'editor').length}</h3>
            <p>Editors</p>
          </div>
          <div className={styles.statCard}>
            <h3>{users.filter((u) => u.role === 'viewer').length}</h3>
            <p>Viewers</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
