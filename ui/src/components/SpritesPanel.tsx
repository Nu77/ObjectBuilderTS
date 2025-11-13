import React from 'react';
import { SpriteList } from './SpriteList';
import './Panel.css';

interface SpritesPanelProps {
  onClose: () => void;
}

export const SpritesPanel: React.FC<SpritesPanelProps> = ({ onClose }) => {
  return (
    <div className="panel sprites-panel">
      <div className="panel-header">
        <span>Sprites</span>
        <button className="panel-close" onClick={onClose}>×</button>
      </div>
      <div className="panel-content">
        <SpriteList />
      </div>
    </div>
  );
};

