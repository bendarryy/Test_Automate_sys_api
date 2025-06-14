"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Search, Star, Clock, TrendingUp, History, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApp } from "@/contexts/app-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getAbsoluteImageUrl } from "@/lib/utils"; // Import the utility

export default function SearchPage() {
  const searchParams = useSearchParams()
  const { state, dispatch } = useApp()
  const { restaurantData: apiRestaurantData, isLoading } = state; // Get data and loading state

  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Initialize allMenuItems from API data
  const [allMenuItems, setAllMenuItems] = useState<any[]>([]);
  useEffect(() => {
    if (apiRestaurantData && apiRestaurantData.menu) {
      setAllMenuItems(Object.values(apiRestaurantData.menu).flat());
    }
  }, [apiRestaurantData]);

  // Initialize search from URL params
  useEffect(() => {
    const query = searchParams.get("q")
    if (query) {
      dispatch({ type: "SET_SEARCH_QUERY", payload: query })
    }

    // Load search history from localStorage
    const savedHistory = localStorage.getItem("searchHistory")
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory))
    }
  }, [searchParams, dispatch])

  // Generate search suggestions
  useEffect(() => {
    if (state.searchQuery.length > 0) {
      const itemSuggestions = allMenuItems
        .filter(
          (item) =>
            item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            item.ingredients?.some((ingredient) => ingredient.toLowerCase().includes(state.searchQuery.toLowerCase())),
        )
        .map((item) => item.name)
        .slice(0, 5)

      const ingredientSuggestions = allMenuItems
        .flatMap((item) => item.ingredients || [])
        .filter((ingredient) => ingredient.toLowerCase().includes(state.searchQuery.toLowerCase()))
        .slice(0, 3)

      setSuggestions([...new Set([...itemSuggestions, ...ingredientSuggestions])])
    } else {
      setSuggestions([])
    }
  }, [state.searchQuery, allMenuItems])

  // Search results
  const searchResults = useMemo(() => {
    if (!state.searchQuery || !apiRestaurantData) return [] // Check for apiRestaurantData

    setIsSearching(true)

    const itemsToSearch = [...allMenuItems]; // Use a copy

    const results = itemsToSearch.filter((item) => {
      const searchLower = state.searchQuery.toLowerCase()
      return (
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.ingredients?.some((ingredient) => ingredient.toLowerCase().includes(searchLower))
      )
    })

    // Sort by relevance
    results.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(state.searchQuery.toLowerCase())
      const bNameMatch = b.name.toLowerCase().includes(state.searchQuery.toLowerCase())

      if (aNameMatch && !bNameMatch) return -1
      if (!aNameMatch && bNameMatch) return 1

      return (b.rating || 0) - (a.rating || 0)
    })

    setTimeout(() => setIsSearching(false), 300)
    return results
  }, [state.searchQuery, allMenuItems, apiRestaurantData]) // Added apiRestaurantData dependency

  const handleSearch = (query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query })

    // Add to search history
    if (query && !searchHistory.includes(query)) {
      const newHistory = [query, ...searchHistory.slice(0, 9)]
      setSearchHistory(newHistory)
      localStorage.setItem("searchHistory", JSON.stringify(newHistory))
    }
  }

  const clearSearchHistory = () => {
    setSearchHistory([])
    localStorage.removeItem("searchHistory")
  }

  const addToCart = (item: any) => {
    dispatch({ type: "ADD_TO_CART", payload: item })
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: { message: `${item.name} added to cart!`, type: "success" },
    })
  }

  if (isLoading || !apiRestaurantData) { // Show loading spinner
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Search Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Search Menu</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Find your favorite dishes, ingredients, and more</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for dishes, ingredients, categories..."
              value={state.searchQuery}
              onChange={(e) => dispatch({ type: "SET_SEARCH_QUERY", payload: e.target.value })}
              onKeyPress={(e) => e.key === "Enter" && handleSearch(state.searchQuery)}
              className="pl-12 pr-4 py-3 text-lg"
            />
            {state.searchQuery && (
              <button
                onClick={() => dispatch({ type: "SET_SEARCH_QUERY", payload: "" })}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Search Suggestions */}
          {suggestions.length > 0 && state.searchQuery && (
            <div className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Content */}
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Search Results */}
          <TabsContent value="results">
            {state.searchQuery ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    Search Results for "{state.searchQuery}"
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {isSearching && !searchResults.length ? "Searching..." : `Found ${searchResults.length} results`}
                  </p>
                </div>

                {isSearching && !searchResults.length ? ( // Adjusted loading condition
                  <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.map((item) => (
                      <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                        <div className="relative h-48">
                          <Image src={getAbsoluteImageUrl(item.image) || "/placeholder.svg"} alt={item.name} fill className="object-cover" /> {/* Use helper */}
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-orange-600 text-white capitalize">{item.category}</Badge>
                          </div>
                          <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{item.rating}</span>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                            <span className="text-xl font-bold text-orange-600">${item.price}</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{item.description}</p>
                          <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{item.prep_time}</span>
                            </div>
                            <span>{item.calories} cal</span>
                          </div>
                          <Button
                            onClick={() => addToCart(item)}
                            className="w-full bg-orange-600 hover:bg-orange-700"
                            disabled={!item.is_available}
                          >
                            {item.is_available ? "Add to Cart" : "Out of Stock"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No results found</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Try searching for something else or browse our popular items below.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Start your search</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Enter a dish name, ingredient, or category to find what you're looking for.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Popular Searches */}
          <TabsContent value="popular">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Popular Searches</h2>
              <p className="text-gray-600 dark:text-gray-300">What other customers are searching for</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {popularSearches.map((search, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-105"
                  onClick={() => handleSearch(search)}
                >
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{search}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Search History */}
          <TabsContent value="history">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Search History</h2>
                <p className="text-gray-600 dark:text-gray-300">Your recent searches</p>
              </div>
              {searchHistory.length > 0 && (
                <Button variant="outline" onClick={clearSearchHistory}>
                  Clear History
                </Button>
              )}
            </div>

            {searchHistory.length > 0 ? (
              <div className="space-y-2">
                {searchHistory.map((search, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-md transition-all duration-300"
                    onClick={() => handleSearch(search)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <History className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">{search}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No search history</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your search history will appear here as you search for items.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
