import { Navigate, Outlet } from "react-router-dom"
import Navbar from "./components/Navbar"
import { Sidebar } from "./components/Sidebar"
import BottomNavBar from "./components/BottomNavBar"





const Layout = () => {
  const systemId = localStorage.getItem('selectedSystemId');
  if (!systemId) {
    return <Navigate to="/systems" replace />;
  }
  else{
    return (
    
    <>
      
      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        <Sidebar />
        <div style={{ flex: 1, height: '100vh', overflow: 'hidden', position: 'relative' }}>
          <Navbar />
          <main style={{ height: 'calc(100vh - 64px)', overflow: 'auto', background: 'white' }}>
            <Outlet />
          </main>
          <BottomNavBar />
        </div>
      </div>
    </>
  )
  }
}
export default Layout