"use client";
import { useEffect } from "react";
import { useApp } from "@/contexts/app-context";

export function ThemeToggle() {
  const { state, dispatch } = useApp();
  const theme = state.theme || "light";

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  return (
    <button
      aria-label="Toggle theme"
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 transition-colors"
      onClick={() => dispatch({ type: "TOGGLE_THEME" })}
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
