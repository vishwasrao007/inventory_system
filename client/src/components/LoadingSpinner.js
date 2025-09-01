import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-dark-400">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
