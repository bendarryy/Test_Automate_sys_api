import { useState, useEffect } from 'react';
import { useInventory } from './useInventory';
import { useSelectedSystemId } from 'shared/hooks/useSelectedSystemId';
import { InventoryItem, NewInventoryItem } from '../types/inventory';

export function useInventoryManagement() {
  const [selectedSystemId] = useSelectedSystemId();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState<NewInventoryItem>({
    name: '',
    quantity: null,
    unit: '',
    min_threshold: null,
  });
  const { inventory, loading, error, fetchInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useInventory();
  const [showModal, setShowModal] = useState(false);
  const [localInventory, setLocalInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    if (selectedSystemId) {
      fetchInventory(selectedSystemId);
    }
  }, [selectedSystemId, fetchInventory]);

  useEffect(() => {
    if (Array.isArray(inventory)) {
      setLocalInventory(inventory);
    }
  }, [inventory]);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleAddNewIngredient = async () => {
    if (!newItem.name || newItem.quantity === null || !selectedSystemId) return;
    await addInventoryItem(selectedSystemId, newItem);
    fetchInventory(selectedSystemId);
    setNewItem({ name: '', quantity: null, unit: '', min_threshold: null });
    handleCloseModal();
  };

  const isEditing = (record: InventoryItem) => String(record.id) === editingKey;

  const edit = (record: InventoryItem) => {
    setEditingKey(String(record.id));
    setEditingData({ ...record });
  };

  const cancel = () => {
    setEditingKey(null);
    setEditingData(null);
  };

  const save = async (id: string) => {
    const numId = Number(id);
    if (!editingData || !selectedSystemId || isNaN(numId)) return;
    // Optimistic update: update local inventory immediately
    const prevInventory = [...localInventory];
    const updatedInventory = localInventory.map(item =>
      item.id === numId ? { ...item, ...editingData } : item
    );
    setLocalInventory(updatedInventory);
    setEditingKey(null);
    setEditingData(null);
    try {
      await updateInventoryItem(selectedSystemId, numId, editingData);
      fetchInventory(selectedSystemId);
    } catch (errInfo) {
      // Rollback on error
      setLocalInventory(prevInventory);
      console.error('Validate Failed:', errInfo);
    }
  };

  const handleDelete = async (id: string) => {
    if (!selectedSystemId) return;
    try {
      await deleteInventoryItem(selectedSystemId, id);
      fetchInventory(selectedSystemId);
    } catch (err) {
      console.error('Delete Failed:', err);
    }
  };

  return {
    inventory: localInventory,
    loading,
    error,
    editingKey,
    editingData,
    newItem,
    showModal,
    setEditingData,
    setNewItem,
    setShowModal,
    handleOpenModal,
    handleCloseModal,
    handleAddNewIngredient,
    isEditing,
    edit,
    cancel,
    save,
    handleDelete,
  };
}
