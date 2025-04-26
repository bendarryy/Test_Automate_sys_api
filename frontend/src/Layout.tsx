import { Outlet } from "react-router-dom"
import Navbar from "./components/Navbar"
import { Sidebar } from "./components/Sidebar"


const Layout = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <Sidebar />
      <div style={{ flex: 1, height: '100vh', overflow: 'hidden' }}>
        <Navbar title="Restaurant App" />
        <main style={{ height: 'calc(100vh - 64px)', overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
export default Layout