import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  RiHome4Line,
  RiListCheck,
  RiBookOpenLine,
  RiTBoxLine,
  RiClipboardLine,
  RiSettings4Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiInformationLine,
  RiComputerLine,
  RiUserLine,
  RiMoreFill,
} from "react-icons/ri"
import {
  RiHome4Fill,
  RiListCheck2,
  RiBookOpenFill,
  RiTBoxFill,
  RiClipboardFill,
  RiSettings4Fill,
  RiInformationFill,
  RiComputerFill,
  RiUserFill,
} from "react-icons/ri"
import { Layout, Menu, Button, theme, Typography, Dropdown } from 'antd'
import { IconType } from "react-icons"
import styles from './Sidebar.module.css'

const { Sider } = Layout;
const { Text } = Typography;

// ملاحظة: في الـ layout الرئيسي، أضف <Sidebar /> و <BottomNavBar /> معاً.
// Sidebar يظهر فقط على الشاشات الكبيرة، وBottomNavBar يظهر فقط على الشاشات الصغيرة (راجع CSS).

interface NavItem {
  name: string
  icon: IconType
  activeIcon: IconType
  href: string
}

function getNavItems(): NavItem[] {
  const systemCategory = localStorage.getItem('selectedSystemCategory');
  if (systemCategory == 'supermarket') {
    //supermarket system
    return [
      { name: "Home", icon: RiHome4Line, activeIcon: RiHome4Fill, href: "/" },
      { name: "inventory", icon: RiTBoxLine, activeIcon: RiTBoxFill, href: "/inventory" },
      { name: "About", icon: RiInformationLine, activeIcon: RiInformationFill, href: "/about" },
    ];

  }
  return [
    { name: "Home", icon: RiHome4Line, activeIcon: RiHome4Fill, href: "/" },
    { name: "Orders", icon: RiListCheck, activeIcon: RiListCheck2, href: "/orders" },
    { name: "Menu", icon: RiBookOpenLine, activeIcon: RiBookOpenFill, href: "/menu" },
    { name: "Menu Management", icon: RiClipboardLine, activeIcon: RiClipboardFill, href: "/menu-management" },
    { name: "Inventory", icon: RiTBoxLine, activeIcon: RiTBoxFill, href: "/Inventory" },
    { name: "KDS", icon: RiComputerLine, activeIcon: RiComputerFill, href: `/kds/` },
    { name: "Waiter Display", icon: RiComputerLine, activeIcon: RiComputerFill, href: "/waiterdisplay" },
    { name: "Delivery Display", icon: RiComputerLine, activeIcon: RiComputerFill, href: "/deliverydisplay" },
    { name: "Employees", icon: RiUserLine, activeIcon: RiUserFill, href: "/employees" },
    { name: "About", icon: RiInformationLine, activeIcon: RiInformationFill, href: "/about" },
  ];
}

