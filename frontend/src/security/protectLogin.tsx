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
  const { data } = useLogin();
  const location = useLocation();

  // Example: if data contains user info or token, consider logged in
  const isLoggedIn = Boolean(data);

  if (!isLoggedIn) {
     return (<Navigate to="/login" state={{ from: location }} replace />);
  }

  return <>{children}</>;
};

export default ProtectLogin;