"use client";

import { useApp } from "@/contexts/app-context";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Coffee,
  GlassWater,
  Bike,
  Utensils,
  ShoppingCart,
  Star,
  Clock,
  MapPin,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Gift,
  Menu as MenuIcon,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL, fetchRestaurantData } from "@/lib/data";
import {
  RestaurantAPIData,
  SliderImage as ApiSliderImage,
  MenuItem,
} from "@/lib/types";
import { Input } from "@/components/ui/input";

// Mock data should be defined outside the component or imported
const fastFoodMenusData: MenuItem[] = [
  {
    id: 1,
    name: "Classic Burger",
    price: "8.99",
    image: "/placeholder.svg?text=Burger",
    description: "Juicy beef patty with fresh veggies.",
    is_available: true,
    category: "Burgers",
    created_at: "2023-01-01T12:00:00Z",
    updated_at: "2023-01-01T12:00:00Z",
  },
  {
    id: 2,
    name: "Pepperoni Pizza",
    price: "12.50",
    image: "/placeholder.svg?text=Pizza",
    description: "Classic pepperoni pizza.",
    is_available: true,
    category: "Pizza",
    created_at: "2023-01-01T12:00:00Z",
    updated_at: "2023-01-01T12:00:00Z",
  },
  {
    id: 3,
    name: "Fries",
    price: "3.00",
    image: "/placeholder.svg?text=Fries",
    description: "Crispy golden fries.",
    is_available: true,
    category: "Sides",
    created_at: "2023-01-01T12:00:00Z",
    updated_at: "2023-01-01T12:00:00Z",
  },
];

const servicesData = [
  {
    name: "Online Order",
    description: "Order your favorite food online.",
    icon: <ShoppingCart className="w-8 h-8 text-brand-red" />,
  },
  {
    name: "Home Delivery",
    description: "Fast and reliable home delivery.",
    icon: <Bike className="w-8 h-8 text-brand-red" />,
  },
  {
    name: "Hygienic Food",
    description: "We ensure the best quality and hygiene.",
    icon: <Star className="w-8 h-8 text-brand-red" />,
  },
  {
    name: "24/7 Service",
    description: "Order anytime, we are here for you.",
    icon: <Clock className="w-8 h-8 text-brand-red" />,
  },
];

const uniqueExperiencesData = [
  {
    title: "Birthday Parties",
    image: "/placeholder.svg?text=Birthday",
    features: [
      "Custom Menu Options",
      "Dedicated Party Area",
      "Decoration Services",
      "Entertainment Options",
    ],
  },
  {
    title: "Corporate Events",
    image: "/placeholder.svg?text=Corporate",
    features: [
      "Buffet or Plated Meals",
      "AV Equipment Available",
      "Private Dining Rooms",
      "Customizable Packages",
    ],
  },
];

const complimentaryItemsData = [
  {
    id: 4, // Added id for key prop
    name: "Espresso Martini",
    oldPrice: "12.00",
    newPrice: "9.00",
    image: "/placeholder.svg?text=Martini",
    description: "Rich espresso with a kick.",
    is_available: true,
    category: "Drinks",
    created_at: "2023-01-01T12:00:00Z",
    updated_at: "2023-01-01T12:00:00Z",
  },
  {
    id: 5, // Added id for key prop
    name: "Iced Coffee",
    oldPrice: "8.00",
    newPrice: "6.00",
    image: "/placeholder.svg?text=Iced+Coffee",
    description: "Chilled and refreshing.",
    is_available: true,
    category: "Drinks",
    created_at: "2023-01-01T12:00:00Z",
    updated_at: "2023-01-01T12:00:00Z",
  },
  {
    id: 6,
    name: "Cosmopolitan",
    oldPrice: "15.00",
    newPrice: "11.00",
    image: "/placeholder.svg?text=Cosmopolitan",
    description: "A classic cocktail with vodka, triple sec, and cranberry juice.",
    is_available: true,
    category: "Drinks",
    created_at: "2023-01-01T12:00:00Z",
    updated_at: "2023-01-01T12:00:00Z",
  },
  {
    id: 7,
    name: "Fresh Juice",
    oldPrice: "7.00",
    newPrice: "5.00",
    image: "/placeholder.svg?text=Juice",
    description: "Natural fruit juice, freshly squeezed.",
    is_available: true,
    category: "Drinks",
    created_at: "2023-01-01T12:00:00Z",
    updated_at: "2023-01-01T12:00:00Z",
  },
];

