import React from 'react';
import { Card, Button, Tag, Tooltip, Space, Empty } from 'antd';
import { CarOutlined } from '@ant-design/icons';
import { CheckOutlined, RollbackOutlined } from '@ant-design/icons';

interface BaseOrderItem {
  id: number;
  menu_item_name: string;
  quantity: number;
  notes?: string;
}

interface BaseOrder {
  id: number;
  order_items: BaseOrderItem[];
  total_price: number;
  status: string;
  created_at?: string;
  // waiter
  table_number?: number;
  // delivery
  customer_name?: string;
}

type DeliveryStatus = "ready" | "out_for_delivery" | "completed";
type WaiterStatus = "ready" | "served" | "completed";

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
  served: 'orange',
  completed: 'green',
};

const statusText = {
  ready: 'Ready',
  served: 'Served',
  completed: 'Completed',
};

const statusAccent = {
  ready: 'linear-gradient(135deg, #1890ff 60%, #e6f7ff 100%)',
  served: 'linear-gradient(135deg, #faad14 60%, #fffbe6 100%)',
  completed: 'linear-gradient(135deg, #52c41a 60%, #f6ffed 100%)',
};

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onStatusChange,
  isUpdating,
  showRevertButton,
  orderType = 'waiter'
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
        }}
      >
        <Space size="middle">
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {orderType === 'waiter' ? `Table ${order.table_number}` : order.customer_name}
          </span>
          <Tag
            color={statusColors[order.status as keyof typeof statusColors]}
            style={{ fontSize: 14, padding: '2px 12px' }}
          >
            {statusText[order.status as keyof typeof statusText]}
          </Tag>
          <span
            style={{
              fontSize: 14,
              color: '#888',
            }}
          >
            {order.created_at ? new Date(order.created_at).toLocaleTimeString() : ''}
          </span>
        </Space>
        <span
          style={{
            fontSize: 14,
            color: '#888',
          }}
        >
          Order #{order.id}
        </span>
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
          {expanded ? 'Hide details' : `Show details (${totalItems} items)`}
        </Button>
        {expanded && (
          <div
            style={{
              maxHeight: 140,
              overflowY: 'auto',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 8,
              padding: 8,
            }}
          >
            <b>Items:</b>
            <ul
              style={{
                paddingLeft: 20,
                margin: 0,
              }}
            >
              {orderItems.length > 0 ? orderItems.map(item => (
                <li
                  key={item.id}
                  style={{
                    marginBottom: 4,
                    fontSize: 15,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 500,
                    }}
                  >
                    {item.menu_item_name}
                  </span>
                  <span
                    style={{
                      marginLeft: 8,
                      color: '#888',
                    }}
                  >
                    ×{item.quantity}
                  </span>
                </li>
              )) : <Empty description="No items" />}
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
        {orderType === 'waiter' && order.status === 'ready' && (
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
        {orderType === 'waiter' && order.status === 'served' && (
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
        {orderType === 'waiter' && showRevertButton && order.status === 'served' && (
          <Tooltip title="Revert to Ready">
            <Button
              type="default"
              danger
              icon={<RollbackOutlined />}
              onClick={() => onStatusChange('ready')}
              loading={isUpdating}
              style={{ marginLeft: 8 }}
            >
              Revert
            </Button>
          </Tooltip>
        )}
        {orderType === 'delivery' && order.status === 'ready' && (
          <Tooltip title="Mark as Out for Delivery">
            <Button
              type="primary"
              icon={<CarOutlined />}
              loading={isUpdating}
              onClick={() => onStatusChange('out_for_delivery')}
              style={{ borderRadius: 8, fontWeight: 600 }}
              aria-label="Mark as Out for Delivery"
            >
              Mark as Out for Delivery
            </Button>
          </Tooltip>
        )}
        {orderType === 'delivery' && order.status === 'out_for_delivery' && (
          <Tooltip title="Mark as Completed">
            <Button
              type="primary"
              danger
              icon={<CheckOutlined />}
              loading={isUpdating}
              onClick={() => onStatusChange('completed')}
              style={{ borderRadius: 8, fontWeight: 600 }}
              aria-label="Mark as Completed"
            >
              Mark as Completed
            </Button>
          </Tooltip>
        )}
        {orderType === 'delivery' && showRevertButton && order.status === 'out_for_delivery' && (
          <Tooltip title="Revert to Ready">
            <Button
              type="default"
              danger
              icon={<RollbackOutlined />}
              onClick={() => onStatusChange('ready')}
              loading={isUpdating}
              style={{ marginLeft: 8 }}
            >
              Revert
            </Button>
          </Tooltip>
        )}
      </div>
    </Card>
  );
};

export default OrderCard;
