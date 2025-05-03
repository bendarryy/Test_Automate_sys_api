import { useCallback } from 'react';

/**
 * Custom hook to get and set the selected system ID and category using localStorage.
 * Usage:
 *   const [selectedSystemId, setSelectedSystemId, selectedCategory, setSelectedCategory] = useSelectedSystemId();
 */
export function useSelectedSystemId(): [string | null, (id: string) => void, string | null, (category: string) => void] {
  const getSelectedSystemId = useCallback(() => {
    return localStorage.getItem('selectedSystemId');
  }, []);

  const setSelectedSystemId = useCallback((id: string) => {
    localStorage.setItem('selectedSystemId', id);
  }, []);

  const getSelectedCategory = useCallback(() => {
    return localStorage.getItem('selectedSystemCategory');
  }, []);

  const setSelectedCategory = useCallback((category: string) => {
    localStorage.setItem('selectedSystemCategory', category);
  }, []);

  return [getSelectedSystemId(), setSelectedSystemId, getSelectedCategory(), setSelectedCategory];
}
