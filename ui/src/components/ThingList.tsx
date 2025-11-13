import React, { useEffect, useState, useRef } from 'react';
import { useWorker } from '../contexts/WorkerContext';
import { useAppStateContext } from '../contexts/AppStateContext';
import { CommandFactory } from '../services/CommandFactory';
import { SpriteThumbnail } from './SpriteThumbnail';
import './ThingList.css';

interface ThingListItem {
  id?: number;
  thing?: {
    id: number;
    category?: string;
    [key: string]: any;
  };
  frameGroup?: any;
  pixels?: Uint8Array | ArrayBuffer | Buffer | any;
  name?: string;
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
        // Extract thing list from command
        // Command structure: { type, data: { selectedIds, list: ThingListItem[] } }
        // Or: { type, selectedIds, things: ThingListItem[] }
        let thingList: ThingListItem[] = [];
        let selectedIds: number[] = [];
        
        if (command.data) {
          thingList = command.data.list || command.data.things || [];
          selectedIds = command.data.selectedIds || [];
        } else if (command.things) {
          thingList = command.things;
          selectedIds = command.selectedIds || [];
        }
        
        // Transform ThingListItem objects to UI format
        const transformedList = thingList.map((item: any) => {
          // Extract ID from thing object or item itself
          const id = item.thing?.id || item.id || 0;
          
          // Extract pixels - should be ArrayBuffer after Electron IPC serialization
          let pixels = null;
          if (item.pixels) {
            // After Electron IPC, pixels should be ArrayBuffer
            if (item.pixels instanceof ArrayBuffer) {
              pixels = item.pixels;
            } else if (item.pixels instanceof Uint8Array) {
              pixels = item.pixels;
            } else if (item.pixels.buffer instanceof ArrayBuffer) {
              // Typed array view
              pixels = item.pixels.buffer;
            } else if (typeof item.pixels === 'object' && item.pixels.byteLength !== undefined) {
              // ArrayBuffer-like object
              pixels = item.pixels;
            } else {
              // Fallback: try to use as-is
              pixels = item.pixels;
            }
          }
          
          return {
            id,
            name: item.thing?.name || item.name,
            pixels,
            spriteId: item.spriteId,
            spritePixels: item.spritePixels,
          };
        });
        
        setThings(transformedList);
        if (selectedIds.length > 0) {
          setSelectedThingIds(selectedIds);
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

  // Keyboard navigation (only when list container is focused)
  const listRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const listElement = listRef.current;
    if (!listElement) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if list is focused or contains focused element
      if (!listElement.contains(document.activeElement)) return;
      if (things.length === 0) return;
      
      const selectedIndex = things.findIndex(t => selectedThingIds.includes(t.id));
      if (selectedIndex < 0 && things.length > 0) {
        // No selection, select first item
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          handleThingClick(things[0].id);
        }
        return;
      }

      let newIndex = selectedIndex;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (e.key === 'ArrowDown') {
          newIndex = Math.min(selectedIndex + 1, things.length - 1);
        } else {
          newIndex = Math.max(selectedIndex - 1, 0);
        }
        
        if (newIndex >= 0 && newIndex < things.length) {
          const thing = things[newIndex];
          handleThingClick(thing.id);
          // Scroll into view
          setTimeout(() => {
            const element = document.querySelector(`[data-thing-id="${thing.id}"]`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 0);
        }
      }
    };

    listElement.addEventListener('keydown', handleKeyDown);
    return () => listElement.removeEventListener('keydown', handleKeyDown);
  }, [things, selectedThingIds]);

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
        <div className="loading-spinner"></div>
        <p>Loading {currentCategory}...</p>
      </div>
    );
  }

  return (
    <div className="thing-list" ref={listRef} tabIndex={0}>
      {things.length === 0 ? (
        <div className="thing-list-empty">
          <p>No {currentCategory} found</p>
          <p className="thing-list-empty-hint">
            {currentCategory === 'item' && 'Load a project to see items'}
            {currentCategory === 'outfit' && 'Load a project to see outfits'}
            {currentCategory === 'effect' && 'Load a project to see effects'}
            {currentCategory === 'missile' && 'Load a project to see missiles'}
          </p>
        </div>
      ) : (
        <>
          <div className="thing-list-header">
            <span className="thing-list-count">{things.length} {currentCategory}</span>
          </div>
          <div className="thing-list-items">
            {things.map((thing) => (
              <div
                key={thing.id}
                data-thing-id={thing.id}
                className={`thing-list-item ${
                  selectedThingIds.includes(thing.id) ? 'selected' : ''
                }`}
                onClick={() => handleThingClick(thing.id)}
                title={`Thing #${thing.id}${thing.name ? ` - ${thing.name}` : ''}`}
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
        </>
      )}
    </div>
  );
};

