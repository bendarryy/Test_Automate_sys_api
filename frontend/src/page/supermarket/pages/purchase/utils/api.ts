import axios from 'axios';
import { PurchaseOrder, GoodsReceiving } from '../types/purchase';

// Purchase Orders CRUD
export const getPurchaseOrders = async (systemId: string) => axios.get(`/api/supermarket/${systemId}/purchase-orders/`).then(r => r.data);
export const createPurchaseOrder = async (systemId: string, data: Partial<PurchaseOrder>) => axios.post(`/api/supermarket/${systemId}/purchase-orders/`, data).then(r => r.data);
export const updatePurchaseOrder = async (systemId: string, id: number, data: Partial<PurchaseOrder>) => axios.patch(`/api/supermarket/${systemId}/purchase-orders/${id}/`, data).then(r => r.data);
export const deletePurchaseOrder = async (systemId: string, id: number) => axios.delete(`/api/supermarket/${systemId}/purchase-orders/${id}/`).then(r => r.data);

// Goods Receiving CRUD
export const getGoodsReceiving = async (systemId: string) => axios.get(`/api/supermarket/${systemId}/goods-receiving/`).then(r => r.data);
export const createGoodsReceiving = async (systemId: string, data: Partial<GoodsReceiving>) => axios.post(`/api/supermarket/${systemId}/goods-receiving/`, data).then(r => r.data);
export const updateGoodsReceiving = async (systemId: string, id: number, data: Partial<GoodsReceiving>) => axios.patch(`/api/supermarket/${systemId}/goods-receiving/${id}/`, data).then(r => r.data);
export const deleteGoodsReceiving = async (systemId: string, id: number) => axios.delete(`/api/supermarket/${systemId}/goods-receiving/${id}/`).then(r => r.data);
