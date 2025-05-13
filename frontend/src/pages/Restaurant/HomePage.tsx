import { Drawer, Badge } from "antd";
import ProductsSection from "../../components/ProductSelection";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useState } from "react";
import OrdersSection from "../../components/BillSection";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const HomePage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const billItems = useSelector((state: RootState) => state.bill.items);

  return (
    <main>
      <div className="d-flex" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="d-flex flex-column gap-2" style={{ flex: 2, width: '70%' }}>
          <ProductsSection />
        </div>
      </div>

      <Drawer
        title="Orders"
        placement="right"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        width={400}
      >
        <OrdersSection />
      </Drawer>

      <div style={{ 
        position: 'fixed',
        right: '24px',
        bottom: '24px',
        zIndex: 1000
      }}>
        <Badge count={billItems.length} size="default">
          <button
            onClick={() => setIsDrawerOpen(true)}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#1890ff',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.3s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#40a9ff';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#1890ff';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ShoppingCartOutlined style={{ fontSize: '24px' }} />
          </button>
        </Badge>
      </div>
    </main>
  );
};

export default HomePage;