// InventoryManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { Table, Form, ProgressBar, Button } from 'react-bootstrap';
import styles from '../styles/InventoryManagementPage.module.css';
import { useInventory, InventoryItem } from '../hooks/useInventory';

const SYSTEM_ID = '5'; // TODO: replace with dynamic system id as needed

// Helper to calculate status and availability
function computeStatusAndAvailability(item: InventoryItem) {
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

const InventoryManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    quantity: null,
    unit: '',
    min_threshold: null,
  });
  const { inventory, loading, error, fetchInventory, addInventoryItem } = useInventory();

  useEffect(() => {
    fetchInventory(SYSTEM_ID);
    // eslint-disable-next-line
  }, []);

  const handleAddNewIngredient = async () => {
    if (!newItem.name || newItem.quantity === null || !newItem.unit) return;
    await addInventoryItem(SYSTEM_ID, newItem);
    fetchInventory(SYSTEM_ID);
    setNewItem({ name: '', quantity: null, unit: '', min_threshold: null });
  };

  // Use backend data, but keep original UI logic
  const filteredItems = (inventory || []).filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`container py-4 ${styles.customContainer}`}>
      <h1 className="text-center mb-4 text-primary">Stock Management</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {/* شريط البحث */}
      <Form.Group className="mb-4">
        <Form.Control
          type="search"
          placeholder="Search Ingredients"
          className="rounded-pill"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      {/* جدول البيانات */}
      <Table striped bordered hover className="rounded-3 overflow-hidden shadow">
        <thead className="bg-primary text-white">
          <tr>
            <th>Item Name</th>
            <th>Current Quantity</th>
            <th>Unit</th>
            <th>Status</th>
            <th>Availability</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item, index) => {
            const { status, availability } = computeStatusAndAvailability(item);
            return (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.unit}</td>
                <td>
                  <span
                    className={`badge ${status === 'LOW' ? 'bg-danger' : 'bg-success'} rounded-pill`}
                  >
                    {status}
                  </span>
                </td>
                <td>
                  <ProgressBar
                    now={availability}
                    className="rounded-pill"
                    variant={status === 'LOW' ? 'danger' : 'success'}
                    label={`${availability}%`}
                  />
                </td>
              </tr>
            );
          })}
          {loading && (
            <tr><td colSpan={5} className="text-center">Loading...</td></tr>
          )}
        </tbody>
      </Table>

      {/* إضافة عنصر جديد */}
      <Form className="mb-3">
        <Form.Group className="mb-2">
          <Form.Control
            type="text"
            placeholder="Item Name"
            value={newItem.name}
            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Control
            type="number"
            placeholder="Quantity"
            value={newItem.quantity ?? ''}
            onChange={e => setNewItem({ ...newItem, quantity: e.target.value === '' ? null : Number(e.target.value) })}
          />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Control
            type="text"
            placeholder="Unit (e.g. kg, liter)"
            value={newItem.unit}
            onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Control
            type="number"
            placeholder="Min Threshold"
            value={newItem.min_threshold ?? ''}
            onChange={e => setNewItem({ ...newItem, min_threshold: e.target.value === '' ? null : Number(e.target.value) })}
          />
        </Form.Group>
        <Button
          variant="primary"
          className="rounded-pill w-100"
          onClick={e => { e.preventDefault(); handleAddNewIngredient(); }}
          disabled={loading}
        >
          + Add New Ingredient
        </Button>
      </Form>
    </div>
  );
};

export default InventoryManagementPage;