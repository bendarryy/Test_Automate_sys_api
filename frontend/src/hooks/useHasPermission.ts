import { useSelector, shallowEqual } from 'react-redux';
import { useMemo, useCallback } from 'react';
import { RootState } from '../store';

/**
 * Checks if the user has the given permission(s).
 * @param permission - A single permission string or an array of permissions. Returns true if user has at least one of them.
 */
export default function useHasPermission(permission: string | string[]): boolean {
  // Use shallowEqual to avoid unnecessary rerenders if actions array reference changes but content doesn't
  const actions = useSelector(
    (state: RootState) => state.permissions.actions,
    shallowEqual
  );

  // Memoize the permission check function for stability
  const checkPermission = useCallback(
    (perm: string | string[]) => {
      if (Array.isArray(perm)) {
        return perm.some((p) => actions.includes(p));
      }
      return actions.includes(perm);
    },
    [actions]
  );

  // Memoize the result for the current permission input
  return useMemo(() => checkPermission(permission), [checkPermission, permission]);
}
