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
  // Auth-related routes OUTSIDE the layout
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/ownerlogin",
    element: <OwnerLogin />,
  },
  {
    path: "/employeelogin",
    element: <EmployeeLogin />,
  },
  // Main layout and protected routes
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
      {
        path: "orders",
        element: <ProtectLogin><OrdersPage /></ProtectLogin>,
      },
      {
        path: "orders/:orderId", // Dynamic route for order details
        element: <ProtectLogin><OrderDetailsPage /></ProtectLogin>,
      },
      {
        path: "orders/:orderId/edit", // Route for editing an order
        element: <ProtectLogin><EditOrderPage /></ProtectLogin>,
      },
      // Manage the menu items pages
      {
        path: "/menu",
        element: <ProtectLogin><MenuPage /></ProtectLogin>,
      },
      // menu management route
      {
        path: "/menu-management",
        element: <ProtectLogin><MenuManagement /></ProtectLogin>,
      },
      //  Inventory route
      {
        path: "/Inventory",
        element: <ProtectLogin><InventoryManagementPage /></ProtectLogin>,
      },
      // Inventory item view route
      {
        path: "/restaurant/:systemId/inventory/:itemId",
        element: <ProtectLogin><InventoryItemViewPage /></ProtectLogin>,
      },
    ],
  },
]);

const Router = () => <RouterProvider router={router} />;
export default Router;
