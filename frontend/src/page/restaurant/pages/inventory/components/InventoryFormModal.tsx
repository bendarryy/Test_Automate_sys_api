import React from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { NewInventoryItem } from '../types/inventory';

interface InventoryFormModalProps {
  visible: boolean;
  loading: boolean;
  newItem: NewInventoryItem;
  setNewItem: React.Dispatch<React.SetStateAction<NewInventoryItem>>;
  onCancel: () => void;
  onAdd: () => void;
}

const InventoryFormModal: React.FC<InventoryFormModalProps> = ({
  visible,
  loading,
  newItem,
  setNewItem,
  onCancel,
  onAdd,
}) => (
  <Modal
    title="Add New Ingredient"
    open={visible}
    onCancel={onCancel}
    footer={[
      <Button key="cancel" onClick={onCancel}>
        Cancel
      </Button>,
      <Button
        key="submit"
        type="primary"
        onClick={onAdd}
        loading={loading}
      >
        Add Ingredient
      </Button>
    ]}
  >
    <Form layout="vertical">
      <Form.Item label="Item Name" required>
        <Input
          value={newItem.name}
          onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter item name"
        />
      </Form.Item>
      <Form.Item label="Quantity" required>
        <Input
          type="number"
          value={newItem.quantity ?? ''}
          onChange={e => setNewItem(prev => ({ ...prev, quantity: e.target.value === '' ? null : Number(e.target.value) }))}
          placeholder="Enter quantity"
        />
      </Form.Item>
      <Form.Item label="Unit">
        <Input
          value={newItem.unit}
          onChange={e => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
          placeholder="Enter unit (e.g. kg, liter)"
        />
      </Form.Item>
      <Form.Item label="Min Threshold">
        <Input
          type="number"
          value={newItem.min_threshold ?? ''}
          onChange={e => setNewItem(prev => ({ ...prev, min_threshold: e.target.value === '' ? null : Number(e.target.value) }))}
          placeholder="Enter minimum threshold"
        />
      </Form.Item>
    </Form>
  </Modal>
);

export default InventoryFormModal;
