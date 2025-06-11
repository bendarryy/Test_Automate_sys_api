import { useMemo, useState, useCallback, useTransition } from 'react';
import { App as AntdApp } from 'antd';
import { useDelivery } from './useDelivery';
import type { DeliveryOrder } from '../types/order';

const SYSTEM_ID = localStorage.getItem('selectedSystemId') ?? '';

export function useDeliveryDisplay() {
  const { message, modal } = AntdApp.useApp();
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    orders,
    isLoading,
    error,
    refresh,
    updateStatus,
  } = useDelivery(SYSTEM_ID);

  const readyOrders = useMemo(
    () =>
      orders
        .filter((o) => o.status === 'ready')
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [orders]
  );

  const outForDeliveryOrders = useMemo(
    () =>
      orders
        .filter((o) => o.status === 'out_for_delivery')
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [orders]
  );

  const handleStatusChange = useCallback(
    async (orderId: number, status: DeliveryOrder['status']) => {
      setUpdatingOrderId(orderId);
      startTransition(async () => {
        try {
          await updateStatus(orderId, status);
          message.success('Order status updated successfully');
        } catch {
          message.error('Failed to update order status');
        } finally {
          setUpdatingOrderId(null);
        }
      });
    },
    [updateStatus, message, startTransition]
  );

  const handleRevertStatus = useCallback(
    (orderId: number) => {
      modal.confirm({
        title: 'Confirm Revert',
        content: 'This order will be moved back to Ready section',
        okText: 'Confirm',
        cancelText: 'Cancel',
        onOk: async () => {
          setUpdatingOrderId(orderId);
          try {
            await updateStatus(orderId, 'ready');
            message.success('Order reverted successfully');
          } catch {
            message.error('Error reverting order');
          } finally {
            setUpdatingOrderId(null);
          }
        },
      });
    },
    [updateStatus, message, modal]
  );

  return {
    orders,
    isLoading: isLoading || isPending,
    error,
    refresh,
    readyOrders,
    outForDeliveryOrders,
    updatingOrderId,
    handleStatusChange,
    handleRevertStatus,
  };
}
