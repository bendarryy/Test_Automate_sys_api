"use client"

import { useState, useMemo, useEffect } from "react" // Added useEffect
import Image from "next/image"
import { Search, Filter, Star, Clock, Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { useApp } from "@/contexts/app-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getAbsoluteImageUrl } from "@/lib/utils"; // Import the utility

export default function MenuPage() {
  const { state, dispatch } = useApp()
  const { restaurantData: apiRestaurantData, isLoading } = state; // Get data and loading state from context

  const [sortBy, setSortBy] = useState("name")
  const [priceRange, setPriceRange] = useState([0, 50])
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Initialize allMenuItems and categories from API data once loaded
  const [allMenuItems, setAllMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);

  useEffect(() => {
    if (apiRestaurantData && apiRestaurantData.menu) {
      // Build menu items with explicit category (fix: use item.category from API, not key)
      const menuItems: any[] = [];
      Object.entries(apiRestaurantData.menu).forEach(([category, items]) => {
        items.forEach((item: any) => {
          menuItems.push({ ...item, category: item.category || category });
        });
      });
      setAllMenuItems(menuItems);
      const uniqueCategories = ["all", ...Object.keys(apiRestaurantData.menu)];
      setCategories(uniqueCategories);
      // Debug: log menuItems and categories
      console.log('DEBUG menuItems:', menuItems);
      console.log('DEBUG uniqueCategories:', uniqueCategories);
      // Set min and max price dynamically
      const prices = menuItems.map((item) => parseFloat(item.price)).filter((p) => !isNaN(p));
      const min = prices.length ? Math.min(...prices) : 0;
      const max = prices.length ? Math.max(...prices) : 1000;
      setMinPrice(Math.floor(min));
      setMaxPrice(Math.ceil(max));
      setPriceRange([Math.floor(min), Math.ceil(max)]);
    }
  }, [apiRestaurantData]);

  const filteredAndSortedItems = useMemo(() => {
    if (!apiRestaurantData) return [];
    let items = [...allMenuItems];

    // Debug: log selectedCategory and allMenuItems
    console.log('DEBUG selectedCategory:', state.selectedCategory);
    console.log('DEBUG allMenuItems:', allMenuItems);

    // Filter by search query
    if (state.searchQuery) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          item.ingredients?.some((ingredient) => ingredient.toLowerCase().includes(state.searchQuery.toLowerCase())),
      );
    }

    // Filter by category (fix: compare with key, not item.category)
    if (state.selectedCategory && state.selectedCategory !== "all") {
      items = items.filter((item) =>
        (item.category || "").toLowerCase() === state.selectedCategory.toLowerCase()
      );
    }

    // Debug: log filtered items
    console.log('DEBUG filteredItems:', items);

    // Filter by price range
    items = items.filter((item) => {
      const price = Number.parseFloat(item.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Filter by allergens
    if (selectedAllergens.length > 0) {
      items = items.filter((item) => !item.allergens?.some((allergen) => selectedAllergens.includes(allergen)));
    }

    // Sort items
    items.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return Number.parseFloat(a.price) - Number.parseFloat(b.price);
        case "price-high":
          return Number.parseFloat(b.price) - Number.parseFloat(a.price);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return items;
  }, [allMenuItems, state.searchQuery, state.selectedCategory, priceRange, selectedAllergens, sortBy, apiRestaurantData]); // Added apiRestaurantData dependency

  const addToCart = (item: any) => {
    dispatch({ type: "ADD_TO_CART", payload: item })
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: { message: `${item.name} added to cart!`, type: "success" },
    })
  }

  const toggleFavorite = (item: any) => {
    const isFavorite = state.favorites.some((fav) => fav.id === item.id)
    if (isFavorite) {
      dispatch({ type: "REMOVE_FROM_FAVORITES", payload: item.id })
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: { message: `${item.name} removed from favorites`, type: "info" },
      })
    } else {
      dispatch({ type: "ADD_TO_FAVORITES", payload: item })
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: { message: `${item.name} added to favorites!`, type: "success" },
      })
    }
  }

  const handleAllergenChange = (allergen: string, checked: boolean) => {
    if (checked) {
      setSelectedAllergens([...selectedAllergens, allergen])
    } else {
      setSelectedAllergens(selectedAllergens.filter((a) => a !== allergen))
    }
  }

  if (isLoading || !apiRestaurantData) { // Show loading spinner while data is loading or not yet available
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Menu</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover our carefully crafted dishes made with the finest ingredients
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search menu items, ingredients..."
                value={state.searchQuery}
                onChange={(e) => dispatch({ type: "SET_SEARCH_QUERY", payload: e.target.value })}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={state.selectedCategory}
              onValueChange={(value) => dispatch({ type: "SET_SELECTED_CATEGORY", payload: value })}
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Toggle */}
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="w-full lg:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <Slider value={priceRange} onValueChange={setPriceRange} min={minPrice} max={maxPrice} step={1} className="w-full" />
                </div>

                {/* Allergen Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exclude Allergens
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Gluten", "Dairy", "Nuts", "Seafood", "Eggs", "Soy"].map((allergen) => (
                      <div key={allergen} className="flex items-center space-x-2">
                        <Checkbox
                          id={allergen}
                          checked={selectedAllergens.includes(allergen)}
                          onCheckedChange={(checked) => handleAllergenChange(allergen, checked as boolean)}
                        />
                        <label htmlFor={allergen} className="text-sm text-gray-700 dark:text-gray-300">
                          {allergen}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            Showing {filteredAndSortedItems.length} of {allMenuItems.length} items
          </p>
        </div>

        {/* Menu Items Grid */}
        {state.isLoading && !allMenuItems.length ? ( // Adjusted loading condition
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedItems.map((item) => {
              const isFavorite = state.favorites.some((fav) => fav.id === item.id)

              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={getAbsoluteImageUrl(item.image) || "/placeholder.svg"} // Use helper for image URL
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-orange-600 text-white capitalize">{item.category}</Badge>
                    </div>

                    {/* Rating */}
                    <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{item.rating}</span>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(item)}
                      className="absolute bottom-3 right-3 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full transition-all"
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                    </button>

                    {/* Availability Overlay */}
                    {!item.is_available && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                        <Badge variant="destructive" className="text-lg px-4 py-2">
                          Out of Stock
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-1">{item.name}</h3>
                      <span className="text-xl font-bold text-orange-600">${item.price}</span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{item.description}</p>

                    {/* Item Details */}
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{item.prep_time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>{item.calories} cal</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>({item.reviews_count} reviews)</span>
                      </div>
                    </div>

                    {/* Ingredients */}
                    {item.ingredients && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ingredients:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.ingredients.slice(0, 3).map((ingredient, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {ingredient}
                            </Badge>
                          ))}
                          {item.ingredients.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{item.ingredients.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Allergens */}
                    {item.allergens && item.allergens.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Contains:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.allergens.map((allergen, index) => (
                            <Badge key={index} variant="outline" className="text-xs text-red-600 border-red-200">
                              {allergen}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => addToCart(item)}
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                        disabled={!item.is_available}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {item.is_available ? "Add to Cart" : "Out of Stock"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* No Results */}
        {filteredAndSortedItems.length === 0 && !state.isLoading && ( // Adjusted no results condition
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <Search className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No items found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button
              onClick={() => {
                dispatch({ type: "SET_SEARCH_QUERY", payload: "" })
                dispatch({ type: "SET_SELECTED_CATEGORY", payload: "all" })
                setPriceRange([0, 50])
                setSelectedAllergens([])
              }}
              variant="outline"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
