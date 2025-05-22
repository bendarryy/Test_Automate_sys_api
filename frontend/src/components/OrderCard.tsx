import React from 'react';
import { Card, Button, Tag, Tooltip, Space, Empty } from 'antd';
import { CheckCircleTwoTone, ClockCircleTwoTone, CheckOutlined, RollbackOutlined } from '@ant-design/icons';
import { WaiterOrder, WaiterOrderItem } from '../hooks/useWaiter';

interface OrderCardProps {
  order: WaiterOrder;
  onStatusChange: (newStatus: string) => void;
  isUpdating: boolean;
  showRevertButton?: boolean;
}

const statusIcons = {
  ready: <ClockCircleTwoTone twoToneColor="#1890ff" style={{ fontSize: 20 }} />,
  served: <CheckCircleTwoTone twoToneColor="#faad14" style={{ fontSize: 20 }} />,
  completed: <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 20 }} />,
};

const statusColors = {
  ready: 'blue',
  served: 'orange',
  completed: 'green',
};

const statusText = {
  ready: 'Ready',
  served: 'Served',
  completed: 'Completed',
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusChange, isUpdating, showRevertButton }) => {
  const [expanded, setExpanded] = React.useState(false);
  
  const totalItems = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  return (
    <Card
      title={
        <Space>
          {statusIcons[order.status]}
          <span style={{ fontWeight: 600 }}>Table {order.table_number}</span>
        </Space>
      }
      extra={
        <Tag color={statusColors[order.status]} style={{ fontSize: 14, padding: '2px 12px' }}>
          {statusText[order.status]}
        </Tag>
      }
      bordered
      style={{ borderRadius: 12, boxShadow: '0 2px 12px #f0f1f3', minHeight: 320, maxHeight: 340 }}
      headStyle={{ background: '#fafcff', borderRadius: '12px 12px 0 0', minHeight: 48 }}
      bodyStyle={{ padding: 16, minHeight: 220, maxHeight: 260, overflow: 'hidden' }}
    >
      <div style={{ marginBottom: 8, fontSize: 15, color: '#888' }}>
        <span>Order #<b>{order.id}</b></span>
        <span style={{ float: 'right' }}>{new Date(order.created_at).toLocaleTimeString()}</span>
      </div>
      
      <div style={{ marginBottom: 10 }}>
        <Button 
          type="text" 
          size="small"
          onClick={() => setExpanded(!expanded)}
          style={{ padding: '0 4px', marginBottom: 8 }}
          aria-label={expanded ? 'Hide details' : 'Show details'}
        >
          {expanded ? 'Hide details' : `Show details (${totalItems} items)`}
        </Button>
        
        {expanded && (
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            <b>Items:</b>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              {order.order_items?.map((item: WaiterOrderItem) => (
                <li key={item.id} style={{ marginBottom: 4, fontSize: 15 }}>
                  <span style={{ fontWeight: 500 }}>{item.menu_item_name}</span>
                  <span style={{ marginLeft: 8, color: '#888' }}>×{item.quantity}</span>
                </li>
              )) || <Empty description="No items" />}
            </ul>
          </div>
        )}
      </div>
      
      <div style={{ textAlign: 'right', marginTop: 18 }}>
        {order.status === 'ready' && (
          <Tooltip title="Mark as served">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={isUpdating}
              onClick={() => onStatusChange('served')}
              style={{ borderRadius: 8, fontWeight: 600 }}
              aria-label="Mark as served"
            >
              Mark as served
            </Button>
          </Tooltip>
        )}
        {order.status === 'served' && (
          <Tooltip title="Complete order">
            <Button
              type="primary"
              danger
              icon={<CheckOutlined />}
              loading={isUpdating}
              onClick={() => onStatusChange('completed')}
              style={{ borderRadius: 8, fontWeight: 600 }}
              aria-label="Complete order"
            >
              Complete
            </Button>
          </Tooltip>
        )}
        {showRevertButton && order.status === 'served' && (
          <Tooltip title="Revert to Ready">
            <Button 
              type="text" 
              danger
              icon={<RollbackOutlined />}
              onClick={() => onStatusChange('ready')}
              loading={isUpdating}
              style={{ marginTop: 8 }}
            />
          </Tooltip>
        )}
      </div>
    </Card>
  );
};

export default OrderCard;
