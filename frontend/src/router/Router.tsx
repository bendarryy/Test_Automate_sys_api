import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "../Layout";
import HomePage from "../pages/HomePage";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";

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
        element: <HomePage />,
      },
      // about route
      {
        path: "/about",
        element: <About />,
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
    ],
  },
]);

const Router = () => <RouterProvider router={router} />;
export default Router;
