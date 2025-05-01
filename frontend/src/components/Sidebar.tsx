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
  FiMonitor,
  FiUsers,
} from "react-icons/fi"
import styles from "../styles/Sidebar.module.css"

// ملاحظة: في الـ layout الرئيسي، أضف <Sidebar /> و <BottomNavBar /> معاً.
// Sidebar يظهر فقط على الشاشات الكبيرة، وBottomNavBar يظهر فقط على الشاشات الصغيرة (راجع CSS).

interface NavItem {
  name: string
  icon: any
  href: string
}

function getNavItems(): NavItem[] {
  return [
    { name: "Home", icon: FiHome, href: "/" },
    { name: "Orders", icon: FiList, href: "/orders" },
    { name: "Menu", icon: FiBookOpen, href: "/menu" },
    { name: "Menu Management", icon: FiClipboard, href: "/menu-management" },
    { name: "Inventory", icon: FiBox, href: "/Inventory" },
    { name: "KDS", icon: FiMonitor, href: `/kds/` },
    { name: "Invite Employee", icon: FiClipboard, href: "/invite-employee" },
    { name: "Employees", icon: FiUsers, href: "/employees" },
    { name: "About", icon: FiInfo, href: "/about" },
  ];
}

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
          {getNavItems().map((item) => (
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
