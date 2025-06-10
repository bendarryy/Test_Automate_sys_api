import { useMemo, useState, useCallback } from 'react';
import { useWaiter } from './useWaiter';
import { useSelectedSystemId } from '../../../../../shared/hooks/useSelectedSystemId';
import { getReadyOrders, getServedOrders } from '../utils/orderUtils';
import { App as AntdApp } from 'antd';
import { Order } from '../types/waiterOrder';
import { WaiterOrder } from './useWaiter';

function mapWaiterOrderToOrder(order: WaiterOrder): Order {
  return {
    id: order.id,
    order_items: order.order_items,
    total_price: Number(order.total_price),
    status: order.status,
    created_at: order.created_at,
    table_number: order.table_number ? Number(order.table_number) : undefined,
    customer_name: order.customer_name,
    updated_at: order.updated_at,
  };
}

export function useWaiterDisplay() {
  const { message, modal } = AntdApp.useApp();
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [SYSTEM_ID] = useSelectedSystemId();
  const { orders, patchOrderStatus, fetchOrders, orderLoading, orderError } = useWaiter(SYSTEM_ID || "");

  // Fetch orders automatically on mount
  // (Should be called in the component, not here)

  const mappedOrders = useMemo(() => orders.map(mapWaiterOrderToOrder), [orders]);
  const readyOrders = useMemo(() => getReadyOrders(mappedOrders), [mappedOrders]);
  const servedOrders = useMemo(() => getServedOrders(mappedOrders), [mappedOrders]);

  const handleOrderStatusChange = useCallback(async (orderId: number, newStatus: string) => {
    setStatusUpdatingId(orderId);
    try {
      await patchOrderStatus(orderId, newStatus);
      message.success('Order status updated successfully');
    } catch {
      message.error('Failed to update order status');
    } finally {
      setStatusUpdatingId(null);
    }
  }, [patchOrderStatus, message]);

  const handleRevertStatus = useCallback((orderId: number) => {
    modal.confirm({
      title: 'Confirm Revert',
      content: 'This order will be moved back to Ready section',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setStatusUpdatingId(orderId);
          await patchOrderStatus(orderId, 'ready');
          message.success('Order reverted successfully');
        } catch {
          message.error('Error reverting order');
        } finally {
          setStatusUpdatingId(null);
        }
      }
    });
  }, [modal, patchOrderStatus, message]);

  return {
    orders: mappedOrders,
    readyOrders,
    servedOrders,
    patchOrderStatus,
    fetchOrders,
    orderLoading,
    orderError,
    statusUpdatingId,
    handleOrderStatusChange,
    handleRevertStatus,
  };
}
