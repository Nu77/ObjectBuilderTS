import React, { useEffect, useState } from 'react';
import { useWorker } from '../contexts/WorkerContext';
import { useAppStateContext } from '../contexts/AppStateContext';
import { CommandFactory } from '../services/CommandFactory';
import { SpriteThumbnail } from './SpriteThumbnail';
import './SpriteList.css';

interface SpriteListItem {
  id: number;
  pixels?: any;
}

export const SpriteList: React.FC = () => {
  const worker = useWorker();
  const { selectedSpriteIds, setSelectedSpriteIds } = useAppStateContext();
  const [sprites, setSprites] = useState<SpriteListItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Listen for SetSpriteListCommand
  useEffect(() => {
    const handleCommand = (command: any) => {
      if (command.type === 'SetSpriteListCommand') {
        setSprites(command.data.list || []);
        if (command.data.selectedIds) {
          setSelectedSpriteIds(command.data.selectedIds);
        }
        setLoading(false);
      }
    };

    worker.onCommand(handleCommand);
  }, [worker, setSelectedSpriteIds]);

  // Load sprite list when thing is selected
  useEffect(() => {
    // TODO: Load sprites for selected thing
    // For now, this is a placeholder
  }, []);

  const handleSpriteClick = (id: number) => {
    setSelectedSpriteIds([id]);
  };

  if (loading) {
    return (
      <div className="sprite-list-loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="sprite-list">
      {sprites.length === 0 ? (
        <div className="sprite-list-empty">
          <p>No sprites found</p>
        </div>
      ) : (
        <div className="sprite-list-items">
          {sprites.map((sprite) => (
            <div
              key={sprite.id}
              className={`sprite-list-item ${
                selectedSpriteIds.includes(sprite.id) ? 'selected' : ''
              }`}
              onClick={() => handleSpriteClick(sprite.id)}
            >
              <div className="sprite-list-item-preview">
                {sprite.pixels ? (
                  <SpriteThumbnail pixels={sprite.pixels} size={32} scale={2} />
                ) : (
                  <div className="sprite-list-item-placeholder">#{sprite.id}</div>
                )}
              </div>
              <div className="sprite-list-item-id">#{sprite.id}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

