// تم تفعيل التحميل الكسول (React.lazy) لجميع الصفحات الثقيلة لتحسين الأداء.
import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import '../styles/error.css';
import { authRoutes } from '../config/navigation.config';
import {SalesPage}  from "../page/supermarket/pages/sales/SalesPage";
import ProtectedRoute from '../components/ProtectedRoute';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSelectedSystemId } from '../shared/hooks/useSelectedSystemId';


function RootUrlPage() {
  const actions = useSelector((state: RootState) => state.permissions.actions);
  // Render the correct page component based on root_url marker
  if (actions.includes('root_url_is_kds')) return <KdsPage />;
  if (actions.includes('root_url_is_orders') || actions.includes('root_url_is_waiter')) return <OrdersPage />;
  if (actions.includes('root_url_is_delivery_driver')) return <DeliveryDisplay />;
  if (actions.includes('root_url_is_cashier') || actions.includes('root_url_is_home')) return <DynamicHomePage />;
  // Fallbacks
  if (actions.includes('read_kds')) return <KdsPage />;
  if (actions.includes('read_order')) return <OrdersPage />;
  if (actions.includes('read_deliverydisplay')) return <DeliveryDisplay />;
  if (actions.includes('read_home')) return <DynamicHomePage />;
  return <About />;
}


const Layout = lazy(() => import("../Layout"));
const ProtectLogin = lazy(() => import("../security/protectLogin"));
const DynamicHomePage = lazy(() => import("../shared/pages/DynamicHomePage"));
const RegisterPage = lazy(() => import("../page/auth/pages/RegisterPage"));
const OrdersPage = lazy(() => import("../page/restaurant/pages/orders/OrderPage"));
const OrderDetailsPage = lazy(() => import("../page/restaurant/pages/orders/OrderDetailsPage"));
const MenuManagement = lazy(() => import("../page/restaurant/pages/menu/MenuManagementPage"));
const InventoryManagementPage = lazy(() => import("../page/restaurant/pages/inventory/InventoryManagementPage"));
const InventoryManagementSMPage = lazy(() => import("../page/supermarket/pages/products/ProductsManagementPage"));
const InventoryItemViewPage = lazy(() => import("../page/restaurant/pages/inventory/InventoryItemViewPage"));
const EmployeeLogin = lazy(() => import("../page/auth/pages/EmployeeLogin"));
const OwnerLogin = lazy(() => import("../page/auth/pages/OwnerLogin"));
const Systems = lazy(() => import("../shared/pages/Systems"));
const KdsPage = lazy(() => import("../page/restaurant/pages/kitchen/KdsPage"));
const EmployeesPage = lazy(() => import("../page/restaurant/pages/employees/EmployeesPage"));
const Financesdashboards = lazy(() => import("../page/restaurant/pages/analysis/FinancialDashboard"));
const WaiterDisplay = lazy(() => import("../page/restaurant/pages/waiter/waiterdisplay"));
const DeliveryDisplay = lazy(() => import("../page/restaurant/pages/delivery/deliverydisplay"));
const About = () => <h1>About Page</h1>;
const Profile = lazy(() => import("../page/settings/pages/Profile"));
const Settings = lazy(() => import("../page/settings/Settings"));
const ChangePassword = lazy(() => import("../page/settings/pages/ChangePassword"));
const SupplierManagement = lazy(() => import("../page/supermarket/pages/suppliers/SupplierManagement"));
const PurchaseOrdersPage = lazy(() => import("../page/supermarket/pages/purchase/PurchaseOrdersPage"));

const ErrorBoundary = () => {
  return (
    <div className="error-page">
      <h1>عذراً، حدث خطأ ما</h1>
      <p>يرجى التأكد من تسجيل الدخول واختيار النظام المناسب</p>
      <button onClick={() => window.location.href = '/systems'}>العودة إلى صفحة الأنظمة</button>
    </div>
  );
};

// Create auth routes from the centralized configuration
const authRoutesConfig = authRoutes.map(route => {
  let element;
  switch(route.path) {
    case '/register':
      element = <RegisterPage />;
      break;
    case '/ownerlogin':
      element = <OwnerLogin />;
      break;
    case '/employeelogin':
      element = <EmployeeLogin />;
      break;
    case '/systems':
      element = <ProtectLogin><Systems /></ProtectLogin>;
      break;
    default:
      element = null;
  }
  return {
    path: route.path,
    element
  };
});

