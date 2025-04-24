// InventoryManagementPage.tsx
import React, { useState } from 'react';
import { Table, Form, ProgressBar, Button } from 'react-bootstrap';
import styles from '../styles/InventoryManagementPage.module.css';

interface Item {
  name: string;
  quantity: string;
  unit: string;
  status: 'Sufficient' | 'LOW';
  availability: number;
}

const InventoryManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<Item[]>([
    { 
      name: 'Tomatoes', 
      quantity: '10', 
      unit: 'kg', 
      status: 'Sufficient',
      availability: 75
    },
    { 
      name: 'Milk', 
      quantity: '2', 
      unit: 'liter', 
      status: 'LOW',
      availability: 25
    },
  ]);

  // دالة إضافة عنصر جديد
  const handleAddNewIngredient = () => {
    const newItem: Item = {
      name: 'New Item',
      quantity: '0',
      unit: 'kg',
      status: 'Sufficient',
      availability: 0
    };
    setItems([...items, newItem]);
  };

  // فلترة العناصر حسب البحث
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`container py-4 ${styles.customContainer}`}>
      <h1 className="text-center mb-4 text-primary">Stock Management</h1>
      
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
          {filteredItems.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.unit}</td>
              <td>
                <span 
                  className={`badge ${
                    item.status === 'LOW' ? 'bg-danger' : 'bg-success'
                  } rounded-pill`}
                >
                  {item.status}
                </span>
              </td>
              <td>
                <ProgressBar 
                  now={item.availability} 
                  className="rounded-pill"
                  variant={item.status === 'LOW' ? 'danger' : 'success'}
                  label={`${item.availability}%`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* زر إضافة عنصر جديد */}
      <div className="d-flex justify-content-end mt-3">
        <Button 
          variant="primary" 
          className="rounded-pill w-100"
          onClick={handleAddNewIngredient}
        >
          + Add New Ingredient
        </Button>
      </div>
    </div>
  );
};

export default InventoryManagementPage;