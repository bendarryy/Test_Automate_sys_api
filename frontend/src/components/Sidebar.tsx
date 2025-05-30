import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RiArrowLeftSLine, RiArrowRightSLine, RiMoreFill } from "react-icons/ri";
import { Layout, Menu, Button, Typography, Dropdown } from 'antd';
import { theme } from 'antd';
import styles from '../styles/Sidebar.module.css';
import { getCommonNavItems, NavItem } from '../config/navigation.config';
import useNavigationItems from '../hooks/useNavigationItems';

const { Sider } = Layout;
const { Text } = Typography;
const { useToken } = theme;

// ملاحظة: في الـ layout الرئيسي، أضف <Sidebar /> و <BottomNavBar /> معاً.
// Sidebar يظهر فقط على الشاشات الكبيرة، وBottomNavBar يظهر فقط على الشاشات الصغيرة (راجع CSS).

export function Sidebar({ defaultIconsOnly = false, className = "" }: { defaultIconsOnly?: boolean, className?: string }) {
  const [collapsed, setCollapsed] = useState(() => {
    const storedCollapsed = localStorage.getItem('sidebarCollapsed');
    return storedCollapsed ? JSON.parse(storedCollapsed) : defaultIconsOnly;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [visibleItems, setVisibleItems] = useState<NavItem[]>([]);
  const [overflowItems, setOverflowItems] = useState<NavItem[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useToken();
  
  // Get system category from localStorage
  const systemCategory = localStorage.getItem('selectedSystemCategory');
  
  // Get navigation items based on system category
  // Filter navigation items by permissions using the custom hook
  const navItems = useNavigationItems().filter(item => item.showInSidebar !== false);
  
  // Get common navigation items (profile, settings, etc.)
  const allCommonItems = getCommonNavItems();
  // Filter common items to only show those with showInSidebar=true
  const commonItems = allCommonItems.filter(item => item.showInSidebar !== false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      // Calculate how many items fit (assuming approx 80px per item)
      const maxVisibleItems = Math.floor(window.innerWidth / 80) - 1; // -1 for the 'More' button
      const numVisible = Math.min(navItems.length, Math.max(1, maxVisibleItems));

      setVisibleItems(navItems.slice(0, numVisible));
      setOverflowItems(navItems.slice(numVisible));
    } else {
      // Reset to show all items when not in mobile mode
      setVisibleItems(navItems);
      setOverflowItems([]);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newCollapsed));
  };
  
  // Create menu items for main navigation
  const menuItems = navItems.map((item) => ({
    key: item.href,
    icon: location.pathname === item.href ? 
      <item.activeIcon style={{ fontSize: '20px' }} /> :
      <item.icon style={{ fontSize: '20px' }} />,
    label: <Text strong style={{ fontSize: '15px' }}>{item.name}</Text>,
    onClick: () => navigate(item.href)
  }));
  
  // Create menu items for common navigation items
  const commonMenuItems = commonItems.map(item => ({
    key: item.href,
    icon: location.pathname === item.href ?
      <item.activeIcon style={{ fontSize: '20px', color: token.colorPrimary }} /> :
      <item.icon style={{ fontSize: '20px' }} />,
    label: <Text style={{ color: location.pathname === item.href ? token.colorPrimary : 'inherit' }}>{item.name}</Text>,
    onClick: () => navigate(item.href)
  }));

  const sidebarStyle = {
    backgroundColor: token.colorBgContainer,
    color: token.colorText,
  };

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
      ...commonMenuItems
    ];

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
            );
          })}
          {(overflowItems.length > 0 || navItems.length > visibleItems.length) && (
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
    );
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={toggleSidebar}
      trigger={null}
      style={sidebarStyle}
      className={className}
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
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {systemCategory === 'supermarket' ? 'SM' : 'RA'}
          </div>
          {!collapsed && <Text strong style={{ fontSize: '18px' }}>{systemCategory === 'supermarket' ? 'Supermarket App' : 'Restaurant App'}</Text>}
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
        items={commonMenuItems}
        style={{ 
          borderRight: 0,
          position: 'absolute',
          bottom: 0,
          width: '100%',
          padding: '8px 0'
        }}
      />
    </Sider>
  );
}
