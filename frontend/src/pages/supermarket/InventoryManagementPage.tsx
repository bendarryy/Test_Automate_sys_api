import { useState, useEffect, useCallback } from 'react';
import { useSupermarketInventory } from '../../hooks/useSupermarketInventory';
import { useInventoryTable } from '../../hooks/useInventoryTable';
import { getInventoryTableColumns } from '../../components/InventoryTableColumns';
import {
  Table,
  Button,
  Form,
  Space,
  Tabs,
  message
} from 'antd';
import dayjs from 'dayjs';

export type Product = {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  expiry_date: string;
};

interface StockHistoryItem {
  date: string;
  product_id: string;
  product_name: string;
  quantity: number;
}

const InventoryManagementPage = () => {
  const system_id = localStorage.getItem('selectedSystemId') || '';
  const {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getExpiringSoonProducts,
    getLowStockProducts,
    getStockHistory,
    loading,
    error,
    data: products
  } = useSupermarketInventory(system_id);

  const { form, editingId, handleEdit, handleCancel } = useInventoryTable();

  const [expiringProducts, setExpiringProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState('1');

  const fetchProducts = useCallback(async () => {
    try {
      await getProducts();
    } catch {
      message.error('Failed to fetch products');
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSave = async (id: string) => {
    try {
      const values = form.getFieldsValue();
      await updateProduct(id, {
        ...values,
        expiry_date: dayjs(values.expiry_date).format('YYYY-MM-DD')
      });
      handleCancel();
      message.success('Product updated successfully');
      fetchProducts();
    } catch {
      message.error('Failed to update product');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      message.success('Product deleted successfully');
      fetchProducts();
    } catch {
      message.error('Delete failed');
    }
  };

  const handleGetExpiringSoon = async () => {
    try {
      const data = await getExpiringSoonProducts();
      setExpiringProducts(data);
    } catch {
      message.error('Failed to load expiring products');
    }
  };

  const handleGetLowStock = async () => {
    try {
      const data = await getLowStockProducts();
      setLowStockProducts(data);
    } catch {
      message.error('Failed to load low stock products');
    }
  };

  const handleGetStockHistory = async () => {
    try {
      const response = await getStockHistory();
      if (Array.isArray(response)) {
        setStockHistory(response);
      } else {
        message.error('Invalid stock history data format');
      }
    } catch {
      message.error('Failed to load stock history');
    }
  };

  const handleRefreshAllProducts = async () => {
    try {
      await fetchProducts();
      message.success('Products refreshed successfully');
    } catch {
      message.error('Failed to refresh products');
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    
    // Auto-refresh when switching tabs
    switch(key) {
      case '1': 
        fetchProducts();
        break;
      case '2':
        handleGetExpiringSoon();
        break;
      case '3':
        handleGetLowStock();
        break;
      case '4':
        handleGetStockHistory();
        break;
    }
  };

  type SafeData<T> = T[];

  const safeData = <T,>(data: SafeData<T> | unknown): SafeData<T> => {
    return Array.isArray(data) ? data : [];
  };

  const columns = getInventoryTableColumns({
    editingId,
    handleEdit,
    handleDelete,
    handleSave,
    handleCancel
  });

  const tabItems = [
    {
      key: '1',
      label: 'All Products',
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Button 
              type="primary" 
              onClick={() => {
                form.resetFields();
                createProduct({
                  name: '',
                  price: 0,
                  stock_quantity: 0,
                  expiry_date: dayjs().format('YYYY-MM-DD')
                });
              }}
            >
              Add Product
            </Button>
            <Button 
              onClick={handleRefreshAllProducts}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
          
          <Form form={form}>
            <Table 
              columns={columns} 
              dataSource={safeData<Product>(products)} 
              loading={loading}
              rowKey="id"
            />
          </Form>
        </Space>
      )
    },
    {
      key: '2',
      label: 'Expiring Soon',
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button onClick={handleGetExpiringSoon}>Refresh</Button>
          <Table columns={columns} dataSource={safeData<Product>(expiringProducts)} loading={loading} rowKey="id" />
        </Space>
      )
    },
    {
      key: '3',
      label: 'Low Stock',
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button onClick={handleGetLowStock}>Refresh</Button>
          <Table columns={columns} dataSource={safeData<Product>(lowStockProducts)} loading={loading} rowKey="id" />
        </Space>
      )
    },
    {
      key: '4',
      label: 'Stock History',
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button onClick={handleGetStockHistory}>Refresh</Button>
          <Table 
            columns={[
              { title: 'Date', dataIndex: 'date', key: 'date' },
              { title: 'Product', dataIndex: 'product_name', key: 'product_name' },
              { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
            ]} 
            dataSource={safeData<StockHistoryItem>(stockHistory)} 
            loading={loading} 
            rowKey="date"
          />
        </Space>
      )
    }
  ];

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <Tabs 
        defaultActiveKey="1" 
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems} 
      />
    </div>
  );
};

export default InventoryManagementPage;
