import React, { useCallback } from 'react';
import { Empty, Skeleton } from 'antd';
import { CarTwoTone } from '@ant-design/icons';
import OrderCard from './OrderCard';
import styles from '../deliverydisplay.module.css';
import type { DeliveryOrder } from '../types/order';



interface OutForDeliverySectionProps {
  orders: DeliveryOrder[];
  isLoading: boolean;
  updatingOrderId: number | null;
  onStatusChange: (orderId: number, status: DeliveryOrder['status']) => void;
  onRevertStatus: (orderId: number) => void;
}

const OutForDeliverySection: React.FC<OutForDeliverySectionProps> = React.memo(({
  orders,
  isLoading,
  updatingOrderId,
  onStatusChange,
  onRevertStatus,
}) => {
  const handleCardStatusChange = useCallback(
    (order: DeliveryOrder, newStatus: DeliveryOrder['status']) => {
      if (newStatus === 'completed') {
        onStatusChange(order.id, newStatus);
      } else if (newStatus === 'ready') {
        onRevertStatus(order.id);
      }
    },
    [onStatusChange, onRevertStatus]
  );

  return (
    <div className={styles.outSection}>
      <h2 className={styles.outTitle}>
        <CarTwoTone twoToneColor="#faad14" style={{ marginLeft: 8 }} />
        Out for Delivery
      </h2>
      <div className={styles.customScrollbar}>
        {isLoading ? (
          <div className={styles.skeletonCol}>
            {[...Array(2)].map((_, idx) => (
              <Skeleton.Button
                key={idx}
                active
                style={{ width: '100%', height: 120, borderRadius: 12, overflow: 'hidden' }}
              />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className={styles.orderCol}>
            {orders.map(order => (
              <OrderCard
                key={order.id}
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
                  // handle only delivery statuses
                  if (newStatus === 'completed' || newStatus === 'ready') {
                    handleCardStatusChange(order, newStatus as DeliveryOrder['status']);
                  }
                }}
                showRevertButton
                orderType="delivery"
              />
            ))}
          </div>
        ) : (
          <Empty description="No orders out for delivery" style={{ marginTop: 24 }} />
        )}
      </div>
    </div>
  );
});

export default OutForDeliverySection;
