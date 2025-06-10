// API endpoint helpers for supermarket products

const API_BASE = '/supermarket';

export const getProductsUrl = (systemId: string) => `${API_BASE}/${systemId}/products/`;
export const getProductUrl = (systemId: string, id: number) => `${API_BASE}/${systemId}/products/${id}`;
export const getAddProductUrl = (systemId: string) => `${API_BASE}/${systemId}/products/`;
export const getUpdateStockUrl = (systemId: string, id: number) => `${API_BASE}/${systemId}/products/${id}/stock/`;
export const getLowStockUrl = (systemId: string) => `${API_BASE}/${systemId}/products/low-stock/`;
export const getExpiringSoonUrl = (systemId: string) => `${API_BASE}/${systemId}/products/expiring-soon/`;
export const getStockHistoryUrl = (systemId: string) => `${API_BASE}/${systemId}/products/stock-history/`;
