import React from 'react';
import { useSelectedSystemId } from '../hooks/useSelectedSystemId';
import RestaurantHomePage from '../../page/restaurant/pages/cashier/HomePage';
import SupermarketHomePage from '../../page/supermarket/pages/home/HomePage';

const DynamicHomePage: React.FC = () => {
  // State to track the current system category
  const [, , systemCategory] = useSelectedSystemId();

  // Render the appropriate home page based on system category
  return (
    <>
      {systemCategory === 'supermarket' ? <SupermarketHomePage /> : <RestaurantHomePage />}
    </>
  );
};

export default DynamicHomePage;
