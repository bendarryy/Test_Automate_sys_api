import { useState, useCallback } from 'react';
import { useApi } from './useApi';

export interface DeliveryOrder {
  id: number;
  status: 'ready' | 'out_for_delivery' | 'completed';
  updated_at: string;
  customer_name?: string;
  table_number?: string;
  created_at?: string;
  order_items: {
    id: number;
    menu_item_name: string;
    quantity: number;
    notes?: string;
  }[];
  total_price: string;
}

export const useDelivery = (systemId: string) => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const { callApi } = useApi<DeliveryOrder[]>();

  const fetchOrders = useCallback(async () => {
    setOrderLoading(true);
    setOrderError(null);
    try {
      const response = await callApi('get', `/restaurant/${systemId}/delivery/orders/`);
      setOrders(response ?? []);
    } catch (error) {
      setOrderError('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setOrderLoading(false);
    }
  }, [systemId]);

  const patchOrderStatus = useCallback(async (orderId: number, newStatus: string) => {
    try {
      await callApi('patch', `/restaurant/${systemId}/delivery/orders/${orderId}/`, {
        status: newStatus
      });
      await fetchOrders(); // Refresh orders after status update
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }, [systemId, fetchOrders]);

  return {
    orders,
    patchOrderStatus,
    fetchOrders,
    orderLoading,
    orderError
  };
};
