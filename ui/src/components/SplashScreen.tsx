import React from 'react';
import './SplashScreen.css';

export const SplashScreen: React.FC = () => {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="splash-logo">
          <h1>Object Builder</h1>
          <p>TypeScript Version</p>
        </div>
        <div className="splash-progress">
          <div className="progress-bar">
            <div className="progress-fill" />
          </div>
          <p className="progress-text">Initializing...</p>
        </div>
      </div>
    </div>
  );
};

