import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiHome,
  FiList,
  FiBookOpen,
  FiSettings,
  FiMoreHorizontal,
  FiClipboard,
  FiBox,
  FiMonitor,
  FiUsers,
  FiInfo,
} from "react-icons/fi";
import styles from "../styles/BottomNavBar.module.css";

const mainNavItems = [
  { name: "Home", icon: FiHome, href: "/" },
  { name: "Orders", icon: FiList, href: "/orders" },
  { name: "Menu", icon: FiBookOpen, href: "/menu" },
  { name: "Settings", icon: FiSettings, href: "/settings" },
];

const otherNavItems = [
  { name: "Menu Management", icon: FiClipboard, href: "/menu-management" },
  { name: "Inventory", icon: FiBox, href: "/Inventory" },
  { name: "KDS", icon: FiMonitor, href: `/kds/` },
  { name: "Invite Employee", icon: FiClipboard, href: "/invite-employee" },
  { name: "Employees", icon: FiUsers, href: "/employees" },
  { name: "About", icon: FiInfo, href: "/about" },
];

export default function BottomNavBar() {
  const location = useLocation();
  const [showOther, setShowOther] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowOther(false);
      }
    }
    if (showOther) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOther]);

  return (
    <nav className={styles.bottomNavBar}>
      {mainNavItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          className={({ isActive }) =>
            styles.navItem + (isActive || location.pathname === item.href ? ` ${styles.active}` : "")
          }
          end={item.href === "/"}
        >
          <item.icon className={styles.icon} />
          <span className={styles.label}>{item.name}</span>
        </NavLink>
      ))}
      <button
        className={styles.navItem + " " + styles.otherButton}
        onClick={() => setShowOther((v) => !v)}
        aria-label="Other"
        type="button"
      >
        <FiMoreHorizontal className={styles.icon} />
        <span className={styles.label}>Other</span>
      </button>
      {showOther && (
        <div className={styles.otherMenu} ref={menuRef}>
          {otherNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                styles.otherMenuItem + (isActive || location.pathname === item.href ? ` ${styles.active}` : "")
              }
              onClick={() => setShowOther(false)}
            >
              <item.icon className={styles.icon} />
              <span className={styles.label}>{item.name}</span>
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