export function Sidebar({ defaultIconsOnly = false, className = "" }: { defaultIconsOnly?: boolean, className?: string }) {
  const [collapsed, setCollapsed] = useState(defaultIconsOnly)
  const [isMobile, setIsMobile] = useState(false)
  const [visibleItems, setVisibleItems] = useState<NavItem[]>([])
  const [overflowItems, setOverflowItems] = useState<NavItem[]>([])
  const location = useLocation()
  const navigate = useNavigate()
  const { token } = theme.useToken()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) {
      const items = getNavItems()
      // Calculate how many items fit (assuming approx 80px per item)
      const maxVisibleItems = Math.floor(window.innerWidth / 80) - 1 // -1 for the 'More' button
      const numVisible = Math.min(items.length, Math.max(1, maxVisibleItems))

      setVisibleItems(items.slice(0, numVisible))
      setOverflowItems(items.slice(numVisible))
    }
  }, [isMobile, token]) // Rerun when isMobile or token changes

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  const menuItems = getNavItems().map((item) => ({
    key: item.href,
    icon: location.pathname === item.href ? 
      <item.activeIcon style={{ fontSize: '20px' }} /> :
      <item.icon style={{ fontSize: '20px' }} />,
    label: <Text strong style={{ fontSize: '15px' }}>{item.name}</Text>,
    onClick: () => navigate(item.href)
  }))

  const settingsItem = {
    key: '/settings',
    icon: location.pathname === '/settings' ?
      <RiSettings4Fill style={{ fontSize: '20px' }} /> :
      <RiSettings4Line style={{ fontSize: '20px' }} />,
    label: <Text strong style={{ fontSize: '15px' }}>Settings</Text>,
    onClick: () => navigate('/settings')
  }

  if (isMobile) {
    const overflowMenuItems = [
      ...overflowItems.map(item => ({
        key: item.href,
        icon: location.pathname === item.href ? 
          <item.activeIcon style={{ fontSize: '20px', color: token.colorPrimary }} /> :
          <item.icon style={{ fontSize: '20px' }} />,
        label: <Text style={{ color: location.pathname === item.href ? token.colorPrimary : 'inherit' }}>{item.name}</Text>,
        onClick: () => navigate(item.href)
      })),
      {
        key: '/settings',
        icon: location.pathname === '/settings' ?
          <RiSettings4Fill style={{ fontSize: '20px', color: token.colorPrimary }} /> :
          <RiSettings4Line style={{ fontSize: '20px' }} />,
        label: <Text style={{ color: location.pathname === '/settings' ? token.colorPrimary : 'inherit' }}>Settings</Text>,
        onClick: () => navigate('/settings')
      }
    ]

    return (
      <div className={styles.bottomNavContainer} style={{ background: token.colorBgContainer, borderTop: `1px solid ${token.colorBorderSecondary}` }}>
        <div className={styles.bottomNavScroll}>
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Button
                key={item.href}
                type="text"
                icon={isActive ? 
                  <item.activeIcon style={{ fontSize: '24px', color: token.colorPrimary }} /> :
                  <item.icon style={{ fontSize: '24px' }} />
                }
                onClick={() => navigate(item.href)}
                className={styles.bottomNavItem}
                style={{
                  color: isActive ? token.colorPrimary : token.colorTextSecondary,
                }}
              >
                <Text style={{ fontSize: '12px', color: isActive ? token.colorPrimary : 'inherit' }}>{item.name}</Text>
              </Button>
            )
          })}
          {(overflowItems.length > 0 || getNavItems().length > visibleItems.length) && (
            <Dropdown
              menu={{ items: overflowMenuItems }}
              placement="topRight"
              trigger={['click']}
            >
              <Button
                type="text"
                icon={<RiMoreFill style={{ fontSize: '24px' }} />}
                className={styles.bottomNavItem}
                style={{ color: token.colorTextSecondary }}
              >
                <Text style={{ fontSize: '12px' }}>More</Text>
              </Button>
            </Dropdown>
          )}
        </div>
      </div>
    )
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={toggleSidebar}
      trigger={null}
      className={className}
      style={{
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div style={{ 
        padding: '16px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: `1px solid ${token.colorBorderSecondary}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: token.colorPrimary,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            RA
          </div>
          {!collapsed && <Text strong style={{ fontSize: '18px' }}>Restaurant App</Text>}
        </div>
        <Button
          type="text"
          icon={collapsed ? <RiArrowRightSLine style={{ fontSize: '20px' }} /> : <RiArrowLeftSLine style={{ fontSize: '20px' }} />}
          onClick={toggleSidebar}
          style={{ padding: '4px 8px' }}
        />
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{ 
          borderRight: 0,
          padding: '8px 0'
        }}
      />

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={[settingsItem]}
        style={{ 
          borderRight: 0,
          position: 'absolute',
          bottom: 0,
          width: '100%',
          padding: '8px 0'
        }}
      />
    </Sider>
  )
}
