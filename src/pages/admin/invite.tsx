import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { createInvitation } from '../../services/invitationService';
import { UserRole } from '../../types/user';
import styles from './invite.module.css';

export default function InvitePage() {
  const { userData } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [invitationLink, setInvitationLink] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setInvitationLink('');
    setLoading(true);

    try {
      const token = await createInvitation(email, role, userData.uid);

      // Generate invitation link
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/signup?token=${token}&email=${encodeURIComponent(email)}`;

      setInvitationLink(link);
      setSuccess(`Invitation created successfully! Send this link to ${email}`);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationLink);
    alert('Invitation link copied to clipboard!');
  };

  return (
    <Layout title="Invite Users">
      <div className={styles.container}>
        <h1>Invite New User</h1>

        <div className={styles.inviteBox}>
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="user@example.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                disabled={loading}
              >
                <option value="viewer">Viewer (Read Only)</option>
                <option value="editor">Editor (Can Edit)</option>
                <option value="admin">Admin (Full Access)</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Creating Invitation...' : 'Send Invitation'}
            </button>
          </form>

          {invitationLink && (
            <div className={styles.linkContainer}>
              <label>Invitation Link (valid for 7 days):</label>
              <div className={styles.linkBox}>
                <input
                  type="text"
                  value={invitationLink}
                  readOnly
                  className={styles.linkInput}
                />
                <button onClick={copyToClipboard} className={styles.copyButton}>
                  Copy
                </button>
              </div>
              <p className={styles.note}>
                Send this link to the invited user. They can use it to create their account.
              </p>
            </div>
          )}
        </div>

        <div className={styles.roleInfo}>
          <h3>Role Permissions</h3>
          <ul>
            <li><strong>Viewer:</strong> Can only view documentation</li>
            <li><strong>Editor:</strong> Can view and edit documentation</li>
            <li><strong>Admin:</strong> Full access including user management and invitations</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
