// تم تفعيل التحميل الكسول (React.lazy) لجميع الصفحات الثقيلة لتحسين الأداء.
import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import '../styles/error.css';
import { authRoutes } from '../config/navigation.config';
import { SalesPage } from "../pages/supermarket/SalesPage";
import ProtectedRoute from '../components/ProtectedRoute';
import { useSelector } from 'react-redux';
import { RootState } from '../store';


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
const DynamicHomePage = lazy(() => import("../pages/DynamicHomePage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const OrdersPage = lazy(() => import("../pages/Restaurant/OrderPage"));
const OrderDetailsPage = lazy(() => import("../pages/Restaurant/OrderDetailsPage"));
const MenuManagement = lazy(() => import("../pages/Restaurant/MenuManagementPage"));
const InventoryManagementPage = lazy(() => import("../pages/Restaurant/InventoryManagementPage"));
const InventoryManagementSMPage = lazy(() => import("../pages/supermarket/InventoryManagementPage"));
const InventoryItemViewPage = lazy(() => import("../pages/Restaurant/InventoryItemViewPage"));
const EmployeeLogin = lazy(() => import("../pages/EmployeeLogin"));
const OwnerLogin = lazy(() => import("../pages/OwnerLogin"));
const Systems = lazy(() => import("../pages/Systems"));
const KdsPage = lazy(() => import("../pages/Restaurant/KdsPage"));
const EmployeesPage = lazy(() => import("../pages/Restaurant/EmployeesPage"));
const Financesdashboards = lazy(() => import("../pages/Restaurant/financesdashboards"));
const WaiterDisplay = lazy(() => import("../pages/Restaurant/waiterdisplay"));
const DeliveryDisplay = lazy(() => import("../pages/Restaurant/deliverydisplay"));
const About = () => <h1>About Page</h1>;
const Profile = lazy(() => import("../pages/Profile"));
const Settings = lazy(() => import("../pages/Settings"));
const ChangePassword = lazy(() => import("../pages/ChangePassword"));
const ProductsManagement = lazy(() => import("../pages/supermarket/ProductsManagement"));

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
              <RootUrlPage />
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
        path: "-management",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <ProtectedRoute permission="create_order">
                <MenuManagement />
              </ProtectedRoute>
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/inventory",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <ProtectedRoute permission="read_inventory">
                <InventoryManagementPage />
              </ProtectedRoute>
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/inventory/:itemId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <ProtectedRoute permission="read_inventory">
                <InventoryItemViewPage />
              </ProtectedRoute>
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/kds",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <ProtectedRoute permission="read_kds">
                <KdsPage />
              </ProtectedRoute>
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/kds/order/:orderId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
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
          <Suspense fallback={<div>Loading...</div>}>
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
          <Suspense fallback={<div>Loading...</div>}>
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
          <Suspense fallback={<div>Loading...</div>}>
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
          <Suspense fallback={<div>Loading...</div>}>
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
          <Suspense fallback={<div>Loading...</div>}>
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
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <ProtectedRoute permission="read_settings">
                <Settings />
              </ProtectedRoute>
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/settings/change-password",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <ProtectedRoute permission="update_settings">
                <ChangePassword />
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
              <RootUrlPage />
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/inventory",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <ProtectedRoute permission="read_inventory">
                <InventoryManagementSMPage />
              </ProtectedRoute>
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/supermarket/products",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <ProtectedRoute permission="read_product">
                <ProductsManagement />
              </ProtectedRoute>
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/supermarket/sales",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <ProtectedRoute permission="read_sales">
                <SalesPage />
              </ProtectedRoute>
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/profile",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <Profile />
            </ProtectLogin>
          </Suspense>
        ),
      },
      {
        path: "/settings",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <Settings />
            </ProtectLogin>
          </Suspense>
        ),
      },
    ],
  },
]);

// Dynamic router that selects the appropriate router based on system category
const DynamicRouter = () => {
  // Get the selected system category from localStorage
  const [systemCategory, setSystemCategory] = React.useState<string | null>(
    localStorage.getItem('selectedSystemCategory')
  );

  // Listen for changes to localStorage
  React.useEffect(() => {
    const handleStorageChange = () => {
      setSystemCategory(localStorage.getItem('selectedSystemCategory'));
    };

    // Listen for custom event when system category changes
    window.addEventListener('systemCategoryChanged', handleStorageChange);
    
    // Also check periodically for changes (fallback)
    const intervalId = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener('systemCategoryChanged', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  // Select the appropriate router based on system category
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {systemCategory === 'supermarket' ? (
        <RouterProvider router={supermarketRouter} />
      ) : (
        <RouterProvider router={router} />
      )}
    </Suspense>
  );
};

// Keep these for backward compatibility
const Router = DynamicRouter;
const SupermarketRouter = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <RouterProvider router={supermarketRouter} />
  </Suspense>
);

export { Router, SupermarketRouter };