import React, { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "../styles/error.css";
import { authRoutes } from "../config/navigation.config";
import { SalesPage } from "../page/supermarket/pages/cashier/SalesPage";
import ProtectedRoute from "../components/ProtectedRoute";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useSelectedSystemId } from "../shared/hooks/useSelectedSystemId";

function RootUrlPage() {
  const actions = useSelector((state: RootState) => state.permissions.actions);
  // Render the correct page component based on root_url marker
  if (actions.includes("root_url_is_kds")) return <KdsPage />;
  if (
    actions.includes("root_url_is_orders") ||
    actions.includes("root_url_is_waiter")
  )
    return <OrdersPage />;
  if (actions.includes("root_url_is_delivery_driver"))
    return <DeliveryDisplay />;
  if (
    actions.includes("root_url_is_cashier") ||
    actions.includes("root_url_is_home")
  )
    return <DynamicHomePage />;
  // Fallbacks
  if (actions.includes("read_kds")) return <KdsPage />;
  if (actions.includes("read_order")) return <OrdersPage />;
  if (actions.includes("read_deliverydisplay")) return <DeliveryDisplay />;
  if (actions.includes("read_home")) return <DynamicHomePage />;
  return <About />;
}

const Layout = lazy(() => import("../Layout"));
const ProtectLogin = lazy(() => import("../security/protectLogin"));
const DynamicHomePage = lazy(() => import("../shared/pages/DynamicHomePage"));
const RegisterPage = lazy(() => import("../page/auth/pages/RegisterPage"));
const OrdersPage = lazy(
  () => import("../page/restaurant/pages/orders/OrderPage")
);
const OrderDetailsPage = lazy(
  () => import("../page/restaurant/pages/orders/OrderDetailsPage")
);
const MenuManagement = lazy(
  () => import("../page/restaurant/pages/menu/MenuManagementPage")
);
const InventoryManagementPage = lazy(
  () => import("../page/restaurant/pages/inventory/InventoryManagementPage")
);
const InventoryManagementSMPage = lazy(
  () => import("../page/supermarket/pages/products/ProductsManagementPage")
);
const InventoryItemViewPage = lazy(
  () => import("../page/restaurant/pages/inventory/InventoryItemViewPage")
);
const EmployeeLogin = lazy(() => import("../page/auth/pages/EmployeeLogin"));
const OwnerLogin = lazy(() => import("../page/auth/pages/OwnerLogin"));
const Systems = lazy(() => import("../shared/pages/Systems"));
const KdsPage = lazy(() => import("../page/restaurant/pages/kitchen/KdsPage"));
const EmployeesPage = lazy(
  () => import("../shared/pages/employees/EmployeesPage")
);
const SupermarketEmployeesPage = lazy(
  () => import("../shared/pages/employees/EmployeesPage")
);
const Financesdashboards = lazy(
  () => import("../page/restaurant/pages/analysis/FinancialDashboard")
);
const WaiterDisplay = lazy(
  () => import("../page/restaurant/pages/waiter/waiterdisplay")
);
const DeliveryDisplay = lazy(
  () => import("../page/restaurant/pages/delivery/deliverydisplay")
);
const About = () => <h1>About Page</h1>;
const Profile = lazy(() => import("../page/settings/pages/Profile"));
const Settings = lazy(() => import("../page/settings/Settings"));
const ChangePassword = lazy(
  () => import("../page/settings/pages/ChangePassword")
);
const SupplierManagement = lazy(
  () => import("../page/supermarket/pages/suppliers/SupplierManagement")
);
const PurchaseOrdersPage = lazy(
  () => import("../page/supermarket/pages/purchase/PurchaseOrdersPage")
);
const GoodsReceivingPage = lazy(
  () => import("../page/supermarket/pages/purchase/GoodsReceivingPage")
);

const ErrorBoundary = () => {
  return (
    <div className="error-page">
      <h1>عذراً، حدث خطأ ما</h1>
      <p>يرجى التأكد من تسجيل الدخول واختيار النظام المناسب</p>
      <button onClick={() => (window.location.href = "/systems")}>
        العودة إلى صفحة الأنظمة
      </button>
    </div>
  );
};

