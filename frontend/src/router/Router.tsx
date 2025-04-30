import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "../Layout";
import HomePage from "../pages/HomePage";
import RegisterPage from "../pages/RegisterPage";
import OrdersPage from "../pages/OrderPage";
import OrderDetailsPage from "../pages/OrderDetailsPage";
import EditOrderPage from "../pages/EditOrderPage";
import MenuPage from "../pages/MenuPage";
import MenuManagement from "../components/MenuManagement";
import InventoryManagementPage from "../pages/InventoryManagementPage";
import InventoryItemViewPage from "../pages/InventoryItemViewPage";
import ProtectLogin from "../security/protectLogin";
import EmployeeLogin from "../pages/EmployeeLogin";
import OwnerLogin from "../pages/OwnerLogin";
import Systems from "../pages/Systems";
import KdsPage from "../pages/KdsPage";
import InviteEmployeePage from "../pages/InviteEmployeePage";
import EmployeesPage from "../pages/EmployeesPage";

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

const Router = () => <RouterProvider router={router} />;
export default Router;