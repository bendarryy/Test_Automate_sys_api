import React, { useCallback } from 'react';
import { Empty, Skeleton } from 'antd';
import { ClockCircleTwoTone } from '@ant-design/icons';
import OrderCard from './OrderCard';
import styles from '../deliverydisplay.module.css';
import type { DeliveryOrder } from '../types/order';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';

interface ReadyOrdersSectionProps {
  orders: DeliveryOrder[];
  isLoading: boolean;
  updatingOrderId: number | null;
  onStatusChange: (orderId: number, status: DeliveryOrder['status']) => void;
}

const ReadyOrdersSection: React.FC<ReadyOrdersSectionProps> = React.memo(({
  orders,
  isLoading,
  updatingOrderId,
  onStatusChange,
}) => {
  const handleCardStatusChange = useCallback(
    (order: DeliveryOrder, newStatus: DeliveryOrder['status']) => {
      if (newStatus === 'out_for_delivery') {
        onStatusChange(order.id, newStatus);
      }
    },
    [onStatusChange]
  );

  return (
    <div className={styles.readySection}>
      <h2 className={styles.readyTitle}>
        <ClockCircleTwoTone twoToneColor="#1890ff" style={{ marginLeft: 8 }} />
        Ready Orders
      </h2>
      {isLoading ? (
        <div className={styles.skeletonRow}>
          {[...Array(3)].map((_, idx) => (
            <Skeleton.Button
              key={idx}
              active
              style={{ width: 300, height: 320, borderRadius: 12, overflow: 'hidden' }}
            />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className={styles.swiperWrapper}>
          <Swiper
            spaceBetween={16}
            slidesPerView={'auto'}
            freeMode
            direction="horizontal"
            style={{ height: '100%', padding: '8px 0' }}
          >
            {orders.map(order => (
              <SwiperSlide key={order.id} style={{ width: 370, height: '100%' }}>
                <div style={{ height: '100%', paddingRight: 16 }}>
                  <OrderCard
                    order={{
                      ...order,
                      total_price: typeof order.total_price === 'string'
                        ? parseFloat(order.total_price)
                        : order.total_price,
                      table_number: order.table_number === null ? undefined : order.table_number,
                      order_items: Array.isArray(order.order_items)
                        ? order.order_items.filter(
                            function (
                              item
                            ): item is {
                              id: number;
                              menu_item_name: string;
                              quantity: number;
                              notes?: string;
                            } {
                              if (
                                typeof item === 'object' &&
                                item !== null &&
                                'id' in item &&
                                'menu_item_name' in item &&
                                'quantity' in item
                              ) {
                                const obj = item;
                                return (
                                  typeof obj.id === 'number' &&
                                  typeof obj.menu_item_name === 'string' &&
                                  typeof obj.quantity === 'number'
                                );
                              }
                              return false;
                            }
                          )
                        : []
                    }}
                    isUpdating={updatingOrderId === order.id}
                    onStatusChange={newStatus => {
                      if (newStatus === 'out_for_delivery') {
                        handleCardStatusChange(order, newStatus as 'out_for_delivery');
                      }
                    }}
                    orderType="delivery"
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
});

export default ReadyOrdersSection;
