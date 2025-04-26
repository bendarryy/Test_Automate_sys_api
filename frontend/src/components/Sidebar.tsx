import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  FiHome,
  FiList,
  FiBookOpen,
  FiBox,
  FiClipboard,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiInfo,
} from "react-icons/fi"
import styles from "../styles/Sidebar.module.css"

interface NavItem {
  name: string
  icon: any
  href: string
}

const navItems: NavItem[] = [
  { name: "Home", icon: FiHome, href: "/" },
  { name: "Orders", icon: FiList, href: "/orders" },
  { name: "Menu", icon: FiBookOpen, href: "/menu" },
  { name: "Menu Management", icon: FiClipboard, href: "/menu-management" },
  { name: "Inventory", icon: FiBox, href: "/Inventory" },
  { name: "About", icon: FiInfo, href: "/about" },
]

export function Sidebar({ defaultIconsOnly = false, className = "" }: { defaultIconsOnly?: boolean, className?: string }) {
  const [iconsOnly, setIconsOnly] = useState(defaultIconsOnly)
  const location = useLocation()

  const toggleSidebar = () => {
    setIconsOnly(!iconsOnly)
  }

  return (
    <aside className={styles.sidebar + ` ${styles['creative-sidebar']} ${iconsOnly ? "icons-only" : "expanded"} ${className}`}>
      <div className={styles['sidebar-header']}>
        <div className={styles['brand']}>
          <div className={styles['logo']}>
            <span>RA</span>
          </div>
          <span className={styles['brand-name']}>Restaurant App</span>
        </div>
        <button className={styles['toggle-button']} onClick={toggleSidebar}>
          {iconsOnly ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      <div className={styles['sidebar-content']}>
        <ul className={styles['nav-menu']}>
          {navItems.map((item) => (
            <li key={item.name} className={styles['nav-item'] + (location.pathname == item.href ? ` ${styles['active']}` : "") }>
              <NavLink to={item.href} className={styles['nav-link']} title={iconsOnly ? item.name : ""} end={item.href === "/"}>
                <span className={styles['icon']}>
                  <item.icon />
                </span>
                <span className={styles['label']}>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles['sidebar-footer']}>
        <ul className={styles['nav-menu']}>
          <li className={styles['nav-item']}>
            <NavLink to="/settings" className={styles['nav-link']} title={iconsOnly ? "Settings" : ""}>
              <span className={styles['icon']}>
                <FiSettings />
              </span>
              <span className={styles['label']}>Settings</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </aside>
  )
}
