export type SystemCategory = 'restaurant' | 'supermarket';

interface RoleOption {
  value: string;
  label: string;
}

export const restaurantRoleColors: Record<string, string> = {
  waiter: 'blue',
  delivery: 'green',
  chef: 'orange',
  head_chef: 'red',
  cashier: 'purple',
  manager: 'cyan',
  inventory_manager: 'geekblue',
  // Add other restaurant-specific roles and colors if any
};

export const restaurantRoleOptions: RoleOption[] = [
  { value: 'waiter', label: 'Waiter' },
  { value: 'delivery', label: 'Delivery Driver' },
  { value: 'chef', label: 'Chef' },
  { value: 'head_chef', label: 'Head Chef' },
  { value: 'cashier', label: 'Cashier (Restaurant)' },
  { value: 'manager', label: 'Manager (Restaurant)' },
  { value: 'inventory_manager', label: 'Inventory Manager (Restaurant)' },
];

export const supermarketRoleColors: Record<string, string> = {
  cashier: 'purple',
  manager: 'cyan',
  stock_clerk: 'volcano',
  butcher: 'magenta',
  baker: 'gold',
  produce_manager: 'lime',
  // Add other supermarket-specific roles and colors
};

export const supermarketRoleOptions: RoleOption[] = [
  { value: 'cashier', label: 'Cashier (Supermarket)' },
  { value: 'manager', label: 'Manager (Supermarket)' },
  { value: 'stock_clerk', label: 'Stock Clerk' },
  { value: 'butcher', label: 'Butcher' },
  { value: 'baker', label: 'Baker' },
  { value: 'produce_manager', label: 'Produce Manager' },
  // Add other supermarket-specific roles
];

interface RoleConfig {
  options: RoleOption[];
  colors: Record<string, string>;
}

export const getRoleConfig = (category: SystemCategory): RoleConfig => {
  if (category === 'supermarket') {
    return {
      options: supermarketRoleOptions,
      colors: supermarketRoleColors,
    };
  }
  // Default to restaurant
  return {
    options: restaurantRoleOptions,
    colors: restaurantRoleColors,
  };
};
