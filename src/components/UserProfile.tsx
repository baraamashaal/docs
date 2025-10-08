import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_PERMISSIONS } from '../types/user';
import styles from './UserProfile.module.css';

const UserProfile: React.FC = () => {
  const { currentUser, userData, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (!currentUser) return null;

  const canManageUsers = userData && ROLE_PERMISSIONS[userData.role].canManageUsers;

  return (
    <div className={styles.userProfile}>
      <span className={styles.userEmail}>{currentUser.email}</span>
      <span className={styles.userRole}>({userData?.role})</span>
      {canManageUsers && (
        <a href="/admin/users" className={styles.adminLink}>
          Admin
        </a>
      )}
      <button onClick={handleLogout} className={styles.logoutButton}>
        Logout
      </button>
    </div>
  );
};

export default UserProfile;
