import React, { useState } from 'react';
import './Panel.css';

interface PanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onClose?: () => void;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  children,
  className = '',
  collapsible = true,
  defaultCollapsed = false,
  onClose,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const handleToggle = () => {
    if (collapsible) {
      setCollapsed(prev => !prev);
    }
  };

  return (
    <div className={`panel ${className} ${collapsed ? 'collapsed' : ''}`}>
      <div className="panel-header">
        <button
          className="panel-toggle"
          onClick={handleToggle}
          aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
          disabled={!collapsible}
        >
          <span className={`panel-toggle-icon ${collapsed ? 'collapsed' : ''}`}>
            ▼
          </span>
        </button>
        <span className="panel-title">{title}</span>
        {onClose && (
          <button
            className="panel-close"
            onClick={onClose}
            aria-label="Close panel"
          >
            ×
          </button>
        )}
      </div>
      {!collapsed && (
        <div className="panel-content">
          {children}
        </div>
      )}
    </div>
  );
};

