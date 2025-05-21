import React, { useEffect, useState, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Table, Tag, Button, Space, Card, Typography, Alert, Spin, Modal } from 'antd';
import { 
  EyeOutlined, 
  HourglassOutlined, 
  CheckCircleOutlined,
  DashboardOutlined 
} from '@ant-design/icons';
import KdsOrderDetails from './KdsOrderDetails';
import useHasPermission from '../../hooks/useHasPermission';

const { Title, Text } = Typography;

interface KitchenOrder {
  id: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'canceled';
  customer_name?: string;
  table_number?: string;
  created_at?: string;
}

const statusColors = {
  pending: 'orange',
  preparing: 'blue',
  ready: 'green',
  completed: 'gray',
  canceled: 'red'
};

const statusLabels = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  canceled: 'Canceled'
};

const KdsPage: React.FC = () => {
  const params = useParams<{ systemId?: string; orderId?: string }>();
  const systemId = params.systemId || localStorage.getItem('selectedSystemId') || '5';
  const { loading, error, callApi } = useApi<KitchenOrder[]>();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [updating, setUpdating] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<KitchenOrder | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (systemId) {
      callApi('get', `/restaurant/${systemId}/kitchen/orders/`)
        .then(setOrders)
        .catch(() => {});
    }
  }, [systemId]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchOrders();
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!params.orderId) return;
    setDetailsLoading(true);
    setDetailsError(null);
    callApi('get', `/restaurant/${systemId}/kitchen/orders/${params.orderId}/`)
      .then((data) => setOrderDetails(data))
      .catch((err) => setDetailsError(err?.message || 'Error loading details'))
      .finally(() => setDetailsLoading(false));
  }, [params.orderId, systemId]);

  const handleStatusUpdate = async (id: number, status: 'preparing' | 'ready' | 'completed' | 'canceled') => {
    if (!systemId) return;
    setUpdating(id);
    try {
      await callApi('patch', `/restaurant/${systemId}/kitchen/orders/${id}/`, { status });
      fetchOrders();
    } finally {
      setUpdating(null);
    }
  };

  const hasKdsPermission = useHasPermission('read_kds');
  if (!hasKdsPermission) return <Navigate to="/" replace />;

  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => <Text strong>{id}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof statusLabels) => (
        <Tag color={statusColors[status]}>
          {statusLabels[status]}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: KitchenOrder) => (
        <Space size="middle">
          <Link to={`/kds/order/${record.id}`}>
            <Button icon={<EyeOutlined />} size="small">
              Details
            </Button>
          </Link>
          
          {record.status === 'pending' && (
            <Button 
              type="primary" 
              icon={<HourglassOutlined />} 
              size="small"
              loading={updating === record.id}
              onClick={() => handleStatusUpdate(record.id, 'preparing')}
            >
              Start Preparing
            </Button>
          )}
          
          {record.status === 'preparing' && (
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />} 
              size="small"
              loading={updating === record.id}
              onClick={() => handleStatusUpdate(record.id, 'ready')}
            >
              Mark as Ready
            </Button>
          )}
          
          {record.status === 'ready' && (
            <Tag icon={<CheckCircleOutlined />} color="success">
              Ready to Serve
            </Tag>
          )}
        </Space>
      )
    }
  ];



  return (
    <>
    <Card 
      title={
        <Space>
          <DashboardOutlined />
          <Title level={4} style={{ margin: 0 }}>Kitchen Display System</Title>
        </Space>
      }
      style={{ margin: 24 }}
    >
      {loading && <Spin size="large" className="center-spinner" />}
      {error && <Alert message={error} type="error" showIcon />}
      
      <Table 
        columns={columns} 
        dataSource={orders} 
        rowKey="id"
        locale={{ emptyText: 'No orders found' }}
      />
    </Card>
    {params.orderId && (
      <Modal
        title="Order Details"
        open={true}
        onCancel={() => window.history.back()}
        footer={[
          <Button key="back" onClick={() => window.history.back()}>
            Back to Orders
          </Button>
        ]}
        width={800}
      >
        {detailsLoading && <Spin size="large" className="center-spinner" />}
        {detailsError && <Alert message={detailsError} type="error" showIcon />}
        {orderDetails && <KdsOrderDetails />}
      </Modal>
    )}
    </>
  );
};

export default KdsPage;