const bestSellerDealsData = [
  {
    name: "Buffet Vegas",
    active: true,
    image: "/placeholder.svg?text=Buffet+Vegas",
    oldPrice: "50.00",
    newPrice: "35.00",
    features: [
      "Unlimited Starters",
      "Main Course Variety",
      "Dessert Bar",
      "Soft Drinks Included",
    ],
  },
  { name: "Family Combo", active: false, image: "", oldPrice: "", newPrice: "", features: [] }, // Ensure all items have consistent structure
  { name: "Weekend Special", active: false, image: "", oldPrice: "", newPrice: "", features: [] },
];

const socialImagesData = [
  "/placeholder.svg?text=Social1",
  "/placeholder.svg?text=Social2",
  "/placeholder.svg?text=Social3",
  "/placeholder.svg?text=Social4",
  "/placeholder.svg?text=Social5",
];

// Helper function to get a diverse set of popular items
const getPopularItems = (
  menu: Record<string, MenuItem[]>,
  countPerCategory: number = 2, // How many items to try to get from each category
  maxTotal: number = 6        // The absolute maximum number of items to return
): MenuItem[] => {
  if (!menu) return [];

  const popularItemsList: MenuItem[] = [];
  const categoryNames = Object.keys(menu); // e.g., ["drink", "food", "pizza"]

  for (const categoryName of categoryNames) {
    const availableItemsInCategory = menu[categoryName].filter(item => item.is_available);
    const itemsToTake = availableItemsInCategory.slice(0, countPerCategory);
    popularItemsList.push(...itemsToTake);
  }
  // Slice to ensure we don't exceed maxTotal. This favors categories listed earlier if the sum of items exceeds maxTotal.
  return popularItemsList.slice(0, maxTotal);
};


