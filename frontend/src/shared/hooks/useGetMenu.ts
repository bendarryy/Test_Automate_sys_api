// useGetMenu.ts
import { useMemo, useCallback } from 'react';
import { useApi } from './useApi';

/**
 * Helper function to create an SVG data URL for an emoji icon.
 */
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

/**
 * Returns the emoji icon for a given category.
 * @param category The category name
 * @returns Emoji string
 */
export const getCategoryIcon = (category: string): string => {
  const normalizedCategory = (category || '').toLowerCase().trim();
  if (categoryIcons[normalizedCategory]) {
    return categoryIcons[normalizedCategory];
  }
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (normalizedCategory.includes(key)) {
      return icon;
    }
  }
  return categoryIcons.default;
};

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  cost: number;
  category: string;
  is_available: boolean;
  image?: string | null | File;
}

/**
 * Custom React hook to manage menu items for a restaurant system.
 * Provides CRUD operations and category utilities, with memoized handlers for performance.
 * @param systemId The restaurant system ID
 * @returns Menu API handlers and state
 */
export const useGetMenu = (systemId: number) => {
  const { callApi, data, loading, error, clearCache } = useApi<MenuItem[]>();

  const getCategories = useCallback(async () => {
    const url = `/restaurant/${systemId}/menu-items/categories/`;
    const response = await callApi<string[]>('get', url);
    return response;
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

  const createMenuItem = useCallback(async (menuItem: MenuItem | FormData): Promise<MenuItem | null> => {
    const url = `/restaurant/${systemId}/menu-items/`;
    const result = await (menuItem instanceof FormData 
      ? callApi<MenuItem>('post', url, menuItem, true)
      : callApi<MenuItem>('post', url, menuItem));
    
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

  const updateMenuItem = useCallback(async (id: number, menuItem: Partial<MenuItem> | FormData): Promise<MenuItem | null> => {
    const url = `/restaurant/${systemId}/menu-items/${id}/`;
    const result = await (menuItem instanceof FormData 
      ? callApi<MenuItem>('put', url, menuItem, true)
      : callApi<MenuItem>('put', url, menuItem));
    
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

  const apiObject = useMemo(() => ({
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
  // For debugging: set displayName on the returned object
  // (React DevTools does not support hooks displayName, but this helps in custom logs)
  // @ts-expect-error: displayName is not a standard property on objects, used here for debugging purposes
  apiObject.displayName = 'useGetMenu';
  return apiObject;
};
