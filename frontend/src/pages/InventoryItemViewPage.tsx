import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useInventory, InventoryItem } from '../hooks/useInventory';

const InventoryItemViewPage: React.FC = () => {
  const { systemId, itemId } = useParams<{ systemId: string; itemId: string }>();
  const navigate = useNavigate();
  const { getInventoryItem, updateInventoryItem, deleteInventoryItem } = useInventory();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (systemId && itemId) {
      setLoading(true);
      getInventoryItem(systemId, itemId)
        .then(setItem)
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [systemId, itemId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!item) return;
    const { name, value, type } = e.target;
    let newValue: string | number | null = value;
    if (type === 'number') {
      newValue = value === '' ? null : Number(value);
    }
    setItem({ ...item, [name]: newValue });
  };

  const handleSave = async () => {
    if (!item || !systemId || !itemId) return;
    setSaving(true);
    setError(null);
    try {
      await updateInventoryItem(systemId, itemId, item);
      setError('Saved!');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!systemId || !itemId) return;
    setSaving(true);
    setError(null);
    try {
      await deleteInventoryItem(systemId, itemId);
      navigate('/Inventory');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (!item) return <div className="alert alert-danger">Item not found</div>;

  return (
    <div className="container py-4">
      <h2>View/Edit Inventory Item</h2>
      {error && <div className={`alert ${error === 'Saved!' ? 'alert-success' : 'alert-danger'}`}>{error}</div>}
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control name="name" value={item.name} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Quantity</Form.Label>
          <Form.Control name="quantity" type="number" value={item.quantity ?? ''} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Unit</Form.Label>
          <Form.Control name="unit" value={item.unit} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Min Threshold</Form.Label>
          <Form.Control name="min_threshold" type="number" value={item.min_threshold ?? ''} onChange={handleChange} />
        </Form.Group>
        <Button variant="primary" onClick={e => { e.preventDefault(); handleSave(); }} disabled={saving} className="me-2">
          Save
        </Button>
        <Button variant="danger" onClick={e => { e.preventDefault(); handleDelete(); }} disabled={saving}>
          Delete
        </Button>
      </Form>
    </div>
  );
};

export default InventoryItemViewPage;
