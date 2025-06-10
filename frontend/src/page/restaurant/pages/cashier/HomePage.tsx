import { Badge, Layout } from "antd";
import ProductsSection from "./sections/ProductSelection"
import { ArrowRightOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import Header from "../../../../components/Header";
import OrdersSection from "./sections/BillSection";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";

const { Sider } = Layout;

const HomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Use localStorage directly, as this is not related to systemId/category
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : false;
  });
  const billItems = useSelector((state: RootState) => state.bill.items);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  return (
    <main style={{ overflow: 'hidden' }}>
      <Header
        title="Restaurant Dashboard"
        breadcrumbs={[
          { title: 'Restaurant', path: '/restaurant' },
          { title: 'Dashboard' }
        ]}
      />
      <Layout style={{ height: 'calc(100vh - 130px)' }}>
        <Layout.Content style={{ padding: '24px', overflow: 'auto' }}>
          <ProductsSection />
        </Layout.Content>
        
        <Sider
          width={400}
          collapsed={!isSidebarOpen}
          collapsedWidth={0}
          trigger={null}
          style={{
            background: '#fff',
            borderLeft: '1px solid #f0f0f0',
            transition: 'all 0.3s',
            position: 'relative',
          }}
        >
          <div style={{
            position: 'absolute',
            left: '-20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1000,
          }}>
            <Badge count={billItems.length} size="default">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                  width: '40px',
                  height: '40px',
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
                {isSidebarOpen ? (
                  <ArrowRightOutlined style={{ fontSize: '16px' }} />
                ) : (
                  <ArrowLeftOutlined style={{ fontSize: '16px' }} />
                )}
              </button>
            </Badge>
          </div>
          <OrdersSection />
        </Sider>
      </Layout>
    </main>
  );
};

export default HomePage;