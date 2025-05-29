import React from 'react';
import '../styles/loading.css';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
      </div>
      <p className="loading-text">جاري التحميل...</p>
    </div>
  );
};

export default LoadingSpinner; 