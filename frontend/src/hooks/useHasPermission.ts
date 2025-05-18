import { useSelector } from 'react-redux';
import { RootState } from '../store';

/**
 * Checks if the user has the given permission(s).
 * @param permission - A single permission string or an array of permissions. Returns true if user has at least one of them.
 */
export default function useHasPermission(permission: string | string[]): boolean {
  const actions = useSelector((state: RootState) => state.permissions.actions);
  if (Array.isArray(permission)) {
    return permission.some((perm) => actions.includes(perm));
  }
  return actions.includes(permission);
}
