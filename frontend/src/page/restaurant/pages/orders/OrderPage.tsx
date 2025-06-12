import React from 'react';
import { Button, Select, notification, Space, Input, Tag } from 'antd';
import { DeleteOutlined, SearchOutlined, ReloadOutlined, ShopOutlined, CarOutlined } from '@ant-design/icons';
import { useOrders } from '../../hooks/useOrders';
import Header from 'shared/componanets/Header';
import { useNavigate } from 'react-router-dom';
import { ReusableTable } from 'shared/componanets/ReusableTable';
import type { ColumnsType } from 'antd/es/table';
import { useSelectedSystemId } from 'shared/hooks/useSelectedSystemId';
import { Order, OrderStatus } from './types/order';
import { statusColors } from './utils/orderUtils';

const OrderPage: React.FC = () => {
  const [systemId] = useSelectedSystemId();
  const { data: orders = [], loading, getOrders, updateOrderStatus, deleteOrder } = useOrders(systemId || "");
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<string[]>([]);
  const [searchText, setSearchText] = React.useState('');
  const [localOrders, setLocalOrders] = React.useState<Order[]>([]);

  React.useEffect(() => {
    if (Array.isArray(orders)) {
      setLocalOrders(orders);
    }
  }, [orders]);

  // Memoize filtered and sorted orders
  const filteredOrders = React.useMemo(() => {
    const ordersList = Array.isArray(localOrders) ? localOrders : [];
    // Sort orders by date in descending order (newest first)
    const sortedOrders = [...ordersList].sort((a: Order, b: Order) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    if (!searchText) return sortedOrders as Order[];
    const searchLower = searchText.toLowerCase();
    return sortedOrders.filter((order: Order) =>
      String(order.id).includes(searchLower) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchLower)) ||
      (order.table_number && order.table_number.toLowerCase().includes(searchLower)) ||
      order.status.toLowerCase().includes(searchLower)
    ) as Order[];
  }, [localOrders, searchText]);

  // Optimistic update for status change
  const handleStatusChange = React.useCallback(async (id: string, status: OrderStatus) => {
    // Optimistically update local state
    const prevOrders = [...localOrders];
    setLocalOrders(orders => orders.map(order => order.id === id ? { ...order, status } : order));
    try {
      await updateOrderStatus(id, status);
      notification.success({ message: 'Order status updated' });
      getOrders();
    } catch (err: unknown) {
      setLocalOrders(prevOrders); // Rollback on error
      const error = err as Error;
      notification.error({ message: 'Failed to update order status', description: error.message });
    }
  }, [updateOrderStatus, getOrders, localOrders]);

  // Optimistic update for delete
  const handleDelete = React.useCallback(async (id: string) => {
    const prevOrders = [...localOrders];
    setLocalOrders(orders => orders.filter(order => order.id !== id));
    try {
      await deleteOrder(id);
      notification.success({ message: 'Order deleted successfully' });
      getOrders();
    } catch (err: unknown) {
      setLocalOrders(prevOrders); // Rollback on error
      const error = err as Error;
      notification.error({ message: 'Failed to delete order', description: error.message });
    }
  }, [deleteOrder, getOrders, localOrders]);

  // Optimistic update for bulk status change
  const handleBulkStatusChange = React.useCallback(async (newStatus: OrderStatus) => {
    const prevOrders = [...localOrders];
    setLocalOrders(orders => orders.map(order =>
      selectedRowKeys.includes(String(order.id)) ? { ...order, status: newStatus } : order
    ));
    try {
      await Promise.all(selectedRowKeys.map(id => updateOrderStatus(id, newStatus)));
      notification.success({
        message: 'Success',
        description: `Updated status for ${selectedRowKeys.length} orders successfully`
      });
      setSelectedRowKeys([]);
      getOrders();
    } catch {
      setLocalOrders(prevOrders); // Rollback on error
      notification.error({
        message: 'Error',
        description: 'Failed to update status for selected orders'
      });
    }
  }, [selectedRowKeys, updateOrderStatus, getOrders, localOrders]);

  // Optimistic update for bulk delete
  const handleBulkDelete = React.useCallback(async () => {
    const prevOrders = [...localOrders];
    setLocalOrders(orders => orders.filter(order => !selectedRowKeys.includes(String(order.id))));
    try {
      await Promise.all(selectedRowKeys.map(id => deleteOrder(id)));
      notification.success({
        message: 'Success',
        description: `Deleted ${selectedRowKeys.length} orders successfully`
      });
      setSelectedRowKeys([]);
      getOrders();
    } catch {
      setLocalOrders(prevOrders); // Rollback on error
      notification.error({
        message: 'Error',
        description: 'Failed to delete selected orders'
      });
    }
  }, [selectedRowKeys, deleteOrder, getOrders, localOrders]);

  React.useEffect(() => {
    getOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemId]);

  const handleSearch = React.useCallback((value: string) => {
    setSearchText(value);
  }, []);

  const columns: ColumnsType<Order> = [
    {
      title: 'type',
      dataIndex: 'order_type',
      key: 'order_type',
      render: (order_type: Order['order_type']) => (
        <Tag color={order_type === 'delivery' ? 'geekblue' : 'green'}>
          {order_type === 'delivery' ? <CarOutlined /> : <ShopOutlined />}{" "}
        </Tag>
      ),
      filters: [
        { text: 'In House', value: 'in_house' },
        { text: 'Delivery', value: 'delivery' },
      ],
      onFilter: (value: boolean | React.Key, record: Order) => record.order_type === value,
    },
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <Button type="link" onClick={() => navigate(`/orders/${id}`)}>{id}</Button>
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
            value={selectedKeys[0] as string}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={confirm}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
        </div>
      ),
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record: Order) => (record.customer_name || '').toLowerCase().includes((value as string).toLowerCase()),
      sorter: (a: Order, b: Order) => (a.customer_name || '').localeCompare(b.customer_name || ''),
      render: (text: string | undefined) => text && text.trim() !== '' ? text : '-',
    },
    {
      title: 'Address',
      dataIndex: 'delivery_address',
      key: 'delivery_address',
      render: (text: string | undefined, record: Order) => record.order_type === 'delivery' ? (text || '-') : '-',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }: { setSelectedKeys: (keys: React.Key[]) => void; selectedKeys: React.Key[]; confirm: () => void }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search address"
            value={selectedKeys[0] as string}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={confirm}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
        </div>
      ),
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record: Order) => (record.delivery_address?.toLowerCase() || '').includes((value as string).toLowerCase()),
    },
    {
      title: 'phone',
      dataIndex: 'customer_phone',
      key: 'customer_phone',
      render: (text: string | undefined, record: Order) => record.order_type === 'delivery' ? (text || '-') : '-',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }: { setSelectedKeys: (keys: React.Key[]) => void; selectedKeys: React.Key[]; confirm: () => void }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search phone"
            value={selectedKeys[0] as string}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={confirm}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
        </div>
      ),
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record: Order) => (record.customer_phone || '').toLowerCase().includes((value as string).toLowerCase()),
    },
    {
      title: 'Table',
      dataIndex: 'table_number',
      key: 'table_number',
      sorter: (a: Order, b: Order) => (a.table_number || '').localeCompare(b.table_number || ''),
      render: (text: string | undefined) => text && text.trim() !== '' ? text : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => (
        <Tag color={statusColors[status]} style={{ textTransform: 'capitalize' }}>{status}</Tag>
      ),
      filters: Object.entries(statusColors).map(([status]) => ({
        text: status.charAt(0).toUpperCase() + status.slice(1),
        value: status,
      })),
      onFilter: (value, record: Order) => record.status === value,
    },
    {
      title: 'Total',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (total: string | number) => `$${total}`,
      sorter: (a: Order, b: Order) => parseFloat(String(a.total_price)) - parseFloat(String(b.total_price)),
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
      render: (record: Order) => (
        <Space>
          <Select
            value={record.status}
            style={{ width: 120 }}
            onChange={(value) => handleStatusChange(record.id, value as OrderStatus)}
            onClick={(e) => e.stopPropagation()} // Prevent row selection when clicking select
          >
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="preparing">Preparing</Select.Option>
            <Select.Option value="ready">Ready</Select.Option>
            {record.order_type === 'delivery' ? (
              <Select.Option value="out_for_delivery">Out for Delivery</Select.Option>
            ) : (
              <Select.Option value="served">Served</Select.Option>
            )}
            <Select.Option value="completed">Completed</Select.Option>
            <Select.Option value="canceled">Canceled</Select.Option>
          </Select>
            <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={e => {
              e.stopPropagation();
              handleDelete(record.id);
            }}
            />
        </Space>
      ),
    },
  ];

  const extraActions = selectedRowKeys.length > 0 && (
    <Space>
      <Select
        style={{ width: 120 }}
        placeholder="Change Status"
        onChange={(value) => handleBulkStatusChange(value as OrderStatus)} // Cast value to OrderStatus
      >
        <Select.Option value="pending">Pending</Select.Option>
        <Select.Option value="preparing">Preparing</Select.Option>
        <Select.Option value="ready">Ready</Select.Option>
        {selectedRowKeys.some(key => {
          const order = (orders as Order[])?.find((o: Order) => o.id === key);
          return order?.order_type === 'delivery';
        }) ? (
          <Select.Option value="out_for_delivery">Out for Delivery</Select.Option>
        ) : (
          <Select.Option value="served">Served</Select.Option>
        )}
        <Select.Option value="completed">Completed</Select.Option>
        <Select.Option value="canceled">Canceled</Select.Option>
      </Select>
      <Button 
        danger 
        onClick={handleBulkDelete}
      >
        Delete Selected
      </Button>
    </Space>
  );

  return (
    <div style={{ padding: 20 }}>
      <Header
        title="Order Management"
        breadcrumbs={[
          { title: 'Restaurant', path: '/restaurant' },
          { title: 'Orders' }
        ]}
        actions={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={getOrders}
          >
            Refresh Orders
          </Button>
        }
        showSearch={true}
        onSearch={handleSearch}
        searchPlaceholder="Search orders..."
      />
      <div style={{ marginTop: 16 }}>
        <ReusableTable<Order & Record<string, unknown>>
          data={filteredOrders as (Order & Record<string, unknown>)[]}
          loading={loading}
          columns={columns as ColumnsType<Order & Record<string, unknown>>}
          rowKey="id"
          onRowSelectionChange={(keys: React.Key[]) => setSelectedRowKeys(keys as string[])} 
          selectedRowKeys={selectedRowKeys}
          extraActions={extraActions}
        />
      </div>
    </div>
  );
};

export default OrderPage;