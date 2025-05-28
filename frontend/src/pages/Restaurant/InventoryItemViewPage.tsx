import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Input, Spin } from 'antd';
import Header from '../../components/Header';
import { useInventory, InventoryItem } from '../../hooks/useInventory';
import useHasPermission from '../../hooks/useHasPermission';

const InventoryItemViewPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const systemId = localStorage.getItem('selectedSystemId');
  const navigate = useNavigate();
  const { getInventoryItem, updateInventoryItem, deleteInventoryItem } = useInventory();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasUpdatePermission = useHasPermission('update_inventory');

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
    if (!hasUpdatePermission) return;
    setSaving(true);
    setError(null);
    try {
      await updateInventoryItem(systemId, itemId, item);
      setError('Saved!');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error updating inventory item');
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error deleting inventory item');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><Spin /></div>;
  if (!item) return <div className="alert alert-danger">Item not found</div>;

  return (
    <div className="container">
      <Header 
        title="Inventory Item Details" 
        showBackButton={true}
        onBack={() => navigate(-1)}
        actions={hasUpdatePermission && (
          <Button type="primary" onClick={handleSave} disabled={saving}>
            Save
          </Button>
        )}
      />
      <div className="card shadow rounded-4 p-4" style={{ maxWidth: 480, width: '100%', margin: '0 auto' }}>
        {error && <div className={`alert ${error === 'Saved!' ? 'alert-success' : 'alert-danger'} py-2 px-3`}>{error}</div>}
        <Form>
          <Form.Item label="Name">
            <Input name="name" value={item.name} onChange={handleChange} autoFocus />
          </Form.Item>
          <Form.Item label="Quantity">
            <Input name="quantity" type="number" value={item.quantity ?? ''} onChange={handleChange} />
          </Form.Item>
          <Form.Item label="Unit">
            <Input name="unit" value={item.unit} onChange={handleChange} />
          </Form.Item>
          <Form.Item label="Min Threshold">
            <Input name="min_threshold" type="number" value={item.min_threshold ?? ''} onChange={handleChange} />
          </Form.Item>
          <div className="d-flex gap-2 justify-content-between">
            <Button danger onClick={e => { e.preventDefault(); handleDelete(); }} disabled={saving}>
              Delete
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default InventoryItemViewPage;
