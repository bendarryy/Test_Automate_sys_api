import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Space, message, Tag, Spin, Empty } from 'antd';
import Header from '../../components/Header';
import { CheckOutlined, CarOutlined } from '@ant-design/icons';
import { useApi } from '../../hooks/useApi';

const SYSTEM_ID = localStorage.getItem('selectedSystemId') ?? '';

interface DeliveryOrderItem {
  id: number;
  menu_item: number;
  menu_item_name: string;
  quantity: number;
}

interface DeliveryOrder {
  id: number;
  customer_name: string;
  total_price: string;
  profit: number;
  status: 'ready' | 'out_for_delivery' | 'completed';
  order_items: DeliveryOrderItem[];
  created_at: string;
  updated_at: string;
}

const statusColors: Record<DeliveryOrder['status'], string> = {
  ready: 'blue',
  out_for_delivery: 'orange',
  completed: 'green',
};

const statusText: Record<DeliveryOrder['status'], string> = {
  ready: 'Ready for Delivery',
  out_for_delivery: 'Out for Delivery',
  completed: 'Completed',
};

const DeliveryDisplay: React.FC = () => {
  const {
    data: orders,
    loading,
    error,
    callApi,
  } = useApi<DeliveryOrder[]>();

  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      await callApi(
        'get',
        `/restaurant/${SYSTEM_ID}/delivery/orders/`
      );
    } catch {
      // error handled by hook
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: DeliveryOrder['status']) => {
    setStatusUpdatingId(orderId);
    try {
      await callApi(
        'patch',
        `/restaurant/${SYSTEM_ID}/delivery/orders/${orderId}/`,
        { status: newStatus }
      );
      message.success('Order status updated successfully');
      fetchOrders();
    } catch {
      message.error('Failed to update order status');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const readyOrders = orders?.filter(o => o.status === 'ready') || [];
  const outForDeliveryOrders = orders?.filter(o => o.status === 'out_for_delivery') || [];
  const completedOrders = orders?.filter(o => o.status === 'completed') || [];

  return (            
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Header 
        title="Delivery Display"
        breadcrumbs={[
          { title: 'Restaurant', path: '/restaurant' },
          { title: 'Delivery' }
        ]}
        actions={
          <Space size="large">
            <Tag color="blue">Ready: {readyOrders.length}</Tag>
            <Tag color="orange">Out: {outForDeliveryOrders.length}</Tag>
            <Tag color="green">Completed: {completedOrders.length}</Tag>
            <Button icon={<CarOutlined />} onClick={fetchOrders} size="large">Refresh</Button>
          </Space>
        }
      />
      {loading && <Spin size="large" style={{ display: 'block', margin: '40px auto' }} />}
      {error && <Empty description={error} style={{ marginTop: 32 }} />}
      {!loading && !error && (
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <h2 style={{ color: '#1890ff', marginBottom: 16 }}>Ready for Delivery</h2>
            {readyOrders.length === 0 ? (
              <Empty description="No ready orders" />
            ) : (
              readyOrders.map(order => (
                <Card
                  key={order.id}
                  title={<span><CarOutlined /> {order.customer_name}</span>}
                  style={{ marginBottom: 20 }}
                  extra={<Tag color={statusColors[order.status]}>{statusText[order.status]}</Tag>}
                >
                  <div style={{ marginBottom: 8 }}>
                    <b>Total:</b> {order.total_price} | <b>Profit:</b> {order.profit}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <b>Items:</b>
                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                      {order.order_items.map(item => (
                        <li key={item.id}>{item.menu_item_name} <span style={{ color: '#888' }}>×{item.quantity}</span></li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    loading={statusUpdatingId === order.id}
                    onClick={() => handleStatusChange(order.id, 'out_for_delivery')}
                  >
                    Mark as Out for Delivery
                  </Button>
                </Card>
              ))
            )}
          </Col>
          <Col xs={24} md={12}>
            <h2 style={{ color: '#faad14', marginBottom: 16 }}>Out for Delivery</h2>
            {outForDeliveryOrders.length === 0 ? (
              <Empty description="No orders out for delivery" />
            ) : (
              outForDeliveryOrders.map(order => (
                <Card
                  key={order.id}
                  title={<span><CarOutlined /> {order.customer_name}</span>}
                  style={{ marginBottom: 20 }}
                  extra={<Tag color={statusColors[order.status]}>{statusText[order.status]}</Tag>}
                >
                  <div style={{ marginBottom: 8 }}>
                    <b>Total:</b> {order.total_price} | <b>Profit:</b> {order.profit}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <b>Items:</b>
                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                      {order.order_items.map(item => (
                        <li key={item.id}>{item.menu_item_name} <span style={{ color: '#888' }}>×{item.quantity}</span></li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    loading={statusUpdatingId === order.id}
                    onClick={() => handleStatusChange(order.id, 'completed')}
                  >
                    Mark as Completed
                  </Button>
                </Card>
              ))
            )}
          </Col>
        </Row>
      )}
    </div>
  );
};

export default DeliveryDisplay;