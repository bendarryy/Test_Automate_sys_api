import React from 'react';
import { Card, Typography, Descriptions, Tag, Spin, Alert } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const { Title } = Typography;





const Profile: React.FC = () => {
  const profileState = useSelector((state: RootState) => state.profile);
  const profileData = profileState.profile;
  const loading = profileState.loading;
  const error = profileState.error;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert message="No Profile Data" description="Unable to load profile data. Please try again." type="warning" showIcon />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Title level={2} style={{ marginBottom: '24px' }}>Profile Information</Title>
        
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Username">{profileData.user.username}</Descriptions.Item>
          {profileData.user.email && (
            <Descriptions.Item label="Email">{profileData.user.email}</Descriptions.Item>
          )}
          <Descriptions.Item label="Role">
            <Tag color={profileData.role === 'owner' ? 'blue' : 'green'}>
              {profileData.role.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Date Joined">
            {formatDate(profileData.user.date_joined)}
          </Descriptions.Item>
          
          {profileData.role === 'owner' && Array.isArray(profileData.systems) && (
            <Descriptions.Item label="Systems">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profileData.systems.map((system) => (
                  <Tag key={system.id} color={system.category === 'restaurant' ? 'orange' : 'purple'}>
                    {system.name} ({system.category})
                  </Tag>
                ))}
              </div>
            </Descriptions.Item>
          )}
          
          {profileData.role !== 'owner' && typeof profileData.systems === 'number' && (
            <Descriptions.Item label="Number of Systems">
              {profileData.systems}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  );
};

export default Profile; 