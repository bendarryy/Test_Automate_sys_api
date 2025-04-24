import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "../Layout";
import HomePage from "../pages/HomePage";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import OrdersPage from "../pages/OrderPage";
import OrderDetailsPage from "../pages/OrderDetailsPage";
import EditOrderPage from "../pages/EditOrderPage";
import MenuPage from "../pages/MenuPage";
import MenuManagement from "../components/MenuManagement";
import InventoryManagementPage from "../pages/InventoryManagementPage";


// Example components for routes
const About = () => <h1>About Page</h1>;

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // home route
      {
        path: "/",
        element: <HomePage />,
      },
      // about route
      {
        path: "/about",
        element: <About />,
      },
      // register route
      {
        path: "/register",
        element: <RegisterPage />,
      },
      // login route
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "orders",
        element: <OrdersPage />,
      },
      {
        path: "orders/:orderId", // Dynamic route for order details
        element: <OrderDetailsPage />,
      },
      {
        path: "orders/:orderId/edit", // Route for editing an order
        element: <EditOrderPage />,
      },
      // Manage the menu items pages
      {
        path: "/menu",
        element: <MenuPage />,
      },
      // menu management route
      {
        path: "/menu-management",
        element: <MenuManagement />,
      }
      ,
      //  Inventory route
      {
        path: "/Inventory",
        element: <InventoryManagementPage />,
      },
    ],
  },
]);

const Router = () => <RouterProvider router={router} />;
export default Router;
