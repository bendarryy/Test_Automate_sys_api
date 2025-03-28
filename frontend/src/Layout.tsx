import { Outlet } from "react-router-dom"
import Navbar from "./components/Navbar"

const Layout = () => {
  return (
    <div>
      <Navbar title="Restaurant App" />
      <main style={{ height: "calc(100vh - 64px)" }}>
        <Outlet />
      </main>
      
    </div>
  )
}

export default Layout
