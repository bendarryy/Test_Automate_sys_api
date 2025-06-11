import { useState, useEffect, useCallback } from 'react';

const SYSTEM_ID_KEY = 'selectedSystemId';
const SYSTEM_CATEGORY_KEY = 'selectedSystemCategory';

/**
 * Custom hook to get and set the selected system ID and category using localStorage,
 * and ensuring components re-render on change.
 * Usage:
 *   const [selectedSystemId, setSelectedSystemId, selectedSystemCategory, setSelectedSystemCategory] = useSelectedSystemId();
 */
export function useSelectedSystemId(): [
  string | null,
  (id: string) => void,
  string | null,
  (category: string) => void
] {
  const [systemId, setSystemId] = useState<string | null>(() => {
    return localStorage.getItem(SYSTEM_ID_KEY);
  });
  const [systemCategory, setSystemCategory] = useState<string | null>(() => {
    return localStorage.getItem(SYSTEM_CATEGORY_KEY);
  });

  const updateSystemId = useCallback((id: string) => {
    localStorage.setItem(SYSTEM_ID_KEY, id);
    setSystemId(id);
    // Dispatch a custom event to notify other instances of the hook or components
    window.dispatchEvent(new StorageEvent('storage', { key: SYSTEM_ID_KEY }));
  }, []);

  const updateSystemCategory = useCallback((category: string) => {
    localStorage.setItem(SYSTEM_CATEGORY_KEY, category);
    setSystemCategory(category);
    // Dispatch a custom event to notify other instances of the hook or components
    window.dispatchEvent(new StorageEvent('storage', { key: SYSTEM_CATEGORY_KEY }));
  }, []);

  // Effect for initial hydration from localStorage
  useEffect(() => {
    const currentId = localStorage.getItem(SYSTEM_ID_KEY);
    if (systemId !== currentId) {
      setSystemId(currentId);
    }
    const currentCategory = localStorage.getItem(SYSTEM_CATEGORY_KEY);
    if (systemCategory !== currentCategory) {
      setSystemCategory(currentCategory);
    }
  }, [systemId, systemCategory]); // Include dependencies as per lint rule

  // Memoized event handler for storage changes
  const handleStorageChange = useCallback((event: StorageEvent) => {
    if (event.key === SYSTEM_ID_KEY) {
      const newValue = localStorage.getItem(SYSTEM_ID_KEY);
      setSystemId(newValue);
    }
    if (event.key === SYSTEM_CATEGORY_KEY) {
      const newValue = localStorage.getItem(SYSTEM_CATEGORY_KEY);
      setSystemCategory(newValue);
    }
  }, []); // setSystemId and setSystemCategory are stable

  // Effect for setting up and tearing down the storage event listener
  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleStorageChange]);

  return [systemId, updateSystemId, systemCategory, updateSystemCategory];
}