export default function KingsBurgerPage() {
  const { state, dispatch } = useApp();
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [restaurantData, setRestaurantData] =
    useState<RestaurantAPIData | null>(null);
  const [heroSliderData, setHeroSliderData] = useState<ApiSliderImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await fetchRestaurantData();
        setRestaurantData(data);
        if (data.system && data.system.slider_images) {
          setHeroSliderData(
            data.system.slider_images.filter((slide) => slide.is_active)
          );
        }
        // Dispatch action to store restaurant data in context if needed by other components like menu page
        dispatch({ type: "SET_RESTAURANT_DATA", payload: data });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Failed to load restaurant data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [dispatch]); // Added dispatch to dependency array

  const categoriesData = restaurantData?.menu
    ? Object.entries(restaurantData.menu).map(([categoryName, items]) => ({
        name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
        image:
          items.length > 0 && items[0].image && items.find(item => item.is_available && item.image) // Prefer available item with image
            ? API_BASE_URL + (items.find(item => item.is_available && item.image)?.image || items[0].image)
            : "/placeholder.svg?text=" + categoryName,
        items: items.filter(item => item.is_available).length, // Count only available items
      })).filter(category => category.items > 0) // Only show categories with available items
    : [];

  const nextHeroSlide = () =>
    setCurrentHeroSlide((prev) => (prev + 1) % (heroSliderData.length || 1));
  const prevHeroSlide = () =>
    setCurrentHeroSlide(
      (prev) => (prev - 1 + (heroSliderData.length || 1)) % (heroSliderData.length || 1)
    );

  const handleAddToCart = (item: MenuItem) => {
    dispatch({ type: "ADD_TO_CART", payload: item });
    dispatch({
      type: "ADD_NOTIFICATION",
      payload: { message: `${item.name} added to cart!`, type: "success" },
    });
    console.log("Added to cart:", item.name);
  };

  // Get popular menu items for display
  const popularMenuItemsToDisplay = restaurantData?.menu
  ? getPopularItems(restaurantData.menu, 2, 6) // Get 2 items per category, max 6 total
  : [];

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading restaurant data...</p></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen"><p>Error loading data: {error}</p></div>;
  }

  if (!restaurantData) {
    return <div className="flex justify-center items-center h-screen"><p>No restaurant data available.</p></div>;
  }

  return (
    <div className="bg-white dark:bg-brand-dark text-gray-800 dark:text-gray-200">
      {/* Header */}
      <header className="bg-brand-dark text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            {restaurantData?.system.logo && (
              <Image
                src={API_BASE_URL + restaurantData.system.logo}
                alt={restaurantData.system.name || "Restaurant Logo"}
                width={40}
                height={40}
              />
            )}
            <span className="font-bold text-xl">
              {restaurantData?.system.name || "Restaurant"}
            </span>
          </Link>
          <nav className="hidden lg:flex items-center space-x-6">
            <Link href="/" className="hover:text-brand-red">
              Home
            </Link>
            <Link href="/menu" className="hover:text-brand-red">
              Menu
            </Link>
            <Link href="/about" className="hover:text-brand-red">
              About
            </Link>
            <Link href="/contact" className="hover:text-brand-red">
              Contact
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="w-6 h-6" />
            </Button>
            {/* Add Theme Toggle if you have one */}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-brand-dark text-white h-[80vh] flex items-center justify-center overflow-hidden">
        {heroSliderData.length > 0 ? (
          <>
            <div className="absolute inset-0">
              <Image
                src={API_BASE_URL + heroSliderData[currentHeroSlide].image}
                alt={
                  heroSliderData[currentHeroSlide].caption ||
                  `Slide ${currentHeroSlide + 1}`
                }
                layout="fill"
                objectFit="cover"
                className="opacity-30"
                priority={currentHeroSlide === 0}
              />
            </div>
            <div className="container mx-auto px-4 relative z-10 grid md:grid-cols-2 items-center gap-8">
              <div>
                <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
                  {heroSliderData[currentHeroSlide].caption ||
                    restaurantData?.system.public_title ||
                    "Welcome!"}
                </h1>
                <p className="text-lg md:text-xl mb-8">
                  {restaurantData?.system.public_description ||
                    "Enjoy the best food in town."}
                </p>
                <Button
                  size="lg"
                  className="bg-brand-red hover:bg-brand-red-dark"
                >
                  Order Now <ShoppingCart className="ml-2 w-5 h-5" />
                </Button>
              </div>
              <div className="relative hidden md:block">
                <Image
                  src={API_BASE_URL + heroSliderData[currentHeroSlide].image}
                  alt={
                    heroSliderData[currentHeroSlide].caption || "Featured Dish"
                  }
                  width={500}
                  height={400}
                  className="drop-shadow-2xl rounded-lg"
                  objectFit="cover"
                />
              </div>
            </div>
            <button
              onClick={prevHeroSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full border border-white/50 text-white hover:bg-white/10 disabled:opacity-50"
              disabled={heroSliderData.length <= 1}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextHeroSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full border border-white/50 text-white hover:bg-white/10 disabled:opacity-50"
              disabled={heroSliderData.length <= 1}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {heroSliderData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentHeroSlide(index)}
                  className={`w-3 h-3 rounded-full ${
                    currentHeroSlide === index
                      ? "bg-brand-red"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
              {restaurantData?.system.public_title || "Welcome!"}
            </h1>
            <p className="text-lg md:text-xl mb-8">
              {restaurantData?.system.public_description ||
                "Enjoy the best food in town. Slider images are currently unavailable."}
            </p>
            <Button
              size="lg"
              className="bg-brand-red hover:bg-brand-red-dark"
            >
              View Menu <Utensils className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}
      </section>

      {/* Perfect Place Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <p className="text-brand-red font-semibold text-center mb-2">
            ABOUT THE FOOD RESTAURANT
          </p>
          <h2 className="text-4xl font-bold text-center mb-12">
            Perfect Place For An Exceptional Experience
          </h2>
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-brand-yellow p-3 rounded-full mt-1">
                  <Bike className="w-6 h-6 text-brand-dark" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    Online Food Ordering
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Easy food delivery from the best restaurants.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-brand-yellow p-3 rounded-full mt-1">
                  <Gift className="w-6 h-6 text-brand-dark" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    100% Healthy Food
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Eating a wide variety of nutritious healthy foods.
                  </p>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 grid grid-cols-3 gap-4">
              <Image
                src="/placeholder.svg?width=200&height=250&text=Woman"
                alt="Woman ordering"
                width={200}
                height={250}
                className="rounded-full object-cover aspect-[4/5]"
              />
              <Image
                src="/placeholder.svg?width=200&height=250&text=Phone+App"
                alt="Food delivery app"
                width={200}
                height={250}
                className="rounded-full object-cover aspect-[4/5] mt-8"
              />
              <Image
                src="/placeholder.svg?width=200&height=250&text=Chef"
                alt="Chef cooking"
                width={200}
                height={250}
                className="rounded-full object-cover aspect-[4/5]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Choose a Category Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-2">
            Choose a Category
          </h2>
          <div className="w-20 h-1 bg-brand-yellow mx-auto mb-12"></div>
          <div className="flex space-x-6 overflow-x-auto pb-4 -mx-4 px-4">
            {categoriesData.length > 0 ? (
              categoriesData.map((category) => (
                <div
                  key={category.name}
                  className="text-center flex-shrink-0 w-40"
                >
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    width={120}
                    height={120}
                    className="rounded-full mx-auto mb-3 border-4 border-white dark:border-gray-700 shadow-lg object-cover aspect-square"
                  />
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {category.items} Dish{category.items === 1 ? "" : "es"} in
                    the Menu
                  </p>
                </div>
              ))
            ) : (
              <p>No categories found.</p>
            )}
          </div>
        </div>
      </section>

      {/* How We Work Section */}
      <section className="py-16 bg-brand-red text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {/* Placeholder for subtle background graphics */}
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <p className="font-semibold text-center mb-1">
            EASY ORDER IN 3 STEPS
          </p>
          <h2 className="text-4xl font-bold text-center mb-12">How We Work</h2>
          <div className="grid md:grid-cols-2 items-center gap-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {[
                {
                  icon: <MenuIcon className="w-10 h-10" />,
                  title: "Explore Menu",
                  step: 1,
                },
                {
                  icon: <Utensils className="w-10 h-10" />,
                  title: "Choose a Dish",
                  step: 2,
                },
                {
                  icon: <ShoppingBag className="w-10 h-10" />,
                  title: "Place an Order",
                  step: 3,
                },
              ].map((item) => (
                <div key={item.title} className="relative">
                  <div className="bg-brand-yellow text-brand-dark rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4 relative">
                    {item.icon}
                    <div className="absolute -top-2 -right-2 bg-brand-dark text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm opacity-80">
                    A range of powerful tools for viewing, querying and
                    filtering your data.
                  </p>
                </div>
              ))}
            </div>
            <div>
              <Image
                src="/placeholder.svg?width=500&height=350&text=Dining+People"
                alt="People dining"
                width={500}
                height={350}
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Fast Food Menus Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-2">
            Fast Food Menus
          </h2>
          <div className="w-20 h-1 bg-brand-yellow mx-auto mb-12"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fastFoodMenusData.map((item) => (
              <Card
                key={item.id} // Use id for key
                className="flex items-center p-4 space-x-4 hover:shadow-lg transition-shadow dark:bg-gray-800"
              >
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded-full flex-shrink-0 object-cover aspect-square" // Added object-cover
                />
                <div className="flex-grow">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-brand-red font-bold text-lg">
                    ${item.price}
                  </p>
                </div>
                <Button
                  size="icon"
                  className="bg-brand-yellow text-brand-dark hover:bg-yellow-400"
                  onClick={() => handleAddToCart(item)}
                >
                  <ShoppingCart className="w-5 h-5" />
                </Button>
              </Card>
            ))}
            <Card className="bg-brand-yellow text-brand-dark p-6 flex flex-col justify-center items-center text-center rounded-lg lg:col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-2">OPENING TIMES</h3>
              <div className="space-y-1 text-sm mb-4">
                <p>Mon - Tue: 17:00 to 23:00</p>
                <p>Wed - Sun: 17:00 to 23:00</p>
              </div>
              <Button className="bg-brand-red text-white hover:bg-red-700 w-full text-lg py-3">
                <Phone className="w-5 h-5 mr-2" /> +1 234 567 891
              </Button>
              <p className="text-xs mt-2">Avenue New Town 124 United State</p>
            </Card>
          </div>
        </div>
      </section>

      {/* We Provide Best Services Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <p className="text-brand-red font-semibold text-center mb-2">
            FOOD SERVICES
          </p>
          <h2 className="text-4xl font-bold text-center mb-12">
            We Provide Best Services
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-8">
              {servicesData.map((service) => (
                <div key={service.name}>
                  <div className="bg-white dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-2">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
            <div>
              <Image
                src="/placeholder.svg?width=500&height=400&text=Food+Bowl"
                alt="Food Bowl"
                width={500}
                height={400}
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Unique Experiences Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <p className="text-brand-red font-semibold text-center mb-2">
            PACKAGES
          </p>
          <h2 className="text-4xl font-bold text-center mb-12">
            A Collection of Unique Experiences
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {uniqueExperiencesData.map((exp) => (
              <Card
                key={exp.title}
                className="overflow-hidden dark:bg-gray-800"
              >
                <Image
                  src={exp.image || "/placeholder.svg"}
                  alt={exp.title}
                  width={600}
                  height={300}
                  className="w-full h-64 object-cover"
                />
                <CardContent className="p-6 bg-brand-yellow/10 dark:bg-brand-yellow/5">
                  <h3 className="text-2xl font-bold text-brand-red mb-4">
                    {exp.title}
                  </h3>
                  <ul className="space-y-2">
                    {exp.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <div className="w-2 h-2 bg-brand-yellow rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Complimentary Items Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2">
            A Complimentary Cocktail, Coffee, Ice-Tea For You.
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
            Enjoy a cosmopolitan or a non-alcoholic espresso martini.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {complimentaryItemsData.map((item) => (
              <Card
                key={item.id} // Use id for key
                className="text-center p-4 hover:shadow-lg transition-shadow dark:bg-gray-700"
              >
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={120}
                  height={120}
                  className="rounded-full mx-auto mb-3 object-cover aspect-square" // Added object-cover
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  100 grams
                </p>
                <h3 className="font-semibold mb-1">{item.name}</h3>
                <div className="text-brand-red font-bold text-lg">
                  {item.oldPrice && (
                    <span className="text-gray-400 line-through mr-2 text-sm">
                      ${item.oldPrice}
                    </span>
                  )}
                  ${item.newPrice}
                </div>
                <Button
                  size="icon"
                  className="bg-brand-yellow text-brand-dark hover:bg-yellow-400 mt-3 mx-auto"
                  onClick={() => handleAddToCart(item as MenuItem)} // Cast to MenuItem
                >
                  <ShoppingCart className="w-5 h-5" />
                </Button>
              </Card>
            ))}
          </div>
          <p className="text-center mt-8 text-sm">
            Booking Calling 24/7:{" "}
            <a
              href={`tel:${restaurantData?.system.phone_number || '+1234567890'}`}
              className="text-brand-red font-semibold"
            >
              {restaurantData?.system.phone_number || '+12 345 67890'}
            </a>
          </p>
        </div>
      </section>

      {/* Best Seller Deals Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <p className="text-brand-red font-semibold text-center mb-2">
            WEEKLY SPECIAL
          </p>
          <h2 className="text-4xl font-bold text-center mb-12">
            Best Seller Deals
          </h2>
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="space-y-3">
              {bestSellerDealsData.map((deal) => (
                <Button
                  key={deal.name}
                  variant={deal.active ? "default" : "outline"}
                  className={`w-full justify-start p-4 h-auto text-left ${
                    deal.active
                      ? "bg-brand-yellow text-brand-dark hover:bg-yellow-400"
                      : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full mr-3 ${
                      deal.active
                        ? "bg-brand-red"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  ></div>
                  {deal.name}
                </Button>
              ))}
            </div>
            {bestSellerDealsData.find((d) => d.active)?.image && (
              <div className="md:col-span-2 bg-brand-yellow/20 dark:bg-brand-yellow/10 p-8 rounded-lg flex flex-col md:flex-row items-center gap-8">
                <Image
                  src={
                    bestSellerDealsData.find((d) => d.active)!.image! ||
                    "/placeholder.svg"
                  }
                  alt={bestSellerDealsData.find((d) => d.active)!.name}
                  width={250}
                  height={250}
                  className="rounded-lg shadow-lg object-cover aspect-square" // Added object-cover
                />
                <div>
                  <h3 className="text-3xl font-bold mb-4">{bestSellerDealsData.find((d) => d.active)!.name}</h3>
                  <ul className="space-y-2 mb-4">
                    {bestSellerDealsData
                      .find((d) => d.active)!
                      .features!.map((feature) => (
                        <li key={feature} className="flex items-center">
                          <Star className="w-4 h-4 text-green-500 mr-2" />{" "}
                          {feature}
                        </li>
                      ))}
                  </ul>
                  <div className="text-2xl font-bold text-brand-red mb-4">
                    <span className="text-gray-500 dark:text-gray-400 line-through mr-2">
                      ${bestSellerDealsData.find((d) => d.active)!.oldPrice}
                    </span>
                    ${bestSellerDealsData.find((d) => d.active)!.newPrice}
                  </div>
                  <Button className="bg-brand-red text-white hover:bg-red-700 px-8 py-3">
                    Product
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Follow Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Instagram className="w-8 h-8 text-brand-red" />
            <h2 className="text-3xl font-bold text-center">
              Follow {restaurantData?.system.name || "Us"}
            </h2>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Join our community to inspire your desires
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1">
            {socialImagesData.map((img, i) => (
              <div
                key={i}
                className="aspect-square relative overflow-hidden group"
              >
                <Image
                  src={img || "/placeholder.svg"}
                  alt={`Social Image ${i + 1}`}
                  layout="fill"
                  objectFit="cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Instagram className="w-10 h-10 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-brand-dark pt-16 relative">
        <div className="absolute bottom-0 left-0 opacity-10 pointer-events-none">
          {/* Placeholder for background food graphics */}
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-12 gap-8 mb-12">
            <div className="md:col-span-4 bg-brand-red text-white p-8 rounded-lg text-center">
              {restaurantData?.system.logo && (
                 <Image
                    src={API_BASE_URL + restaurantData.system.logo}
                    alt={restaurantData.system.name || "Restaurant Logo"}
                    width={60}
                    height={60}
                    className="mx-auto mb-4"
                  />
              )}
              <h3 className="text-xl font-bold mb-2">{restaurantData?.system.name || "Restaurant"}</h3>
              {/* TODO: Replace with API opening hours */}
              <p className="text-sm mb-1">
                Tuesday - Saturday: 12:00pm - 23:00pm 
              </p>
              <p className="text-sm mb-4">Closed on Sunday</p>
              <p className="text-sm font-semibold">
                5 star rated on TripAdvisor
              </p>
            </div>
            <div className="md:col-span-2">
              <h4 className="font-bold text-lg mb-4">About</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {["Our Story", "Special Dish", "Reservation", "Contact"].map( // Updated items
                  (item) => (
                    <li key={item}>
                      <Link href="#" className="hover:text-brand-red">
                        &gt; {item}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="md:col-span-2">
              <h4 className="font-bold text-lg mb-4">Menu</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {categoriesData.slice(0,5).map( // Display first 5 categories from API
                  (item) => (
                    <li key={item.name}>
                      <Link href="#" className="hover:text-brand-red"> 
                        &gt; {item.name}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="md:col-span-4">
              <h4 className="font-bold text-lg mb-4">Newsletter</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Get recent news and updates.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex">
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="rounded-r-none dark:bg-gray-700 dark:border-gray-600"
                  aria-label="Email Address for newsletter"
                />
                <Button type="submit" className="bg-brand-red hover:bg-red-700 text-white rounded-l-none">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
          <div className="border-t border-gray-300 dark:border-gray-700 py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} {restaurantData?.system.name || "Restaurant Name"} | All Rights Reserved
            </p>
            <div className="flex space-x-4 mt-4 sm:mt-0">
              {restaurantData?.system.social_links?.facebook && <Link href={restaurantData.system.social_links.facebook} className="hover:text-brand-red">Facebook</Link>}
              {restaurantData?.system.social_links?.twitter && <Link href={restaurantData.system.social_links.twitter} className="hover:text-brand-red">Twitter</Link>}
              {restaurantData?.system.social_links?.instagram && <Link href={restaurantData.system.social_links.instagram} className="hover:text-brand-red">Instagram</Link>}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
