import { useCallback, useMemo } from 'react';
import { useApi } from './useApi';
import dayjs from 'dayjs';

export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  product_id: string;
  quantity: number;
  price: number;
  order_date: string;
  expected_delivery_date?: string;
  status: 'pending' | 'partially_received' | 'completed';
  received_quantity?: number;
}

export interface GoodsReceiving {
  id: string;
  purchase_order_id: string;
  received_quantity: number;
  received_date: string;
  expiry_date?: string;
  location?: string;
}

export const usePurchaseOrders = (systemId: string) => {
  const { data, loading, error, callApi, clearCache } = useApi();

  const getPurchaseOrders = useCallback(async () => {
    try {
      return await callApi('get', `/supermarket/${systemId}/purchase-orders/`);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      throw error;
    }
  }, [systemId, callApi]);

  const createPurchaseOrder = useCallback(async (data: Omit<PurchaseOrder, 'id' | 'status'>) => {
    try {
      const result = await callApi('post', `/supermarket/${systemId}/purchase-orders/`, data);
      clearCache(`/supermarket/${systemId}/purchase-orders/`);
      return result;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }
  }, [systemId, callApi, clearCache]);

  const updatePurchaseOrder = useCallback(async (id: string, data: Partial<PurchaseOrder>) => {
    try {
      const result = await callApi('patch', `/supermarket/${systemId}/purchase-orders/${id}/`, data);
      clearCache(`/supermarket/${systemId}/purchase-orders/${id}/`);
      clearCache(`/supermarket/${systemId}/purchase-orders/`);
      return result;
    } catch (error) {
      console.error('Error updating purchase order:', error);
      throw error;
    }
  }, [systemId, callApi, clearCache]);

  const deletePurchaseOrder = useCallback(async (id: string) => {
    try {
      await callApi('delete', `/supermarket/${systemId}/purchase-orders/${id}/`);
      clearCache(`/supermarket/${systemId}/purchase-orders/${id}/`);
      clearCache(`/supermarket/${systemId}/purchase-orders/`);
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      throw error;
    }
  }, [systemId, callApi, clearCache]);

  const getPendingPurchaseOrders = useCallback(async () => {
    try {
      return await callApi('get', `/supermarket/${systemId}/purchase-orders/pending/`);
    } catch (error) {
      console.error('Error fetching pending purchase orders:', error);
      throw error;
    }
  }, [systemId, callApi]);

  const getPartiallyReceivedPurchaseOrders = useCallback(async () => {
    try {
      return await callApi('get', `/supermarket/${systemId}/purchase-orders/partially-received/`);
    } catch (error) {
      console.error('Error fetching partially received purchase orders:', error);
      throw error;
    }
  }, [systemId, callApi]);

  const getGoodsReceiving = useCallback(async () => {
    try {
      return await callApi('get', `/supermarket/${systemId}/goods-receiving/`);
    } catch (error) {
      console.error('Error fetching goods receiving:', error);
      throw error;
    }
  }, [systemId, callApi]);

  const createGoodsReceiving = useCallback(async (data: Omit<GoodsReceiving, 'id'>) => {
    try {
      // Get the purchase order to check order date and remaining quantity
      const purchaseOrder = await callApi<PurchaseOrder>('get', `/supermarket/${systemId}/purchase-orders/${data.purchase_order_id}/`);
      
      if (!purchaseOrder) {
        throw new Error('Purchase order not found');
      }
      
      // Validate received date is not before order date
      if (dayjs(data.received_date).isBefore(dayjs(purchaseOrder.order_date))) {
        throw new Error('Received date cannot be before order date');
      }

      // Calculate remaining quantity
      const receivedQuantity = purchaseOrder.received_quantity || 0;
      const remainingQuantity = purchaseOrder.quantity - receivedQuantity;

      // Validate received quantity doesn't exceed remaining quantity
      if (data.received_quantity > remainingQuantity) {
        throw new Error(`Received quantity (${data.received_quantity}) exceeds remaining quantity (${remainingQuantity})`);
      }

      if (data.received_quantity <= 0) {
        throw new Error('Received quantity must be greater than 0');
      }

      const result = await callApi('post', `/supermarket/${systemId}/goods-receiving/`, data);
      clearCache(`/supermarket/${systemId}/goods-receiving/`);
      clearCache(`/supermarket/${systemId}/purchase-orders/${data.purchase_order_id}/`);
      return result;
    } catch (error) {
      console.error('Error creating goods receiving:', error);
      throw error;
    }
  }, [systemId, callApi, clearCache]);

  const updateGoodsReceiving = useCallback(async (id: string, data: Partial<GoodsReceiving>) => {
    try {
      if (data.received_date) {
        // Get the purchase order to check order date
        const goodsReceiving = await callApi<GoodsReceiving>('get', `/supermarket/${systemId}/goods-receiving/${id}/`);
        if (!goodsReceiving) {
          throw new Error('Goods receiving record not found');
        }
        const purchaseOrder = await callApi<PurchaseOrder>('get', `/supermarket/${systemId}/purchase-orders/${goodsReceiving.purchase_order_id}/`);
        if (!purchaseOrder) {
          throw new Error('Purchase order not found');
        }
        
        // Validate received date is not before order date
        if (dayjs(data.received_date).isBefore(dayjs(purchaseOrder.order_date))) {
          throw new Error('Received date cannot be before order date');
        }
      }

      if (data.received_quantity) {
        // Get the purchase order and current goods receiving record
        const goodsReceiving = await callApi<GoodsReceiving>('get', `/supermarket/${systemId}/goods-receiving/${id}/`);
        if (!goodsReceiving) {
          throw new Error('Goods receiving record not found');
        }
        const purchaseOrder = await callApi<PurchaseOrder>('get', `/supermarket/${systemId}/purchase-orders/${goodsReceiving.purchase_order_id}/`);
        if (!purchaseOrder) {
          throw new Error('Purchase order not found');
        }
        
        // Calculate remaining quantity (excluding current goods receiving record)
        const totalReceivedQuantity = (purchaseOrder.received_quantity || 0) - goodsReceiving.received_quantity;
        const remainingQuantity = purchaseOrder.quantity - totalReceivedQuantity;

        // Validate new received quantity doesn't exceed remaining quantity
        if (data.received_quantity > remainingQuantity) {
          throw new Error(`Received quantity (${data.received_quantity}) exceeds remaining quantity (${remainingQuantity})`);
        }
      }

      const result = await callApi('patch', `/supermarket/${systemId}/goods-receiving/${id}/`, data);
      clearCache(`/supermarket/${systemId}/goods-receiving/${id}/`);
      clearCache(`/supermarket/${systemId}/goods-receiving/`);
      return result;
    } catch (error) {
      console.error('Error updating goods receiving:', error);
      throw error;
    }
  }, [systemId, callApi, clearCache]);

  const deleteGoodsReceiving = useCallback(async (id: string) => {
    try {
      await callApi('delete', `/supermarket/${systemId}/goods-receiving/${id}/`);
      clearCache(`/supermarket/${systemId}/goods-receiving/${id}/`);
      clearCache(`/supermarket/${systemId}/goods-receiving/`);
    } catch (error) {
      console.error('Error deleting goods receiving:', error);
      throw error;
    }
  }, [systemId, callApi, clearCache]);

  const getGoodsReceivingByPurchaseOrder = useCallback(async (purchaseOrderId: string) => {
    try {
      return await callApi('get', `/supermarket/${systemId}/goods-receiving/by-purchase-order/?purchase_order_id=${purchaseOrderId}`);
    } catch (error) {
      console.error('Error fetching goods receiving by purchase order:', error);
      throw error;
    }
  }, [systemId, callApi]);

  return useMemo(() => ({
    data,
    loading,
    error,
    getPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getPendingPurchaseOrders,
    getPartiallyReceivedPurchaseOrders,
    getGoodsReceiving,
    createGoodsReceiving,
    updateGoodsReceiving,
    deleteGoodsReceiving,
    getGoodsReceivingByPurchaseOrder,
  }), [
    data,
    loading,
    error,
    getPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getPendingPurchaseOrders,
    getPartiallyReceivedPurchaseOrders,
    getGoodsReceiving,
    createGoodsReceiving,
    updateGoodsReceiving,
    deleteGoodsReceiving,
    getGoodsReceivingByPurchaseOrder,
  ]);
}; 