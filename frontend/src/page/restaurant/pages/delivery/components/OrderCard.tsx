import React from 'react';
import { Card, Button, Space } from 'antd';
import { FaUser, FaRegCalendarAlt, FaChair } from 'react-icons/fa';
import type { BaseOrder, DeliveryStatus, WaiterStatus } from '../types/order';

interface OrderCardProps {
  order: BaseOrder;
  onStatusChange: (
    newStatus: DeliveryStatus | WaiterStatus
  ) => void;
  isUpdating: boolean;
  showRevertButton?: boolean;
  orderType?: 'waiter' | 'delivery';
}

const statusColors = {
  ready: 'blue',
  out_for_delivery: 'orange',
  completed: 'green',
};

const statusText = {
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  completed: 'Completed',
};

const statusAccent = {
  ready: 'linear-gradient(135deg, #1890ff 60%, #e6f7ff 100%)',
  out_for_delivery: 'linear-gradient(135deg, #faad14 60%, #fffbe6 100%)',
  completed: 'linear-gradient(135deg, #52c41a 60%, #f6ffed 100%)',
};

const statusbuttonColors = {
  ready: '#1890ff',
  out_for_delivery: '#faad14', 
  completed: '#52c41a',
};

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onStatusChange,
  isUpdating,
  showRevertButton,
  orderType = 'waiter',
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const orderItems = order.order_items || [];
  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card
      style={{
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        background: 'rgba(255, 255, 255, 0.2)',
        border: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 8,
          height: '100%',
          background: statusAccent[order.status as keyof typeof statusAccent],
          borderRadius: '16px 0 0 16px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 16,
          padding: '4px 8px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <span
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: '#52c41a',
          }}
        >
          {Number(order.total_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          <span style={{ fontSize: 15, color: '#888', marginLeft: 2 }}> USD</span>
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          marginTop: 8,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {order.order_type && (
            <span style={{ color: '#888', fontSize: 13 }}>Type: {order.order_type}</span>
          )}
          {order.customer_name && (
            <span style={{ fontWeight: 600, color: '#333' }}>{order.customer_name}</span>
          )}
          {order.delivery_address && (
            <span style={{ color: '#888', fontSize: 13 }}>Address: {order.delivery_address}</span>
          )}
          {order.customer_phone && (
            <span style={{ color: '#888', fontSize: 13 }}>Phone: {order.customer_phone}</span>
          )}
          {order.table_number && (
            <span style={{ color: '#888', fontSize: 13 }}>Table: {order.table_number}</span>
          )}
          {order.created_at && (
            <span style={{ color: '#aaa', fontSize: 12 }}>{new Date(order.created_at).toLocaleString()}</span>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 14, color: '#888', fontWeight: 500 }}>
            Order #{order.id}
          </span>
          <div style={{ fontSize: 13, color: statusColors[order.status as keyof typeof statusColors], fontWeight: 600 }}>
            {statusText[order.status as keyof typeof statusText] || order.status}
          </div>
        </div>
      </div>
      <div
        style={{
          padding: '16px 24px',
        }}
      >
        <Button
          type="link"
          size="small"
          onClick={() => setExpanded(!expanded)}
          style={{ padding: 0, marginBottom: 8, fontWeight: 600 }}
          aria-label={expanded ? 'Hide details' : 'Show details'}
        >
          {expanded ? 'Hide details' : 'Show details'}
        </Button>
        {expanded && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Order Items ({totalItems}):</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {orderItems.map(item => (
                <li key={item.id} style={{ marginBottom: 2 }}>
                  <span style={{ fontWeight: 500 }}>{item.menu_item_name}</span> x{item.quantity}
                  {item.notes && (
                    <span style={{ color: '#888', fontSize: 12, marginLeft: 6 }}>
                      ({item.notes})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          padding: '16px 24px',
        }}
      >
        {/* Waiter order actions */}
        {orderType === 'waiter' && order.status === 'ready' && (
          <Button
            type="primary"
            loading={isUpdating}
            onClick={() => onStatusChange('served')}
            
          >
            Mark as Served
          </Button>
        )}
        {orderType === 'waiter' && order.status === 'served' && (
          <Button
            type="primary"
            loading={isUpdating}
            onClick={() => onStatusChange('completed')}
            style={{ backgroundColor:statusbuttonColors[order.status as keyof typeof statusbuttonColors] }}
          >
            Complete
          </Button>
        )}
        {orderType === 'waiter' && showRevertButton && order.status === 'served' && (
          <Button
            danger
            loading={isUpdating}
            onClick={() => onStatusChange('ready')}
          >
            Revert to Ready
          </Button>
        )}
        {/* Delivery order actions */}
        {orderType === 'delivery' && order.status === 'ready' && (
          <Button
            type="primary"
            loading={isUpdating}
            onClick={() => onStatusChange('out_for_delivery')}
          >
            Out for Delivery
          </Button>
        )}
        {orderType === 'delivery' && order.status === 'out_for_delivery' && (
          <Button
            type="primary"
            loading={isUpdating}
            onClick={() => onStatusChange('completed')}
            style={{ backgroundColor:statusbuttonColors[order.status as keyof typeof statusbuttonColors] }}
          >
            Complete
          </Button>
        )}
        {orderType === 'delivery' && showRevertButton && order.status === 'out_for_delivery' && (
          <Button
            danger
            loading={isUpdating}
            onClick={() => onStatusChange('ready')}
          >
            Revert to Ready
          </Button>
        )}
      </div>
    </Card>
  );
};

export default OrderCard;
