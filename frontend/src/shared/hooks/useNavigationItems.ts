import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { restaurantNavItems, supermarketNavItems, NavItem } from '../../config/navigation.config';
import { useMemo } from 'react';
export default function useNavigationItems(): NavItem[] {
  const actions = useSelector((state: RootState) => state.permissions.actions);
  const systemCategory = localStorage.getItem('selectedSystemCategory');

  return useMemo(() => {
    const navItems = systemCategory === 'supermarket' ? supermarketNavItems : restaurantNavItems;
    return navItems.filter(
      (item) => !item.requiredPermission || actions.includes(item.requiredPermission as string)
    );
  }, [systemCategory, actions]);
}
