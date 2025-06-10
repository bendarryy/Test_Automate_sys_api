import React from 'react';
import { Card, Space, Tag, Button, Divider, List, Typography, Badge, Collapse, Descriptions, Empty } from 'antd';
import { HourglassOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { KitchenOrder } from '../types/kitchenOrder';
import { statusColors, statusLabels } from '../utils/kdsConstants';

const { Text, Title } = Typography;
const { Panel } = Collapse;

interface OrderCardProps {
  order: KitchenOrder;
  updating: number | null;
  onStatusUpdate: (id: number, newStatus: 'preparing' | 'ready') => void;
}

const CARD_MIN_HEIGHT = 420; // Adjust as needed for your layout

const OrderCard: React.FC<OrderCardProps> = ({ order, updating, onStatusUpdate }) => {
  const itemsCount = order.order_items.length;
  return (
    <Card
      style={{
        border: '1px solid #f0f0f0',
        borderRadius: 14,
        marginBottom: 20,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        background: '#fff',
        transition: 'box-shadow 0.2s',
        cursor: 'pointer',
        minHeight: CARD_MIN_HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
      styles={{ 
        body: { padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }
      }}
      title={
        <Space>
          <Badge status={order.status === 'preparing' ? 'processing' : 'warning'} />
          <Title level={5} style={{ margin: 0 }}>Order #{order.id}</Title>
        </Space>
      }
      extra={
        <Tag color={statusColors[order.status]} style={{ fontWeight: 500, fontSize: 15 }}>
          {statusLabels[order.status]}
        </Tag>
      }
      actions={[
        <Space style={{ width: '100%', justifyContent: 'center' }} key="actions">
          {order.status === 'pending' && (
            <Button
              type="primary"
              icon={<HourglassOutlined />}
              loading={updating === order.id}
              onClick={() => onStatusUpdate(order.id, 'preparing')}
              style={{ minWidth: 130 }}
            >
              Start Preparing
            </Button>
          )}
          {order.status === 'preparing' && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={updating === order.id}
              onClick={() => onStatusUpdate(order.id, 'ready')}
              style={{ minWidth: 130, background: '#52c41a', borderColor: '#52c41a' }}
            >
              Mark as Ready
            </Button>
          )}
        </Space>
      ]}
    >
      <Descriptions
        column={1}
        size="small"
        contentStyle={{ fontWeight: 500 }}
        labelStyle={{ color: '#888', fontWeight: 400, width: 90 }}
        style={{ marginBottom: 10 }}
      >
        <Descriptions.Item label="Table">{order.table_number || '-'}</Descriptions.Item>
        {order.customer_name && (
          <Descriptions.Item label="Customer">{order.customer_name}</Descriptions.Item>
        )}
        <Descriptions.Item label="Total">
          <Text strong style={{ color: '#1890ff' }}>${order.total_price}</Text>
        </Descriptions.Item>
      </Descriptions>
      <Divider style={{ margin: '12px 0' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Text strong style={{ fontSize: 15, color: '#555' }}>
          Order Items
        </Text>
        {itemsCount === 0 ? (
          <Empty
            description="No items"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ marginTop: 24, marginBottom: 24 }}
          />
        ) : itemsCount > 5 ? (
          <Collapse
            bordered={false}
            style={{ background: '#fafafa', marginTop: 8 }}
            expandIconPosition="end"
          >
            <Panel header={`Show all (${itemsCount})`} key="items">
              <List
                size="small"
                dataSource={order.order_items}
                renderItem={item => (
                  <List.Item style={{ padding: '6px 0' }}>
                    <Text>{item.quantity}x {item.menu_item_name}</Text>
                    {item.notes && <Text type="secondary"> - {item.notes}</Text>}
                  </List.Item>
                )}
              />
            </Panel>
          </Collapse>
        ) : (
          <List
            bordered={false}
            style={{ minHeight: 120, marginTop: 8, flex: 1 }}
            size="small"
            dataSource={order.order_items}
            renderItem={item => (
              <List.Item style={{ padding: '6px 0' }}>
                <Text>{item.quantity}x {item.menu_item_name}</Text>
                {item.notes && <Text type="secondary"> - {item.notes}</Text>}
              </List.Item>
            )}
          />
        )}
      </div>
    </Card>
  );
};

export default OrderCard;
