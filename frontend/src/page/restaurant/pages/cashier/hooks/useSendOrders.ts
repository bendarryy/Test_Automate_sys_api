import { useCallback, useMemo } from 'react';
import { useApi } from 'shared/hooks/useApi';

interface OrderItem {
  menu_item: number;
  quantity: number;
}

interface Order {
  customer_name: string | null;
  table_number: string | null;
  waiter?: number | null;
  order_type: 'in_house' | 'delivery';
  status?: string;
}

interface OrderResponse {
  id: number;
  customer_name: string;
  table_number: string;
  total_price: number;
  status: string;
  order_type: 'in_house' | 'delivery';
  created_at: string;
  waiter?: number;
}

export const useSendOrders = (systemId: number) => {
  const { callApi, loading, error, clearCache } = useApi<OrderResponse>();

  const createOrder = useCallback(async (orderData: Order) => {
    try {
      const result = await callApi('post', `/restaurant/${systemId}/orders/`, orderData);
      clearCache(`/restaurant/${systemId}/orders/`);
      return result;
    } catch (err) {
      console.error('Error creating order:', err);
      throw err;
    }
  }, [systemId, callApi, clearCache]);

  const addItemToOrder = useCallback(async (orderId: number, item: OrderItem) => {
    try {
      if (!item.menu_item || !item.quantity) {
        throw new Error("Both 'menu_item' and 'quantity' fields are required.");
      }

      const result = await callApi('post', `/restaurant/${systemId}/orders/${orderId}/items/`, item);
      clearCache(`/restaurant/${systemId}/orders/${orderId}/`);
      return result;
    } catch (err) {
      console.error('Error adding item to order:', err);
      throw err;
    }
  }, [systemId, callApi, clearCache]);

  const updateOrderStatus = useCallback(async (orderId: number, status: string) => {
    try {
      const result = await callApi('patch', `/restaurant/${systemId}/orders/${orderId}/`, { status });
      clearCache(`/restaurant/${systemId}/orders/${orderId}/`);
      clearCache(`/restaurant/${systemId}/orders/`);
      return result;
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  }, [systemId, callApi, clearCache]);

  return useMemo(() => ({
    createOrder,
    addItemToOrder,
    updateOrderStatus,
    loading,
    error
  }), [
    createOrder,
    addItemToOrder,
    updateOrderStatus,
    loading,
    error
  ]);
};
