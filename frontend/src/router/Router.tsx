// تم تفعيل التحميل الكسول (React.lazy) لجميع الصفحات الثقيلة لتحسين الأداء.
import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
const Layout = lazy(() => import("../Layout"));
const ProtectLogin = lazy(() => import("../security/protectLogin"));
const SupermarketPage = lazy(() => import("../pages/supermarket/HomePage"));


const HomePage = lazy(() => import("../pages/Restaurant/HomePage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const OrdersPage = lazy(() => import("../pages/Restaurant/OrderPage"));
const OrderDetailsPage = lazy(() => import("../pages/Restaurant/OrderDetailsPage"));
const EditOrderPage = lazy(() => import("../pages/Restaurant/EditOrderPage"));
const MenuManagement = lazy(() => import("../components/MenuManagement"));
const InventoryManagementPage = lazy(() => import("../pages/Restaurant/InventoryManagementPage"));
const InventoryManagementSMPage = lazy(() => import("../pages/supermarket/InventoryManagementPage"));
const InventoryItemViewPage = lazy(() => import("../pages/Restaurant/InventoryItemViewPage"));
const EmployeeLogin = lazy(() => import("../pages/EmployeeLogin"));
const OwnerLogin = lazy(() => import("../pages/OwnerLogin"));
const Systems = lazy(() => import("../pages/Systems"));
const KdsPage = lazy(() => import("../pages/Restaurant/KdsPage"));
const EmployeesPage = lazy(() => import("../pages/Restaurant/EmployeesPage"));
const Financesdashboards = lazy(() => import("../pages/Restaurant/financesdashboards"));

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
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Layout />
      </Suspense>
    ),
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <HomePage />
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/about",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <About />
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/orders",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <OrdersPage />
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/orders/:orderId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <OrderDetailsPage />
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/orders/:orderId/edit",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <EditOrderPage />
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/menu",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <MenuManagement EditPermition />
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/menu-management",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <MenuManagement />
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/inventory",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <InventoryManagementPage />
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/inventory/:itemId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <InventoryItemViewPage />
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/kds",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <KdsPage />
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/kds/order/:orderId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <KdsPage />
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/employees",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <EmployeesPage />
            </ProtectLogin>
          </Suspense>
        ),
      },
       {
        path: "/financesdashboards",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <Financesdashboards />
            </ProtectLogin>
          </Suspense>
        ),
      },
    ],
  },
]);

const supermarketRouter = createBrowserRouter([
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
  
  {
    path: "/",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Layout />
      </Suspense>
    ),
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <SupermarketPage />
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/inventory",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <InventoryManagementSMPage />
            </ProtectLogin>
          </Suspense>
        ),
      },
    ],
  },
]);

const Router = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <RouterProvider router={router} />
  </Suspense>
);

const SupermarketRouter = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <RouterProvider router={supermarketRouter} />
  </Suspense>
);

export  {Router, SupermarketRouter};