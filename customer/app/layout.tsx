"use client"; // Add this if not present, as we'll use hooks
import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider, useApp } from "@/contexts/app-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NotificationToast } from "@/components/ui/notification-toast";
import { fetchRestaurantData } from "@/lib/data";
import { RestaurantAPIData } from "@/lib/types";
import { useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AppProvider>
          <DataInitializer />
          <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
            <Header />
            <main className="min-h-[calc(100vh-200px)]">
              {children}
            </main>
            <Footer />
            <NotificationToast />
            <ThemeToggle />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}

function DataInitializer() {
  const { dispatch } = useApp();

  useEffect(() => {
    async function loadData() {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const data = await fetchRestaurantData();
        dispatch({ type: "SET_RESTAURANT_DATA", payload: data });
        // تعيين ألوان الثيم كمتغيرات CSS في body
        if (data?.system?.primary_color && data?.system?.secondary_color) {
          document.body.style.setProperty('--primary-color', data.system.primary_color);
          document.body.style.setProperty('--secondary-color', data.system.secondary_color);
        }
      } catch (error) {
        console.error("Failed to load restaurant data:", error);
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            message: "Failed to load restaurant information. Please try again later.",
            type: "error",
          },
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }
    loadData();
  }, [dispatch]);

  return null;
}
