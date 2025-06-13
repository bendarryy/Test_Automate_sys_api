import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "../styles/error.css";
import { authRoutes } from "../config/navigation.config";
import { SalesPage } from "../page/supermarket/pages/cashier/SalesPage";
import ProtectedRoute from "../shared/componanets/ProtectedRoute";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useSelectedSystemId } from "../shared/hooks/useSelectedSystemId";
import Layout from "../Layout";
import ProtectLogin from "../security/protectLogin";
import DynamicHomePage from "../shared/pages/DynamicHomePage";
import RegisterPage from "../page/auth/pages/RegisterPage";
import OrdersPage from "../page/restaurant/pages/orders/OrderPage";
import OrderDetailsPage from "../page/restaurant/pages/orders/OrderDetailsPage";
import MenuManagement from "../page/restaurant/pages/menu/MenuManagementPage";
import InventoryManagementPage from "../page/restaurant/pages/inventory/InventoryManagementPage";
import InventoryManagementSMPage from "../page/supermarket/pages/products/ProductsManagementPage";
import InventoryItemViewPage from "../page/restaurant/pages/inventory/InventoryItemViewPage";
import EmployeeLogin from "../page/auth/pages/EmployeeLogin";
import OwnerLogin from "../page/auth/pages/OwnerLogin";
import Systems from "../shared/pages/Systems";
import KdsPage from "../page/restaurant/pages/kitchen/KdsPage";
import EmployeesPage from "../shared/pages/employees/EmployeesPage";
import SupermarketEmployeesPage from "../shared/pages/employees/EmployeesPage";
import Financesdashboards from "../page/restaurant/pages/analysis/FinancialDashboard";
import WaiterDisplay from "../page/restaurant/pages/waiter/waiterdisplay";
import DeliveryDisplay from "../page/restaurant/pages/delivery/deliverydisplay";
import Profile from "../page/settings/pages/Profile";
import Settings from "../page/settings/Settings";
import ChangePassword from "../page/settings/pages/ChangePassword";
import SupplierManagement from "../page/supermarket/pages/suppliers/SupplierManagement";
import PurchaseOrdersPage from "../page/supermarket/pages/purchase/PurchaseOrdersPage";
import GoodsReceivingPage from "../page/supermarket/pages/purchase/GoodsReceivingPage";
import CreateSystem from "../page/system/CreateSystem/CreateSystem";
import UpdateSystem from "../page/system/UpdateSystem/UpdateSystem";
import EditSystemPublicProfile from "../page/system/UpdateSystem/EditSystemPublicProfile";

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
  return <div>لا يوجد صفحة رئيسية محددة</div>;
}

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
    case "/systems/create":
      element = <CreateSystem />;
      break;
    case "/systems/edit/:id":
      element = <UpdateSystem />;
      return {
        path: route.path,
        element,
        errorElement: <ErrorBoundary />,
      };
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
        element: <div>About Page</div>,
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
      {
        path: "/systems/public-profile",
        element: (
          <ProtectedRoute permission="read_settings">
            <EditSystemPublicProfile />
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: "/change-password",
        element: (
          <ProtectedRoute permission="read_settings">
            <ChangePassword />
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
      return supermarketRouter;
    }
    else {
      return router;
    }
  }, [systemCategory]);

  // Add a key state to force RouterProvider re-rendering if necessary
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
