import React from "react";
import TablesSection from "../components/TablesSection";
import ProductsSection from "../components/ProductsSection";
import BillSection from "../components/BillSection";
import Grid from "@mui/material/Grid";
import { Box } from "@mui/material";

const HomePage = () => {
  return (
    <main>
      <Box display="flex" height="calc(100vh - 64px)">
        {/* العمود الأول: مكدس TablesSection وProductsSection */}
        <Box flex={2} display="flex" flexDirection="column" gap={2} sx={{ width : "70%" }}>
          <TablesSection />
          <ProductsSection />
        </Box>
        {/* العمود الثاني: BillSection */}
        <Box flex={1}>
          <BillSection />
        </Box>
      </Box>
    </main>
  );
};

export default HomePage;