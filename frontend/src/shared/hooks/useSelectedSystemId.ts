import { useCallback, useMemo } from 'react';

const SYSTEM_ID_KEY = 'selectedSystemId';
const SYSTEM_CATEGORY_KEY = 'selectedSystemCategory';

/**
 * Custom hook to get and set the selected system ID and category using localStorage.
 * Usage:
 *   const [selectedSystemId, setSelectedSystemId, selectedCategory, setSelectedCategory] = useSelectedSystemId();
 */
export function useSelectedSystemId(): [string | null, (id: string) => void, string | null, (category: string) => void] {
  const getSelectedSystemId = useCallback(() => {
    return localStorage.getItem(SYSTEM_ID_KEY);
  }, []);

  const setSelectedSystemId = useCallback((id: string) => {
    localStorage.setItem(SYSTEM_ID_KEY, id);
  }, []);

  const getSelectedCategory = useCallback(() => {
    return localStorage.getItem(SYSTEM_CATEGORY_KEY);
  }, []);

  const setSelectedCategory = useCallback((category: string) => {
    localStorage.setItem(SYSTEM_CATEGORY_KEY, category);
  }, []);

  return useMemo(() => [
    getSelectedSystemId(),
    setSelectedSystemId,
    getSelectedCategory(),
    setSelectedCategory
  ], [getSelectedSystemId, setSelectedSystemId, getSelectedCategory, setSelectedCategory]);
}
