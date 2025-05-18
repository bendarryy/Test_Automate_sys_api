import { Table, Typography, Button, Select, InputNumber, Divider } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { 
  removeItemFromSale, 
  updatePaymentType,
  applyDiscount,
  clearCurrentSale,
  updateItemQuantity
} from '../store/salesSlice';
import { useApi } from '../hooks/useApi';

interface BillItem {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  unit_price: string | number;
  discount_amount: string;
  total_price: string | number;
}

export const SalesBillSection = () => {
  const currentSale = useSelector((state: RootState) => state.sales.currentSale);
  console.log('Current sale in BillSection:', currentSale);
  
  const dispatch = useDispatch();
  const api = useApi();
  const systemId = localStorage.getItem('selectedSystemId');

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (price: string | number) => `$${price || '0.00'}`
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: BillItem) => (
        <InputNumber 
          min={1} 
          defaultValue={quantity} 
          onChange={(value) => {
            if (value) {
              dispatch(updateItemQuantity({ 
                id: record.id, 
                quantity: value 
              }));
            }
          }} 
        />
      )
    },
    {
      title: 'Total',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (total: string | number) => `$${(typeof total === 'string' ? parseFloat(total) : total).toFixed(2) || '0.00'}`
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: BillItem) => (
        <Button 
          danger 
          type="text" 
          onClick={() => dispatch(removeItemFromSale(record.id))}
        >
          Remove
        </Button>
      )
    }
  ];

  const paymentTypes = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Credit Card' },
    { value: 'mobile', label: 'Mobile Payment' }
  ];

  const calculateTotal = () => {
    if (!currentSale?.items) return 0;
    return currentSale.items.reduce(
      (sum: number, item: BillItem) => sum + (parseFloat(item.total_price.toString()) || 0), 
      0
    );
  };

  const handleApplyDiscount = async (amount: number | null) => {
    try {
      if (currentSale?.id && amount !== null) {
        await api.callApi('patch', `/supermarket/${systemId}/sales/${currentSale.id}/apply-discount/`, { 
          discount_amount: amount.toString() 
        });
        dispatch(applyDiscount(amount.toString()));
      }
    } catch (error: unknown) {
      console.error('Failed to apply discount', error);
    }
  };

  return (
    <div>
      <Table 
        columns={columns} 
        dataSource={currentSale?.items || []} 
        rowKey="id"
        pagination={false}
        size="small"
      />
      
      <Divider />
      
      <div style={{ marginBottom: 16 }}>
        <Typography.Text strong>Payment Method:</Typography.Text>
        <Select
          style={{ width: '100%', marginTop: 8 }}
          value={currentSale?.payment_type}
          onChange={(value) => dispatch(updatePaymentType(value))}
          options={paymentTypes}
        />
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <Typography.Text strong>Discount:</Typography.Text>
        <InputNumber 
          style={{ width: '100%', marginTop: 8 }}
          min={0}
          value={parseFloat(currentSale?.discount_amount || '0')}
          onChange={handleApplyDiscount}
          formatter={(value) => `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0')}
        />
      </div>
      
      <Divider />
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>Total:</Typography.Title>
        <Typography.Title level={4} style={{ margin: 0 }}>
          ${(parseFloat(calculateTotal().toString()) - parseFloat(currentSale?.discount_amount || '0')).toFixed(2)}
        </Typography.Title>
      </div>
      
      <Button 
        danger 
        type="text" 
        onClick={() => dispatch(clearCurrentSale())}
        style={{ marginTop: 16 }}
      >
        Clear Sale
      </Button>
    </div>
  );
};
