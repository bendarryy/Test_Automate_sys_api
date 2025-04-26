import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';

// This assumes that successful login sets some identifiable value in `data` (e.g., a token or user object)
// You may need to adapt this logic if your login state is managed elsewhere (e.g., context, localStorage, etc.)

interface ProtectLoginProps {
  children: ReactNode;
}

const ProtectLogin = (props: ProtectLoginProps) => {
  const { children } = props;
  const { isAuthenticated } = useLogin();
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectLogin;