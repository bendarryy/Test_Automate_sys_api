import { useState } from 'react';
import { Drawer, Badge, Button, message } from 'antd';
import { ShoppingCartOutlined, PrinterOutlined, PlusOutlined } from '@ant-design/icons';
import Header from '../../../../components/Header';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../store';
import { SalesProductSelection } from '../../../../components/SalesProductSelection';
import { SalesBillSection } from '../../../../components/SalesBillSection';
import { useApi } from '../../../../shared/hooks/useApi';
import { setCurrentSale, clearCurrentSale } from '../../../../store/salesSlice';
import { useSelectedSystemId } from '../../../../shared/hooks/useSelectedSystemId';

interface SaleItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  name: string;
}

interface Sale {
  id: number;
  receipt_number: string;
  cashier: string | null;
  total_price: number | null;
  discount_amount: string;
  payment_type: string | null;
  vat_amount: string;
  vat_rate: string;
  items: SaleItem[];
}

export const SalesPage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const currentSale = useSelector((state: RootState) => state.sales.currentSale);
  const dispatch = useDispatch();
  const api = useApi();
  const [systemId] = useSelectedSystemId();

  const handleCompleteSale = async () => {
    if (!currentSale || !currentSale.payment_type) {
      message.error('Please select payment type');
      return;
    }

    try {
      let sale: Sale;
      if (currentSale.id) {
        sale = await api.callApi('put', `/supermarket/${systemId}/sales/${currentSale.id}/`, currentSale) as Sale;
      } else {
        sale = await api.callApi('post', `/supermarket/${systemId}/sales/`, currentSale) as Sale;
      }
      
      message.success('Sale completed successfully');
      dispatch(clearCurrentSale());
      setIsDrawerOpen(false);
      
      // Print receipt
      if (sale.id) {
        setIsPrinting(true);
        window.open(`http://127.0.0.1:8000/api/supermarket/${systemId}/sales/${sale.id}/receipt/`, '_blank');
        setIsPrinting(false);
      }
    } catch (error: unknown) {
      message.error(`Failed to complete sale: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleNewSale = () => {
    dispatch(setCurrentSale({
      receipt_number: '',
      cashier: null,
      total_price: null,
      discount_amount: '0.00',
      payment_type: null,
      vat_amount: '0.00',
      vat_rate: '0.16',
      items: []
    }));
    setIsDrawerOpen(true);
  };

  return (
    <main>
      <Header
        title="Sales Management"
        breadcrumbs={[
          { title: 'Supermarket', path: '/supermarket' },
          { title: 'Sales' }
        ]}
        actions={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleNewSale}
          >
            New Sale
          </Button>
        }
      />
      <div style={{ 
        display: 'flex', 
        height: 'calc(100vh - 120px)',
        padding: '16px'
      }}>
        <div style={{ 
          flex: 2, 
          width: '100%',
          marginRight: '16px'
        }}>
          <SalesProductSelection />
        </div>
      </div>

      <Drawer
        title="Current Sale"
        placement="right"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        width={450}
        extra={[
          <Button 
            key="print" 
            icon={<PrinterOutlined />} 
            loading={isPrinting}
            onClick={() => currentSale?.id && window.open(`http://127.0.0.1:8000/api/supermarket/${systemId}/sales/${currentSale.id}/receipt/`, '_blank')}
          />,
          <Button 
            key="complete" 
            type="primary" 
            onClick={handleCompleteSale}
          >
            Complete Sale
          </Button>
        ]}
      >
        <SalesBillSection />
      </Drawer>

      <div style={{ 
        position: 'fixed',
        right: '24px',
        bottom: '24px',
        zIndex: 1000
      }}>
        <Badge count={currentSale?.items.length || 0} size="default">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={currentSale ? () => setIsDrawerOpen(true) : handleNewSale}
          />
        </Badge>
      </div>
    </main>
  );
};
