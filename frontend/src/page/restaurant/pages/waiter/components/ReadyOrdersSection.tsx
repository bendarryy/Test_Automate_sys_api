import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Empty, Skeleton } from 'antd';
import { ClockCircleTwoTone } from '@ant-design/icons';
import OrderCard from '../../delivery/components/OrderCard';
import { Order } from '../types/waiterOrder';

interface ReadyOrdersSectionProps {
  orders: Order[];
  orderLoading: boolean;
  statusUpdatingId: number | null;
  onStatusChange: (orderId: number, newStatus: string) => void;
}

const ReadyOrdersSection: React.FC<ReadyOrdersSectionProps> = ({ orders, orderLoading, statusUpdatingId, onStatusChange }) => (
  <div style={{ flex: 2, minWidth: 0 }}>
    <h2 style={{ color: '#1890ff', marginBottom: 16 }}>
      <ClockCircleTwoTone twoToneColor="#1890ff" style={{ marginLeft: 8 }} />
      Ready Orders
    </h2>
    {orderLoading ? (
      <div style={{
        display: 'flex',
        gap: 16,
        padding: 16,
        background: '#f0f9ff',
        borderRadius: 12,
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        maxHeight: 400
      }}>
        {[...Array(3)].map((_, idx) => (
          <Skeleton.Button
            key={idx}
            active
            style={{ width: 300, height: 320, borderRadius: 12, overflow: 'hidden' }}
          />
        ))}
      </div>
    ) : orders.length > 0 ? (
      <div style={{ 
        background: '#f0f9ff', 
        borderRadius: 12, 
        padding: 16, 
        height: '100%',
        width: '100%'
      }}>
        <Swiper 
          spaceBetween={16} 
          slidesPerView={'auto'}
          freeMode={true}
          direction="horizontal"
          style={{ height: '100%', padding: '8px 0' }}
        >
          {orders.map(order => (
            <SwiperSlide key={order.id} style={{ width: 370, height: '100%' }}>
              <div style={{ height: '100%', paddingRight: 16 }}>
                <OrderCard 
                  order={order} 
                  isUpdating={statusUpdatingId === order.id}
                  onStatusChange={(newStatus) => onStatusChange(order.id, newStatus)}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    ) : (
      <Empty description="No orders available" style={{ marginTop: 24 }} />
    )}
  </div>
);

export default ReadyOrdersSection;
