import React from 'react';
import { Card, List, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  UserOutlined, 
  LockOutlined, 
  BellOutlined, 
  SafetyOutlined,
  RightOutlined 
} from '@ant-design/icons';

const { Title } = Typography;

interface SettingItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const settingsItems: SettingItem[] = [
    {
      title: 'Account Settings',
      description: 'Manage your account information and password',
      icon: <UserOutlined style={{ fontSize: '24px', color: '#1677ff' }} />,
      path: '/settings/account'
    },
    {
      title: 'Change Password',
      description: 'Update your password',
      icon: <LockOutlined style={{ fontSize: '24px', color: '#1677ff' }} />,
      path: '/settings/change-password'
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
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Settings</Title>
      
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