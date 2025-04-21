import React, { useEffect } from "react";
import GridScrollX from "./GridScrollX";
import styles from "../styles/ProductsSection.module.css";
import { useDispatch } from "react-redux";
import { addItem } from "../store/billSlice";
import { useGetMenu } from "../hooks/useGetMenu";

const ProductsSection = () => {
  const dispatch = useDispatch();
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const { getMenu, data } = useGetMenu(5);

  const toggleCategorySelection = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };
  
  useEffect(() => { 
      if (selectedCategories.length > 0) {
        getMenu(selectedCategories.join(","));
      } else {
        // جلب جميع المنتجات عندما لا توجد فئات مختارة
        getMenu();
      }

    
    console.log(data);
  }, [selectedCategories]);

  const categories = [...new Set((data || []).map((product) => product.category))];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <div className={styles.categories}>
          <ul className={styles.categoryList}>
            {categories.map((category) => (
              <div key={category} className={styles.categoryItem}>
                <input
                  type="checkbox"
                  name="category-tags"
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleCategorySelection(category)}
                />
                <label htmlFor={`category-${category}`}>
                  <div className={styles.categoryTag}>
                    <p>{category}</p>
                  </div>
                </label>
              </div>
            ))}
          </ul>
        </div>
      </div>
      <GridScrollX
        items={data || []}
        renderItem={(product, index) => (
          <div key={`${product.id}-${index}`}>
            <label htmlFor={`product-${product.id.toString()}-${index}`}>
              <div
                className={styles.product}
                onClick={() => {
                  dispatch(
                    addItem({
                      ...product,
                      id: product.id.toString(),
                      price: Number(product.price), // Ensure price is a number
                      quantity: 1, // Default quantity for new items
                    })
                  );
                }}
              >
                <h3>{product.name}</h3>
                <p>${product.price}</p>
              </div>
            </label>
          </div>
        )}
      />
    </div>
  );
};

export default ProductsSection;
