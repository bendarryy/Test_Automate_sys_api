import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { restaurantNavItems, supermarketNavItems, commonNavItems, NavItem } from '../config/navigation.config';

export default function useNavigationItems(): NavItem[] {
  const actions = useSelector((state: RootState) => state.permissions.actions);
  const systemCategory = localStorage.getItem('selectedSystemCategory');

  let navItems: NavItem[] = [];
  if (systemCategory === 'supermarket') {
    navItems = supermarketNavItems;
  } else {
    navItems = restaurantNavItems;
  }
  // لا تضف commonNavItems هنا
  return navItems.filter(
    (item) => !item.requiredPermission || actions.includes(item.requiredPermission)
  );
}
