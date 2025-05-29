import React, { useState } from 'react';
import { Card, Descriptions, Tag, Spin, Alert, Form, Input, Button, Modal, message, Row, Col, Typography } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Header from '../components/Header';
import { useApi } from '../hooks/useApi';
import ProfileAvatar from '../components/ProfileAvatar';
import { MdEmail, MdPerson, MdCalendarToday, MdBusiness, MdPhone } from 'react-icons/md';

const { Title, Text } = Typography;

interface ProfileUpdateData {
  current_password: string;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

interface UserData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  phone?: string;
}

const Profile: React.FC = () => {
  const profileState = useSelector((state: RootState) => state.profile);
  const profileData = profileState.profile;
  const loading = profileState.loading;
  const error = profileState.error;
  const { callApi } = useApi();
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [updateLoading, setUpdateLoading] = useState(false);

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

  const handleEdit = () => {
    form.setFieldsValue({
      username: profileData.user.username,
      email: profileData.user.email || '',
      first_name: profileData.user.first_name || '',
      last_name: profileData.user.last_name || '',
      phone: (profileData.user as UserData).phone || '',
    });
    setIsEditing(true);
  };

  const handleUpdate = async (values: ProfileUpdateData) => {
    try {
      setUpdateLoading(true);
      await callApi('patch', '/core/profile/update/', values);
      message.success('Profile updated successfully');
      setIsEditing(false);
      // You might want to refresh the profile data here
    } catch (err) {
      message.error('Failed to update profile');
      console.error('Profile update error:', err);
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', margin: '0 auto' }}>
      <Header 
        title="Profile Information"
        breadcrumbs={[
          { title: 'Profile', path: '/profile' }
        ]}
        actions={[
          <Button key="edit-profile" type="primary" onClick={handleEdit}>
            Edit Profile
          </Button>
        ]}
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <ProfileAvatar 
                name={profileData.user.username} 
                size={120}
              />
              <Title level={3} style={{ marginTop: 16, marginBottom: 4 }}>
                {profileData.user.username}
              </Title>
              <Tag color={profileData.role === 'owner' ? 'blue' : 'green'} style={{ fontSize: '14px', padding: '4px 12px' }}>
                {profileData.role.toUpperCase()}
              </Tag>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card>
            <Descriptions bordered column={1}>
              <Descriptions.Item 
                label={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdPerson style={{ fontSize: '18px' }} />
                    <Text strong>Username</Text>
                  </div>
                }
              >
                {profileData.user.username}
              </Descriptions.Item>

              {profileData.user.email && (
                <Descriptions.Item 
                  label={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MdEmail style={{ fontSize: '18px' }} />
                      <Text strong>Email</Text>
                    </div>
                  }
                >
                  {profileData.user.email}
                </Descriptions.Item>
              )}

              {profileData.user.phone && (
                <Descriptions.Item 
                  label={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MdPhone style={{ fontSize: '18px' }} />
                      <Text strong>Phone</Text>
                    </div>
                  }
                >
                  {profileData.user.phone}
                </Descriptions.Item>
              )}

              <Descriptions.Item 
                label={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdCalendarToday style={{ fontSize: '18px' }} />
                    <Text strong>Date Joined</Text>
                  </div>
                }
              >
                {formatDate(profileData.user.date_joined)}
              </Descriptions.Item>
              
              {profileData.role === 'owner' && Array.isArray(profileData.systems) && (
                <Descriptions.Item 
                  label={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MdBusiness style={{ fontSize: '18px' }} />
                      <Text strong>Systems</Text>
                    </div>
                  }
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {profileData.systems.map((system) => (
                      <Tag 
                        key={system.id} 
                        color={system.category === 'restaurant' ? 'orange' : 'purple'}
                        style={{ fontSize: '14px', padding: '4px 12px' }}
                      >
                        {system.name} ({system.category})
                      </Tag>
                    ))}
                  </div>
                </Descriptions.Item>
              )}
              
              {profileData.role !== 'owner' && typeof profileData.systems === 'number' && (
                <Descriptions.Item 
                  label={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MdBusiness style={{ fontSize: '18px' }} />
                      <Text strong>Number of Systems</Text>
                    </div>
                  }
                >
                  {profileData.systems}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Edit Profile"
        open={isEditing}
        onCancel={() => setIsEditing(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            name="current_password"
            label="Current Password"
            rules={[{ required: true, message: 'Please enter your current password' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="first_name"
            label="First Name"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Last Name"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={updateLoading} style={{ marginRight: 8 }}>
              Save Changes
            </Button>
            <Button onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile; 