import React, { useEffect, useState } from 'react';
import { Suspense, lazy } from 'react';

// Lazy load the home pages
const RestaurantHomePage = lazy(() => import('./Restaurant/HomePage'));
const SupermarketHomePage = lazy(() => import('./supermarket/HomePage'));

const DynamicHomePage: React.FC = () => {
  // State to track the current system category
  const [systemCategory, setSystemCategory] = useState<string | null>(
    localStorage.getItem('selectedSystemCategory')
  );

  // Update the system category when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const currentCategory = localStorage.getItem('selectedSystemCategory');
      setSystemCategory(currentCategory);
    };

    // Check for changes immediately
    handleStorageChange();

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for our custom event
    window.addEventListener('systemCategoryChanged', handleStorageChange);
    
    // Also poll for changes as a fallback
    const intervalId = setInterval(handleStorageChange, 300);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('systemCategoryChanged', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  // Render the appropriate home page based on system category
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {systemCategory === 'supermarket' ? <SupermarketHomePage /> : <RestaurantHomePage />}
    </Suspense>
  );
};

export default DynamicHomePage;
