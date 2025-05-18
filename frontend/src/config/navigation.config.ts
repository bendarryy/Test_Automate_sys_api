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
  },
  {
    name: "Orders",
    icon: RiListCheck,
    activeIcon: RiListCheck2,
    href: "/orders",
    systemCategory: "restaurant",
    showInSidebar: true,
  },
  {
    name: "Menu",
    icon: RiBookOpenLine,
    activeIcon: RiBookOpenFill,
    href: "/menu",
    systemCategory: "restaurant",
    showInSidebar: true,
  },
  {
    name: "Menu Management",
    icon: RiClipboardLine,
    activeIcon: RiClipboardFill,
    href: "/menu-management",
    systemCategory: "restaurant",
    showInSidebar: true,
  },
  {
    name: "Inventory",
    icon: RiTBoxLine,
    activeIcon: RiTBoxFill,
    href: "/Inventory",
    systemCategory: "restaurant",
    showInSidebar: true,
  },
  {
    name: "KDS",
    icon: RiComputerLine,
    activeIcon: RiComputerFill,
    href: "/kds",
    systemCategory: "restaurant",
    showInSidebar: true,
  },
  {
    name: "Waiter Display",
    icon: RiComputerLine,
    activeIcon: RiComputerFill,
    href: "/waiterdisplay",
    systemCategory: "restaurant",
    showInSidebar: true,
  },
  {
    name: "Delivery Display",
    icon: RiComputerLine,
    activeIcon: RiComputerFill,
    href: "/deliverydisplay",
    systemCategory: "restaurant",
    showInSidebar: true,
  },
  {
    name: "Employees",
    icon: RiUserLine,
    activeIcon: RiUserFill,
    href: "/employees",
    systemCategory: "restaurant",
    showInSidebar: true,
  },
  {
    name: "Finances",
    icon: RiClipboardLine,
    activeIcon: RiClipboardFill,
    href: "/financesdashboards",
    systemCategory: "restaurant",
    showInSidebar: true,
  },
  {
    name: "About",
    icon: RiInformationLine,
    activeIcon: RiInformationFill,
    href: "/about",
    systemCategory: "restaurant",
    showInSidebar: true,
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
  },
  {
    name: 'Inventory',
    icon: RiTBoxLine,
    activeIcon: RiTBoxFill,
    href: '/inventory',
    systemCategory: 'supermarket',
    showInSidebar: true,
  },
  {
    name: 'About',
    icon: RiInformationLine,
    activeIcon: RiInformationFill,
    href: '/about',
    systemCategory: 'supermarket',
    showInSidebar: true,
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
  },
  {
    name: 'Settings',
    icon: RiSettings4Line,
    activeIcon: RiSettings4Fill,
    href: '/settings',
    systemCategory: 'all',
    showInSidebar: true,
  },
];

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
