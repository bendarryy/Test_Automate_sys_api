import { useApi } from './useApi';

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'canceled';
type OrderType = 'in_house' | 'delivery';

interface CreateOrderData {
  customer_name: string | null;
  table_number: string | null;
  waiter: number | null;
  order_type: OrderType;
}

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

  const getOrders = async () => {
    return api.callApi('get', `/restaurant/${systemId}/orders/`);
  };

  const getOrderDetails = async (id: string) => {
    return api.callApi('get', `/restaurant/${systemId}/orders/${id}/`);
  };

  const createOrder = async (data: CreateOrderData) => {
    return api.callApi('post', `/restaurant/${systemId}/orders/`, data);
  };

  const updateOrderStatus = async (id: string, status: string) => {
    return api.callApi('patch', `/restaurant/${systemId}/orders/${id}/`, { status });
  };

  const updateOrder = async (id: string, data: Partial<Order>) => {
    return api.callApi('patch', `/restaurant/${systemId}/orders/${id}/`, data);
  };

  const getOrderItems = async (orderId: string) => {
    return api.callApi('get', `/restaurant/${systemId}/orders/${orderId}/items/`);
  };

  const createOrderItem = async (orderId: string, item: Omit<OrderItem, 'id'>) => {
    return api.callApi('post', `/restaurant/${systemId}/orders/${orderId}/items/`, item);
  };

  const deleteOrderItem = async (orderId: string, itemId: string) => {
    return api.callApi('delete', `/restaurant/${systemId}/orders/${orderId}/items/${itemId}/`);
  };

  const deleteOrder = async (id: string) => {
    return api.callApi('delete', `/restaurant/${systemId}/orders/${id}/`);
  };

  return {
    ...api,
    getOrders,
    getOrderDetails,
    updateOrderStatus,
    updateOrder,
    getOrderItems,
    createOrderItem,
    deleteOrderItem,
    deleteOrder
  };
};