import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from '@docusaurus/router';
import { useAuth } from '../contexts/AuthContext';
import { validateInvitation } from '../services/invitationService';
import styles from '../components/Login.module.css';

export default function SignupPage() {
  const location = useLocation();
  const history = useHistory();
  const { signup } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const inviteToken = params.get('token');
    const inviteEmail = params.get('email');

    if (!inviteToken) {
      setValidationError('No invitation token provided. Please use the invitation link sent to your email.');
      setLoading(false);
      return;
    }

    setToken(inviteToken);
    if (inviteEmail) {
      setEmail(decodeURIComponent(inviteEmail));
    }

    // Validate invitation
    validateInvitation(inviteToken).then((invitation) => {
      if (!invitation) {
        setValidationError('This invitation link is invalid or has expired.');
      } else {
        setRole(invitation.role);
      }
      setLoading(false);
    }).catch(() => {
      setValidationError('Failed to validate invitation.');
      setLoading(false);
    });
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setError('');
      setSubmitting(true);
      await signup(email, password, token);
      // Redirect to home after successful signup
      history.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <p style={{ textAlign: 'center' }}>Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h2>Invalid Invitation</h2>
          <div className={styles.error}>{validationError}</div>
          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            Please contact an administrator for a valid invitation link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2>Create Your Account</h2>
        <p className={styles.subtitle}>You've been invited as a <strong>{role}</strong></p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitting}
              readOnly
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={submitting}
              minLength={6}
              placeholder="At least 6 characters"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={submitting}
              minLength={6}
              placeholder="Re-enter your password"
            />
          </div>

          <button type="submit" disabled={submitting} className={styles.submitButton}>
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className={styles.info}>
          Already have an account? <a href="/">Sign in here</a>
        </p>
      </div>
    </div>
  );
}
