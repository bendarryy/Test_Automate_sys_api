import { useState, useEffect, useCallback, useMemo } from 'react';
import { message } from 'antd';
import { useGetMenu } from '../../../../../shared/hooks/useGetMenu';
import { useSelectedSystemId } from '../../../../../shared/hooks/useSelectedSystemId';
import { MenuItem } from '../types/menu';
import { filterMenuItems, validateMenuItem } from '../utils/menuUtils';

const initialItem: MenuItem = {
  id: 0,
  name: '',
  category: '',
  price: 0,
  cost: 0,
  is_available: true,
  description: '',
  image: null,
};

export function useMenuManagement() {
  const [selectedSystemId] = useSelectedSystemId();
  const { getMenu, createMenuItem, updateMenuItem, deleteMenuItem, getCategories, loading } = useGetMenu(Number(selectedSystemId));

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<MenuItem>(initialItem);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [itemLoadingId, setItemLoadingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedItems, fetchedCategories] = await Promise.all([
          getMenu(),
          getCategories()
        ]);
        setItems((fetchedItems || []).map((item) => ({
          ...item,
          price: typeof item.price === 'number' ? item.price : Number(item.price),
          cost: typeof item.cost === 'number' ? item.cost : Number(item.cost),
          image: item.image ?? null,
        })));
        if (fetchedCategories && Array.isArray(fetchedCategories)) {
          setCategories(fetchedCategories);
        }
      } catch (error) {
        message.error('Failed to load menu data');
        console.error('Error fetching menu data:', error);
        setItems([]);
      }
    };
    fetchData();
  }, []);

  const handleAddClick = useCallback(() => {
    setFormData({ ...initialItem, category: categories[0] || '' });
    setEditItem(null);
    setShowModal(true);
  }, [categories]);

  const handleEditClick = useCallback((item: MenuItem) => {
    setFormData({ ...item });
    setEditItem(item);
    setShowModal(true);
  }, []);

  const handleDeleteClick = useCallback(async (item: MenuItem) => {
    setItemLoadingId(item.id);
    await deleteMenuItem(item.id);
    setItems(prevItems => prevItems.filter((i) => i.id !== item.id));
    setItemLoadingId(null);
  }, [deleteMenuItem]);

  const handleSave = useCallback(async () => {
    const error = validateMenuItem(formData, categories);
    if (error) {
      alert(error);
      return;
    }
    setItemLoadingId(editItem ? editItem.id : null);
    let resultItem: MenuItem | null = null;
    if (formData.image && (formData.image instanceof File || (typeof formData.image === 'object' && formData.image !== null && 'type' in formData.image))) {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('category', formData.category);
      fd.append('price', String(formData.price));
      fd.append('cost', String(formData.cost));
      fd.append('is_available', String(formData.is_available));
      fd.append('description', formData.description || '');
      fd.append('image', formData.image);
      if (editItem) {
        const updated = await updateMenuItem(editItem.id, fd);
        resultItem = {
          ...formData,
          id: editItem.id,
          image: updated?.image ?? formData.image ?? null,
        };
      } else {
        const newMenuItem: MenuItem = {
          id: Date.now(),
          name: formData.name,
          category: formData.category,
          price: Number(formData.price),
          cost: Number(formData.cost),
          is_available: formData.is_available,
          description: formData.description,
          image: null,
        };
        const created = await createMenuItem(newMenuItem);
        resultItem = {
          ...newMenuItem,
          id: typeof created?.id === 'number' ? created.id : newMenuItem.id,
        };
      }
    } else {
      const updatedFormData: Partial<MenuItem> = {
        ...formData,
        price: Number(formData.price),
        cost: Number(formData.cost),
        category: formData.category?.toLowerCase(),
      };
      if (typeof updatedFormData.image === 'string') {
        delete updatedFormData.image;
      }
      if (editItem) {
        const updated = await updateMenuItem(editItem.id, updatedFormData);
        resultItem = {
          ...formData,
          id: editItem.id,
          image: updated?.image ?? formData.image ?? null,
        };
      } else {
        const newMenuItem: MenuItem = {
          id: Date.now(),
          name: formData.name,
          category: formData.category,
          price: Number(formData.price),
          cost: Number(formData.cost),
          is_available: formData.is_available,
          description: formData.description,
          image: null,
        };
        const created = await createMenuItem(newMenuItem);
        resultItem = {
          ...newMenuItem,
          id: typeof created?.id === 'number' ? created.id : newMenuItem.id,
        };
      }
    }
    if (editItem) {
      setItems(items.map((item) => (
        item.id === editItem.id
          ? {
              ...item,
              ...formData,
              price: Number(formData.price),
              cost: Number(formData.cost),
              image: resultItem?.image ?? null,
            }
          : item
      )));
    } else if (resultItem && resultItem.id) {
      setItems([
        ...items,
        {
          ...resultItem,
          price: typeof resultItem.price === 'number' ? resultItem.price : Number(resultItem.price),
          cost: typeof resultItem.cost === 'number' ? resultItem.cost : Number(resultItem.cost),
        }
      ]);
    }
    setShowModal(false);
    setItemLoadingId(null);
  }, [editItem, formData, items, categories, createMenuItem, updateMenuItem]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      if (type === 'file' && e.target instanceof HTMLInputElement && e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setFormData((prev) => ({ ...prev, image: file }));
        return;
      }
      if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
        setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        return;
      }
      setFormData((prev) => {
        if (name === 'price' || name === 'cost') {
          return { ...prev, [name]: value === '' ? '' : Number(value) };
        }
        return { ...prev, [name]: value };
      });
    },
    []
  );

  const filteredItems = useMemo(
    () => filterMenuItems(items, selectedCategories, searchText),
    [items, selectedCategories, searchText]
  );

  return {
    items,
    categories,
    showModal,
    setShowModal,
    formData,
    setFormData,
    editItem,
    setEditItem,
    selectedCategories,
    setSelectedCategories,
    searchText,
    setSearchText,
    loading: loading && items.length === 0,
    itemLoadingId,
    handleAddClick,
    handleEditClick,
    handleDeleteClick,
    handleSave,
    handleChange,
    filteredItems,
  };
}
