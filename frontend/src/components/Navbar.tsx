import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { MdNotifications, MdNotificationsActive, MdAccountCircle } from "react-icons/md"; // react-icons Material Design
import { useNavigate } from "react-router-dom";
import { Layout, Badge, Dropdown, Space, Button, theme } from 'antd';
import type { MenuProps } from 'antd';
import { useApi } from "../hooks/useApi";

const { Header } = Layout;
const { useToken } = theme;

const Navbar = () => {
  const [numOfNotification] = useState(2);
  const { callApi } = useApi();
  const navigate = useNavigate();
  const { token } = useToken();
  const profile = useSelector((state: RootState) => state.profile.profile);
  const userRole = profile?.role || null;

  const [notificationHover, setNotificationHover] = useState(false);
  const [accountHover, setAccountHover] = useState(false);



  const handleLogout = async () => {
    try {
      console.log(userRole);
      if (userRole !== 'owner') {
        await callApi('get', '/core/employee/logout/');
        navigate('/employeelogin');
      } else {
        await callApi('get', '/core/logout/');
        navigate('/ownerlogin');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const notificationItems: MenuProps['items'] = [
    {
      key: 'header',
      label: 'الإشعارات',
      type: 'group',
      style: { 
        fontSize: '14px',
        fontWeight: 600,
        color: token.colorTextHeading
      }
    },
    {
      type: 'divider',
    },
    ...(numOfNotification > 0
      ? [1, 2].map((n) => ({
          key: n,
          label: `إشعار ${n}`,
          style: {
            padding: '8px 12px',
            transition: 'all 0.3s'
          }
        }))
      : [
          {
            key: 'no-notifications',
            label: 'لا توجد إشعارات جديدة',
            disabled: true,
            style: {
              color: token.colorTextDisabled,
              padding: '8px 12px'
            }
          },
        ]),
  ];

  const accountItems: MenuProps['items'] = [
    ...(userRole === 'owner' ? [{
      key: 'my-system',
      label: 'My System',
      onClick: () => navigate('/systems'),
      style: {
        padding: '8px 12px',
        transition: 'all 0.3s'
      }
    }] : []),
    {
      key: 'profile',
      label: 'الملف الشخصي',
      onClick: () => navigate('/profile'),
      style: {
        padding: '8px 12px',
        transition: 'all 0.3s'
      }
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'تسجيل الخروج',
      danger: true,
      onClick: handleLogout,
      style: {
        padding: '8px 12px',
        transition: 'all 0.3s'
      }
    },
  ];

  const getIconButtonStyle = (isHovered: boolean) => ({
    padding: '8px',
    borderRadius: '50%',
    transition: 'background-color 0.3s ease, color 0.3s ease',
    backgroundColor: isHovered ? token.controlItemBgHover : 'transparent',
    border: 'none',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  return (
    <Header style={{ 
      background: token.colorBgContainer,
      padding: '0 24px', 
      display: 'flex', 
      justifyContent: 'flex-end',
      alignItems: 'center',
      boxShadow: token.boxShadow,
      height: '64px',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <Space size="middle">
        <Dropdown
          menu={{ 
            items: notificationItems,
            style: {
              minWidth: '220px',
              boxShadow: token.boxShadowSecondary,
            }
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button 
            type="text" 
            style={getIconButtonStyle(notificationHover)}
            onMouseEnter={() => setNotificationHover(true)}
            onMouseLeave={() => setNotificationHover(false)}
            icon={
              <Badge 
                count={numOfNotification} 
                size="small"
                offset={[-2,2]} // Adjust badge position slightly
                style={{
                  color: token.colorTextLightSolid,
                  backgroundColor: token.colorError,
                }}
              >
                {numOfNotification > 0 ? (
                  <MdNotificationsActive 
                    size={24} 
                    style={{ 
                      color: notificationHover ? token.colorPrimaryHover : token.colorPrimary,
                      transition: 'color 0.3s ease'
                    }} 
                  />
                ) : (
                  <MdNotifications 
                    size={24} 
                    style={{ 
                      color: notificationHover ? token.colorPrimaryHover : token.colorTextSecondary,
                      transition: 'color 0.3s ease'
                    }} 
                  />
                )}
              </Badge>
            }
          />
        </Dropdown>

        <Dropdown
          menu={{ 
            items: accountItems,
            style: {
              minWidth: '180px',
              boxShadow: token.boxShadowSecondary
            }
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button 
            type="text" 
            style={getIconButtonStyle(accountHover)}
            onMouseEnter={() => setAccountHover(true)}
            onMouseLeave={() => setAccountHover(false)}
            icon={
              <MdAccountCircle 
                size={32} 
                style={{ 
                  color: accountHover ? token.colorPrimaryHover : token.colorTextSecondary,
                  transition: 'color 0.3s ease'
                }} 
              />
            }
          />
        </Dropdown>
      </Space>
    </Header>
  );
};

export default Navbar;
