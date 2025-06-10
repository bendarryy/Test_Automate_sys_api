import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePurchaseOrders, PurchaseOrder, GoodsReceiving } from './hooks/usePurchaseOrders';
import { useApi } from '../../../../shared/hooks/useApi';
import Header from '../../../../components/Header';
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
  DatePicker,
  Card,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import { useSelectedSystemId } from '../../../../shared/hooks/useSelectedSystemId';

interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  expiry_date: string;
}

interface Supplier {
  id: number;
  name: string;
  phone: string;
  email: string | null;
}

const PurchaseOrdersPage = () => {
  const [system_id] = useSelectedSystemId();
  const { callApi } = useApi();
  const {
    getPurchaseOrders,
    createPurchaseOrder,
    deletePurchaseOrder,
    getPendingPurchaseOrders,
    getPartiallyReceivedPurchaseOrders,
    getGoodsReceiving,
    createGoodsReceiving,
    deleteGoodsReceiving,
    loading,
  } = usePurchaseOrders(system_id || '');

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [goodsReceiving, setGoodsReceiving] = useState<GoodsReceiving[]>([]);
  const [activeKey, setActiveKey] = useState('1');
  const [isPOModalVisible, setIsPOModalVisible] = useState(false);
  const [isGRModalVisible, setIsGRModalVisible] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [form] = Form.useForm();
  const [grForm] = Form.useForm();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await callApi('get', `/supermarket/${system_id}/products/`);
      setProducts(data as Product[]);
    } catch {
      message.error('Failed to fetch products');
    }
  }, [system_id, callApi]);

  const fetchSuppliers = useCallback(async () => {
    try {
      const data = await callApi('get', `/supermarket/${system_id}/suppliers/`);
      setSuppliers(data as Supplier[]);
    } catch {
      message.error('Failed to fetch suppliers');
    }
  }, [system_id, callApi]);

  const fetchPurchaseOrders = useCallback(async () => {
    try {
      const data = await getPurchaseOrders();
      setPurchaseOrders(data as PurchaseOrder[]);
    } catch {
      message.error('Failed to fetch purchase orders');
    }
  }, []);

  const fetchGoodsReceiving = useCallback(async () => {
    try {
      const data = await getGoodsReceiving();
      setGoodsReceiving(data as GoodsReceiving[]);
    } catch {
      message.error('Failed to fetch goods receiving records');
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchPurchaseOrders();
    fetchProducts();
    fetchSuppliers();
  }, []);

  // Fetch goods receiving only when needed
  useEffect(() => {
    if (activeKey === '4') {
      fetchGoodsReceiving();
    }
  }, [activeKey]);

  const handleTabChange = useCallback((key: string) => {
    setActiveKey(key);
    switch (key) {
      case '1':
        fetchPurchaseOrders();
        break;
      case '2':
        getPendingPurchaseOrders().then((data) => setPurchaseOrders(data as PurchaseOrder[]));
        break;
      case '3':
        getPartiallyReceivedPurchaseOrders().then((data) => setPurchaseOrders(data as PurchaseOrder[]));
        break;
      case '4':
        fetchGoodsReceiving();
        break;
    }
  }, [fetchPurchaseOrders, getPendingPurchaseOrders, getPartiallyReceivedPurchaseOrders, fetchGoodsReceiving]);

  const showPOModal = () => {
    setIsPOModalVisible(true);
  };

  const showGRModal = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsGRModalVisible(true);
    // Set initial form values with validation
    grForm.setFieldsValue({
      received_date: dayjs(),
      received_quantity: undefined,
      expiry_date: undefined,
      location: undefined
    });
  };

  const handlePOCreate = async () => {
    try {
      const values = await form.validateFields();
      await createPurchaseOrder({
        ...values,
        supplier_id: Number(values.supplier_id),
        product_id: Number(values.product_id),
        order_date: dayjs(values.order_date).format('YYYY-MM-DD'),
        expected_delivery_date: values.expected_delivery_date ? dayjs(values.expected_delivery_date).format('YYYY-MM-DD') : undefined,
      });
      message.success('Purchase order created successfully');
      setIsPOModalVisible(false);
      form.resetFields();
      fetchPurchaseOrders();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Failed to create purchase order');
      }
    }
  };

  const handleGRCreate = async () => {
    try {
      const values = await grForm.validateFields();
      if (!selectedPO) {
        message.error('No purchase order selected');
        return;
      }
      
      await createGoodsReceiving({
        ...values,
        purchase_order_id: selectedPO.id,
        received_date: dayjs(values.received_date).format('YYYY-MM-DD'),
        expiry_date: values.expiry_date ? dayjs(values.expiry_date).format('YYYY-MM-DD') : undefined,
      });
      
      message.success('Goods receiving record created successfully');
      setIsGRModalVisible(false);
      grForm.resetFields();
      fetchGoodsReceiving();
      fetchPurchaseOrders();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Failed to create goods receiving record. Please check the received quantity and date.');
      }
      console.error('Goods receiving error:', error);
    }
  };

  const handlePODelete = useCallback(async (id: string) => {
    try {
      await deletePurchaseOrder(id);
      message.success('Purchase order deleted successfully');
      fetchPurchaseOrders();
    } catch {
      message.error('Failed to delete purchase order');
    }
  }, [deletePurchaseOrder, fetchPurchaseOrders]);

  const handleGRDelete = useCallback(async (id: string) => {
    try {
      await deleteGoodsReceiving(id);
      message.success('Goods receiving record deleted successfully');
      fetchGoodsReceiving();
    } catch {
      message.error('Failed to delete goods receiving record');
    }
  }, [deleteGoodsReceiving, fetchGoodsReceiving]);

  const purchaseOrderColumns = useMemo(() => [
    {
      title: 'Order Date',
      dataIndex: 'order_date',
      key: 'order_date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Expected Delivery',
      dataIndex: 'expected_delivery_date',
      key: 'expected_delivery_date',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: PurchaseOrder) => (
        <Space>
          <Button type="primary" onClick={() => showGRModal(record)}>
            Receive Goods
          </Button>
          <Button danger onClick={() => handlePODelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ], [handlePODelete]);

  const goodsReceivingColumns = useMemo(() => [
    {
      title: 'Received Date',
      dataIndex: 'received_date',
      key: 'received_date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Quantity',
      dataIndex: 'received_quantity',
      key: 'received_quantity',
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: GoodsReceiving) => (
        <Button danger onClick={() => handleGRDelete(record.id)}>
          Delete
        </Button>
      ),
    },
  ], [handleGRDelete]);

  const tabItems = useMemo(() => [
    {
      key: '1',
      label: 'All Purchase Orders',
      children: (
        <Table
          columns={purchaseOrderColumns}
          dataSource={purchaseOrders}
          loading={loading}
          rowKey="id"
        />
      ),
    },
    {
      key: '2',
      label: 'Pending Orders',
      children: (
        <Table
          columns={purchaseOrderColumns}
          dataSource={purchaseOrders}
          loading={loading}
          rowKey="id"
        />
      ),
    },
    {
      key: '3',
      label: 'Partially Received',
      children: (
        <Table
          columns={purchaseOrderColumns}
          dataSource={purchaseOrders}
          loading={loading}
          rowKey="id"
        />
      ),
    },
    {
      key: '4',
      label: 'Goods Receiving',
      children: (
        <Table
          columns={goodsReceivingColumns}
          dataSource={goodsReceiving}
          loading={loading}
          rowKey="id"
        />
      ),
    },
  ], [purchaseOrders, goodsReceiving, loading, purchaseOrderColumns, goodsReceivingColumns]);

  return (
    <div>
      <Header title="Purchase Orders & Goods Receiving" />
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={showPOModal}>
            Create Purchase Order
          </Button>
        </Space>

        <Tabs activeKey={activeKey} onChange={handleTabChange} items={tabItems} />

        {/* Purchase Order Modal */}
        <Modal
          title="Create Purchase Order"
          open={isPOModalVisible}
          onOk={handlePOCreate}
          onCancel={() => setIsPOModalVisible(false)}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="supplier_id"
              label="Supplier"
              rules={[{ required: true, message: 'Please select a supplier' }]}
            >
              <Select
                placeholder="Select a supplier"
                options={suppliers.map(supplier => ({
                  value: supplier.id,
                  label: supplier.name
                }))}
              />
            </Form.Item>
            <Form.Item
              name="product_id"
              label="Product"
              rules={[{ required: true, message: 'Please select a product' }]}
            >
              <Select
                placeholder="Select a product"
                options={products.map(product => ({
                  value: product.id,
                  label: product.name
                }))}
              />
            </Form.Item>
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="price"
              label="Price"
              rules={[{ required: true }]}
            >
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="order_date"
              label="Order Date"
              rules={[{ required: true }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="expected_delivery_date"
              label="Expected Delivery Date"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Modal>

        {/* Goods Receiving Modal */}
        <Modal
          title="Create Goods Receiving Record"
          open={isGRModalVisible}
          onOk={handleGRCreate}
          onCancel={() => setIsGRModalVisible(false)}
        >
          <Form form={grForm} layout="vertical">
            <Form.Item
              name="received_quantity"
              label="Received Quantity"
              rules={[
                { required: true, message: 'Please enter received quantity' },
                { type: 'number', min: 1, message: 'Quantity must be greater than 0' }
              ]}
            >
              <InputNumber 
                min={1} 
                style={{ width: '100%' }} 
                placeholder="Enter received quantity"
              />
            </Form.Item>
            <Form.Item
              name="received_date"
              label="Received Date"
              rules={[
                { required: true, message: 'Please select received date' },
                () => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.reject(new Error('Please select received date'));
                    }
                    if (!selectedPO) {
                      return Promise.reject(new Error('No purchase order selected'));
                    }
                    const orderDate = dayjs(selectedPO.order_date);
                    const today = dayjs();
                    if (value.isBefore(orderDate)) {
                      return Promise.reject(new Error('Received date cannot be before order date'));
                    }
                    if (value.isAfter(today)) {
                      return Promise.reject(new Error('Received date cannot be in the future'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                disabledDate={(current) => {
                  if (!selectedPO) return true;
                  const orderDate = dayjs(selectedPO.order_date);
                  const today = dayjs();
                  return current && (current.isBefore(orderDate) || current.isAfter(today));
                }}
                placeholder="Select received date"
              />
            </Form.Item>
            <Form.Item
              name="expiry_date"
              label="Expiry Date"
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value) return Promise.resolve();
                    const receivedDate = getFieldValue('received_date');
                    if (value.isBefore(receivedDate)) {
                      return Promise.reject(new Error('Expiry date cannot be before received date'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                disabledDate={(current) => {
                  const receivedDate = grForm.getFieldValue('received_date');
                  return current && receivedDate && current.isBefore(receivedDate);
                }}
                placeholder="Select expiry date (optional)"
              />
            </Form.Item>
            <Form.Item
              name="location"
              label="Location"
            >
              <Input placeholder="Enter storage location (optional)" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default PurchaseOrdersPage;