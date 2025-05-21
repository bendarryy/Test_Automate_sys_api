import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { UserOutlined, TableOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Card, Descriptions, List, Typography, Tag, Divider, Space, Alert, Spin } from 'antd';
import './KdsOrderDetails.css';

const { Title, Text } = Typography;

interface OrderItem {
  id: number;
  menu_item: number;
  menu_item_name: string;
  quantity: number;
  notes?: string;
}

interface KitchenOrder {
  id: number;
  system: number;
  customer_name: string;
  table_number: string;
  waiter?: string | null;
  total_price: string;
  profit: number;
  status: string;
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
}

const KdsOrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const systemId = localStorage.getItem('selectedSystemId');
  const { callApi, loading, error } = useApi();
  const [order, setOrder] = useState<KitchenOrder | null>(null);


  useEffect(() => {
    if (!orderId) return;
    const fetchData = async () => {
      try {
        const data = await callApi('get', `/restaurant/${systemId}/kitchen/orders/${orderId}/`);
        setOrder(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [orderId, systemId]);

  if (loading) return <Spin size="large" className="center-spinner" />;
  if (error) return <Alert message={error} type="error" showIcon />;
  if (!order) return <Alert message="No order found" type="warning" showIcon />;

  const statusColor = order.status === 'completed' ? 'green' : 'orange';
  const statusText = order.status === 'preparing' ? 'Preparing' : 
                     order.status === 'completed' ? 'Completed' : order.status;

  return (
    <div className="order-details-container">
      <Card 
        title={
          <Space align="center">
            <Title level={4} style={{ margin: 0 }}>Order #{order.id}</Title>
          </Space>
        }
        className="order-card"
        extra={
          <Tag color={statusColor} icon={statusColor === 'green' ? 
               <CheckCircleOutlined /> : <ClockCircleOutlined />}>
            {statusText}
          </Tag>
        }
      >
        <Descriptions 
          bordered 
          column={1} 
          size="middle"
          className="order-info"
        >
          <Descriptions.Item label="Customer Name">
            <Space>
              <UserOutlined />
              <Text>{order.customer_name || 'Not specified'}</Text>
            </Space>
          </Descriptions.Item>
          
          <Descriptions.Item label="Table Number">
            <Space>
              <TableOutlined />
              <Text>{order.table_number}</Text>
            </Space>
          </Descriptions.Item>
          
          <Descriptions.Item label="Waiter">
            <Text>{order.waiter || 'Not specified'}</Text>
          </Descriptions.Item>
          
          <Descriptions.Item label="Order Date">
            <Text>{new Date(order.created_at).toLocaleString('en-US')}</Text>
          </Descriptions.Item>
          
          <Descriptions.Item label="Total Price">
            <Text strong>{order.total_price} SAR</Text>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Order Items</Divider>
        
        {order.order_items.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={order.order_items}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Text key="quantity">{item.quantity}</Text>
                ]}
              >
                <List.Item.Meta
                  title={<Text strong>{item.menu_item_name}</Text>}
                  description={item.notes && (
                    <Space>
                      <Text type="secondary">Notes:</Text>
                      <Text>{item.notes}</Text>
                    </Space>
                  )}
                />
              </List.Item>
            )}
          />
        ) : (
          <Alert 
            message="No order items" 
            type="info" 
            showIcon 
            className="empty-alert"
          />
        )}
      </Card>
    </div>
  );
};

export default KdsOrderDetails;
