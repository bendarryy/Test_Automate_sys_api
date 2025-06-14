"use client";

import { useApp } from "@/contexts/app-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { getAbsoluteImageUrl } from "@/lib/utils";

export default function FavoritesPage() {
  const { state, dispatch } = useApp();
  const { favorites } = state;

  const removeFavorite = (itemId: number) => {
    dispatch({ type: "REMOVE_FROM_FAVORITES", payload: itemId });
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: { message: "Removed from favorites", type: "info" },
    });
  };

  const addToCart = (item: any) => {
    dispatch({ type: "ADD_TO_CART", payload: item });
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: { message: `${item.name} added to cart!`, type: "success" },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Favorites</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Your favorite menu items</p>
        </div>
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No favorites yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Browse the menu and add items to your favorites.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={getAbsoluteImageUrl(item.image) || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-orange-600 text-white capitalize">{item.category}</Badge>
                  </div>
                  <button
                    onClick={() => removeFavorite(item.id)}
                    className="absolute bottom-3 right-3 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full transition-all"
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </button>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-1">{item.name}</h3>
                    <span className="text-xl font-bold text-orange-600">${item.price}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{item.description}</p>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
