import { useCallback, useMemo } from 'react';
import { useApi } from './useApi';

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'canceled';
type OrderType = 'in_house' | 'delivery';



interface Order {
  id: string;
  customer_name: string | null;
  table_number: string;
  waiter?: number;
  order_type: OrderType;
  status: OrderStatus;
  total_price: number;
  profit: number;
  order_items: {
    id: string;
    menu_item: number;
    menu_item_name?: string;
    quantity: number;
  }[];
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  menu_item: number;
  quantity: number;
}

export const useOrders = <T extends Order>(systemId: string) => {
  const api = useApi<T>();

  const getOrders = useCallback(async () => {
    try {
      return await api.callApi('get', `/restaurant/${systemId}/orders/`);
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }, [systemId, api]);

  const getOrderDetails = useCallback(async (id: string) => {
    try {
      return await api.callApi('get', `/restaurant/${systemId}/orders/${id}/`);
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }, [systemId, api]);

  const updateOrderStatus = useCallback(async (id: string, status: string) => {
    try {
      const result = await api.callApi('patch', `/restaurant/${systemId}/orders/${id}/`, { status });
      // Clear both order and list caches
      api.clearCache(`/restaurant/${systemId}/orders/${id}/`);
      api.clearCache(`/restaurant/${systemId}/orders/`);
      return result;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }, [systemId, api]);

  const updateOrder = useCallback(async (id: string, data: Partial<Order>) => {
    try {
      const result = await api.callApi('patch', `/restaurant/${systemId}/orders/${id}/`, data);
      // Clear both order and list caches
      api.clearCache(`/restaurant/${systemId}/orders/${id}/`);
      api.clearCache(`/restaurant/${systemId}/orders/`);
      return result;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }, [systemId, api]);

  const getOrderItems = useCallback(async (orderId: string) => {
    try {
      return await api.callApi('get', `/restaurant/${systemId}/orders/${orderId}/items/`);
    } catch (error) {
      console.error('Error fetching order items:', error);
      throw error;
    }
  }, [systemId, api]);

  const createOrderItem = useCallback(async (orderId: string, item: Omit<OrderItem, 'id'>) => {
    try {
      const result = await api.callApi('post', `/restaurant/${systemId}/orders/${orderId}/items/`, item);
      // Clear both order items and order caches
      api.clearCache(`/restaurant/${systemId}/orders/${orderId}/items/`);
      api.clearCache(`/restaurant/${systemId}/orders/${orderId}/`);
      return result;
    } catch (error) {
      console.error('Error creating order item:', error);
      throw error;
    }
  }, [systemId, api]);

  const deleteOrderItem = useCallback(async (orderId: string, itemId: string) => {
    try {
      await api.callApi('delete', `/restaurant/${systemId}/orders/${orderId}/items/${itemId}/`);
      // Clear both order items and order caches
      api.clearCache(`/restaurant/${systemId}/orders/${orderId}/items/`);
      api.clearCache(`/restaurant/${systemId}/orders/${orderId}/`);
    } catch (error) {
      console.error('Error deleting order item:', error);
      throw error;
    }
  }, [systemId, api]);

  const deleteOrder = useCallback(async (id: string) => {
    try {
      await api.callApi('delete', `/restaurant/${systemId}/orders/${id}/`);
      // Clear both order and list caches
      api.clearCache(`/restaurant/${systemId}/orders/${id}/`);
      api.clearCache(`/restaurant/${systemId}/orders/`);
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }, [systemId, api]);

  return useMemo(() => ({
    ...api,
    getOrders,
    getOrderDetails,
    updateOrderStatus,
    updateOrder,
    getOrderItems,
    createOrderItem,
    deleteOrderItem,
    deleteOrder
  }), [
    api,
    getOrders,
    getOrderDetails,
    updateOrderStatus,
    updateOrder,
    getOrderItems,
    createOrderItem,
    deleteOrderItem,
    deleteOrder
  ]);
};