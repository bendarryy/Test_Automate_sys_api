import React from 'react';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="error-page">
      <h1>Unauthorized Access</h1>
      <p>You do not have permission to view this page.</p>
      <button onClick={() => window.history.back()}>Go Back</button>
    </div>
  );
};

export default UnauthorizedPage;
