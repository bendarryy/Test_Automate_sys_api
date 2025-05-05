import React from 'react';
import { Table, Button, Select, notification, Input, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { useOrders } from '../../hooks/useOrders';
import { useNavigate } from 'react-router-dom';

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
}

const statusColors: Record<OrderStatus, string> = {
  pending: 'orange',
  preparing: 'blue',
  ready: 'green',
  completed: 'purple',
  canceled: 'red'
};

const OrderPage: React.FC = () => {
  const systemId = localStorage.getItem('selectedSystemId') || '';
  const { data: orders = [], loading, getOrders, updateOrderStatus, deleteOrder } = useOrders(systemId);
  const navigate = useNavigate();
  const [searchText, setSearchText] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<string[]>([]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
  };

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

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter((order: Order) => {
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchText.toLowerCase()) ||
      order.table_number.includes(searchText) ||
      order.id.toString().includes(searchText);
    
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(order.status);
    
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<Order> = [
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
        <Space size="middle">
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
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {selectedRowKeys.length > 0 && (
        <div style={{ 
          marginBottom: 16, 
          padding: 12,
          background: '#fafafa',
          border: '1px solid #d9d9d9',
          borderRadius: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>
            <Tag color="blue">{selectedRowKeys.length}</Tag> orders selected
          </span>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={handleBulkDelete}
          >
            Delete Selected
          </Button>
        </div>
      )}
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search orders (ID, Customer, Table)"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300, marginRight: 16 }}
        />
        <Select
          mode="multiple"
          placeholder="Filter by status"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 300 }}
          allowClear
        >
          {Object.entries(statusColors).map(([status, color]) => (
            <Select.Option key={status} value={status}>
              <Tag color={color}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>
            </Select.Option>
          ))}
        </Select>
      </div>
      
      <Table
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
        }}
        columns={columns}
        dataSource={filteredOrders}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 8 }}
        bordered
      />
    </div>
  );
};

export default OrderPage;