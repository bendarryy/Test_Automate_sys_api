import React, { useState } from 'react';
import { Form, Input, InputNumber, DatePicker, Button, Modal } from 'antd';
import type { Dayjs } from 'dayjs';
import type { AddProductPayload } from '../types/product';

interface ProductFormProps {
  onSubmit: (payload: AddProductPayload) => void;
  loading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, loading }) => {
  const [form] = Form.useForm<AddProductPayload & { expiry_date: Dayjs }>();
  const [open, setOpen] = useState(false);

  const handleFinish = (values: AddProductPayload & { expiry_date: Dayjs }) => {
    const payload: AddProductPayload = {
      ...values,
      expiry_date: values.expiry_date.format('YYYY-MM-DD'),
    };
    onSubmit(payload);
    form.resetFields();
    setOpen(false);
  };

  return (
    <>
      <Button
        type="primary"
        onClick={() => setOpen(true)}
        style={{ marginBottom: 16, fontWeight: 600 }}
        size="large"
        block
      >
        + Add New Product
      </Button>
      <Modal
        open={open}
        title={<span style={{ fontWeight: 700 }}>Add New Product</span>}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnClose
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ stock_quantity: 0 }}
        >
          <Form.Item name="name" label="name of product" rules={[{ required: true, message: 'enter the name' }]}> 
            <Input placeholder="name of product" />
          </Form.Item>
          <Form.Item name="price" label="price" rules={[{ required: true, message: 'enter the price' }]}> 
            <InputNumber placeholder="price" min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock_quantity" label="stock quantity" rules={[{ required: true, message: 'enter the stock quantity' }]}> 
            <InputNumber placeholder="stock quantity" min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="expiry_date" label="expiry date" rules={[{ required: true, message: 'enter the date' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              إضافة المنتج
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ProductForm;
