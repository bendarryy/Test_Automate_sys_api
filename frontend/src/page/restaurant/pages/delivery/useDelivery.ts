import { useApi } from '../../../../shared/hooks/useApi';
import { useCallback, useEffect, useRef } from 'react';

export interface DeliveryOrder {
  id: number;
  system: number;
  customer_name: string;
  table_number: number | null;
  waiter: string | null;
  total_price: string;
  profit: number;
  status: 'ready' | 'out_for_delivery' | 'completed';
  order_type: 'delivery';
  order_items: unknown[];
  created_at: string;
  updated_at: string;
}

interface UseDeliveryOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseDeliveryResult {
  orders: DeliveryOrder[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateStatus: (orderId: number, status: DeliveryOrder['status']) => Promise<void>;
}

export function useDelivery(
  systemId: string | number,
  options?: UseDeliveryOptions
): UseDeliveryResult {
  const ordersApi = useApi<DeliveryOrder[]>();
  const updateApi = useApi<DeliveryOrder>();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOrders = useCallback(async () => {
    await ordersApi.callApi('get', `/restaurant/${systemId}/delivery/orders/`);
  }, [ordersApi, systemId]);

  const refresh = useCallback(async () => {
    ordersApi.clearCache(`/restaurant/${systemId}/delivery/orders/`);
    await fetchOrders();
  }, [ordersApi, systemId, fetchOrders]);

  const updateStatus = useCallback(
    async (orderId: number, status: DeliveryOrder['status']) => {
      await updateApi.callApi(
        'patch',
        `/restaurant/${systemId}/delivery/orders/${orderId}/`,
        { status }
      );
      await refresh();
    },
    [updateApi, systemId, refresh]
  );

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemId]);

  useEffect(() => {
    if (!options?.autoRefresh) return;
    intervalRef.current = setInterval(
      fetchOrders,
      options.refreshInterval ?? 5000
    );
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [options?.autoRefresh, options?.refreshInterval, fetchOrders]);

  return {
    orders: ordersApi.data ?? [],
    isLoading: ordersApi.loading || updateApi.loading,
    error: ordersApi.error || updateApi.error,
    refresh,
    updateStatus,
  };
}

