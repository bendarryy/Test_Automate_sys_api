"use client"; // Add this if not present
import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Phone, Mail, MapPin, Clock } from "lucide-react"
// import { restaurantData } from "@/lib/data" // Remove static import
import { useApp } from "@/contexts/app-context"; // Import useApp
import { getAbsoluteImageUrl } from "@/lib/utils"; // Import the utility
import { LoadingSpinner } from "@/components/ui/loading-spinner"; // Import LoadingSpinner

export function Footer() {
  const currentYear = new Date().getFullYear()
  const { state } = useApp(); // Get state from context
  const { restaurantData, isLoading } = state; // Destructure restaurantData and isLoading

  if (isLoading || !restaurantData) {
    // Optionally, render a minimal footer or a loading state
    return (
      <footer className="bg-gray-900 dark:bg-black text-white py-12 text-center">
        <LoadingSpinner />
      </footer>
    );
  }

  const { system } = restaurantData; // Destructure system info

  return (
    <footer className="bg-gray-900 dark:bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Restaurant Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Image
                src={getAbsoluteImageUrl(system.logo) || "/placeholder.svg"} // Use helper
                alt={system.name}
                width={40}
                height={40}
                className="object-contain"
              />
              <h3 className="text-xl font-bold">{system.public_title}</h3>
            </div>
            <p className="text-gray-300 text-sm">{system.public_description}</p>
            <div className="flex space-x-4">
              {system.social_links?.facebook && (
                 <a href={system.social_links.facebook} className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">
                   <Facebook className="h-5 w-5" />
                 </a>
              )}
              {system.social_links?.instagram && (
                <a href={system.social_links.instagram} className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {system.social_links?.twitter && (
                <a href={system.social_links.twitter} className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="text-gray-300 hover:text-white">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/reservations" className="text-gray-300 hover:text-white">
                  Reservations
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-gray-300 hover:text-white">
                  Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <ul className="space-y-3 text-sm">
              {system.address && (
                <li className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  <span className="text-gray-300">{system.address}</span>
                </li>
              )}
              {system.phone_number && (
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-orange-500" />
                  <span className="text-gray-300">{system.phone_number}</span>
                </li>
              )}
              {system.email && (
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-orange-500" />
                  <span className="text-gray-300">{system.email}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Opening Hours</h3>
            {system.opening_hours ? (
              <div className="space-y-2 text-sm text-gray-300">
                {Object.entries(system.opening_hours).map(([day, hours]) => (
                  <p key={day} className="capitalize">
                    {day}: {hours.closed ? "Closed" : `${hours.open} - ${hours.close}`}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-gray-300 text-sm">Opening hours not available.</p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} {system.public_title || system.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
