import React, { useEffect, useState } from 'react';
import { Card, Typography, Descriptions, Tag, Spin, Alert } from 'antd';
import { useApi } from '../hooks/useApi';

const { Title } = Typography;

interface System {
  name: string;
  category: string;
  id: number;
}

interface User {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

interface ProfileData {
  user: User;
  role: string;
  systems: System[] | number;
}

const Profile: React.FC = () => {
  const { callApi, loading, error, data } = useApi<ProfileData>();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('Fetching profile data...');
        const response = await callApi('get', '/core/profile/');
        console.log('Profile response:', response);
        setProfileData(response);

        // Handle employee systems
        if (response.role !== 'owner' && typeof response.systems === 'number') {
          // For employees, set their system ID
          localStorage.setItem('selectedSystemId', response.systems.toString());
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };

    fetchProfile();
  }, []);

  // Update profileData when data changes
  useEffect(() => {
    if (data) {
      setProfileData(data);
    }
  }, [data]);

  console.log('Current state:', { loading, error, profileData, data });

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