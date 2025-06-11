import React from 'react';
import { Form, InputNumber, Input, DatePicker, Button, Select } from 'antd';
import dayjs from 'dayjs';
import { PurchaseOrder } from '../types/PurchaseOrder';

interface PurchaseOrderFormProps {
  initialValues?: Partial<PurchaseOrder>;
  onSubmit: (values: any) => void;
  submitting: boolean;
  suppliers: { id: number; name: string }[];
  products: { id: number; name: string }[];
}

export const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ initialValues, onSubmit, submitting, suppliers, products }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (initialValues) {
      // Convert string dates to dayjs objects for DatePicker fields
      form.setFieldsValue({
        ...initialValues,
        order_date: initialValues.order_date ? dayjs(initialValues.order_date) : undefined,
        expected_delivery_date: initialValues.expected_delivery_date ? dayjs(initialValues.expected_delivery_date) : undefined,
      });
    }
  }, [initialValues, form]);

  // On submit, convert dayjs objects back to string (YYYY-MM-DD)
  const handleFinish = (values: any) => {
    const payload = {
      ...values,
      order_date: values.order_date ? values.order_date.format('YYYY-MM-DD') : undefined,
      expected_delivery_date: values.expected_delivery_date ? values.expected_delivery_date.format('YYYY-MM-DD') : undefined,
    };
    onSubmit(payload);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={initialValues ? {
        ...initialValues,
        order_date: initialValues.order_date ? dayjs(initialValues.order_date) : undefined,
        expected_delivery_date: initialValues.expected_delivery_date ? dayjs(initialValues.expected_delivery_date) : undefined,
      } : undefined}
      aria-label="Purchase Order Form"
    >
      <Form.Item name="supplier" label="Supplier" rules={[{ required: true, message: 'Please select a supplier' }]}> 
        <Select placeholder="Select supplier" options={suppliers.map(s => ({ value: s.id, label: s.name }))} />
      </Form.Item>
      <Form.Item name="product" label="Product" rules={[{ required: true, message: 'Please select a product' }]}> 
        <Select placeholder="Select product" options={products.map(p => ({ value: p.id, label: p.name }))} />
      </Form.Item>
      <Form.Item name="quantity" label="Quantity" rules={[{ required: true, message: 'Please enter quantity' }]}> 
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="cost" label="Cost" rules={[{ required: true, message: 'Please enter cost' }]}> 
        <Input prefix="£" type="number" min={0} step={0.01} />
      </Form.Item>
      <Form.Item name="order_date" label="Order Date" rules={[{ required: true, message: 'Please select order date' }]}> 
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="expected_delivery_date" label="Expected Delivery Date" rules={[{ required: true, message: 'Please select expected delivery date' }]}> 
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting} block>
          {initialValues ? 'Update Order' : 'Create Order'}
        </Button>
      </Form.Item>
    </Form>
  );
};
