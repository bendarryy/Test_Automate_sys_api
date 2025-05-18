import { Navigate, Outlet } from "react-router-dom"
import Navbar from "./components/Navbar"
import { Sidebar } from "./components/Sidebar"
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPermissions } from './store/permissionsSlice';
import { RootState } from './store';
import { useApi } from './hooks/useApi';

const Layout = () => {
  const dispatch = useDispatch();
  const loaded = useSelector((state: RootState) => state.permissions.loaded);
  const { loading, callApi } = useApi();

  useEffect(() => {
    if (!loaded) {
      callApi('get', '/core/profile/').then((data) => {
        dispatch(setPermissions(data?.actions || []));
      }).catch(() => {
        dispatch(setPermissions([]));
      });
    }
    // eslint-disable-next-line
  }, [dispatch, loaded]);

  const systemId = localStorage.getItem('selectedSystemId');
  if (!systemId) {
    return <Navigate to="/systems" replace />;
  }
  if (!loaded || loading) return null;

  return (
    <>
      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        <Sidebar />
        <div style={{ flex: 1, height: '100vh', overflow: 'hidden', position: 'relative' }}>
          <Navbar />
          <main style={{ height: 'calc(100vh - 64px)', overflow: 'auto', background: 'white' }}>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}

export default Layout