const router = createBrowserRouter([
  // Auth-related routes OUTSIDE the layout
  ...authRoutesConfig,

  // All main routes under systemId
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Layout />
      </Suspense>
    ),
    children: [
      {
        path: "/",
        element: (
          <ProtectLogin>
            <RootUrlPage />
          </ProtectLogin>
        ),
      },
      {
        path: "/about",
        element: (
          <ProtectLogin>
            <About />
          </ProtectLogin>
        ),
      },
      {
        path: "/orders",
        element: (
          <ProtectLogin>
            <OrdersPage />
          </ProtectLogin>
        ),
      },
      {
        path: "/orders/:orderId",
        element: (
          <ProtectLogin>
            <OrderDetailsPage />
          </ProtectLogin>
        ),
      },
      {
        path: "/menu",
        element: (
          <ProtectLogin>
            <MenuManagement  />
          </ProtectLogin>
        ),
      },
      {
        path: "-management",
        element: (
          <ProtectLogin>
            <ProtectedRoute permission="create_order">
              <MenuManagement />
            </ProtectedRoute>
          </ProtectLogin>
        ),
      },
      {
        path: "/inventory",
        element: (
          <ProtectLogin>
            <ProtectedRoute permission="read_inventory">
              <InventoryManagementPage />
            </ProtectedRoute>
          </ProtectLogin>
        ),
      },
      {
        path: "/inventory/:itemId",
        element: (
          <ProtectLogin>
            <ProtectedRoute permission="read_inventory">
              <InventoryItemViewPage />
            </ProtectedRoute>
          </ProtectLogin>
        ),
      },
      {
        path: "/kds",
        element: (
          <ProtectLogin>
            <ProtectedRoute permission="read_kds">
              <KdsPage />
            </ProtectedRoute>
          </ProtectLogin>
        ),
      },
      {
        path: "/kds/order/:orderId",
        element: (
          <Suspense fallback={<LoadingSpinner />}>  
          <ProtectLogin>
            <ProtectedRoute permission="read_kds">
              <KdsPage />
            </ProtectedRoute>
          </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/employees",
        element: (
          <Suspense fallback={<LoadingSpinner />}>  
          <ProtectLogin>
            <ProtectedRoute permission="read_employee">
              <EmployeesPage />
            </ProtectedRoute>
          </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/financesdashboards",
        element: (
          <Suspense fallback={<LoadingSpinner />}>  
          <ProtectLogin>
            <ProtectedRoute permission="read_finance">
              <Financesdashboards />
            </ProtectedRoute>
          </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/deliverydisplay",
        errorElement: <ErrorBoundary />,
        element: (
          <Suspense fallback={<LoadingSpinner />}>  
          <ProtectLogin>
            <ProtectedRoute permission="read_deliverydisplay">
              <DeliveryDisplay />
            </ProtectedRoute>
          </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/waiterdisplay",
        errorElement: <ErrorBoundary />,
        element: (
          <Suspense fallback={<LoadingSpinner />}>  
          <ProtectLogin>
            <ProtectedRoute permission="read_waiterdisplay">
              <WaiterDisplay />
            </ProtectedRoute>
          </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/profile",
        element: (
          <Suspense fallback={<LoadingSpinner />}>  
          <ProtectLogin>
            <ProtectedRoute permission="read_profile">
              <Profile />
            </ProtectedRoute>
          </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/settings",
        element: (
          <Suspense fallback={<LoadingSpinner />}>  
          <ProtectLogin>
            <ProtectedRoute permission="read_settings">
              <Settings />
            </ProtectedRoute>
          </ProtectLogin>
          </Suspense>
        ),
      },
    ],
  },
]);

const supermarketRouter = createBrowserRouter([
  // Auth-related routes OUTSIDE the layout
  ...authRoutesConfig,
  
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Layout />
      </Suspense>
    ),
    children: [
      {
        path: "/",
        element: (
          <ProtectLogin>
            <RootUrlPage />
          </ProtectLogin>
        ),
      },
      {
        path: "/products",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectLogin>
              <ProtectedRoute permission="read_inventory">
                <InventoryManagementSMPage />
              </ProtectedRoute>
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/supermarket/sales",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectLogin>
              <ProtectedRoute permission="read_sales">
                <SalesPage />
              </ProtectedRoute>
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/supermarket/purchase-orders",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectLogin>
              <ProtectedRoute permission={["read_order", "create_order"]}>
                <PurchaseOrdersPage />
              </ProtectedRoute>
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/supermarket/suppliers",
        element: (
          <Suspense fallback={<LoadingSpinner />}>  
          <ProtectLogin>
            <SupplierManagement />
          </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/profile",
        element: (
          <Suspense fallback={<LoadingSpinner />}>  
          <ProtectLogin>
            <Profile />
          </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/settings",
        element: (
          <Suspense fallback={<LoadingSpinner />}>  
          <ProtectLogin>
            <Settings />
          </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/change-password",
        element: (
          <Suspense fallback={<LoadingSpinner />}>  
          <ProtectLogin>
            <ChangePassword />
          </ProtectLogin>
          </Suspense>
        ),
      },
    ],
  },
]);

// Dynamic router that selects the appropriate router based on system category
const DynamicRouter = () => {
  // Get the selected system category from the hook
  const [, , systemCategory] = useSelectedSystemId();

  // Add a key state to force router recreation
  const [routerKey, setRouterKey] = React.useState(0);

  // Listen for changes to systemCategory and force router recreation
  React.useEffect(() => {
    setRouterKey(prev => prev + 1);
  }, [systemCategory]);

  // Select the appropriate router based on system category
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {systemCategory === 'supermarket' ? (
        <RouterProvider key={`supermarket-${routerKey}`} router={supermarketRouter} />
      ) : (
        <RouterProvider key={`restaurant-${routerKey}`} router={router} />
      )}
    </Suspense>
  );
};

// Keep these for backward compatibility
const Router = DynamicRouter;
const SupermarketRouter = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <RouterProvider router={supermarketRouter} />
  </Suspense>
);

export { Router, SupermarketRouter };