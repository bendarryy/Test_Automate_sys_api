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

export const useGetMenu = (systemId: number, category?: string) => {
  const { callApi, data, loading, error } = useApi<MenuItem[]>();

  const getMenu = async (category: string) => {
    // بناء الـ URL بناءً على وجود فلتر category أم لا
    let url = `/restaurant/${systemId}/menu-items/`;
    if (category) {
      url += `?category=${category}`;
    }
    return await callApi('get', url);
  };

  return { getMenu, data, loading, error };
};
