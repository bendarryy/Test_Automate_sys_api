import { Navigate, Outlet } from "react-router-dom"
import Navbar from "./components/Navbar"
import { Sidebar } from "./components/Sidebar"
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPermissions } from './store/permissionsSlice';
import { setProfile } from './store/profileSlice';
import { RootState } from './store';
import { useApi } from './hooks/useApi';

const Layout = () => {
  const dispatch = useDispatch();
  const loaded = useSelector((state: RootState) => state.permissions.loaded);
  const profile = useSelector((state: RootState) => state.profile.profile);
  const { loading, callApi } = useApi();

  useEffect(() => {
    if (!profile) {
      (async () => {
        try {
          const data = await callApi('get', '/core/profile/');
          dispatch(setProfile(data));
          dispatch(setPermissions(data?.actions || []));
          
          // Store system info in localStorage
          if (data?.systems) {
            const isOwnerLogin = localStorage.getItem('loginViaOwner') === 'true';
            localStorage.removeItem('loginViaOwner');

            // For non-owners, only store if localStorage is empty
            if (data.role !== 'owner') {
              if (!localStorage.getItem('selectedSystemId')) {
                localStorage.setItem('selectedSystemId', data.systems.id);
              }
              if (!localStorage.getItem('selectedSystemCategory')) {
                localStorage.setItem('selectedSystemCategory', data.systems.category);
              }
            } else if (!isOwnerLogin) {
              // Always store for owners unless logging in via owner login
              localStorage.setItem('selectedSystemId', data.systems.id);
              localStorage.setItem('selectedSystemCategory', data.systems.category);
            }
          }
        } catch {
          dispatch(setProfile(null));
          dispatch(setPermissions([]));
        }
      })();
    } else if (!loaded) {
      // profile موجود لكن لم يتم تحميل الصلاحيات بعد
      dispatch(setPermissions(profile.actions || []));
    }
    // eslint-disable-next-line
  }, [dispatch, loaded, profile]);

  const systemId = localStorage.getItem('selectedSystemId');
  if (profile?.role === 'owner' && !systemId) {
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