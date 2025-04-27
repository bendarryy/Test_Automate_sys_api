// InventoryManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { Table, Form, ProgressBar, Button, Modal } from 'react-bootstrap';
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
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchInventory(SYSTEM_ID);
    // eslint-disable-next-line
  }, []);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleAddNewIngredient = async () => {
    if (!newItem.name || newItem.quantity === null || !newItem.unit) return;
    await addInventoryItem(SYSTEM_ID, newItem);
    fetchInventory(SYSTEM_ID);
    setNewItem({ name: '', quantity: null, unit: '', min_threshold: null });
    handleCloseModal();
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
      <div className="d-flex justify-content-center mb-4">
        <div className="input-group shadow rounded-pill" style={{ maxWidth: 400, width: '100%', background: '#fff' }}>
          <span className="input-group-text bg-white border-0 rounded-pill ps-3" id="search-addon">
            <i className="bi bi-search" style={{ fontSize: '1.3rem', color: '#0d6efd' }}></i>
          </span>
          <Form.Control
            type="search"
            placeholder="Search for ingredients..."
            className="border-0 rounded-pill ps-2 py-2 fs-5"
            style={{ boxShadow: 'none', background: 'transparent' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search Ingredients"
            aria-describedby="search-addon"
          />
        </div>
      </div>

      {/* جدول البيانات */}
      <Table striped bordered hover className={`rounded-3 overflow-hidden shadow ${styles.table}`}>
        <thead className="bg-primary text-white">
          <tr>
            <th ><i className="bi bi-box-seam me-2"></i>Item Name</th>
            <th><i className="bi bi-123 me-2"></i>Current Quantity</th>
            <th><i className="bi bi-cup-straw me-2"></i>Unit</th>
            <th><i className="bi bi-exclamation-circle me-2"></i>Status</th>
            <th><i className="bi bi-graph-up-arrow me-2"></i>Availability</th>
            <th><i className="bi bi-gear me-2"></i>Actions</th>
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
                    className={`badge ${status === 'LOW' ? 'bg-danger' : 'bg-success'} rounded-pill d-flex align-items-center gap-1`}
                  >
                    <i className={`bi ${status === 'LOW' ? 'bi-arrow-down-circle-fill' : 'bi-check-circle-fill'} me-1`}></i>
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
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    className="rounded-pill d-flex align-items-center gap-1"
                    href={`/restaurant/${SYSTEM_ID}/inventory/${item.id}`}
                  >
                    <i className="bi bi-eye-fill"></i>
                    View
                  </Button>
                </td>
              </tr>
            );
          })}
          {loading && (
            <tr><td colSpan={6} className="text-center">Loading...</td></tr>
          )}
        </tbody>
      </Table>

      {/* إضافة عنصر جديد */}
      <div className="d-flex justify-content-end mb-3">
        <Button variant="success" className="rounded-pill px-4 py-2 fw-bold shadow d-flex align-items-center gap-2" onClick={handleOpenModal}>
          <i className="bi bi-plus-circle-fill fs-5"></i>
          Add New Ingredient
        </Button>
      </div>
      <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Add New Ingredient</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Item Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Item Name"
                value={newItem.name}
                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Quantity</Form.Label>
              <Form.Control
                type="number"
                placeholder="Quantity"
                value={newItem.quantity ?? ''}
                onChange={e => setNewItem({ ...newItem, quantity: e.target.value === '' ? null : Number(e.target.value) })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Unit (e.g. kg, liter)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Unit (e.g. kg, liter)"
                value={newItem.unit}
                onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Min Threshold</Form.Label>
              <Form.Control
                type="number"
                placeholder="Min Threshold"
                value={newItem.min_threshold ?? ''}
                onChange={e => setNewItem({ ...newItem, min_threshold: e.target.value === '' ? null : Number(e.target.value) })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={handleCloseModal} className="rounded-pill px-3">
            Cancel
          </Button>
          <Button
            variant="success"
            className="rounded-pill px-4 fw-bold shadow"
            onClick={handleAddNewIngredient}
            disabled={loading}
          >
            Add Ingredient
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InventoryManagementPage;