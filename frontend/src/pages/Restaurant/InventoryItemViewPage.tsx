import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useInventory, InventoryItem } from '../../hooks/useInventory';

const InventoryItemViewPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const systemId = localStorage.getItem('selectedSystemId');
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

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (!item) return <div className="alert alert-danger">Item not found</div>;

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow rounded-4 p-4" style={{ maxWidth: 480, width: '100%' }}>
        <div className="d-flex align-items-center mb-4 gap-2">
          <i className="bi bi-box-seam-fill text-primary fs-3"></i>
          <h3 className="mb-0 fw-bold flex-grow-1">Inventory Item Details</h3>
        </div>
        {error && <div className={`alert ${error === 'Saved!' ? 'alert-success' : 'alert-danger'} py-2 px-3`}>{error}</div>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold"><i className="bi bi-tag me-2 text-secondary"></i>Name</Form.Label>
            <Form.Control name="name" value={item.name} onChange={handleChange} autoFocus />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold"><i className="bi bi-123 me-2 text-secondary"></i>Quantity</Form.Label>
            <Form.Control name="quantity" type="number" value={item.quantity ?? ''} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold"><i className="bi bi-cup-straw me-2 text-secondary"></i>Unit</Form.Label>
            <Form.Control name="unit" value={item.unit} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold"><i className="bi bi-exclamation-circle me-2 text-secondary"></i>Min Threshold</Form.Label>
            <Form.Control name="min_threshold" type="number" value={item.min_threshold ?? ''} onChange={handleChange} />
          </Form.Group>
          <div className="d-flex gap-2 justify-content-between">
            <Button variant="primary" onClick={e => { e.preventDefault(); handleSave(); }} disabled={saving} className="rounded-pill px-4 d-flex align-items-center gap-2 fw-bold shadow">
              <i className="bi bi-save2"></i> Save
            </Button>
            <Button variant="danger" onClick={e => { e.preventDefault(); handleDelete(); }} disabled={saving} className="rounded-pill px-4 d-flex align-items-center gap-2 fw-bold shadow">
              <i className="bi bi-trash3"></i> Delete
            </Button>
            <Button variant="secondary" onClick={() => navigate(-1)} className="rounded-pill px-4 d-flex align-items-center gap-2 fw-bold shadow">
              <i className="bi bi-arrow-left"></i> Back
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default InventoryItemViewPage;
