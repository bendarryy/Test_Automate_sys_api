export interface InventoryItem {
  id: number;
  name: string;
  quantity: number | null;
  unit: string;
  min_threshold: number | null;
}

export type NewInventoryItem = Omit<InventoryItem, 'id'>;
