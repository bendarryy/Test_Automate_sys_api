import { IconType } from "react-icons";
import {
  RiHome4Line,
  RiListCheck,
  RiBookOpenLine,
  RiTBoxLine,
  RiClipboardLine,
  RiSettings4Line,
  RiInformationLine,
  RiComputerLine,
  RiUserLine,
  RiShoppingBasketLine,
} from "react-icons/ri";
import {
  RiHome4Fill,
  RiListCheck2,
  RiBookOpenFill,
  RiTBoxFill,
  RiClipboardFill,
  RiSettings4Fill,
  RiInformationFill,
  RiComputerFill,
  RiUserFill,
  RiShoppingBasketFill,
} from "react-icons/ri";

// Define the navigation item interface
export interface NavItem {
  name: string;
  icon: IconType;
  activeIcon: IconType;
  href: string;
  requiredPermission?: string;
  systemCategory?: "restaurant" | "supermarket" | "all";
  showInSidebar?: boolean; // Controls whether this item appears in the sidebar
}

// Restaurant system navigation items
export const restaurantNavItems: NavItem[] = [
  {
    name: "Home",
    icon: RiHome4Line,
    activeIcon: RiHome4Fill,
    href: "/",
    systemCategory: "restaurant",
    showInSidebar: true,
    requiredPermission: "read_home",

  },
  {
    name: "Orders",
    icon: RiListCheck,
    activeIcon: RiListCheck2,
    href: "/orders",
    systemCategory: "restaurant",
    showInSidebar: true,
    requiredPermission: "read_order",
  },
  {
    name: "Menu",
    icon: RiBookOpenLine,
    activeIcon: RiBookOpenFill,
    href: "/menu",
    systemCategory: "restaurant",
    showInSidebar: true,
    requiredPermission: "read_menu",
  },
  {
    name: "Menu Management",
    icon: RiClipboardLine,
    activeIcon: RiClipboardFill,
    href: "/menu-management",
    systemCategory: "restaurant",
    showInSidebar: true,
    requiredPermission: "update_menu",
  },
  {
    name: "Inventory",
    icon: RiTBoxLine,
    activeIcon: RiTBoxFill,
    href: "/Inventory",
    systemCategory: "restaurant",
    showInSidebar: true,
    requiredPermission: "update_inventory",
  },
  {
    name: "KDS",
    icon: RiComputerLine,
    activeIcon: RiComputerFill,
    href: "/kds",
    systemCategory: "restaurant",
    showInSidebar: true,
    requiredPermission: "read_kds",
  },
  {
    name: "Waiter Display",
    icon: RiComputerLine,
    activeIcon: RiComputerFill,
    href: "/waiterdisplay",
    systemCategory: "restaurant",
    showInSidebar: true,
    requiredPermission: "read_waiterdisplay",
  },
  {
    name: "Delivery Display",
    icon: RiComputerLine,
    activeIcon: RiComputerFill,
    href: "/deliverydisplay",
    systemCategory: "restaurant",
    showInSidebar: true,
    requiredPermission: "read_deliverydisplay",
  },
  {
    name: "Employees",
    icon: RiUserLine,
    activeIcon: RiUserFill,
    href: "/employees",
    systemCategory: "restaurant",
    showInSidebar: true,
    requiredPermission: "update_employee",
  },
  {
    name: "Finances",
    icon: RiClipboardLine,
    activeIcon: RiClipboardFill,
    href: "/financesdashboards",
    systemCategory: "restaurant",
    showInSidebar: true,
    requiredPermission: "read_finance",
  },
  {
    name: "About",
    icon: RiInformationLine,
    activeIcon: RiInformationFill,
    href: "/about",
    systemCategory: "restaurant",
    showInSidebar: true,
    requiredPermission: "read_about",
  },
];

// Supermarket system navigation items
export const supermarketNavItems: NavItem[] = [
  {
    name: 'Home',
    icon: RiHome4Line,
    activeIcon: RiHome4Fill,
    href: '/',
    systemCategory: 'supermarket',
    showInSidebar: true,
    requiredPermission: "read_home",
  },
  {
    name: 'Inventory',
    icon: RiTBoxLine,
    activeIcon: RiTBoxFill,
    href: '/inventory',
    systemCategory: 'supermarket',
    showInSidebar: true,
    requiredPermission: "read_inventory",
  },
  {
    name: 'Products Management',
    icon: RiShoppingBasketLine,
    activeIcon: RiShoppingBasketFill,
    href: '/supermarket/products',
    systemCategory: 'supermarket',
    showInSidebar: true,
    requiredPermission: "update_product",
  },
  {
    name: 'About',
    icon: RiInformationLine,
    activeIcon: RiInformationFill,
    href: '/about',
    systemCategory: 'supermarket',
    showInSidebar: true,
    requiredPermission: "access_about",
  },
];

// Common navigation items for all systems
export const commonNavItems: NavItem[] = [
  {
    name: 'Profile',
    icon: RiUserLine,
    activeIcon: RiUserFill,
    href: '/profile',
    systemCategory: 'all',
    showInSidebar: true,
    requiredPermission: "read_profile",
  },
  {
    name: 'Settings',
    icon: RiSettings4Line,
    activeIcon: RiSettings4Fill,
    href: '/settings',
    systemCategory: 'all',
    showInSidebar: true,
    requiredPermission: "read_settings",
  },
];

// Helper to extract the part after the first underscore
export function getPermissionKey(permission: string): string {
  const idx = permission.indexOf('_');
  return idx !== -1 ? permission.slice(idx + 1) : permission;
}

// Get navigation items based on system category
export const getNavItems = (systemCategory?: string): NavItem[] => {
  if (systemCategory === "supermarket") {
    return [...supermarketNavItems];
  }

  // Default to restaurant if not specified or invalid
  return [...restaurantNavItems];
};

// Get common navigation items
export const getCommonNavItems = (): NavItem[] => {
  return [...commonNavItems];
};

// Auth routes that don't require layout
export const authRoutes = [
  { path: "/register", name: "Register" },
  { path: "/ownerlogin", name: "Owner Login" },
  { path: "/employeelogin", name: "Employee Login" },
  { path: "/systems", name: "Systems" },
];
