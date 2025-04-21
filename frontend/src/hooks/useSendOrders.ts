import { useApi } from './useApi';

interface OrderItem {
  menu_item: number;
  quantity: number;
}

interface Order {
  customer_name: string;
  table_number: string;
  waiter?: number | null;
  status?: string;
}

export const useSendOrders = (systemId: number) => {
  const { callApi, loading, error } = useApi();

  // إنشاء طلب جديد
  const createOrder = async (orderData: Order) => {
    return await callApi('post', `/restaurant/${systemId}/orders/`, orderData );
  };

  // إضافة عنصر إلى الطلب
  const addItemToOrder = async (orderId: number, item: OrderItem) => {
    // Ensure the payload includes the required 'menu_item' and 'quantity' fields
    if (!item.menu_item || !item.quantity) {
      throw new Error("Both 'menu_item' and 'quantity' fields are required.");
    }

    return await callApi('post', `/restaurant/${systemId}/orders/${orderId}/items/`, item);
  };

  // تحديث حالة الطلب (مثل pending, preparing, completed، الخ)
  const updateOrderStatus = async (orderId: number, status: string) => {
    return await callApi('patch', `/restaurant/${systemId}/orders/${orderId}/`,   status  );
  };

  return { createOrder, addItemToOrder, updateOrderStatus, loading, error };
};
