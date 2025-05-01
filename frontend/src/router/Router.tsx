// تم تفعيل التحميل الكسول (React.lazy) لجميع الصفحات الثقيلة لتحسين الأداء.
import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "../Layout";
import ProtectLogin from "../security/protectLogin";

const HomePage = lazy(() => import("../pages/HomePage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const OrdersPage = lazy(() => import("../pages/OrderPage"));
const OrderDetailsPage = lazy(() => import("../pages/OrderDetailsPage"));
const EditOrderPage = lazy(() => import("../pages/EditOrderPage"));
const MenuPage = lazy(() => import("../pages/MenuPage"));
const MenuManagement = lazy(() => import("../components/MenuManagement"));
const InventoryManagementPage = lazy(() => import("../pages/InventoryManagementPage"));
const InventoryItemViewPage = lazy(() => import("../pages/InventoryItemViewPage"));
const EmployeeLogin = lazy(() => import("../pages/EmployeeLogin"));
const OwnerLogin = lazy(() => import("../pages/OwnerLogin"));
const Systems = lazy(() => import("../pages/Systems"));
const KdsPage = lazy(() => import("../pages/KdsPage"));
const InviteEmployeePage = lazy(() => import("../pages/InviteEmployeePage"));
const EmployeesPage = lazy(() => import("../pages/EmployeesPage"));

const About = () => <h1>About Page</h1>;

const router = createBrowserRouter([
  // Auth-related routes OUTSIDE the layout
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
  {
    path: "/systems",
    element: <ProtectLogin><Systems /></ProtectLogin>,
  },

  // All main routes under systemId
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <ProtectLogin><HomePage /></ProtectLogin>,
      },
      {
        path: "about",
        element: <ProtectLogin><About /></ProtectLogin>,
      },
      {
        path: "orders",
        element: <ProtectLogin><OrdersPage /></ProtectLogin>,
      },
      {
        path: "orders/:orderId",
        element: <ProtectLogin><OrderDetailsPage /></ProtectLogin>,
      },
      {
        path: "orders/:orderId/edit",
        element: <ProtectLogin><EditOrderPage /></ProtectLogin>,
      },
      {
        path: "menu",
        element: <ProtectLogin><MenuPage /></ProtectLogin>,
      },
      {
        path: "menu-management",
        element: <ProtectLogin><MenuManagement /></ProtectLogin>,
      },
      {
        path: "inventory",
        element: <ProtectLogin><InventoryManagementPage /></ProtectLogin>,
      },
      {
        path: "inventory/:itemId",
        element: <ProtectLogin><InventoryItemViewPage /></ProtectLogin>,
      },
      {
        path: "kds",
        element: <ProtectLogin><KdsPage /></ProtectLogin>,
      },
      {
        path: "invite-employee",
        element: <ProtectLogin><InviteEmployeePage /></ProtectLogin>,
      },
      {
        path: "employees",
        element: <ProtectLogin><EmployeesPage /></ProtectLogin>,
      }
    ],
  },
]);

const Router = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <RouterProvider router={router} />
  </Suspense>
);
export default Router;