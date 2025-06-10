export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  cost: number;
  is_available: boolean;
  description: string;
  image: string | File | null;
}
