import { useState, useCallback } from 'react';
import axios from 'axios';

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

  const fetchOrders = useCallback(async () => {
    setOrderLoading(true);
    setOrderError(null);
    try {
      const response = await axios.get(`/api/restaurant/${systemId}/delivery/orders/`);
      setOrders(response.data);
    } catch (error) {
      setOrderError('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setOrderLoading(false);
    }
  }, [systemId]);

  const patchOrderStatus = useCallback(async (orderId: number, newStatus: string) => {
    try {
      await axios.patch(`/api/restaurant/${systemId}/delivery/orders/${orderId}/`, {
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
