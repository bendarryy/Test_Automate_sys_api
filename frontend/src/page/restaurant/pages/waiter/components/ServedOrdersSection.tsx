import React from 'react';
import { Empty, Skeleton } from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';
import OrderCard from '../../delivery/components/OrderCard';
import { Order } from '../types/waiterOrder';

interface ServedOrdersSectionProps {
  orders: Order[];
  orderLoading: boolean;
  statusUpdatingId: number | null;
  onStatusChange: (orderId: number, newStatus: string) => void;
  onRevert: (orderId: number) => void;
}

const ServedOrdersSection: React.FC<ServedOrdersSectionProps> = ({ orders, orderLoading, statusUpdatingId, onStatusChange, onRevert }) => (
  <div style={{ flex: 1.5, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
    <h2 style={{ color: '#faad14', marginBottom: 16 }}>
      <CheckCircleTwoTone twoToneColor="#faad14" style={{ marginLeft: 8 }} />
      Served Orders
    </h2>
    <div className="custom-scrollbar">
      {orderLoading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: 16,
          height: 'calc(100vh - 200px)',
          paddingRight: 4,
          overflow: 'hidden',
        }}>
          {[...Array(3)].map((_, idx) => (
            <Skeleton.Button
              key={idx}
              active
              style={{ width: '100%', height: "100%", borderRadius: 12, overflow: 'hidden' }}
            />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div style={{ height: '100%', paddingRight: 4 }}>
          {orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              isUpdating={statusUpdatingId === order.id}
              onStatusChange={(newStatus) => {
                if (newStatus === 'ready') {
                  onRevert(order.id);
                } else {
                  onStatusChange(order.id, newStatus);
                }
              }}
              showRevertButton={true}
            />
          ))}
        </div>
      ) : (
        <Empty description="No orders available" style={{ marginTop: 24 }} />
      )}
    </div>
  </div>
);

export default ServedOrdersSection;
