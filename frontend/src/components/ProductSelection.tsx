import { useEffect, useState, useMemo } from "react";
// import GridScrollX from "./GridScrollX"; // Removed unused import
// import styles from "../styles/ProductsSection.module.css"; // Removed unused import
import { useDispatch, useSelector } from "react-redux";
import { addItem, setSelectedTable, setOrderType } from "../store/billSlice";
import { useGetMenu, getCategoryIcon } from "../hooks/useGetMenu";
// Import necessary Ant Design components
import {
  Col,
  Row,
  Spin,
  Input,
  Select,
  Space,
  Popover,
  Button,
  message,
  Badge,
} from "antd";
import Card from "./Card";
import { MdTableRestaurant, MdDeliveryDining, MdStore } from "react-icons/md";
import { RootState } from "../store";
import TablesSection from "./TablesSection";
import "../styles/ProductSelection.css";

interface Product {
  id: number | string;
  name: string;
  price: number | string;
  category?: string;
  description: string;
  image: string;
  is_available: boolean;
  cost: number | null;
}

// Define sort options type
type SortOrder =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "default";

const ProductSelection = () => {
  const billItems = useSelector((state: RootState) => state.bill.items);
  const dispatch = useDispatch();
  const selectedTable = useSelector(
    (state: RootState) => state.bill.selectedTable
  );
  const systemId = localStorage.getItem("selectedSystemId");
  const orderType = useSelector((state: RootState) => state.bill.orderType);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");
  const { getMenu, getCategories, loading } = useGetMenu(Number(systemId));
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showTables, setShowTables] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesData = await getCategories();
      if (categoriesData) {
        setCategories(categoriesData);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        if (selectedCategories.length > 0) {
          // Fetch menu for each category separately and combine results
          const menuPromises = selectedCategories.map((category) =>
            getMenu(category)
          );
          const results = await Promise.all(menuPromises);
          // Combine all results and remove duplicates based on id
          const combinedResults = results
            .flat()
            .filter(
              (item, index, self) =>
                index === self.findIndex((t) => t.id === item.id)
            );
          // Update the data state with combined results
          if (combinedResults) {
            setProducts(combinedResults);
          }
        } else {
          const result = await getMenu();
          if (result) {
            setProducts(result);
          }
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
        setProducts([]);
      }
    };
    fetchMenu();
  }, [selectedCategories]);

  // Memoize displayed products based on filters and sorting
  const displayedProducts = useMemo(() => {
    let filtered = products;

    // Filter by search term (case-insensitive)
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return Number(a.price) - Number(b.price);
        case "price-desc":
          return Number(b.price) - Number(a.price);
        default:
          return 0;
      }
    });

    return sorted;
  }, [products, searchTerm, sortOrder]);

  // const renderProductImage = (product: Product) => {
  //   // Check if the image is an SVG with emoji (our category icon)
  //   const isCategoryIcon =
  //     product.image?.startsWith("data:image/svg+xml") || !product.image;

  //   return (
  //     <div
  //       style={{
  //         height: 160,
  //         overflow: "hidden",
  //         display: "flex",
  //         alignItems: "center",
  //         justifyContent: "center",
  //         backgroundColor: isCategoryIcon ? "#f0f2f5" : "#f5f5f5",
  //       }}
  //     >
  //       {isCategoryIcon ? (
  //         product.image ? (
  //           <img
  //             className="product-image"
  //             alt={product.name}
  //             src={product.image}
  //             style={{
  //               width: "100%",
  //               height: "100%",
  //               objectFit: "contain",
  //             }}
  //           />
  //         ) : (
  //           <span style={{ fontSize: "64px" }}>
  //             {getCategoryIcon(product.category || "")}
  //           </span>
  //         )
  //       ) : (
  //         <img
  //           className="product-image"
  //           alt={product.name}
  //           src={product.image}
  //           style={{
  //             width: "100%",
  //             height: "100%",
  //             objectFit: "cover",
  //           }}
  //           onError={(e) => {
  //             // If image fails to load, show category icon instead
  //             const target = e.target as HTMLImageElement;
  //             target.style.display = "none";
  //             const parent = target.parentElement;
  //             if (parent) {
  //               const iconSpan = document.createElement("span");
  //               iconSpan.style.fontSize = "64px";
  //               iconSpan.textContent = getCategoryIcon(product.category || "");
  //               parent.appendChild(iconSpan);
  //             }
  //           }}
  //         />
  //       )}
  //     </div>
  //   );
  // };

  const handleTableButtonClick = () => {
    if (orderType === 'delivery') {
      message.info('Table selection is not available for delivery orders');
      return;
    }
    setShowTables(true);
  };

  const handleOrderTypeClick = () => {
    const newType = orderType === 'in_house' ? 'delivery' : 'in_house';
    dispatch(setOrderType(newType));
    if (newType === 'delivery' && selectedTable) {
      dispatch(setSelectedTable(null));
      message.info('Table selection cleared for delivery order');
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "1rem",
      }}
    >
      {/* Controls Section */}
      <Space
        wrap
        style={{
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Space>
          <Popover
            content={
              <div style={{ padding: '4px 8px' }}>
                {orderType === 'in_house' ? 'In House Order' : 'Delivery Order'}
              </div>
            }
            trigger="hover"
            placement="bottom"
          >
            <Button
              type={orderType === 'in_house' ? 'primary' : 'default'}
              icon={orderType === 'in_house' ? <MdStore size={20} /> : <MdDeliveryDining size={20} />}
              onClick={handleOrderTypeClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '8px',
                minWidth: '40px',
                height: '40px',
                transition: 'all 0.3s ease',
              }}
            />
          </Popover>
          <Button
            onClick={handleTableButtonClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "12px",
              border: selectedTable ? "1px solid #1890ff" : "1px solid #e8e8e8",
              backgroundColor: selectedTable ? "#f0f7ff" : "#fff",
              boxShadow: selectedTable
                ? "0 2px 8px rgba(24,144,255,0.15)"
                : "0 2px 4px rgba(0,0,0,0.05)",
              transition: "all 0.3s ease",
              cursor: orderType === 'delivery' ? "not-allowed" : "pointer",
              opacity: orderType === 'delivery' ? 0.5 : 1,
            }}
            disabled={orderType === 'delivery'}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px",
                  borderRadius: "8px",
                  backgroundColor: selectedTable ? "#e6f4ff" : "#f0f7ff",
                  transition: "all 0.3s ease",
                }}
              >
                <MdTableRestaurant
                  size={15}
                  style={{
                    color: selectedTable ? "#1890ff" : "#8c8c8c",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: selectedTable ? 600 : 500,
                  color: selectedTable ? "#1890ff" : "#262626",
                }}
              >
                {selectedTable ? `Table ${selectedTable}` : "Select Table"}
              </span>
            </div>
          </Button>
          <Select<string[]>
            mode="multiple"
            allowClear
            style={{ minWidth: 200 }}
            placeholder="Filter categories"
            onChange={setSelectedCategories}
            options={categories.map((cat) => ({
              label: (
                <Space>
                  <span>{getCategoryIcon(cat)}</span>
                  <span>{cat}</span>
                </Space>
              ),
              value: cat,
            }))}
            value={selectedCategories}
            loading={loading}
            maxTagCount={3}
            maxTagTextLength={10}
            maxTagPlaceholder={(omittedValues) =>
              `+${omittedValues.length} more`
            }
          />
        </Space>

        <Space>
          <Input.Search
            placeholder="Search products..."
            allowClear
            onSearch={setSearchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 200 }}
          />
          <Select<SortOrder>
            defaultValue="default"
            style={{ width: 180 }}
            onChange={setSortOrder}
            options={[
              { value: "default", label: "Sort by..." },
              { value: "name-asc", label: "Name (A-Z)" },
              { value: "name-desc", label: "Name (Z-A)" },
              { value: "price-asc", label: "Price (Low to High)" },
              { value: "price-desc", label: "Price (High to Low)" },
            ]}
          />
        </Space>
      </Space>

      {/* Products Grid Section */}
      <div style={{ flex: 1, overflowY: "auto", paddingTop: "1rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[16, 16]} style={{ margin: "0px", padding: "10px" }}>
            {displayedProducts.map((product) => (
              <Col key={product.id} xs={24} sm={12} md={6} lg={4} xl={3}>
                {/* Badge for product quantity in bill */}
                {/* Badge in top-right */}
                <div style={{ position: 'relative' }}>
                {(() => {
                    const item = billItems.find((item) => String(item.id) === String(product.id));
                    return item && item.quantity > 0 ? (
                      <div style={{ position: 'absolute', top: 5, right: 5 , transform: 'translate(50%, -50%)', zIndex: 1000 }}>
                      <Badge
                        count={item.quantity}
                        color="blue"
                      />
                      </div>
                    ) : null;
                  })()}
                <Card
                  title={product.name}
                  description={product.description}
                  price={`$${product.price}`}
                  badgeText={product.is_available ? '' : 'Unavailable'}
                  accentColor={product.is_available ? '#1677ff' : '#aaa'}
                  textColor="#1e293b"
                  backgroundColor="#fff"
                  imageGradient={product.is_available ? 'linear-gradient(45deg, #a78bfa, #8b5cf6)' : 'linear-gradient(45deg, #ccc, #eee)'}
                  image={product.image}
                  width="100%"
                  onClick={() => {
                    if (product.is_available) {
                      dispatch(
                        addItem({
                          ...product,
                          id: product.id.toString(),
                          price: Number(product.price),
                          quantity: 1,
                        })
                      );
                    }
                  }}
                  style={{
                    height: 260,
                    minHeight: 260,
                    width: '100%',
                    opacity: product.is_available ? 1 : 0.6,
                    cursor: product.is_available ? "pointer" : "not-allowed",
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                />
                </div>
              </Col>
            ))}
          </Row>
        )}
      </div>
      {showTables && <TablesSection onClose={() => setShowTables(false)} />}
    </div>
  );
};

export default ProductSelection;
