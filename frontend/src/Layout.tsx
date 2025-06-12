import { Navigate, Outlet } from "react-router-dom";
import Navbar from "./shared/componanets/Navbar";
import { Sidebar } from "./shared/componanets/Sidebar";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPermissions } from "./store/permissionsSlice";
import { setProfile, Profile } from "./store/profileSlice";
import { RootState } from "./store";
import { useApi } from "shared/hooks/useApi";
import { useSelectedSystemId } from "shared/hooks/useSelectedSystemId";


const Layout = () => {
  const dispatch = useDispatch();
  const loaded = useSelector((state: RootState) => state.permissions.loaded);
  const profile = useSelector((state: RootState) => state.profile.profile);
  const { loading, callApi } = useApi();
  const [
    selectedSystemId,
    setSelectedSystemId,
    selectedCategory,
    setSelectedCategory
  ] = useSelectedSystemId();

  useEffect(() => {
    if (!profile) {
      (async () => {
        try {
          const data = await callApi("get", "/core/profile/") as Profile;
          dispatch(setProfile(data));
          dispatch(setPermissions(data?.actions || []));

          // Store system info using Redux (was localStorage)
          if (data?.systems) {
            const isOwnerLogin =
              localStorage.getItem("loginViaOwner") === "true";
            localStorage.removeItem("loginViaOwner");
            if (!isOwnerLogin) {
              // For non-owners, only store if not already set
              if (data.role !== "owner") {
                if (!selectedSystemId) {
                  const systemId = Array.isArray(data.systems) ? data.systems[0]?.id : data.systems;
                  if (systemId) setSelectedSystemId(String(systemId));
                }
                if (!selectedCategory) {
                  const systemCategory = Array.isArray(data.systems) ? data.systems[0]?.category : undefined;
                  if (systemCategory) setSelectedCategory(systemCategory);
                }
              }
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
  }, [dispatch, loaded, profile, selectedSystemId, setSelectedSystemId, selectedCategory, setSelectedCategory]);

  // Use Redux value instead of localStorage
  const systemId = selectedSystemId;
  if (profile?.role === "owner" && !systemId) {
    return <Navigate to="/systems" replace />;
  }
  if (!loaded || loading) return null;

  return (
    <>
      <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
        <Sidebar />
        <div
          style={{
            flex: 1,
            height: "100vh",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Navbar />
          <main
            style={{
              height: "calc(100vh - 64px)",
              overflow: "auto",
            }}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;
