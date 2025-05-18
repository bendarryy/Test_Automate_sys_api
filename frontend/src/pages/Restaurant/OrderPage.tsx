import React from 'react';
import useHasPermission from '../../hooks/useHasPermission';
import { Button, Select, notification, Space, Input, Tag } from 'antd';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useOrders } from '../../hooks/useOrders';
import { useNavigate } from 'react-router-dom';
import { ReusableTable } from '../../components/ReusableTable';
import type { ColumnsType } from 'antd/es/table';

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'canceled';

interface Order {
  id: string;
  system: number;
  customer_name: string;
  table_number: string;
  waiter?: number;
  total_price: string;
  profit: number;
  status: OrderStatus;
  order_items: {
    id: string;
    menu_item: number;
    menu_item_name: string;
    quantity: number;
  }[];
  created_at: string;
  updated_at: string;
  order_type?: 'in_house' | 'delivery'; // Order type: 'in_house' (default) or 'delivery'
  [key: string]: unknown;
}

const statusColors: Record<OrderStatus, string> = {
  pending: 'orange',
  preparing: 'blue',
  ready: 'green',
  completed: 'purple',
  canceled: 'red'
};

const OrderPage: React.FC = () => {
  // صلاحيات المستخدم
  const canUpdate = useHasPermission('update_order');
  const canDelete = useHasPermission('delete_order');
  const systemId = localStorage.getItem('selectedSystemId') || '';
  const { data: orders = [], loading, getOrders, updateOrderStatus, deleteOrder } = useOrders(systemId);
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<string[]>([]);

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRowKeys.map(id => deleteOrder(id)));
      notification.success({ 
        message: 'Success', 
        description: `Deleted ${selectedRowKeys.length} orders successfully` 
      });
      setSelectedRowKeys([]);
      getOrders();
    } catch  {
      notification.error({
        message: 'Error',
        description: 'Failed to delete selected orders'
      });
    }
  };

  React.useEffect(() => {
    getOrders();
  }, [systemId]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateOrderStatus(id, status);
      notification.success({ message: 'Order status updated' });
      getOrders();
    } catch (err: unknown) {
      const error = err as Error;
      notification.error({ message: 'Failed to update order status', description: error.message });
    }
  };

  const columns: ColumnsType<Order> = [
    {
      title: 'Order type',
      dataIndex: 'order_type',
      key: 'order_type',
      render: (order_type: Order['order_type']) => (order_type === 'delivery' ? 'delivery' : 'in_house'),
      filters: [
        { text: 'In House', value: 'in_house' },
        { text: 'Delivery', value: 'delivery' },
      ],
      onFilter: (value: boolean | React.Key, record: Order) => {
        if (typeof value === 'boolean') return value;
        return (record.order_type || 'in_house') === String(value);
      },
    },
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <Button type="link" onClick={() => navigate(`/orders/${id}`)}>
          #{id}
        </Button>
      ),
      sorter: (a: Order, b: Order) => Number(a.id) - Number(b.id),
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }: { setSelectedKeys: (keys: React.Key[]) => void; selectedKeys: React.Key[]; confirm: () => void }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search customer"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value: boolean | React.Key, record: Order) => {
        if (typeof value === 'boolean') {
          return value;
        }
        return record.customer_name.toLowerCase().includes(String(value).toLowerCase());
      },
      sorter: (a: Order, b: Order) => {
        const nameA = a.customer_name?.toLowerCase() || '';
        const nameB = b.customer_name?.toLowerCase() || '';
        return nameA.localeCompare(nameB , undefined, { numeric: true,
          sensitivity: 'base' });
      },
    },
    {
      title: 'Table',
      dataIndex: 'table_number',
      key: 'table_number',
      sorter: (a: Order, b: Order) => a.table_number.localeCompare(b.table_number),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => (
        <Tag color={statusColors[status]} style={{ textTransform: 'capitalize' }}>
          {status}
        </Tag>
      ),
      filters: Object.entries(statusColors).map(([status]) => ({
        text: status.charAt(0).toUpperCase() + status.slice(1),
        value: status,
      })),
      onFilter: (value: boolean | React.Key, record: Order) => {
        if (typeof value === 'boolean') {
          return value; // Handle boolean case
        }
        return record.status === String(value);
      }
    },
    {
      title: 'Total',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (total: string) => `$${total}`,
      sorter: (a: Order, b: Order) => parseFloat(a.total_price) - parseFloat(b.total_price),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
      sorter: (a: Order, b: Order) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: Order) => (
        (canUpdate || canDelete) ? (
          <Space size="middle">
            {canUpdate && (
              <Select
                value={record.status}
                style={{ width: 120 }}
                onChange={(value) => handleStatusChange(record.id, value)}
              >
                <Select.Option value="pending">Pending</Select.Option>
                <Select.Option value="preparing">Preparing</Select.Option>
                <Select.Option value="ready">Ready</Select.Option>
                <Select.Option value="completed">Completed</Select.Option>
                <Select.Option value="canceled">Canceled</Select.Option>
              </Select>
            )}
            {canDelete && (
              <Button 
                danger 
                onClick={async () => {
                  try {
                    await deleteOrder(record.id);
                    notification.success({ message: 'Order deleted successfully' });
                    getOrders();
                  } catch (err: unknown) {
                    const error = err as Error;
                    notification.error({ message: 'Failed to delete order', description: error.message });
                  }
                }}
              >
                <DeleteOutlined />
              </Button>
            )}
          </Space>
        ) : null
      ),
    },
  ];

  const extraActions = (selectedRowKeys.length > 0 && canDelete) ? (
    <Button 
      danger 
      onClick={handleBulkDelete}
      style={{ marginLeft: 8 }}
    >
      Delete Selected
    </Button>
  ) : null;

  return (
    <ReusableTable<Order>
      data={orders as Order[]}
      loading={loading}
      columns={columns.filter(col => {
        if (col.key === 'actions') {
          return canUpdate || canDelete;
        }
        return true;
      })}
      rowKey="id"
      onRowSelectionChange={(keys: React.Key[]) => setSelectedRowKeys(keys as string[])}
      selectedRowKeys={selectedRowKeys}
      extraActions={extraActions}
    />
  );
};

export default OrderPage;