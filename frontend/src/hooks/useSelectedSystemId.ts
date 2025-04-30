import { useCallback } from 'react';

/**
 * Custom hook to get and set the selected system ID using localStorage.
 * Usage:
 *   const [selectedSystemId, setSelectedSystemId] = useSelectedSystemId();
 */
export function useSelectedSystemId(): [string | null, (id: string) => void] {
  const getSelectedSystemId = useCallback(() => {
    return localStorage.getItem('selectedSystemId');
  }, []);

  const setSelectedSystemId = useCallback((id: string) => {
    localStorage.setItem('selectedSystemId', id);
  }, []);

  return [getSelectedSystemId(), setSelectedSystemId];
}
