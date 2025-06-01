import React, { useEffect, useState, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import { useParams, Navigate } from 'react-router-dom';
import Header from '../../components/Header';
import { 
  Card, 
  Tag, 
  Button, 
  Space, 
  Typography, 
  Alert, 
  Spin, 
  Input, 
  Select, 
  Row, 
  Col, 
  Statistic,
  Divider,
  List,
  Badge
} from 'antd';
import { 
  HourglassOutlined, 
  CheckCircleOutlined,
  DashboardOutlined,
  SearchOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import useHasPermission from '../../hooks/useHasPermission';

const { Text } = Typography;
const { Search } = Input;

interface KitchenOrder {
  id: number;
  status: 'pending' | 'preparing' | 'ready';
  customer_name?: string;
  table_number?: string;
  created_at?: string;
  order_items: {
    id: number;
    menu_item_name: string;
    quantity: number;
    notes?: string;
  }[];
  total_price: string;
}

const statusColors = {
  pending: 'orange',
  preparing: 'blue',
  ready: 'green'
} as const;

const statusLabels = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready'
} as const;

const KdsPage: React.FC = () => {
  const params = useParams<{ systemId?: string }>();
  const systemId = params.systemId || localStorage.getItem('selectedSystemId') || '5';
  const { loading, error, callApi, clearCache } = useApi<KitchenOrder[]>();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [updating, setUpdating] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [tableFilter, setTableFilter] = useState<string>('');

  const fetchOrders = useCallback(async () => {
    if (systemId) {
      try {
        // Clear the cache for this endpoint before fetching
        clearCache(`/restaurant/${systemId}/kitchen/orders/`);
        const data = await callApi('get', `/restaurant/${systemId}/kitchen/orders/`);
        if (data) {
          // Filter orders to only include pending and preparing
          const filteredData = data.filter(order => 
            order.status === 'pending' || order.status === 'preparing'
          ) as KitchenOrder[];
          // Sort orders by status (pending first) and then by creation date (newest first)
          const sortedData = filteredData.sort((a, b) => {
            if (a.status === b.status) {
              return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
            }
            return a.status === 'pending' ? -1 : 1;
          });
          setOrders(sortedData);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    }
  }, [systemId, callApi, clearCache]);

  // Initial load only
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (id: number, newStatus: 'preparing' | 'ready') => {
    if (!systemId) return;
    setUpdating(id);
    try {
      await callApi('patch', `/restaurant/${systemId}/kitchen/orders/${id}/`, { status: newStatus });
      // Update the local state immediately and maintain the sort order
      setOrders(prevOrders => {
        const updatedOrders = prevOrders
          .map(order => order.id === id ? { ...order, status: newStatus } as KitchenOrder : order)
          .filter(order => order.status === 'pending' || order.status === 'preparing')
          .sort((a, b) => {
            if (a.status === b.status) {
              return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
            }
            return a.status === 'pending' ? -1 : 1;
          });
        return updatedOrders;
      });
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdating(null);
    }
  };

  const hasKdsPermission = useHasPermission('read_kds');
  if (!hasKdsPermission) return <Navigate to="/" replace />;

  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchText === '' || 
      order.customer_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      order.table_number?.toLowerCase().includes(searchText.toLowerCase()) ||
      order.id.toString().includes(searchText);
    
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(order.status);
    const matchesTable = tableFilter === '' || order.table_number === tableFilter;

    return matchesSearch && matchesStatus && matchesTable;
  });

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length
  };

  // Get unique table numbers for filter
  const uniqueTables = [...new Set(orders.map(order => order.table_number))].filter(Boolean);

  return (
    <div style={{ padding: '24px' }}>
      <Header 
        title="Kitchen Display System"
        breadcrumbs={[
          { title: 'Restaurant', path: '/restaurant' },
          { title: 'KDS' }
        ]}
        actions={
          <Button 
            type="primary" 
            onClick={fetchOrders} 
            icon={<DashboardOutlined />}
          >
            Refresh
          </Button>
        }
      />

      {loading && <Spin size="large" className="center-spinner" />}
      {error && <Alert message={error} type="error" showIcon />}

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Card>
            <Statistic 
              title="Total Orders" 
              value={stats.total} 
              prefix={<DashboardOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Card>
            <Statistic 
              title="Pending" 
              value={stats.pending} 
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Card>
            <Statistic 
              title="Preparing" 
              value={stats.preparing} 
              valueStyle={{ color: '#1890ff' }}
              prefix={<HourglassOutlined />} 
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Space size="large">
          <Search
            placeholder="Search by order ID, customer, or table"
            allowClear
            onSearch={setSearchText}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Select
            mode="multiple"
            placeholder="Filter by status"
            style={{ width: 300 }}
            onChange={setStatusFilter}
            allowClear
            options={Object.entries(statusLabels).map(([value, label]) => ({
              value,
              label: <Tag color={statusColors[value as keyof typeof statusColors]}>{label}</Tag>
            }))}
          />
          <Select
            placeholder="Filter by table"
            style={{ width: 200 }}
            onChange={setTableFilter}
            allowClear
            options={uniqueTables.map(table => ({ value: table, label: `Table ${table}` }))}
          />
        </Space>
      </Card>

      {/* Orders Grid */}
      <Row gutter={[16, 16]}>
        {filteredOrders.map(order => (
          <Col xs={24} sm={12} md={8} lg={8} xl={8} key={order.id}>
            <Card
              title={
                <Space>
                  <Badge 
                    status={order.status === 'preparing' ? 'processing' : 'warning'} 
                  />
                  <Text strong>Order #{order.id}</Text>
                </Space>
              }
              extra={
                <Tag color={statusColors[order.status]}>
                  {statusLabels[order.status]}
                </Tag>
              }
              actions={[
                order.status === 'pending' && (
                  <Button 
                    type="primary" 
                    icon={<HourglassOutlined />} 
                    loading={updating === order.id}
                    onClick={() => handleStatusUpdate(order.id, 'preparing')}
                  >
                    Start Preparing
                  </Button>
                ),
                order.status === 'preparing' && (
                  <Button 
                    type="primary" 
                    icon={<CheckCircleOutlined />} 
                    loading={updating === order.id}
                    onClick={() => handleStatusUpdate(order.id, 'ready')}
                  >
                    Mark as Ready
                  </Button>
                )
              ].filter(Boolean)}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>Table: {order.table_number}</Text>
                {order.customer_name && <Text>Customer: {order.customer_name}</Text>}
                <Text>Total: ${order.total_price}</Text>
                <Divider style={{ margin: '12px 0' }} />
                <List
                  size="small"
                  dataSource={order.order_items}
                  renderItem={item => (
                    <List.Item>
                      <Text>{item.quantity}x {item.menu_item_name}</Text>
                      {item.notes && <Text type="secondary"> - {item.notes}</Text>}
                    </List.Item>
                  )}
                />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default KdsPage;
