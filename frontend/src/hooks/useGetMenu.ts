// useGetMenu.ts
import { useMemo, useCallback } from 'react';
import { useApi } from './useApi';

// Helper function to create emoji SVG
const createEmojiSvg = (emoji: string): string => {
  return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='50%' x='50%' dominant-baseline='middle' text-anchor='middle' font-size='50'>${emoji}</text></svg>`;
};

// Memoized category icons map
const categoryIcons: Readonly<Record<string, string>> = {
  'pizza': '🍕',
  'burger': '🍔',
  'sandwich': '🥪',
  'drinks': '🥤',
  'dessert': '🍰',
  'salad': '🥗',
  'soup': '🥣',
  'pasta': '🍝',
  'seafood': '🦞',
  'chicken': '🍗',
  'beef': '🥩',
  'vegetarian': '🥬',
  'breakfast': '🍳',
  'lunch': '🍱',
  'dinner': '🍽️',
  'snacks': '🍿',
  'ice cream': '🍦',
  'coffee': '☕',
  'tea': '🫖',
  'juice': '🧃',
  'smoothie': '🥤',
  'wine': '🍷',
  'beer': '🍺',
  'cocktail': '🍹',
  'default': '🍽️'
} as const;

export const getCategoryIcon = (category: string): string => {
  // Convert category to lowercase and remove spaces for matching
  const normalizedCategory = (category || '').toLowerCase().trim();
  
  // Try to find an exact match
  if (categoryIcons[normalizedCategory]) {
    return categoryIcons[normalizedCategory];
  }

  // Try to find a partial match
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (normalizedCategory.includes(key)) {
      return icon;
    }
  }

  // Return default icon if no match found
  return categoryIcons.default;
};

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  cost: number | null;
  category: string;
  is_available: boolean;
  image?: string | null | File;
}

export const useGetMenu = (systemId: number) => {
  const { callApi, data, loading, error, clearCache } = useApi<MenuItem[]>();

  const getCategories = useCallback(async () => {
    const url = `/restaurant/${systemId}/menu-items/categories/`;
    return await callApi('get', url);
  }, [systemId, callApi]);

  const getMenu = useCallback(async (category?: string) => {
    let url = `/restaurant/${systemId}/menu-items/`;
    if (category) {
      url += `?category=${category}`;
    }
    const response = await callApi('get', url);
    
    // Add category icon to items without images
    if (response && Array.isArray(response)) {
      return response.map((item: MenuItem) => ({
        ...item,
        image: item.image || createEmojiSvg(getCategoryIcon(item.category))
      }));
    }
    return response;
  }, [systemId, callApi]);

  const createMenuItem = useCallback(async (menuItem: MenuItem | FormData) => {
    const url = `/restaurant/${systemId}/menu-items/`;
    const result = await (menuItem instanceof FormData 
      ? callApi('post', url, menuItem, true)
      : callApi('post', url, menuItem));
    
    // Clear menu cache after creating new item
    clearCache(`/restaurant/${systemId}/menu-items/`);
    return result;
  }, [systemId, callApi, clearCache]);

  const getMenuItemById = useCallback(async (id: number) => {
    const url = `/restaurant/${systemId}/menu-items/${id}/`;
    const response = await callApi<MenuItem>('get', url);
    if (response) {
      return {
        ...response,
        image: response.image || createEmojiSvg(getCategoryIcon(response.category))
      };
    }
    return response;
  }, [systemId, callApi]);

  const updateMenuItem = useCallback(async (id: number, menuItem: Partial<MenuItem> | FormData) => {
    const url = `/restaurant/${systemId}/menu-items/${id}/`;
    const result = await (menuItem instanceof FormData 
      ? callApi('put', url, menuItem, true)
      : callApi('put', url, menuItem));
    
    // Clear menu cache after updating item
    clearCache(`/restaurant/${systemId}/menu-items/`);
    return result;
  }, [systemId, callApi, clearCache]);

  const patchMenuItem = useCallback(async (id: number, menuItem: Partial<MenuItem>) => {
    const url = `/restaurant/${systemId}/menu-items/${id}/`;
    const result = await callApi('patch', url, menuItem);
    
    // Clear menu cache after patching item
    clearCache(`/restaurant/${systemId}/menu-items/`);
    return result;
  }, [systemId, callApi, clearCache]);

  const deleteMenuItem = useCallback(async (id: number) => {
    const url = `/restaurant/${systemId}/menu-items/${id}/`;
    const result = await callApi('delete', url);
    
    // Clear menu cache after deleting item
    clearCache(`/restaurant/${systemId}/menu-items/`);
    return result;
  }, [systemId, callApi, clearCache]);

  return useMemo(() => ({ 
    getMenu, 
    createMenuItem, 
    getMenuItemById, 
    updateMenuItem, 
    patchMenuItem, 
    deleteMenuItem,
    getCategories,
    data, 
    loading, 
    error 
  }), [
    getMenu,
    createMenuItem,
    getMenuItemById,
    updateMenuItem,
    patchMenuItem,
    deleteMenuItem,
    getCategories,
    data,
    loading,
    error
  ]);
};
