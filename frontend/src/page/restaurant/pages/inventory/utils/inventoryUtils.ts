import { InventoryItem } from '../types/inventory';

export function computeStatusAndAvailability(item: InventoryItem) {
  let status: 'Sufficient' | 'LOW' = 'Sufficient';
  let availability = 100;
  if (item.min_threshold !== null && item.quantity !== null) {
    if (item.quantity <= item.min_threshold) status = 'LOW';
    availability = item.min_threshold > 0 ? Math.round((item.quantity / item.min_threshold) * 100) : 100;
    if (availability > 100) availability = 100;
    if (availability < 0) availability = 0;
  }
  return { status, availability };
}
