import React from 'react';
import Header from '../../components/Header';

const HomePage = () => {
  return (
    <div>
      <Header 
        title="Supermarket Dashboard" 
        breadcrumbs={[
          { title: 'Supermarket' }
        ]}
      />
    </div>
  )
}

export default HomePage
