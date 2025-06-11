// useGetMenu.ts
import { useCallback, useMemo } from 'react';
import { useApi } from 'shared/hooks/useApi';

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  is_available: boolean;
  image?: string | null;
  // أضف خصائص أخرى حسب الحاجة
}

export const useGetMenuList = (systemId: number) => {
  const { callApi, data: menuItems, loading, error, clearCache } = useApi<MenuItem[]>();

  const getMenu = useCallback(async (category?: string) => {
    try {
      let url = `/restaurant/${systemId}/menu-items/`;
      if (category) {
        url += `?category=${category}`;
      }
      return await callApi('get', url);
    } catch (err) {
      console.error('Error fetching menu:', err);
      throw err;
    }
  }, [systemId, callApi]);

  const createMenuItem = useCallback(async (menuItem: Omit<MenuItem, 'id'>) => {
    try {
      const result = await callApi('post', `/restaurant/${systemId}/menu-items/`, menuItem);
      clearCache(`/restaurant/${systemId}/menu-items/`);
      return result;
    } catch (err) {
      console.error('Error creating menu item:', err);
      throw err;
    }
  }, [systemId, callApi, clearCache]);

  const getMenuItemById = useCallback(async (id: number) => {
    try {
      return await callApi<MenuItem>('get', `/restaurant/${systemId}/menu-items/${id}/`);
    } catch (err) {
      console.error('Error fetching menu item:', err);
      throw err;
    }
  }, [systemId, callApi]);

  const updateMenuItem = useCallback(async (id: number, menuItem: Partial<MenuItem>) => {
    try {
      const result = await callApi('put', `/restaurant/${systemId}/menu-items/${id}/`, menuItem);
      clearCache(`/restaurant/${systemId}/menu-items/${id}/`);
      clearCache(`/restaurant/${systemId}/menu-items/`);
      return result;
    } catch (err) {
      console.error('Error updating menu item:', err);
      throw err;
    }
  }, [systemId, callApi, clearCache]);

  const patchMenuItem = useCallback(async (id: number, menuItem: Partial<MenuItem>) => {
    try {
      const result = await callApi('patch', `/restaurant/${systemId}/menu-items/${id}/`, menuItem);
      clearCache(`/restaurant/${systemId}/menu-items/${id}/`);
      clearCache(`/restaurant/${systemId}/menu-items/`);
      return result;
    } catch (err) {
      console.error('Error patching menu item:', err);
      throw err;
    }
  }, [systemId, callApi, clearCache]);

  const deleteMenuItem = useCallback(async (id: number) => {
    try {
      const result = await callApi('delete', `/restaurant/${systemId}/menu-items/${id}/`);
      clearCache(`/restaurant/${systemId}/menu-items/${id}/`);
      clearCache(`/restaurant/${systemId}/menu-items/`);
      return result;
    } catch (err) {
      console.error('Error deleting menu item:', err);
      throw err;
    }
  }, [systemId, callApi, clearCache]);

  return useMemo(() => ({ 
    getMenu, 
    createMenuItem, 
    getMenuItemById, 
    updateMenuItem, 
    patchMenuItem, 
    deleteMenuItem, 
    menuItems, 
    loading, 
    error 
  }), [
    getMenu,
    createMenuItem,
    getMenuItemById,
    updateMenuItem,
    patchMenuItem,
    deleteMenuItem,
    menuItems,
    loading,
    error
  ]);
};
