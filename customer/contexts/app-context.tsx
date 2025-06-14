"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import type { CartItem, MenuItem, RestaurantAPIData } from "@/lib/types" // Import RestaurantAPIData

interface AppState {
  theme: "light" | "dark"
  cart: CartItem[]
  favorites: MenuItem[]
  searchQuery: string
  selectedCategory: string
  isLoading: boolean
  notifications: Notification[]
  restaurantData: RestaurantAPIData | null // Add restaurantData
}

interface Notification {
  id: string
  message: string
  type: "success" | "error" | "info"
  timestamp: number
}

type AppAction =
  | { type: "TOGGLE_THEME" }
  | { type: "ADD_TO_CART"; payload: MenuItem }
  | { type: "REMOVE_FROM_CART"; payload: number }
  | { type: "UPDATE_CART_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "ADD_TO_FAVORITES"; payload: MenuItem }
  | { type: "REMOVE_FROM_FAVORITES"; payload: number }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_SELECTED_CATEGORY"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "ADD_NOTIFICATION"; payload: Omit<Notification, "id" | "timestamp"> }
  | { type: "REMOVE_NOTIFICATION"; payload: string }
  | { type: "SET_RESTAURANT_DATA"; payload: RestaurantAPIData } // Add action for setting data

const initialState: AppState = {
  theme: "light",
  cart: [],
  favorites: [],
  searchQuery: "",
  selectedCategory: "all",
  isLoading: true, // Set initial loading to true
  notifications: [],
  restaurantData: null, // Initialize restaurantData as null
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "TOGGLE_THEME":
      return { ...state, theme: state.theme === "light" ? "dark" : "light" }

    case "ADD_TO_CART":
      const existingItem = state.cart.find((item) => item.id === action.payload.id)
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        }
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1 }],
      }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      }

    case "UPDATE_CART_QUANTITY":
      return {
        ...state,
        cart: state.cart
          .map((item) => (item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item))
          .filter((item) => item.quantity > 0),
      }

    case "CLEAR_CART":
      return { ...state, cart: [] }

    case "ADD_TO_FAVORITES":
      if (state.favorites.some((item) => item.id === action.payload.id)) {
        return state
      }
      return {
        ...state,
        favorites: [...state.favorites, action.payload],
      }

    case "REMOVE_FROM_FAVORITES":
      return {
        ...state,
        favorites: state.favorites.filter((item) => item.id !== action.payload),
      }

    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload }

    case "SET_SELECTED_CATEGORY":
      return { ...state, selectedCategory: action.payload }

    case "SET_LOADING":
      return { ...state, isLoading: action.payload }

    case "ADD_NOTIFICATION":
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      }
      return {
        ...state,
        notifications: [...state.notifications, notification],
      }

    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter((notification) => notification.id !== action.payload),
      }
    case "SET_RESTAURANT_DATA": // Handle the new action
      return { ...state, restaurantData: action.payload, isLoading: false }
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const savedCart = localStorage.getItem("cart")
    const savedFavorites = localStorage.getItem("favorites")

    if (savedTheme) {
      dispatch({ type: "TOGGLE_THEME" })
    }
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart)
        cart.forEach((item: CartItem) => {
          for (let i = 0; i < item.quantity; i++) {
            dispatch({ type: "ADD_TO_CART", payload: item })
          }
        })
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites)
        favorites.forEach((item: MenuItem) => {
          dispatch({ type: "ADD_TO_FAVORITES", payload: item })
        })
      } catch (error) {
        console.error("Error loading favorites from localStorage:", error)
      }
    }
  }, [])

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem("theme", state.theme)
    localStorage.setItem("cart", JSON.stringify(state.cart))
    localStorage.setItem("favorites", JSON.stringify(state.favorites))
  }, [state.theme, state.cart, state.favorites])

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    state.notifications.forEach((notification) => {
      setTimeout(() => {
        dispatch({ type: "REMOVE_NOTIFICATION", payload: notification.id })
      }, 5000)
    })
  }, [state.notifications])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
