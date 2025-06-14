"use client"

import { useState, useEffect } from "react" // Added useEffect
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Search, ShoppingCart, Heart, Menu, X, Sun, Moon, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useApp } from "@/contexts/app-context"
import { getAbsoluteImageUrl } from "@/lib/utils"; // Import the utility
import { LoadingSpinner } from "@/components/ui/loading-spinner"; // Import LoadingSpinner


export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()
  const { state, dispatch } = useApp()
  const { restaurantData, isLoading, theme } = state; // Destructure theme as well

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "About", href: "/about" },
    { name: "Reservations", href: "/reservations" },
    { name: "Contact", href: "/contact" },
  ]

  const toggleTheme = () => {
    dispatch({ type: "TOGGLE_THEME" })
    // The theme class is toggled on `document.documentElement` in AppProvider or RootLayout
    // Forcing a class toggle here might be redundant if already handled globally
    // but if not, this is the place:
    // document.documentElement.classList.toggle("dark", newTheme === 'dark');
  }

  const handleSearch = (query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query })
  }

  // Show a minimal header or loading indicator if data is not yet available
  if (isLoading || !restaurantData) {
    return (
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <LoadingSpinner size="sm" />
              <div className="hidden sm:block">
                 <h1 className="text-xl font-bold text-gray-900 dark:text-white">Loading...</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" disabled><Moon className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" disabled><Bell className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" disabled><Heart className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" disabled><ShoppingCart className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" disabled><User className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" className="lg:hidden" disabled><Menu className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  const { system } = restaurantData; // Destructure system from loaded data

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src={getAbsoluteImageUrl(system.logo) || "/placeholder.svg"} // Use helper
              alt={system.name}
              width={40}
              height={40}
              className="object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{system.public_title}</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-orange-600 dark:hover:text-orange-400 ${
                  pathname === item.href ? "text-orange-600 dark:text-orange-400" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            {isSearchOpen ? (
              <div className="flex items-center space-x-2 w-full">
                <Input
                  type="text"
                  placeholder="Search menu items..."
                  value={state.searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full"
                />
                <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="w-full justify-start text-gray-500"
              >
                <Search className="h-4 w-4 mr-2" />
                Search menu...
              </Button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {state.notifications.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">{state.notifications.length}</Badge>
              )}
            </Button>

            {/* Favorites */}
            <Link href="/favorites">
              <Button variant="ghost" size="sm" className="relative">
                <Heart className="h-4 w-4" />
                {state.favorites.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">{state.favorites.length}</Badge>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {state.cart.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                    {state.cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Account */}
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4" />
            </Button>

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-orange-600 dark:hover:text-orange-400 ${
                    pathname === item.href ? "text-orange-600 dark:text-orange-400" : "text-gray-700 dark:text-gray-300"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Search */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Input
                  type="text"
                  placeholder="Search menu items..."
                  value={state.searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full"
                />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
