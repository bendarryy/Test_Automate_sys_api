import { MenuItem } from '../types/menu';

export function filterMenuItems(
  items: MenuItem[],
  selectedCategories: string[],
  searchText: string
): MenuItem[] {
  let filtered = items;
  if (selectedCategories.length > 0) {
    filtered = filtered.filter(item => selectedCategories.includes(item.category));
  }
  if (searchText) {
    const lowerSearchText = searchText.toLowerCase();
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(lowerSearchText) ||
      item.description.toLowerCase().includes(lowerSearchText) ||
      item.category.toLowerCase().includes(lowerSearchText)
    );
  }
  return filtered;
}

export function validateMenuItem(
  formData: MenuItem,
  categories: string[]
): string | null {
  if (
    !formData.name ||
    typeof formData.category !== 'string' ||
    !formData.category.trim() ||
    !categories.some(cat => cat.toLowerCase() === formData.category.toLowerCase()) ||
    formData.price == null || isNaN(Number(formData.price)) || Number(formData.price) <= 0 ||
    formData.cost == null || isNaN(Number(formData.cost)) || Number(formData.cost) <= 0 ||
    Number(formData.cost) >= Number(formData.price)
  ) {
    return 'Please fill in all required fields: name, valid category, price (>0), and cost (>0 and < price).';
  }
  return null;
}
