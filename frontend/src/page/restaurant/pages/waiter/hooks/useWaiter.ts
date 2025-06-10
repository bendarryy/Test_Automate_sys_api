import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useApi } from '../../../../../shared/hooks/useApi';

// Types for order and table, matching the API
export interface WaiterOrderItem {
  id: number;
  menu_item: number;
  menu_item_name: string;
  quantity: number;
}

export interface WaiterOrder {
  id: number;
  system: number;
  customer_name: string;
  table_number: string;
  waiter: number | null;
  total_price: string;
  profit: number;
  status: string;
  order_type: string;
  order_items: WaiterOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface WaiterTableStatus {
  status: string;
  current_order?: {
    id: number;
    customer_name: string;
    status: string;
  };
}
export type WaiterTablesMap = Record<string, WaiterTableStatus>;

const DEBOUNCE_DELAY = 300; // 300ms debounce delay

export function useWaiter(systemId: string | number) {
  const { callApi: callOrdersApi, clearCache: clearOrdersCache } = useApi<WaiterOrder[]>();
  const { callApi: callTablesApi, clearCache: clearTablesCache } = useApi<WaiterTablesMap>();
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Orders state
  const [orders, setOrders] = useState<WaiterOrder[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Tables state
  const [tables, setTables] = useState<WaiterTablesMap>({});
  const [tablesLoading, setTablesLoading] = useState(false);
  const [tablesError, setTablesError] = useState<string | null>(null);

  // Fetch all orders with debouncing
  const fetchOrders = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
    setOrderLoading(true);
    setOrderError(null);
    try {
        const data = await callOrdersApi('get', `/restaurant/${systemId}/waiter/orders/`);
      setOrders(data || []);
    } catch (err) {
        setOrderError(err instanceof Error ? err.message : 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setOrderLoading(false);
    }
    }, DEBOUNCE_DELAY);
  }, [systemId, callOrdersApi]);

  // Fetch all tables with debouncing
  const fetchTables = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
    setTablesLoading(true);
    setTablesError(null);
    try {
        const data = await callTablesApi('get', `/restaurant/${systemId}/waiter/orders/tables/`);
      setTables(data || {});
    } catch (err) {
        setTablesError(err instanceof Error ? err.message : 'Failed to fetch tables');
      setTables({});
    } finally {
      setTablesLoading(false);
    }
    }, DEBOUNCE_DELAY);
  }, [systemId, callTablesApi]);

  // Fetch a single order instance
  const fetchOrder = useCallback(async (orderId: number | string) => {
    return callOrdersApi('get', `/restaurant/${systemId}/waiter/orders/${orderId}/`);

  }, [systemId, callOrdersApi]);

  // Patch order status with optimistic updates
  const patchOrderStatus = useCallback(
    async (orderId: number | string, status: string) => {
      // Optimistically update the order status
      setOrders(prev => prev.map(o => 
        o.id === Number(orderId) ? { ...o, status } : o
      ));

      try {
        const updated = await callOrdersApi('patch', `/restaurant/${systemId}/waiter/orders/${orderId}/`, { status });
        // Update with actual response
        setOrders(prev => prev.map(o => 
          o.id === Number(orderId) ? { ...o, ...updated } : o
        ));
      return updated;
      } catch (error) {
        // Revert on error
        setOrders(prev => prev.map(o => 
          o.id === Number(orderId) ? { ...o, status: o.status } : o
        ));
        throw error;
      }
    },
    [callOrdersApi, systemId]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Initial fetch with cleanup
  useEffect(() => {
    fetchOrders();
    fetchTables();

    // Set up polling interval
    const pollInterval = setInterval(() => {
      fetchOrders();
      fetchTables();
    }, 30000); // Poll every 30 seconds

    return () => {
      clearInterval(pollInterval);
      clearOrdersCache(`/restaurant/${systemId}/waiter/orders/`);
      clearTablesCache(`/restaurant/${systemId}/waiter/orders/tables/`);
    };
  }, [fetchOrders, fetchTables, systemId, clearOrdersCache, clearTablesCache]);

  return useMemo(() => ({
    orders,
    tables,
    orderLoading,
    tablesLoading,
    orderError,
    tablesError,
    fetchOrders,
    fetchTables,
    fetchOrder,
    patchOrderStatus,
  }), [
    orders,
    tables,
    orderLoading,
    tablesLoading,
    orderError,
    tablesError,
    fetchOrders,
    fetchTables,
    fetchOrder,
    patchOrderStatus,
  ]);
}
