// useGetMenu.ts
import { useApi } from './useApi';

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  // أضف خصائص أخرى حسب الحاجة
}

export const useGetMenuList = (systemId: number) => {
  const { callApi, data: menuItems, loading, error } = useApi<MenuItem[]>();

  const getMenu = async (category?: string) => {
    let url = `/restaurant/${systemId}/menu-items/`;
    if (category) {
      url += `?category=${category}`;
    }
    return await callApi('get', url);
  };

  const createMenuItem = async (menuItem: MenuItem) => {
    const url = `/restaurant/${systemId}/menu-items/`;
    return await callApi('post', url, menuItem);
  };

  const getMenuItemById = async (id: number) => {
    const url = `/restaurant/${systemId}/menu-items/${id}/`;
    return await callApi('get', url);
  };

  const updateMenuItem = async (id: number, menuItem: Partial<MenuItem>) => {
    const url = `/restaurant/${systemId}/menu-items/${id}/`;
    return await callApi('put', url, menuItem);
  };

  const patchMenuItem = async (id: number, menuItem: Partial<MenuItem>) => {
    const url = `/restaurant/${systemId}/menu-items/${id}/`;
    return await callApi('patch', url, menuItem);
  };

  const deleteMenuItem = async (id: number) => {
    const url = `/restaurant/${systemId}/menu-items/${id}/`;
    return await callApi('delete', url);
  };

  return { 
    getMenu, 
    createMenuItem, 
    getMenuItemById, 
    updateMenuItem, 
    patchMenuItem, 
    deleteMenuItem, 
    menuItems, 
    loading, 
    error 
  };
};
