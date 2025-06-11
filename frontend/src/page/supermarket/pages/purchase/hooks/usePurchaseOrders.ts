import { useCallback } from 'react';
import { useApi } from '../../../../../shared/hooks/useApi';
import { PurchaseOrder } from '../types/PurchaseOrder';

export const usePurchaseOrders = (systemId: string) => {
  const { data, loading, error, callApi, clearCache } = useApi<PurchaseOrder[]>();

  const fetchOrders = useCallback(() => {
    return callApi('get', `/supermarket/${systemId}/purchase-orders/`);
  }, [callApi, systemId]);

  const fetchPendingOrders = useCallback(() => {
    return callApi('get', `/supermarket/${systemId}/purchase-orders/pending/`);
  }, [callApi, systemId]);

  const fetchPartiallyReceivedOrders = useCallback(() => {
    return callApi('get', `/supermarket/${systemId}/purchase-orders/partially-received/`);
  }, [callApi, systemId]);

  const createOrder = useCallback((order: Partial<PurchaseOrder>) => {
    return callApi('post', `/supermarket/${systemId}/purchase-orders/`, order);
  }, [callApi, systemId]);

  const updateOrder = useCallback((id: number, order: Partial<PurchaseOrder>) => {
    return callApi('patch', `/supermarket/${systemId}/purchase-orders/${id}/`, order);
  }, [callApi, systemId]);

  const deleteOrder = useCallback((id: number) => {
    return callApi('delete', `/supermarket/${systemId}/purchase-orders/${id}/`);
  }, [callApi, systemId]);

  return {
    data,
    loading,
    error,
    fetchOrders,
    fetchPendingOrders,
    fetchPartiallyReceivedOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    clearCache,
  };
};
