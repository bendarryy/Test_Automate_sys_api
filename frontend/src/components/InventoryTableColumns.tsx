import { TableColumnsType } from 'antd';
import { Form, Input, InputNumber, DatePicker, Space, Button } from 'antd';
import dayjs from 'dayjs';
import { Product } from '../pages/supermarket/InventoryManagementPage';

interface InventoryTableColumnsProps {
  editingId: string | null;
  handleEdit: (record: Product) => void;
  handleDelete: (id: string) => void;
  handleSave: (id: string) => void;
  handleCancel: () => void;
}

export const getInventoryTableColumns = ({
  editingId,
  handleEdit,
  handleDelete,
  handleSave,
  handleCancel
}: InventoryTableColumnsProps): TableColumnsType<Product> => {
  return [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => {
        if (editingId === record.id) {
          return (
            <Form.Item name="name" style={{ margin: 0 }}>
              <Input />
            </Form.Item>
          );
        }
        return record.name;
      }
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (_, record) => {
        if (editingId === record.id) {
          return (
            <Form.Item name="price" style={{ margin: 0 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          );
        }
        return `$${record.price}`;
      }
    },
    {
      title: 'Stock',
      dataIndex: 'stock_quantity',
      key: 'stock',
      render: (_, record) => {
        if (editingId === record.id) {
          return (
            <Form.Item name="stock_quantity" style={{ margin: 0 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          );
        }
        return record.stock_quantity;
      }
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      render: (_, record) => {
        if (editingId === record.id) {
          return (
            <Form.Item name="expiry_date" style={{ margin: 0 }}>
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Form.Item>
          );
        }
        return dayjs(record.expiry_date).format('YYYY-MM-DD');
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        if (editingId === record.id) {
          return (
            <Space size="middle">
              <Button onClick={() => handleSave(record.id)}>Save</Button>
              <Button onClick={handleCancel}>Cancel</Button>
            </Space>
          );
        }
        return (
          <Space size="middle">
            <Button onClick={() => handleEdit(record)}>Edit</Button>
            <Button danger onClick={() => handleDelete(record.id)}>Delete</Button>
          </Space>
        );
      }
    }
  ];
};
