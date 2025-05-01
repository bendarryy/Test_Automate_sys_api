import React, { useState, useEffect } from 'react';
// تم تحسين الاستيراد لتقليل حجم الباندل:
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import { useGetMenu } from '../hooks/useGetMenu';
import { useSelectedSystemId } from '../hooks/useSelectedSystemId';
const categories = ['Food', 'Drink', 'Soups', 'Dessert'];

const initialItem = {
  name: '',
  category: 'Food',
  price: '',
  available: true,
  description: '',
  specialOffer: false,
};

const MenuManagement = () => {

const [selectedSystemId] = useSelectedSystemId();
  const { getMenu, createMenuItem, updateMenuItem, deleteMenuItem, loading, error } = useGetMenu(Number(selectedSystemId));

  interface MenuItem {
    id: number;
    name: string;
    category: string;
    price: number;
    available: boolean;
    description: string;
    specialOffer: boolean;
  }
  
  const [items, setItems] = useState<MenuItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialItem);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState('Food');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const fetchedItems = await getMenu();
        setItems(fetchedItems || []);
        console.log('Fetched items:', items);
      } catch (error) {
        console.error('Error fetching menu:', error);
      }
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    console.log('Items updated:', items);
  }, [items]);

  const handleAddClick = React.useCallback(() => {
    setFormData(initialItem);
    setEditItem(null);
    setShowModal(true);
  }, []);

  const handleEditClick = React.useCallback((item: MenuItem) => {
    setFormData({ ...item, price: item.price.toString() });
    setEditItem(item);
    setShowModal(true);
  }, []);

  const handleDeleteClick = React.useCallback(async (item: MenuItem) => {
    await deleteMenuItem(item.id);
    setItems(items.filter((i) => i.id !== item.id));
  }, []);

  const handleSave = React.useCallback(async () => {
    if (!formData.name || !formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      alert('Please fill in all fields correctly.');
      return;
    }
  
    const updatedFormData = {
      ...formData,
      price: Number(formData.price),
      category: formData.category.toLowerCase(), // Convert category to lowercase
    };

    if (editItem) {
      await updateMenuItem(editItem.id, updatedFormData);
      setItems(items.map((item) => (
        item.id === editItem.id
          ? {
              id: editItem.id,
              name: updatedFormData.name,
              category: updatedFormData.category,
              price: Number(updatedFormData.price),
              available: updatedFormData.available,
              description: updatedFormData.description,
              specialOffer: updatedFormData.specialOffer,
            }
          : item
      )));
    } else {
      const newItem = await createMenuItem({ ...updatedFormData, id: Date.now() });
      // Ensure newItem has all MenuItem properties and correct types
      if (
        newItem &&
        typeof newItem.id === 'number' &&
        typeof newItem.name === 'string' &&
        typeof newItem.category === 'string' &&
        typeof newItem.price === 'number' &&
        typeof newItem.available === 'boolean' &&
        typeof newItem.description === 'string' &&
        typeof newItem.specialOffer === 'boolean'
      ) {
        setItems([
          ...items,
          {
            id: newItem.id,
            name: newItem.name,
            category: newItem.category,
            price: newItem.price,
            available: newItem.available,
            description: newItem.description,
            specialOffer: newItem.specialOffer,
          },
        ]);
      }
    }
    setShowModal(false);
  }, []);

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value });
  }, []);

  return (
    <div className="container mt-5">
      <h2>Management Menu</h2>
      <Button className="my-3" onClick={handleAddClick}>
        Add New Item
      </Button>

      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <p>Error loading menu: {error}</p>
      ) : (
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'Food')} className="mb-3">
          {categories.map((cat) => (
            <Tab eventKey={cat} title={cat} key={cat}>
              <Table striped bordered hover>
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
                  {items
                    .map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.description}</td>
                        <td>{item.price} EGP</td>
                        <td>{item.available ? 'Available' : 'Not Available'}</td>
                        <td>{item.specialOffer || '-'}</td>
                        <td>
                          <Button variant="warning" size="sm" onClick={() => handleEditClick(item)}>
                            Edit
                          </Button>{' '}
                          <Button variant="danger" size="sm" onClick={() => handleDeleteClick(item)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Tab>
          ))}
        </Tabs>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editItem ? 'Edit Item' : 'Add Item'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control name="name" value={formData.name} onChange={handleChange} />
            </Form.Group>
            <div className="d-flex justify-content-between">
              <Form.Group className="w-50 me-2">
                <Form.Label>Category</Form.Label>
                <Form.Select name="category" value={formData.category} onChange={handleChange}>
                  {categories.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="w-50">
                <Form.Label>Price (EGP)</Form.Label>
                <Form.Control
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>
            <Form.Group className="mt-2">
              <Form.Check
                type="switch"
                label="Available"
                name="available"
                checked={formData.available}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Check
                type="switch"
                label="Special Offer"
                name="specialOffer"
                checked={formData.specialOffer}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MenuManagement;