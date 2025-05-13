// useGetMenu.ts
import { useApi } from './useApi';

// Helper function to get category icon
export const getCategoryIcon = (category: string): string => {
  const categoryIcons: { [key: string]: string } = {
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
  };

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

// Helper function to create SVG with emoji
const createEmojiSvg = (emoji: string): string => {
  return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='50%' x='50%' dominant-baseline='middle' text-anchor='middle' font-size='50'>${emoji}</text></svg>`;
};

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  cost: number | null;
  category: string;
  image: string | null;
  is_available: boolean;
}

export const useGetMenu = (systemId: number) => {
  const { callApi, data, loading, error } = useApi<MenuItem[]>();

  const getCategories = async () => {
    const url = `/restaurant/${systemId}/menu-items/categories/`;
    return await callApi('get', url);
  };

  const getMenu = async (category?: string) => {
    let url = `/restaurant/${systemId}/menu-items/`;
    if (category) {
      url += `?category=${category}`;
    }
    const response = await callApi('get', url);
    
    // Add category icon to items without images
    if (response && Array.isArray(response)) {
      return response.map(item => ({
        ...item,
        image: item.image || createEmojiSvg(getCategoryIcon(item.category))
      }));
    }
    return response;
  };

  const createMenuItem = async (menuItem: MenuItem | FormData) => {
    const url = `/restaurant/${systemId}/menu-items/`;
    if (menuItem instanceof FormData) {
      return await callApi('post', url, menuItem, true);
    }
    return await callApi('post', url, menuItem);
  };

  const getMenuItemById = async (id: number) => {
    const url = `/restaurant/${systemId}/menu-items/${id}/`;
    const response = await callApi('get', url);
    if (response) {
      return {
        ...response,
        image: response.image || createEmojiSvg(getCategoryIcon(response.category))
      };
    }
    return response;
  };

  const updateMenuItem = async (id: number, menuItem: Partial<MenuItem> | FormData) => {
    const url = `/restaurant/${systemId}/menu-items/${id}/`;
    if (menuItem instanceof FormData) {
      return await callApi('put', url, menuItem, true);
    }
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
    getCategories,
    data, 
    loading, 
    error 
  };
};
