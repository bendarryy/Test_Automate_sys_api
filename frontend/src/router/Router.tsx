// تم تفعيل التحميل الكسول (React.lazy) لجميع الصفحات الثقيلة لتحسين الأداء.
import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import '../styles/error.css';
import { authRoutes } from '../config/navigation.config';
const Layout = lazy(() => import("../Layout"));
const ProtectLogin = lazy(() => import("../security/protectLogin"));
const SupermarketPage = lazy(() => import("../pages/supermarket/HomePage"));


// Dynamic home page that switches based on system category
const DynamicHomePage = lazy(() => import("../pages/DynamicHomePage"));
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
const WaiterDisplay = lazy(() => import("../pages/Restaurant/waiterdisplay"));
const DeliveryDisplay = lazy(() => import("../pages/Restaurant/deliverydisplay"));
const About = () => <h1>About Page</h1>;
const Profile = lazy(() => import("../pages/Profile"));
const Settings = lazy(() => import("../pages/Settings"));
const ChangePassword = lazy(() => import("../pages/ChangePassword"));

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
              <DynamicHomePage />
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
      {
        path: "/deliverydisplay",
        errorElement: <ErrorBoundary />,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <DeliveryDisplay />
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
              <WaiterDisplay />
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
      {
        path: "/settings/change-password",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectLogin>
              <ChangePassword />
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
              <DynamicHomePage />
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