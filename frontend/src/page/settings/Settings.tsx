import React from 'react';
import { Card, List, Typography, Switch } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  UserOutlined, 
  LockOutlined, 
  BellOutlined, 
  SafetyOutlined,
  RightOutlined 
} from '@ant-design/icons';
import { useThemeContext } from '../../theme/ThemeContext';

const { Title } = Typography;

interface SettingItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeContext();

  const settingsItems: SettingItem[] = [
    {
      title: 'Account Settings',
      description: 'Manage your account information and password',
      icon: <UserOutlined style={{ fontSize: '24px', color: '#1677ff' }} />,
      path: '/profile'
    },
    {
      title: 'Change Password',
      description: 'Update your password',
      icon: <LockOutlined style={{ fontSize: '24px', color: '#1677ff' }} />,
      path: '/change-password'
    },
    {
      title: 'Notifications',
      description: 'Manage your notification preferences',
      icon: <BellOutlined style={{ fontSize: '24px', color: '#1677ff' }} />,
      path: '/settings/notifications'
    },
    {
      title: 'Security',
      description: 'Manage your security settings',
      icon: <SafetyOutlined style={{ fontSize: '24px', color: '#1677ff' }} />,
      path: '/settings/security'
    },
    {
      title: 'Edit Public Profile & Media',
      description: 'Manage your public profile and media for your system',
      icon: <UserOutlined style={{ fontSize: '24px', color: '#1677ff' }} />, // You can change the icon if you want
      path: '/systems/public-profile', // Update this path if you want to use a dynamic system id
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Settings</Title>
      
      <div className="settings-page">
        <h2>Theme Settings</h2>
        <div className="theme-switch">
          <span>Dark Mode: </span>
          <Switch
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
        </div>
      </div>

      <Card>
        <List
          itemLayout="horizontal"
          dataSource={settingsItems}
          renderItem={(item) => (
            <List.Item
              onClick={() => navigate(item.path)}
              className="settings-list-item"
            >
              <List.Item.Meta
                avatar={item.icon}
                title={item.title}
                description={item.description}
              />
              <RightOutlined style={{ color: '#bfbfbf' }} />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Settings;