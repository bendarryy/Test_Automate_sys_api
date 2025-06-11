import React from 'react';
import { Form, InputNumber, DatePicker, Input, Button, Space } from 'antd';
import { GoodsReceiving } from '../types/purchase';

interface Props {
  initial?: Partial<GoodsReceiving>;
  onSubmit: (data: Partial<GoodsReceiving>) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const GoodsReceivingForm: React.FC<Props> = ({ initial = {}, onSubmit, onCancel, loading }) => {
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
      <Form.Item name="purchase_order_id" label="Purchase Order ID" rules={[{ required: true, message: 'Required' }]}> <InputNumber style={{ width: '100%' }} min={1} /> </Form.Item>
      <Form.Item name="received_quantity" label="Received Quantity" rules={[{ required: true, message: 'Required' }]}> <InputNumber style={{ width: '100%' }} min={1} /> </Form.Item>
      <Form.Item name="received_date" label="Received Date" rules={[{ required: true, message: 'Required' }]}> <DatePicker style={{ width: '100%' }} /> </Form.Item>
      <Form.Item name="expiry_date" label="Expiry Date"> <DatePicker style={{ width: '100%' }} /> </Form.Item>
      <Form.Item name="location" label="Location"> <Input /> </Form.Item>
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>Save</Button>
          {onCancel && <Button onClick={onCancel}>Cancel</Button>}
        </Space>
      </Form.Item>
    </Form>
  );
};

export default GoodsReceivingForm;
