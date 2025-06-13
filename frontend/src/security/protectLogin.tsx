import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApi } from '../shared/hooks/useApi';
import Loading from '../shared/componanets/Loading';

// This assumes that successful login sets some identifiable value in `data` (e.g., a token or user object)
// You may need to adapt this logic if your login state is managed elsewhere (e.g., context, localStorage, etc.)

interface ProtectLoginProps {
  children: ReactNode;
}

const ProtectLogin = (props: ProtectLoginProps) => {
  const { children } = props;
  const location = useLocation();
  const { callApi, loading, error } = useApi();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await callApi('get', '/core/check-auth/'); // Adjust the endpoint as needed
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuth();
  }, [callApi]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Navigate to="/ownerLogin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectLogin;