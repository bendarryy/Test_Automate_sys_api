import React from "react";
import TablesSection from "../components/TablesSection";
import ProductsSection from "../components/ProductsSection";
import BillSection from "../components/BillSection";
// تم حذف استيراد bootstrap لأن الاستيراد موجود في main.tsx فقط

const HomePage = () => {
  return (
    <main>
      <div className="d-flex" style={{ height: 'calc(100vh - 64px)' }}>
        {/* العمود الأول: مكدس TablesSection وProductsSection */}
        <div className="d-flex flex-column gap-2" style={{ flex: 2, width: '70%' }}>
          <TablesSection />
          <ProductsSection />
        </div>
        {/* العمود الثاني: BillSection */}
        <div style={{ flex: 1 }}>
          <BillSection />
        </div>
      </div>
    </main>
  );
};

export default HomePage;