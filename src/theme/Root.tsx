import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import PrivateRoute from '../components/PrivateRoute';

// Wrapping your site with an authentication provider
export default function Root({ children }) {
  return (
    <AuthProvider>
      <PrivateRoute>
        {children}
      </PrivateRoute>
    </AuthProvider>
  );
}
