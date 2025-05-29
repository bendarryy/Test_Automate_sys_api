import { useCallback, useMemo } from 'react';
import { useApi } from './useApi';

interface DeliveryOrder {
  id: number;
  customer_name: string;
  address: string;
  phone: string;
  status: 'pending' | 'in_progress' | 'delivered' | 'cancelled';
  total_price: number;
  created_at: string;
}

export const useDelivery = (systemId: number) => {
  const { callApi, data, loading, error, clearCache } = useApi<DeliveryOrder[]>();

  const getDeliveryOrders = useCallback(async (status?: string) => {
    let url = `/restaurant/${systemId}/delivery-orders/`;
    if (status) {
      url += `?status=${status}`;
    }
    return await callApi('get', url);
  }, [systemId, callApi]);

  const createDeliveryOrder = useCallback(async (orderData: Omit<DeliveryOrder, 'id' | 'created_at'>) => {
    const result = await callApi('post', `/restaurant/${systemId}/delivery-orders/`, orderData);
    clearCache(`/restaurant/${systemId}/delivery-orders/`);
    return result;
  }, [systemId, callApi, clearCache]);

  const updateDeliveryStatus = useCallback(async (orderId: number, status: DeliveryOrder['status']) => {
    const result = await callApi('patch', `/restaurant/${systemId}/delivery-orders/${orderId}/`, { status });
    clearCache(`/restaurant/${systemId}/delivery-orders/`);
    clearCache(`/restaurant/${systemId}/delivery-orders/${orderId}/`);
    return result;
  }, [systemId, callApi, clearCache]);

  const getDeliveryOrderById = useCallback(async (orderId: number) => {
    return await callApi<DeliveryOrder>('get', `/restaurant/${systemId}/delivery-orders/${orderId}/`);
  }, [systemId, callApi]);

  return useMemo(() => ({
    data,
    loading,
    error,
    getDeliveryOrders,
    createDeliveryOrder,
    updateDeliveryStatus,
    getDeliveryOrderById
  }), [
    data,
    loading,
    error,
    getDeliveryOrders,
    createDeliveryOrder,
    updateDeliveryStatus,
    getDeliveryOrderById
  ]);
};