// Create auth routes from the centralized configuration
const authRoutesConfig = authRoutes.map((route) => {
  let element;
  switch (route.path) {
    case "/register":
      element = <RegisterPage />;
      break;
    case "/ownerlogin":
      element = <OwnerLogin />;
      break;
    case "/employeelogin":
      element = <EmployeeLogin />;
      break;
    case "/systems":
      element = <Systems />;
      break;
    default:
      element = null;
  }
  return {
    path: route.path,
    element,
  };
});

const router = createBrowserRouter([
  // Auth-related routes OUTSIDE the layout
  ...authRoutesConfig,

  // All main routes under systemId
  {
    path: "/",
    element: (
      <ProtectLogin>
        <Layout />
      </ProtectLogin>
    ),
    children: [
      {
        path: "/",
        element: <RootUrlPage />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/orders",
        element: <OrdersPage />,
      },
      {
        path: "/orders/:orderId",
        element: <OrderDetailsPage />,
      },
      {
        path: "/menu",
        element: <MenuManagement />,
      },
      {
        path: "-management",
        element: (
          <ProtectedRoute permission="create_order">
            <MenuManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "/inventory",
        element: (
          <ProtectedRoute permission="read_inventory">
            <InventoryManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/inventory/:itemId",
        element: (
          <ProtectedRoute permission="read_inventory">
            <InventoryItemViewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/kds",
        element: (
          <ProtectedRoute permission="read_kds">
            <KdsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/kds/order/:orderId",
        element: (
          <ProtectedRoute permission="read_kds">
            <KdsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/employees",
        element: (
          <ProtectedRoute permission="read_employee">
            <EmployeesPage category="restaurant" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/financesdashboards",
        element: (
          <ProtectedRoute permission="read_finance">
            <Financesdashboards />
          </ProtectedRoute>
        ),
      },
      {
        path: "/deliverydisplay",
        errorElement: <ErrorBoundary />,
        element: (
          <ProtectedRoute permission="read_deliverydisplay">
            <DeliveryDisplay />
          </ProtectedRoute>
        ),
      },
      {
        path: "/waiterdisplay",
        errorElement: <ErrorBoundary />,
        element: (
          <ProtectedRoute permission="read_waiterdisplay">
            <WaiterDisplay />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute permission="read_profile">
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/settings",
        element: (
          <ProtectedRoute permission="read_settings">
            <Settings />
          </ProtectedRoute>
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
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <RootUrlPage />,
      },
      {
        path: "/products",
        element: (
          <ProtectedRoute permission="read_inventory">
            <InventoryManagementSMPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/supermarket/sales",
        element: (
          <ProtectedRoute permission="read_sales">
            <SalesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/supermarket/purchase-orders",
        element: (
          <ProtectedRoute permission={["read_order", "create_order"]}>
            <PurchaseOrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/supermarket/goods-receiving",
        element: (
          <ProtectedRoute permission={["read_order", "create_order"]}>
            <GoodsReceivingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/supermarket/suppliers",
        element: <SupplierManagement />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/employees",
        element: <SupermarketEmployeesPage category="supermarket" />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/change-password",
        element: <ChangePassword />,
      },
    ],
  },
]);

// Dynamic router that selects the appropriate router based on system category
const DynamicRouter = () => {
  // Get the selected system category from the hook
  const [, , systemCategory] = useSelectedSystemId();

  // Create the router instance based on systemCategory
  const activeRouter = React.useMemo(() => {
    if (systemCategory === "supermarket") {
      return supermarketRouter; // Assuming supermarketRouter is defined elsewhere and correctly configured
    }
    else {
      return router;
    } // Assuming router is defined elsewhere and correctly configured for restaurant
  }, [systemCategory]);

  // Add a key state to force RouterProvider re-rendering if necessary,
  // though useMemo for activeRouter should handle the core issue.
  const [routerKey, setRouterKey] = React.useState(0);
  React.useEffect(() => {
    setRouterKey((prev) => prev + 1);
  }, [systemCategory]);

  const currentKeyForProvider = `${systemCategory}-${routerKey}`;

  return <RouterProvider router={activeRouter} key={currentKeyForProvider} />;
};

// Keep these for backward compatibility
const Router = DynamicRouter;
const SupermarketRouter = () => <RouterProvider router={supermarketRouter} />;

export { Router, SupermarketRouter };
