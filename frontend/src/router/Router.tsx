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
import InventoryItemViewPage from "../pages/InventoryItemViewPage";
import ProtectLogin from "../security/protectLogin";
import OwnerLogin from "../pages/Ownerlogin";
import EmployeeLogin from "../pages/EmployeeLogin";
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
        element: <ProtectLogin><HomePage /></ProtectLogin>,
      },
      // about route
      {
        path: "/about",
        element: <ProtectLogin><About /></ProtectLogin>,
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
        element: <ProtectLogin><OrdersPage /></ProtectLogin>, // Protecting the orders page
      },
      {
        path: "orders/:orderId", // Dynamic route for order details
        element: <ProtectLogin><OrderDetailsPage /></ProtectLogin>, // Protecting the order details page
      },
      {
        path: "orders/:orderId/edit", // Route for editing an order
        element: <ProtectLogin><EditOrderPage /></ProtectLogin>, // Protecting the edit order page
      },
      // Manage the menu items pages
      {
        path: "/menu",
        element: <ProtectLogin><MenuPage /></ProtectLogin>, // Protecting the menu page
      },
      // menu management route
      {
        path: "/menu-management",
        element: <ProtectLogin><MenuManagement /></ProtectLogin>, // Protecting the menu management page
      },
      //  Inventory route
      {
        path: "/Inventory",
        element: <ProtectLogin><InventoryManagementPage /></ProtectLogin>, // Protecting the inventory management page
      },
      // Inventory item view route
      {
        path: "/restaurant/:systemId/inventory/:itemId",
        element: <ProtectLogin><InventoryItemViewPage /></ProtectLogin>,
      },
      // Owner login
      {
        path: "/Ownerlogin",
        element: <OwnerLogin />,
      },
       // Employee login
       {
        path: "/employeelogin",
        element: <EmployeeLogin />,
      },
    ],
  },
]);

const Router = () => <RouterProvider router={router} />;
export default Router;
