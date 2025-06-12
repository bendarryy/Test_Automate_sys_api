import React from 'react';
import { Navigate } from 'react-router-dom';
import useHasPermission from 'shared/hooks/useHasPermission';

interface ProtectedRouteProps {
  permission: string | string[];
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ permission, children }) => {
  const hasPermission = useHasPermission(permission);

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
