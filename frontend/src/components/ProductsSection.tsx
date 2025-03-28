import React, { useEffect } from "react";
import GridScrollX from "./GridScrollX";
import styles from "../styles/ProductsSection.module.css";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import CakeIcon from "@mui/icons-material/Cake";
import EmojiFoodBeverageIcon from "@mui/icons-material/EmojiFoodBeverage";
import LocalPizzaIcon from "@mui/icons-material/LocalPizza";
import LunchDiningIcon from "@mui/icons-material/LunchDining";
import SaladIcon from "@mui/icons-material/EmojiNature";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../store/billSlice";
import { useGetMenu } from "../hooks/useGetMenu";

const ProductsSection = () => {
  const dispatch = useDispatch();
  const [tabSelected, setTabSelected] = React.useState("food");
  const { getMenu, data, loading, error } = useGetMenu(5);

  useEffect(() => {
    getMenu(tabSelected);
    console.log(data);
  } , [tabSelected]);
  // const categories = [
  //   {
  //     id: "0-unique",
  //     name: "default",
  //     icon: <RestaurantMenuIcon />, // Default icon for categories
  //     products: [],
  //   },
  //   {
  //     id: "1-unique",
  //     name: "juice",
  //     icon: <LocalDrinkIcon />,
  //     products: [
  //       {
  //         id: "1-unique",
  //         name: "apple juice",
  //         price: 3.99,
  //       },
  //       {
  //         id: "2-unique",
  //         name: "orange juice",
  //         price: 3.99,
  //       },
  //       {
  //         id: "3-unique",
  //         name: "pineapple juice",
  //         price: 3.99,
  //       },
  //     ],
  //   },
  //   {
  //     id: "2-unique",
  //     name: "Pasta",
  //     icon: <LunchDiningIcon />,
  //     products: [
  //       {
  //         id: "1-unique",
  //         name: "spaghetti",
  //         price: 9.99,
  //       },
  //       {
  //         id: "2-unique",
  //         name: "macaroni",
  //         price: 9.99,
  //       },
  //       {
  //         id: "3-unique",
  //         name: "penne",
  //         price: 9.99,
  //       },
  //     ],
  //   },
  //   {
  //     id: "3-unique",
  //     name: "Pizza",
  //     icon: <LocalPizzaIcon />,
  //     products: [
  //       {
  //         id: "1-unique",
  //         name: "margherita",
  //         price: 12.99,
  //       },
  //       {
  //         id: "2-unique",
  //         name: "pepperoni",
  //         price: 12.99,
  //       },
  //       {
  //         id: "3-unique",
  //         name: "veggie",
  //         price: 12.99,
  //       },
  //     ],
  //   },
  //   {
  //     id: "4-unique",
  //     name: "Burger",
  //     icon: <FastfoodIcon />,
  //     products: [
  //       {
  //         id: "1-unique",
  //         name: "cheeseburger",
  //         price: 8.99,
  //       },
  //       {
  //         id: "2-unique",
  //         name: "hamburger",
  //         price: 8.99,
  //       },
  //       {
  //         id: "3-unique",
  //         name: "veggie burger",
  //         price: 8.99,
  //       },
  //     ],
  //   },
  //   {
  //     id: "5-unique",
  //     name: "Salad",
  //     icon: <SaladIcon />,
  //     products: [
  //       {
  //         id: "1-unique",
  //         name: "garden salad",
  //         price: 7.99,
  //       },
  //       {
  //         id: "2-unique",
  //         name: "caesar salad",
  //         price: 7.99,
  //       },
  //       {
  //         id: "3-unique",
  //         name: "greek salad",
  //         price: 7.99,
  //       },
  //     ],
  //   },
  //   {
  //     id: "6-unique",
  //     name: "Dessert",
  //     icon: <CakeIcon />,
  //     products: [
  //       {
  //         id: "1-unique",
  //         name: "cheesecake",
  //         price: 5.99,
  //       },
  //       {
  //         id: "2-unique",
  //         name: "chocolate cake",
  //         price: 5.99,
  //       },
  //       {
  //         id: "3-unique",
  //         name: "apple pie",
  //         price: 5.99,
  //       },
  //     ],
  //   },
  //   {
  //     id: "7-unique",
  //     name: "Beverage",
  //     icon: <EmojiFoodBeverageIcon />,
  //     products: [
  //       {
  //         id: "1-unique",
  //         name: "coffee",
  //         price: 2.99,
  //       },
  //       {
  //         id: "2-unique",
  //         name: "tea",
  //         price: 2.99,
  //       },
  //       {
  //         id: "3-unique",
  //         name: "soda",
  //         price: 2.99,
  //       },
  //     ],
  //   },
  //   {
  //     id: "8-unique",
  //     name: "sweet",
  //     icon: <CakeIcon />,
  //     products: [
  //       {
  //         id: "1-unique",
  //         name: "brownie",
  //         price: 4.99,
  //       },
  //       {
  //         id: "2-unique",
  //         name: "cupcake",
  //         price: 3.99,
  //       },
  //       {
  //         id: "3-unique",
  //         name: "donut",
  //         price: 2.99,
  //       },
  //     ],
  //   },
  // ];

  // const selectedProducts =

  return (
    <div style={{ flex: 1 , display: "flex" , flexDirection: "column" , gap: "1rem" }}>
      <div>
        <div className={styles.categories}>
          <ul className={styles.categoryList}>
            {/* {categories.map((category) => (
              <div key={category.id} className={styles.categoryItem}>
                <input
                  type="checkbox"
                  name="category-tags"
                  id={`category-${category.id}`}
                />
                <label htmlFor={`category-${category.id}`}>
                  <div
                    className={styles.categoryTag}
                    onClick={() => setTabSelected(category.id)}
                  >
                    {category.icon}
                    <p>{category.name}</p>
                  </div>
                </label>
              </div>
            ))} */}
          </ul>
        </div>
      </div>
      <GridScrollX
        items={data || []}
        renderItem={(product, index) => (
          <div key={`${product.id}-${index}`}>
            <input
              type="checkbox"
              name="product"
              id={`product-${product.id.toString()}-${index}`}
              className={styles.checkbox}
            />
            <label htmlFor={`product-${product.id.toString()}-${index}`}>
              <div className={styles.product} onClick={() => dispatch(addItem(product))}>
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
