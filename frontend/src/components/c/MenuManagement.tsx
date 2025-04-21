/* MenuManagement.tsx */
import React, { useState, ChangeEvent } from 'react';
import styles from './../styles/MenuManagement.module.css'; // Adjust the path as necessary

type Category = 'Food' | 'Drink' | 'Soups' | 'Dessert';

interface MenuItem {
  name: string;
  description: string;
  price: number | string;
  category: Category;
  available: boolean;
  specialOffer:  boolean;
  offerDescription?: string;
}

const categories: Category[] = ['Food', 'Drink', 'Soups', 'Dessert'];

const initialItem: MenuItem = {
  name: '',
  description: '',
  price: '',
  category: 'Food',
  available: true,
  specialOffer: false,
};

const dummyData: MenuItem[] = [
  { name: 'Burger', description: 'Beef burger with cheese', price: 50, category: 'Food', available: true, specialOffer: '10% off' },
  { name: 'Pizza', description: 'Margherita pizza with fresh basil', price: 80, category: 'Food', available: true, specialOffer: '' },
];

const MenuManagement: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>(dummyData);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<MenuItem>(initialItem);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState<Category>('Food');

  const handleAddClick = () => {
    setFormData(initialItem);
    setEditItem(null);
    setShowModal(true);
  };

  const handleEditClick = (item: MenuItem) => {
    setFormData(item);
    setEditItem(item);
    setShowModal(true);
  };

  const handleDeleteClick = (item: MenuItem) => {
    setItems(items.filter(i => i !== item));
  };

  const handleSave = () => {
    const price = typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price;
    if (!formData.name || isNaN(price) || price <= 0) {
      alert('Please fill in all fields correctly.');
      return;
    }
    const newItem = { ...formData, price };
    if (editItem) {
      setItems(items.map(i => i.name === editItem.name ? newItem : i));
    } else {
      setItems([...items, newItem]);
    }
    setShowModal(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };
  const handleChangespecialOffer = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target as HTMLInputElement;
    setFormData({ ...formData, specialOffer: checked});
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Management Menu</h2>
      <button className={styles.addBtn} onClick={handleAddClick}>Add New Item</button>

      <div className={styles.tabs}>
        {categories.map(cat => (
          <button
            key={cat}
            className={
              activeTab === cat ? `${styles.tab} ${styles.activeTab}` : styles.tab
            }
            onClick={() => setActiveTab(cat as Category)}
          >{cat}</button>
        ))}
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Availability</th>
            <th>Special Offer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.filter(item => item.category === activeTab).map((item, idx) => (
            <tr key={idx}>
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td>{item.price} EGP</td>
              <td>{item.available ? 'Available' : 'Not Available'}</td>
              <td>{typeof item.specialOffer === 'string' ? item.specialOffer : '-'}</td>
              <td>
                <button className={styles.editBtn} onClick={() => handleEditClick(item)}>Edit</button>
                <button className={styles.deleteBtn} onClick={() => handleDeleteClick(item)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <h3>{editItem ? 'Edit Item' : 'Add Item'}</h3>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
            </header>
            <div className={styles.modalBody}>
              <form className={styles.form}>
                <label>Name</label>
                <input name="name" value={formData.name} onChange={handleChange} />

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>Category</label>
                    <select name="category" value={formData.category} onChange={handleChange}>
                      {categories.map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Price (EGP)</label>
                    <input name="price" type="number" value={formData.price} onChange={handleChange} />
                  </div>
                </div>

                <label className={styles.switchLabel}>
                  <input type="checkbox" name="available" checked={formData.available} onChange={handleChange} />
                  Available
                </label>

                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange}></textarea>

                <label className={styles.switchLabel}>
                  <input type="checkbox" name="specialOffer" checked={!!formData.specialOffer} onChange={handleChangespecialOffer} />
                  Special Offer
                </label>
                {formData.specialOffer && (
                  <input name="specialOffer" value={formData.offerDescription} onChange={handleChange} placeholder="Special Offer" />
                )}
              </form>
            </div>
            <footer className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave}>Save</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;