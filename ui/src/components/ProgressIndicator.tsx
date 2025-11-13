import React from 'react';
import './ProgressIndicator.css';

interface ProgressIndicatorProps {
  visible: boolean;
  message?: string;
  progress?: number; // 0-100
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  visible,
  message = 'Loading...',
  progress,
}) => {
  if (!visible) return null;

  return (
    <div className="progress-overlay">
      <div className="progress-dialog">
        <div className="progress-message">{message}</div>
        {progress !== undefined ? (
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
        ) : (
          <div className="progress-spinner" />
        )}
      </div>
    </div>
  );
};

