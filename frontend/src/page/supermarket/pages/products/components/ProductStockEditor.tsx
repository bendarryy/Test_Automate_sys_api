import React, { useState } from 'react';
import { Modal, Form, InputNumber } from 'antd';
import type { Product } from '../types/product';

interface ProductStockEditorProps {
  product: Product;
  onUpdate: (stock: number) => void;
  loading?: boolean;
}

const ProductStockEditor: React.FC<ProductStockEditorProps> = ({ product, onUpdate, loading }) => {
  const [visible, setVisible] = useState(true);
  const [form] = Form.useForm<{ stock: number }>();

  const handleOk = async () => {
    const values = await form.validateFields();
    onUpdate(values.stock);
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <Modal
      open={visible}
      title={`Edit Stock: ${product.name}`}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Update"
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ stock: product.stock_quantity }}>
        <Form.Item name="stock" label="Stock Quantity" rules={[{ required: true, message: 'Enter stock quantity' }]}> 
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductStockEditor;
