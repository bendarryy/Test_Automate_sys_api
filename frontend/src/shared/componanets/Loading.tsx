import React from 'react';
import {
  FaPizzaSlice,
  FaShoppingCart,
  FaAppleAlt,
  FaIceCream,
  FaFish
} from 'react-icons/fa';
import '../styles/loading.css';

const Loading: React.FC = () => {
  return (
    <div className="loading-page">
      <div className="loading-center">
        <div className="orbit-ring">
          <FaPizzaSlice className="orbit-icon" style={{ top: '-40px' }} />
          <FaAppleAlt className="orbit-icon" style={{ right: '-40px' }} />
          <FaShoppingCart className="orbit-icon" style={{ bottom: '-40px' }} />
          <FaIceCream className="orbit-icon" style={{ left: '-40px' }} />
          <FaFish className="orbit-icon" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        </div>
      </div>
    </div>
  );
};

export default Loading;
