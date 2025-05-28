import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSupermarketInventory } from '../../hooks/useSupermarketInventory';
import { useInventoryTable } from '../../hooks/useInventoryTable';
import { getInventoryTableColumns } from '../../components/InventoryTableColumns';
import Header from '../../components/Header';
import {
  Table,
  Button,
  Form,
  Space,
  Tabs,
  message,
  Modal,
  Input,
  InputNumber,
  DatePicker
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

  const [form] = Form.useForm();
  const { editingId, handleEdit, handleCancel: handleCancelEdit } = useInventoryTable(form);

  const [expiringProducts, setExpiringProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistoryItem[]>([]);
  const [activeKey, setActiveKey] = useState('1');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    stock_quantity: 0,
    expiry_date: dayjs().format('YYYY-MM-DD')
  });

  const fetchProducts = useCallback(async () => {
    try {
      await getProducts();
    } catch (err) {
      message.error(`Failed to fetch products: ${err}`);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSave = useCallback((id: string) => {
    try {
      const values = form.getFieldsValue();
      updateProduct(id, {
        ...values,
        expiry_date: dayjs(values.expiry_date).format('YYYY-MM-DD')
      }).then(() => {
        handleCancelEdit();
        message.success('Product updated successfully');
        fetchProducts();
      }).catch(() => {
        message.error('Failed to update product');
      });
    } catch {
      message.error('Failed to update product');
    }
  }, [form, updateProduct, handleCancelEdit, fetchProducts]);

  const handleDelete = useCallback((id: string) => {
    try {
      deleteProduct(id).then(() => {
        message.success('Product deleted successfully');
        fetchProducts();
      }).catch(() => {
        message.error('Failed to delete product');
      });
    } catch {
      message.error('Failed to delete product');
    }
  }, [deleteProduct, fetchProducts]);

  const handleGetExpiringSoon = useCallback(async () => {
    try {
      const data = await getExpiringSoonProducts();
      setExpiringProducts(data);
    } catch (err) {
      message.error(`Failed to load expiring products: ${err}`);
    }
  }, [getExpiringSoonProducts]);

  const handleGetLowStock = useCallback(async () => {
    try {
      const data = await getLowStockProducts();
      setLowStockProducts(data);
    } catch (err) {
      message.error(`Failed to load low stock products: ${err}`);
    }
  }, [getLowStockProducts]);

  const handleGetStockHistory = useCallback(async () => {
    try {
      const response = await getStockHistory();
      if (Array.isArray(response)) {
        setStockHistory(response);
      } else {
        message.error('Invalid stock history data format');
      }
    } catch (err) {
      message.error(`Failed to load stock history: ${err}`);
    }
  }, [getStockHistory]);

  const handleRefreshAllProducts = useCallback(async () => {
    try {
      await fetchProducts();
      message.success('Products refreshed successfully');
    } catch (err) {
      message.error(`Failed to refresh products: ${err}`);
    }
  }, [fetchProducts]);

  const handleTabChange = useCallback((key: string) => {
    setActiveKey(key);
    switch (key) {
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
  }, [setActiveKey, fetchProducts, handleGetExpiringSoon, handleGetLowStock, handleGetStockHistory]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      await createProduct(newProduct);
      message.success('Product added successfully');
      setIsModalVisible(false);
      fetchProducts();
    } catch {
      message.error('Failed to add product');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  type SafeData<T> = T[];

  const safeData = useCallback(<T,>(data: SafeData<T> | unknown): SafeData<T> => {
    return Array.isArray(data) ? data : [];
  }, []);

  // Memoize columns to avoid unnecessary re-renders
  const columns = useMemo(() => getInventoryTableColumns({
    editingId,
    handleEdit,
    handleDelete,
    handleSave,
    handleCancel: handleCancelEdit
  }), [editingId, handleEdit, handleCancelEdit, handleDelete, handleSave]);

  // Memoize tab items to avoid expensive re-renders
  const tabItems = useMemo(() => [
    {
      key: '1',
      label: 'All Products',
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Button 
              type="primary" 
              onClick={showModal}
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
          
          <Table 
              columns={columns} 
              dataSource={safeData<Product>(products)} 
              loading={loading}
              rowKey="id"
              pagination={{ 
                pageSize: 10,
                showSizeChanger: false,
                position: ['bottomCenter']
              }}
              size="small"
              scroll={{ y: 400 }}
            />
        </Space>
      )
    },
    {
      key: '2',
      label: 'Expiring Soon',
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button onClick={handleGetExpiringSoon}>Refresh</Button>
          <Table 
            columns={columns} 
            dataSource={safeData<Product>(expiringProducts)} 
            loading={loading} 
            rowKey="id" 
            pagination={{ 
              pageSize: 10,
              showSizeChanger: false,
              position: ['bottomCenter']
            }}
            size="small"
            scroll={{ y: 400 }}
            virtual={true}
          />
        </Space>
      )
    },
    {
      key: '3',
      label: 'Low Stock',
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button onClick={handleGetLowStock}>Refresh</Button>
          <Table 
            columns={columns} 
            dataSource={safeData<Product>(lowStockProducts)} 
            loading={loading} 
            rowKey="id" 
            pagination={{ 
              pageSize: 10,
              showSizeChanger: false,
              position: ['bottomCenter']
            }}
          />
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
            pagination={{ 
              pageSize: 10,
              showSizeChanger: false,
              position: ['bottomCenter']
            }}
          />
        </Space>
      )
    }
  ], [columns, products, expiringProducts, lowStockProducts, stockHistory, loading, handleRefreshAllProducts, handleGetExpiringSoon, handleGetLowStock, handleGetStockHistory, safeData]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container-fluid">
      <Header 
        title="Inventory Management"
        breadcrumbs={[
          { title: 'Supermarket', path: '/supermarket' },
          { title: 'Inventory' }
        ]}
        actions={
          <Button 
            type="primary" 
            onClick={showModal}
          >
            Add Product
          </Button>
        }
      />
      <Form form={form} component={false}>
        <Tabs 
          activeKey={activeKey}
          onChange={handleTabChange}
          items={tabItems} 
          style={{ width: '100%' }} 
        />
      </Form>

      <Modal 
        title="Add New Product" 
        open={isModalVisible} 
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Product Name">
            <Input 
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            />
          </Form.Item>
          <Form.Item label="Price">
            <InputNumber 
              value={newProduct.price}
              onChange={(value) => setNewProduct({...newProduct, price: value || 0})}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="Stock Quantity">
            <InputNumber 
              value={newProduct.stock_quantity}
              onChange={(value) => setNewProduct({...newProduct, stock_quantity: value || 0})}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="Expiry Date">
            <DatePicker 
              value={dayjs(newProduct.expiry_date)}
              onChange={(date) => setNewProduct({...newProduct, expiry_date: date?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD')})}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Button moved to header actions */}
    </div>
  );
};

export default InventoryManagementPage;
