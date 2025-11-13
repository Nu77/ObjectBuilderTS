import React from 'react';
import { ThingList } from './ThingList';
import './Panel.css';

interface ThingsPanelProps {
  onClose: () => void;
}

export const ThingsPanel: React.FC<ThingsPanelProps> = ({ onClose }) => {
  return (
    <div className="panel things-panel">
      <div className="panel-header">
        <span>Objects</span>
        <button className="panel-close" onClick={onClose}>×</button>
      </div>
      <div className="panel-content">
        <ThingList />
      </div>
    </div>
  );
};

