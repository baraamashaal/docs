import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();

  return currentUser ? <>{children}</> : <Login />;
};

export default PrivateRoute;
