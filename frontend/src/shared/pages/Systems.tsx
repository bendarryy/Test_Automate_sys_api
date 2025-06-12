import React, { useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { useSelectedSystemId } from '../hooks/useSelectedSystemId';
import { Layout, Button, Typography, Spin, Alert, Tag } from 'antd';
import { UserOutlined, AppstoreOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const Systems: React.FC = () => {
  interface System {
    id: number;
    name?: string;
    description?: string;
    category: string;
  }

  const { data, loading, error, callApi } = useApi<System[]>();
  const navigate = useNavigate();
  const [, setSelectedSystemId, , setSelectedCategory] = useSelectedSystemId();

  useEffect(() => {
    callApi('get', '/core/systems/');
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f6fa' }}>
      <Content style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 36, minWidth: 350, maxWidth: 420, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <AppstoreOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
          <Title level={3} style={{ color: '#222', textAlign: 'center', marginBottom: 32 }}>Select a System to Start</Title>
          {loading && (
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <Spin size="large" tip="Loading systems..." />
            </div>
          )}
          {error && <Alert message="Error loading systems" description={error} type="error" showIcon style={{ marginBottom: '24px' }} />}
          {!loading && !error && data && Array.isArray(data) && data.length > 0 ? (
            <div style={{ width: '100%', maxHeight: 400, overflow: 'auto' }}>
              {data.map((system: System) => (
                <div key={system.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f6f8fa', border: '1px solid #e4e7ed', borderRadius: 10, padding: 18, marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <UserOutlined style={{ fontSize: 28, color: '#bfbfbf' }} />
                    <div>
                      <Text strong style={{ fontSize: 18, color: '#222' }}>{system.name || `System #${system.id}`}</Text>
                      <div>
                        <Tag color="geekblue" style={{ fontSize: 13 }}>{system.category}</Tag>
                      </div>
                      <Paragraph style={{ color: '#666', margin: 0, fontSize: 13 }}>{system.description || 'No description available for this system.'}</Paragraph>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Button
                      type="primary"
                      style={{ borderRadius: 6, fontWeight: 'bold', height: 40, marginBottom: 4 }}
                      onClick={() => {
                        setSelectedSystemId(system.id.toString());
                        setSelectedCategory(system.category);
                        
                        // Dispatch a custom event to notify the router that the system category has changed
                        window.dispatchEvent(new CustomEvent('systemCategoryChanged'));
                        
                        navigate('/');
                      }}
                    >
                      Select
                    </Button>
                    <Button
                      type="default"
                      style={{ borderRadius: 6, fontWeight: 'bold', height: 36 }}
                      onClick={() => navigate(`/systems/edit/${system.id}`)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}

            </div>
          ) : (
            !loading && !error && (
              <>
                <Alert message="No systems available." type="info" showIcon />
                <Button
                  type="dashed"
                  style={{ width: '100%', height: 44, fontWeight: 'bold', borderRadius: 8, marginTop: 16 }}
                  onClick={() => navigate('/systems/create')}
                  icon={<AppstoreOutlined />}
                >
                  + Create New System
                </Button>
              </>
            )
          )}
          <Button
            type="dashed"
            style={{ width: '100%', height: 44, fontWeight: 'bold', borderRadius: 8, marginTop: 16 }}
            onClick={() => navigate('/systems/create')}
            icon={<AppstoreOutlined />}
          >
              + Create New System
          </Button>
          <Button 
            type="default" 
            style={{ marginTop: 24, width: '100%', height: 44, fontWeight: 'bold', borderRadius: 8 }}
            onClick={() => navigate('/')}
          >
            back to home          
            </Button>
        </div>
      </Content>
    </Layout>
  );
};

export default Systems;