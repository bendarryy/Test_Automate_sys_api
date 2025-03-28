// RestaurantContext.tsx
import React, { createContext, useState, ReactNode } from "react";

// Define types for product
interface Product {
  id: string;
  name: string;
  price: number;
}

// Define the shape of the context
interface RestaurantContextType {
  selectedTable: string | null;
  billItems: Product[];
  selectTable: (tableId: string | null) => void;
  addToBill: (product: Product) => void;
  removeFromBill: (productId: string) => void;
}

// Create the context with an undefined default value
export const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

// Provider component with typed children
export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [billItems, setBillItems] = useState<Product[]>([]);

  const selectTable = (tableId: string | null) => {
    setSelectedTable(tableId);
  };

  const addToBill = (product: Product) => {
    setBillItems((prevItems) => [...prevItems, product]);
  };

  const removeFromBill = (productId: string) => {
    setBillItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  return (
    <RestaurantContext.Provider
      value={{
        selectedTable,
        billItems,
        selectTable,
        addToBill,
        removeFromBill,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};