import { IconType } from "react-icons";
import * as RiIcons from "react-icons/ri";

// نوع الأيقونات المدعومة
type IconName =
  | "Home"
  | "FileList2"
  | "Restaurant2"
  | "Archive"
  | "Dashboard"
  | "UserVoice"
  | "Truck"
  | "Team"
  | "MoneyDollarCircle"
  | "AccountCircle"
  | "Settings4"
  | "Information"
  | "Store2";

// خريطة الأيقونات: اسم الأيقونة => { line, fill }
const iconMap: Record<IconName, { line: IconType; fill: IconType }> = {
  Home: { line: RiIcons.RiHome4Line, fill: RiIcons.RiHome4Fill },
  FileList2: { line: RiIcons.RiFileList2Line, fill: RiIcons.RiFileList2Fill },
  Restaurant2: { line: RiIcons.RiRestaurant2Line, fill: RiIcons.RiRestaurant2Fill },
  Archive: { line: RiIcons.RiArchiveLine, fill: RiIcons.RiArchiveFill },
  Dashboard: { line: RiIcons.RiDashboardLine, fill: RiIcons.RiDashboardFill },
  UserVoice: { line: RiIcons.RiUserVoiceLine, fill: RiIcons.RiUserVoiceFill },
  Truck: { line: RiIcons.RiTruckLine, fill: RiIcons.RiTruckFill },
  Team: { line: RiIcons.RiTeamLine, fill: RiIcons.RiTeamFill },
  MoneyDollarCircle: { line: RiIcons.RiMoneyDollarCircleLine, fill: RiIcons.RiMoneyDollarCircleFill },
  AccountCircle: { line: RiIcons.RiAccountCircleLine, fill: RiIcons.RiAccountCircleFill },
  Settings4: { line: RiIcons.RiSettings4Line, fill: RiIcons.RiSettings4Fill },
  Information: { line: RiIcons.RiInformationLine, fill: RiIcons.RiInformationFill },
  Store2: { line: RiIcons.RiStore2Line, fill: RiIcons.RiStore2Fill },
};

// دالة مساعدة لجلب الأيقونة العادية والمفعلة
function getIconPair(icon: IconName) {
  return iconMap[icon];
}

// تعريف نوع النظام
export type SystemCategory = "restaurant" | "supermarket" | "all";

// تعريف العنصر المجرد (بدون أيقونات مباشرة)
interface BaseNavItem {
  name: string;
  icon: IconName;
  href: string;
  requiredPermission?: string | string[];
  systemCategory: SystemCategory;
  showInSidebar?: boolean;
}

// تعريف العنصر النهائي (مع الأيقونات)
export interface NavItem {
  name: string;
  icon: IconType;
  activeIcon: IconType;
  href: string;
  requiredPermission?: string | string[];
  systemCategory: SystemCategory;
  showInSidebar?: boolean;
}

// عناصر التنقل المجردة (بيانات فقط)
const navItemsData: BaseNavItem[] = [
  // Restaurant
  { name: "Home", icon: "Home", href: "/", systemCategory: "restaurant", showInSidebar: true, requiredPermission: "create_order" },
  { name: "Orders", icon: "FileList2", href: "/orders", systemCategory: "restaurant", showInSidebar: true, requiredPermission: "read_order" },
  { name: "Menu", icon: "Restaurant2", href: "/menu", systemCategory: "restaurant", showInSidebar: true, requiredPermission: "read_menu" },
  { name: "Inventory", icon: "Archive", href: "/Inventory", systemCategory: "restaurant", showInSidebar: true, requiredPermission: "update_inventory" },
  { name: "KDS", icon: "Dashboard", href: "/kds", systemCategory: "restaurant", showInSidebar: true, requiredPermission: "read_kds" },
  { name: "Waiter Display", icon: "UserVoice", href: "/waiterdisplay", systemCategory: "restaurant", showInSidebar: true, requiredPermission: "read_waiterdisplay" },
  { name: "Delivery Display", icon: "Truck", href: "/deliverydisplay", systemCategory: "restaurant", showInSidebar: true, requiredPermission: "read_deliverydisplay" },
  { name: "Employees", icon: "Team", href: "/employees", systemCategory: "restaurant", showInSidebar: true, requiredPermission: "update_employee" },
  { name: "Finances", icon: "MoneyDollarCircle", href: "/financesdashboards", systemCategory: "restaurant", showInSidebar: true, requiredPermission: "read_finance" },
  { name: "About", icon: "Information", href: "/about", systemCategory: "restaurant", showInSidebar: true, requiredPermission: "read_about" },

  // Supermarket
  { name: "Home", icon: "Home", href: "/", systemCategory: "supermarket", showInSidebar: true, requiredPermission: "read_home" },
  { name: "Products", icon: "Archive", href: "/products", systemCategory: "supermarket", showInSidebar: true, requiredPermission: "read_inventory" },
  { name: "Sales", icon: "MoneyDollarCircle", href: "/supermarket/sales", systemCategory: "supermarket", showInSidebar: true, requiredPermission: "read_sales" },
  { name: "Purchase Orders", icon: "FileList2", href: "/supermarket/purchase-orders", systemCategory: "supermarket", showInSidebar: true, requiredPermission: "read_order" },
  { name: "About", icon: "Information", href: "/about", systemCategory: "supermarket", showInSidebar: true, requiredPermission: "access_about" },
  { name: "Supplier Management", icon: "Store2", href: "/supermarket/suppliers", systemCategory: "supermarket", showInSidebar: true },

  // Common
  { name: "Profile", icon: "AccountCircle", href: "/profile", systemCategory: "all", showInSidebar: true, requiredPermission: "read_profile" },
  { name: "Settings", icon: "Settings4", href: "/settings", systemCategory: "all", showInSidebar: true, requiredPermission: "read_settings" },
];

// دالة توليد العناصر النهائية مع الأيقونات
function buildNavItems(items: BaseNavItem[]): NavItem[] {
  return items.map(({ icon, ...rest }) => {
    const { line, fill } = getIconPair(icon);
    return { ...rest, icon: line, activeIcon: fill, iconName: icon } as NavItem;
  });
}

// عناصر التنقل النهائية حسب النظام
const allNavItems = buildNavItems(navItemsData);

// دوال جلب العناصر حسب النظام
export const getNavItems = (systemCategory?: SystemCategory): ReadonlyArray<NavItem> => {
  if (systemCategory === "supermarket") {
    return allNavItems.filter(item => item.systemCategory === "supermarket");
  }
  // Default to restaurant
  return allNavItems.filter(item => item.systemCategory === "restaurant");
};

export const getCommonNavItems = (): ReadonlyArray<NavItem> =>
  allNavItems.filter(item => item.systemCategory === "all");

// تصدير عناصر المطعم والسوبرماركت بشكل صريح للتوافق مع الاستيراد القديم
export const restaurantNavItems: ReadonlyArray<NavItem> = allNavItems.filter(
  item => item.systemCategory === "restaurant"
);

export const supermarketNavItems: ReadonlyArray<NavItem> = allNavItems.filter(
  item => item.systemCategory === "supermarket"
);

// دالة مساعدة لاستخراج الجزء بعد أول "_"
export function getPermissionKey(permission: string): string {
  const idx = permission.indexOf('_');
  return idx !== -1 ? permission.slice(idx + 1) : permission;
}

// مسارات المصادقة التي لا تحتاج تخطيط
export const authRoutes = [
  { path: "/register", name: "Register" },
  { path: "/ownerlogin", name: "Owner Login" },
  { path: "/employeelogin", name: "Employee Login" },
  { path: "/systems", name: "Systems" },
];
