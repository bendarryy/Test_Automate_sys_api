import React, { useEffect, useState } from 'react';
import { useGetMenu } from '../../hooks/useGetMenu';
import styles from '../../styles/MenuPage.module.css';
import { useSelectedSystemId } from '../../hooks/useSelectedSystemId';

const MenuPage = () => {
  const [selectedSystemId] = useSelectedSystemId();
  const { 
    getMenu, 
    createMenuItem, 
    deleteMenuItem, 
    updateMenuItem, 
    data: menuItems, 
    loading, 
    error 
  } = useGetMenu(Number(selectedSystemId));

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
  });

  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [updatedItem, setUpdatedItem] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
  });

  useEffect(() => {
    getMenu(); // Fetch all menu items on component mount
  }, []);

  const handleCreate = async () => {
    if (!newItem.name || !newItem.category || newItem.price <= 0) {
      alert('Please fill in all fields correctly.');
      return;
    }
    await createMenuItem({ ...newItem, id: Date.now() });
    setNewItem({ name: '', description: '', price: 0, category: '' }); // Reset form
    getMenu(); // Refresh menu
  };

  const handleDelete = async (id: number) => {
    await deleteMenuItem(id);
    getMenu(); // Refresh menu
  };

  const handleEdit = (item: { id: number; name: string; description?: string; price: number; category: string }) => {
    setEditingItem(item.id);
    setUpdatedItem({
      name: item.name,
      description: item.description ?? "",
      price: item.price,
      category: item.category,
    });
  };

  const handleUpdate = async () => {
    if (!updatedItem.name || !updatedItem.category || updatedItem.price <= 0) {
      alert('Please fill in all fields correctly.');
      return;
    }
    await updateMenuItem(editingItem!, updatedItem);
    setEditingItem(null); // Exit edit mode
    getMenu(); // Refresh menu
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Menu</h1>
      <div className={styles.newItemForm}>
        <input
          type="text"
          placeholder="Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Description"
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          className={styles.input}
        />
        <input
          type="number"
          placeholder="Price"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
          className={styles.input}
        />
        <select
          value={newItem.category}
          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
          className={styles.select}
        >
          <option value="">Select Category</option>
          <option value="food">Food</option>
          <option value="drink">Drink</option>
          <option value="soups">Soups</option>
          <option value="dessert">Dessert</option>
        </select>
        <button className={styles.createButton} onClick={handleCreate}>
          Add New Item
        </button>
      </div>
      <ul className={styles.menuList}>
        {menuItems?.map((item) => (
          <li key={item.id} className={styles.menuItem}>
            {editingItem === item.id ? (
              <div className={styles.editForm}>
                <input
                  type="text"
                  placeholder="Name"
                  value={updatedItem.name}
                  onChange={(e) => setUpdatedItem({ ...updatedItem, name: e.target.value })}
                  className={styles.input}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={updatedItem.description}
                  onChange={(e) => setUpdatedItem({ ...updatedItem, description: e.target.value })}
                  className={styles.input}
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={updatedItem.price}
                  onChange={(e) => setUpdatedItem({ ...updatedItem, price: parseFloat(e.target.value) })}
                  className={styles.input}
                />
                <select
                  value={updatedItem.category}
                  onChange={(e) => setUpdatedItem({ ...updatedItem, category: e.target.value })}
                  className={styles.select}
                >
                  <option value="">Select Category</option>
                  <option value="food">Food</option>
                  <option value="drink">Drink</option>
                  <option value="soups">Soups</option>
                  <option value="dessert">Dessert</option>
                </select>
                <button className={styles.updateButton} onClick={handleUpdate}>
                  Save
                </button>
                <button className={styles.cancelButton} onClick={() => setEditingItem(null)}>
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <h2 className={styles.itemName}>{item.name}</h2>
                <p className={styles.itemDescription}>{item.description}</p>
                <p className={styles.itemPrice}>Price: ${item.price}</p>
                <p className={styles.itemCategory}>Category: {item.category}</p>
                <button className={styles.editButton} onClick={() => handleEdit(item)}>
                  Update
                </button>
                <button className={styles.deleteButton} onClick={() => handleDelete(item.id)}>
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MenuPage;
