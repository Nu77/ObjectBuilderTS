import React, { useEffect, useState } from 'react';
import { useWorker } from '../contexts/WorkerContext';
import { useAppStateContext } from '../contexts/AppStateContext';
import { CommandFactory } from '../services/CommandFactory';
import { SpriteThumbnail } from './SpriteThumbnail';
import './SpriteList.css';

interface SpriteListItem {
  id: number;
  pixels?: Uint8Array | ArrayBuffer | Buffer | any;
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
        // Extract sprite list from command
        // Command structure: { type, data: { selectedIds, list: SpriteData[] } }
        // Or: { type, selectedIds, sprites: SpriteData[] }
        let spriteList: SpriteListItem[] = [];
        let selectedIds: number[] = [];
        
        if (command.data) {
          spriteList = command.data.list || command.data.sprites || [];
          selectedIds = command.data.selectedIds || [];
        } else if (command.sprites) {
          spriteList = command.sprites;
          selectedIds = command.selectedIds || [];
        }
        
        // Transform SpriteData objects to UI format
        const transformedList = spriteList.map((sprite: any) => {
          const id = sprite.id || 0;
          
          // Extract pixels - should be ArrayBuffer after Electron IPC serialization
          let pixels = null;
          if (sprite.pixels) {
            // After Electron IPC, pixels should be ArrayBuffer
            if (sprite.pixels instanceof ArrayBuffer) {
              pixels = sprite.pixels;
            } else if (sprite.pixels instanceof Uint8Array) {
              pixels = sprite.pixels;
            } else if (sprite.pixels.buffer instanceof ArrayBuffer) {
              // Typed array view
              pixels = sprite.pixels.buffer;
            } else if (typeof sprite.pixels === 'object' && sprite.pixels.byteLength !== undefined) {
              // ArrayBuffer-like object
              pixels = sprite.pixels;
            } else {
              // Fallback: try to use as-is
              pixels = sprite.pixels;
            }
          }
          
          return {
            id,
            pixels,
          };
        });
        
        setSprites(transformedList);
        if (selectedIds.length > 0) {
          setSelectedSpriteIds(selectedIds);
        }
        setLoading(false);
      }
    };

    worker.onCommand(handleCommand);
  }, [worker, setSelectedSpriteIds]);

  // Load sprite list when thing is selected
  useEffect(() => {
    const handleCommand = (command: any) => {
      if (command.type === 'SetThingDataCommand') {
        // Extract sprite IDs from thing data
        const thingData = command.data;
        if (thingData && thingData.sprites) {
          // Get sprites from the DEFAULT frame group (or first available)
          let spriteIds: number[] = [];
          
          // Try to get sprites from frame groups
          if (thingData.sprites instanceof Map) {
            // If it's a Map, get sprites from DEFAULT frame group (0)
            const defaultSprites = thingData.sprites.get(0) || [];
            spriteIds = defaultSprites.map((s: any) => s.id).filter((id: number) => id > 0);
          } else if (Array.isArray(thingData.sprites)) {
            // If it's an array, use it directly
            spriteIds = thingData.sprites.map((s: any) => s.id).filter((id: number) => id > 0);
          } else if (thingData.sprites[0]) {
            // If it's an object with numeric keys
            const defaultSprites = thingData.sprites[0] || [];
            spriteIds = defaultSprites.map((s: any) => s.id).filter((id: number) => id > 0);
          }
          
          // Load sprite list with first sprite ID if available
          if (spriteIds.length > 0) {
            loadSpriteList(spriteIds[0]);
          } else {
            setSprites([]);
            setLoading(false);
          }
        } else {
          setSprites([]);
          setLoading(false);
        }
      }
    };

    worker.onCommand(handleCommand);
  }, [worker]);

  const loadSpriteList = async (targetId: number) => {
    setLoading(true);
    try {
      const command = CommandFactory.createGetSpriteListCommand(targetId);
      await worker.sendCommand(command);
    } catch (error) {
      console.error('Failed to load sprite list:', error);
      setLoading(false);
    }
  };

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

