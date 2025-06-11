import React, { Suspense, lazy } from 'react';
import { useSelectedSystemId } from '../hooks/useSelectedSystemId';

// Lazy load the home pages
const RestaurantHomePage = lazy(() => import('../../page/restaurant/pages/cashier/HomePage'));
const SupermarketHomePage = lazy(() => import('../../page/supermarket/pages/home/HomePage'));

const DynamicHomePage: React.FC = () => {
  // State to track the current system category
  const [, , systemCategory] = useSelectedSystemId();

  // Render the appropriate home page based on system category
  return (
    <Suspense fallback={null}>
      {systemCategory === 'supermarket' ? <SupermarketHomePage /> : <RestaurantHomePage />}
    </Suspense>
  );
};

export default DynamicHomePage;
