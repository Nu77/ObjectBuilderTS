import React, { useEffect, useState } from 'react';
import { useWorker } from '../contexts/WorkerContext';
import { useAppStateContext } from '../contexts/AppStateContext';
import { CommandFactory } from '../services/CommandFactory';
import { SpriteThumbnail } from './SpriteThumbnail';
import './ThingList.css';

interface ThingListItem {
  id: number;
  name?: string;
  pixels?: any;
  spriteId?: number;
  spritePixels?: any;
}

export const ThingList: React.FC = () => {
  const worker = useWorker();
  const { currentCategory, selectedThingIds, setSelectedThingIds } = useAppStateContext();
  const [things, setThings] = useState<ThingListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load thing list when category changes
    loadThingList();
  }, [currentCategory]);

  // Listen for SetThingListCommand
  useEffect(() => {
    const handleCommand = (command: any) => {
      if (command.type === 'SetThingListCommand') {
        setThings(command.data.list || []);
        if (command.data.selectedIds) {
          setSelectedThingIds(command.data.selectedIds);
        }
        setLoading(false);
      }
    };

    worker.onCommand(handleCommand);
  }, [worker, setSelectedThingIds]);

  const loadThingList = async () => {
    setLoading(true);
    try {
      const command = CommandFactory.createGetThingListCommand(100, currentCategory);
      await worker.sendCommand(command);
    } catch (error) {
      console.error('Failed to load thing list:', error);
      setLoading(false);
    }
  };

  const handleThingClick = (id: number) => {
    setSelectedThingIds([id]);
    // Load thing data
    loadThing(id);
  };

  const loadThing = async (id: number) => {
    try {
      const command = CommandFactory.createGetThingCommand(id, currentCategory);
      await worker.sendCommand(command);
    } catch (error) {
      console.error('Failed to load thing:', error);
    }
  };

  if (loading) {
    return (
      <div className="thing-list-loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="thing-list">
      {things.length === 0 ? (
        <div className="thing-list-empty">
          <p>No things found</p>
        </div>
      ) : (
        <div className="thing-list-items">
          {things.map((thing) => (
            <div
              key={thing.id}
              className={`thing-list-item ${
                selectedThingIds.includes(thing.id) ? 'selected' : ''
              }`}
              onClick={() => handleThingClick(thing.id)}
            >
              <div className="thing-list-item-preview">
                {thing.spritePixels || thing.pixels ? (
                  <SpriteThumbnail 
                    pixels={thing.spritePixels || thing.pixels} 
                    size={32} 
                    scale={2} 
                  />
                ) : (
                  <div className="thing-list-item-placeholder">#{thing.id}</div>
                )}
              </div>
              <div className="thing-list-item-info">
                <div className="thing-list-item-id">#{thing.id}</div>
                {thing.name && (
                  <div className="thing-list-item-name">{thing.name}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

