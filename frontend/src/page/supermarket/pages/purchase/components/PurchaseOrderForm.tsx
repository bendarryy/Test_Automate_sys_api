import React from 'react';
import { Form, InputNumber, DatePicker, Button, Select, Space } from 'antd';
import { PurchaseOrder } from '../types/purchase';

interface Props {
  initial?: Partial<PurchaseOrder>;
  onSubmit: (data: Partial<PurchaseOrder>) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const PurchaseOrderForm: React.FC<Props> = ({ initial = {}, onSubmit, onCancel, loading }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    form.setFieldsValue(initial);
  }, [initial, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      initialValues={initial}
      style={{ maxWidth: 500 }}
    >
      <Form.Item name="supplier_id" label="Supplier ID" rules={[{ required: true, message: 'Required' }]}> <InputNumber style={{ width: '100%' }} min={1} /> </Form.Item>
      <Form.Item name="product_id" label="Product ID" rules={[{ required: true, message: 'Required' }]}> <InputNumber style={{ width: '100%' }} min={1} /> </Form.Item>
      <Form.Item name="quantity" label="Quantity" rules={[{ required: true, message: 'Required' }]}> <InputNumber style={{ width: '100%' }} min={1} /> </Form.Item>
      <Form.Item name="cost" label="Cost" rules={[{ required: true, message: 'Required' }]}> <InputNumber style={{ width: '100%' }} min={0} step={0.01} /> </Form.Item>
      <Form.Item name="order_date" label="Order Date" rules={[{ required: true, message: 'Required' }]}> <DatePicker style={{ width: '100%' }} /> </Form.Item>
      <Form.Item name="expected_delivery_date" label="Expected Delivery Date"> <DatePicker style={{ width: '100%' }} /> </Form.Item>
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>Save</Button>
          {onCancel && <Button onClick={onCancel}>Cancel</Button>}
        </Space>
      </Form.Item>
    </Form>
  );
};

export default PurchaseOrderForm;
