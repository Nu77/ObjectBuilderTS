import React, { useState, useEffect, useCallback } from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { useWorker } from '../contexts/WorkerContext';
import { useAppStateContext } from '../contexts/AppStateContext';
import { CommandFactory } from '../services/CommandFactory';
import { useToast } from '../hooks/useToast';
import { SpriteThumbnail } from './SpriteThumbnail';
import './FindDialog.css';

interface FindDialogProps {
  open: boolean;
  onClose: () => void;
}

type TabType = 'things' | 'sprites';

interface ThingProperty {
  property: string;
  value: any;
}

export const FindDialog: React.FC<FindDialogProps> = ({ open, onClose }) => {
  const worker = useWorker();
  const { currentCategory, setSelectedThingIds, setSelectedSpriteIds } = useAppStateContext();
  const { showError } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('things');
  const [searchCategory, setSearchCategory] = useState<string>(currentCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [thingResults, setThingResults] = useState<any[]>([]);
  const [spriteResults, setSpriteResults] = useState<any[]>([]);
  const [selectedThingIds, setSelectedThingIdsLocal] = useState<number[]>([]);
  const [selectedSpriteIds, setSelectedSpriteIdsLocal] = useState<number[]>([]);
  
  // Property-based search for things
  const [thingProperties, setThingProperties] = useState<Record<string, boolean>>({});
  const [thingName, setThingName] = useState<string>('');
  
  // Sprite search options
  const [unusedSprites, setUnusedSprites] = useState<boolean>(false);
  const [emptySprites, setEmptySprites] = useState<boolean>(false);

  // Update search category when currentCategory changes
  useEffect(() => {
    if (open) {
      setSearchCategory(currentCategory);
    }
  }, [currentCategory, open]);

  // Handle property checkbox change
  const handlePropertyChange = useCallback((property: string, checked: boolean) => {
    setThingProperties(prev => {
      const next = { ...prev };
      if (checked) {
        next[property] = true;
      } else {
        delete next[property];
      }
      return next;
    });
  }, []);

  // Find things based on properties
  const handleFindThings = useCallback(async () => {
    setSearching(true);
    setThingResults([]);
    setSelectedThingIdsLocal([]);

    try {
      const properties: ThingProperty[] = [];
      
      // Add property-based filters
      Object.keys(thingProperties).forEach(prop => {
        if (thingProperties[prop]) {
          properties.push({
            property: prop,
            value: true,
          });
        }
      });

      // Add name search if provided
      if (thingName.trim()) {
        properties.push({
          property: 'marketName',
          value: thingName.trim(),
        });
      }

      // Add ID search if searchTerm is a number
      if (searchTerm.trim() && !isNaN(Number(searchTerm.trim()))) {
        properties.push({
          property: 'id',
          value: parseInt(searchTerm.trim()),
        });
      }

      if (properties.length === 0 && !searchTerm.trim()) {
        showError('Please select at least one property or enter a search term');
        setSearching(false);
        return;
      }

      const command = CommandFactory.createFindThingCommand(searchCategory, properties);
      await worker.sendCommand(command);
    } catch (error: any) {
      setSearching(false);
      showError(error.message || 'Search failed');
    }
  }, [thingProperties, thingName, searchTerm, searchCategory, worker, showError]);

  // Find sprites
  const handleFindSprites = useCallback(async () => {
    if (!unusedSprites && !emptySprites) {
      showError('Please select at least one search option');
      return;
    }

    setSearching(true);
    setSpriteResults([]);
    setSelectedSpriteIdsLocal([]);

    try {
      const command = CommandFactory.createFindSpritesCommand(unusedSprites, emptySprites);
      await worker.sendCommand(command);
    } catch (error: any) {
      setSearching(false);
      showError(error.message || 'Search failed');
    }
  }, [unusedSprites, emptySprites, worker, showError]);

  // Listen for FindResultCommand
  useEffect(() => {
    const handleCommand = (command: any) => {
      if (command.type === 'FindResultCommand') {
        if (command.data?.type === 'things') {
          setThingResults(command.data.list || []);
        } else if (command.data?.type === 'sprites') {
          setSpriteResults(command.data.list || []);
        }
        setSearching(false);
      }
    };

    worker.onCommand(handleCommand);
    return () => {
      // Cleanup handled by worker context
    };
  }, [worker]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (activeTab === 'things') {
        handleFindThings();
      } else {
        handleFindSprites();
      }
    }
  };

  // Handle thing result click
  const handleThingClick = useCallback(async (thing: any) => {
    if (thing && thing.id !== undefined) {
      setSelectedThingIds([thing.id]);
      
      try {
        const command = CommandFactory.createGetThingCommand(thing.id, searchCategory);
        await worker.sendCommand(command);
        onClose();
      } catch (error: any) {
        console.error('Failed to load thing:', error);
        showError('Failed to load thing');
      }
    }
  }, [searchCategory, worker, showError, onClose]);

  // Handle sprite result click
  const handleSpriteClick = useCallback(async (sprite: any) => {
    if (sprite && sprite.id !== undefined) {
      setSelectedSpriteIds([sprite.id]);
      
      try {
        const command = CommandFactory.createGetSpriteListCommand(sprite.id);
        await worker.sendCommand(command);
        onClose();
      } catch (error: any) {
        console.error('Failed to load sprite:', error);
        showError('Failed to load sprite');
      }
    }
  }, [worker, showError, onClose]);

  // Handle thing selection toggle
  const handleThingToggle = useCallback((thingId: number, checked: boolean) => {
    setSelectedThingIdsLocal(prev => {
      if (checked) {
        return [...prev, thingId];
      } else {
        return prev.filter(id => id !== thingId);
      }
    });
  }, []);

  // Handle sprite selection toggle
  const handleSpriteToggle = useCallback((spriteId: number, checked: boolean) => {
    setSelectedSpriteIdsLocal(prev => {
      if (checked) {
        return [...prev, spriteId];
      } else {
        return prev.filter(id => id !== spriteId);
      }
    });
  }, []);

  // Select all results
  const handleSelectAll = useCallback(() => {
    if (activeTab === 'things') {
      setSelectedThingIdsLocal(thingResults.map(r => r.id || r.thing?.id).filter(Boolean));
    } else {
      setSelectedSpriteIdsLocal(spriteResults.map(r => r.id).filter(Boolean));
    }
  }, [activeTab, thingResults, spriteResults]);

  // Select clicked result
  const handleSelect = useCallback(() => {
    if (activeTab === 'things' && selectedThingIdsLocal.length > 0) {
      setSelectedThingIds(selectedThingIdsLocal);
      onClose();
    } else if (activeTab === 'sprites' && selectedSpriteIdsLocal.length > 0) {
      setSelectedSpriteIds(selectedSpriteIdsLocal);
      onClose();
    }
  }, [activeTab, selectedThingIdsLocal, selectedSpriteIdsLocal, setSelectedThingIds, setSelectedSpriteIds, onClose]);

  if (!open) return null;

  return (
    <div className="find-dialog-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="find-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="find-dialog-header">
          <h2>Find</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="find-dialog-tabs">
          <button
            className={`find-tab ${activeTab === 'things' ? 'active' : ''}`}
            onClick={() => setActiveTab('things')}
          >
            Objects
          </button>
          <button
            className={`find-tab ${activeTab === 'sprites' ? 'active' : ''}`}
            onClick={() => setActiveTab('sprites')}
          >
            Sprites
          </button>
        </div>

        <div className="find-dialog-content">
          {activeTab === 'things' ? (
            <>
              {/* Properties Panel */}
              <div className="find-properties-panel">
                <h3>Properties</h3>
                <div className="find-category-select">
                  <label>Category:</label>
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                  >
                    <option value="item">Item</option>
                    <option value="outfit">Outfit</option>
                    <option value="effect">Effect</option>
                    <option value="missile">Missile</option>
                  </select>
                </div>
                
                <div className="find-properties-list">
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.isGround || false}
                      onChange={(e) => handlePropertyChange('isGround', e.target.checked)}
                    />
                    Is Ground
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.isGroundBorder || false}
                      onChange={(e) => handlePropertyChange('isGroundBorder', e.target.checked)}
                    />
                    Is Ground Border
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.isOnBottom || false}
                      onChange={(e) => handlePropertyChange('isOnBottom', e.target.checked)}
                    />
                    Is On Bottom
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.isOnTop || false}
                      onChange={(e) => handlePropertyChange('isOnTop', e.target.checked)}
                    />
                    Is On Top
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.hasLight || false}
                      onChange={(e) => handlePropertyChange('hasLight', e.target.checked)}
                    />
                    Has Light
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.miniMap || false}
                      onChange={(e) => handlePropertyChange('miniMap', e.target.checked)}
                    />
                    Automap
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.hasOffset || false}
                      onChange={(e) => handlePropertyChange('hasOffset', e.target.checked)}
                    />
                    Has Offset
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.hasElevation || false}
                      onChange={(e) => handlePropertyChange('hasElevation', e.target.checked)}
                    />
                    Has Elevation
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.cloth || false}
                      onChange={(e) => handlePropertyChange('cloth', e.target.checked)}
                    />
                    Cloth
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.isMarketItem || false}
                      onChange={(e) => handlePropertyChange('isMarketItem', e.target.checked)}
                    />
                    Market Item
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.writable || false}
                      onChange={(e) => handlePropertyChange('writable', e.target.checked)}
                    />
                    Writable
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.writableOnce || false}
                      onChange={(e) => handlePropertyChange('writableOnce', e.target.checked)}
                    />
                    Writable Once
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.hasDefaultAction || false}
                      onChange={(e) => handlePropertyChange('hasDefaultAction', e.target.checked)}
                    />
                    Has Action
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.isContainer || false}
                      onChange={(e) => handlePropertyChange('isContainer', e.target.checked)}
                    />
                    Container
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.stackable || false}
                      onChange={(e) => handlePropertyChange('stackable', e.target.checked)}
                    />
                    Stackable
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.forceUse || false}
                      onChange={(e) => handlePropertyChange('forceUse', e.target.checked)}
                    />
                    Force Use
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.multiUse || false}
                      onChange={(e) => handlePropertyChange('multiUse', e.target.checked)}
                    />
                    Multi Use
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.isFluidContainer || false}
                      onChange={(e) => handlePropertyChange('isFluidContainer', e.target.checked)}
                    />
                    Fluid Container
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.isFluid || false}
                      onChange={(e) => handlePropertyChange('isFluid', e.target.checked)}
                    />
                    Fluid
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.isUnpassable || false}
                      onChange={(e) => handlePropertyChange('isUnpassable', e.target.checked)}
                    />
                    Unpassable
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.isUnmoveable || false}
                      onChange={(e) => handlePropertyChange('isUnmoveable', e.target.checked)}
                    />
                    Unmoveable
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.blockMissile || false}
                      onChange={(e) => handlePropertyChange('blockMissile', e.target.checked)}
                    />
                    Block Missile
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.blockPathfind || false}
                      onChange={(e) => handlePropertyChange('blockPathfind', e.target.checked)}
                    />
                    Block Pathfind
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.noMoveAnimation || false}
                      onChange={(e) => handlePropertyChange('noMoveAnimation', e.target.checked)}
                    />
                    No Move Animation
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.pickupable || false}
                      onChange={(e) => handlePropertyChange('pickupable', e.target.checked)}
                    />
                    Pickupable
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.hangable || false}
                      onChange={(e) => handlePropertyChange('hangable', e.target.checked)}
                    />
                    Hangable
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.isHorizontal || false}
                      onChange={(e) => handlePropertyChange('isHorizontal', e.target.checked)}
                    />
                    Horizontal Wall
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.isVertical || false}
                      onChange={(e) => handlePropertyChange('isVertical', e.target.checked)}
                    />
                    Vertical Wall
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.rotatable || false}
                      onChange={(e) => handlePropertyChange('rotatable', e.target.checked)}
                    />
                    Rotatable
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.dontHide || false}
                      onChange={(e) => handlePropertyChange('dontHide', e.target.checked)}
                    />
                    Don't Hide
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.isTranslucent || false}
                      onChange={(e) => handlePropertyChange('isTranslucent', e.target.checked)}
                    />
                    Translucent
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.isLyingObject || false}
                      onChange={(e) => handlePropertyChange('isLyingObject', e.target.checked)}
                    />
                    Lying Object
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.animateAlways || false}
                      onChange={(e) => handlePropertyChange('animateAlways', e.target.checked)}
                    />
                    Animate Always
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.isFullGround || false}
                      onChange={(e) => handlePropertyChange('isFullGround', e.target.checked)}
                    />
                    Full Ground
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.ignoreLook || false}
                      onChange={(e) => handlePropertyChange('ignoreLook', e.target.checked)}
                    />
                    Ignore Look
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.wrappable || false}
                      onChange={(e) => handlePropertyChange('wrappable', e.target.checked)}
                    />
                    Wrappable
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.unwrappable || false}
                      onChange={(e) => handlePropertyChange('unwrappable', e.target.checked)}
                    />
                    Unwrappable
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.topEffect || false}
                      onChange={(e) => handlePropertyChange('topEffect', e.target.checked)}
                    />
                    Top Effect
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.usable || false}
                      onChange={(e) => handlePropertyChange('usable', e.target.checked)}
                    />
                    Usable
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.hasCharges || false}
                      onChange={(e) => handlePropertyChange('hasCharges', e.target.checked)}
                    />
                    Has Charges
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.floorChange || false}
                      onChange={(e) => handlePropertyChange('floorChange', e.target.checked)}
                    />
                    Floor Change
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={thingProperties.isLensHelp || false}
                      onChange={(e) => handlePropertyChange('isLensHelp', e.target.checked)}
                    />
                    Lens Help
                  </label>
                  
                  <div className="find-name-input">
                    <label>Name:</label>
                    <input
                      type="text"
                      value={thingName}
                      onChange={(e) => setThingName(e.target.value)}
                      placeholder="Market name..."
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                  
                  <div className="find-id-input">
                    <label>ID:</label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Thing ID..."
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                </div>
              </div>

              {/* Results Panel */}
              <div className="find-results-panel">
                <h3>Found ({thingResults.length})</h3>
                <div className="find-results-list">
                  {searching ? (
                    <div className="find-loading">Searching...</div>
                  ) : thingResults.length === 0 ? (
                    <div className="find-placeholder">No results. Use properties to search.</div>
                  ) : (
                    thingResults.map((result, index) => {
                      const thingId = result.id || result.thing?.id;
                      const isSelected = selectedThingIdsLocal.includes(thingId);
                      return (
                        <div
                          key={index}
                          className={`find-result-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleThingToggle(thingId, !isSelected)}
                          onDoubleClick={() => handleThingClick(result)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleThingToggle(thingId, e.target.checked);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="find-result-preview">
                            {result.spritePixels || result.pixels ? (
                              <SpriteThumbnail
                                pixels={result.spritePixels || result.pixels}
                                size={32}
                                scale={1}
                                format={result.spritePixels ? 'argb' : 'rgba'}
                              />
                            ) : (
                              <div className="find-result-placeholder">#{thingId}</div>
                            )}
                          </div>
                          <div className="find-result-info">
                            <div className="find-result-id">#{thingId}</div>
                            {result.name && (
                              <div className="find-result-name">{result.name}</div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Sprite Search Properties */}
              <div className="find-properties-panel">
                <h3>Properties</h3>
                <div className="find-properties-list">
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={unusedSprites}
                      onChange={(e) => setUnusedSprites(e.target.checked)}
                    />
                    Unused Sprites
                  </label>
                  <label className="find-checkbox-label">
                    <input
                      type="checkbox"
                      checked={emptySprites}
                      onChange={(e) => setEmptySprites(e.target.checked)}
                    />
                    Empty Sprites
                  </label>
                </div>
              </div>

              {/* Sprite Results Panel */}
              <div className="find-results-panel">
                <h3>Found ({spriteResults.length})</h3>
                <div className="find-results-list">
                  {searching ? (
                    <div className="find-loading">Searching...</div>
                  ) : spriteResults.length === 0 ? (
                    <div className="find-placeholder">No results. Select search options.</div>
                  ) : (
                    spriteResults.map((result, index) => {
                      const spriteId = result.id;
                      const isSelected = selectedSpriteIdsLocal.includes(spriteId);
                      return (
                        <div
                          key={index}
                          className={`find-result-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSpriteToggle(spriteId, !isSelected)}
                          onDoubleClick={() => handleSpriteClick(result)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSpriteToggle(spriteId, e.target.checked);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="find-result-preview">
                            {result.pixels ? (
                              <SpriteThumbnail
                                pixels={result.pixels}
                                size={32}
                                scale={1}
                                format="argb"
                              />
                            ) : (
                              <div className="find-result-placeholder">#{spriteId}</div>
                            )}
                          </div>
                          <div className="find-result-info">
                            <div className="find-result-id">#{spriteId}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="find-dialog-footer">
          <Button
            onClick={activeTab === 'things' ? handleFindThings : handleFindSprites}
            disabled={searching}
          >
            {searching ? 'Searching...' : 'Find'}
          </Button>
          <Button
            onClick={handleSelectAll}
            disabled={searching || (activeTab === 'things' ? thingResults.length === 0 : spriteResults.length === 0)}
          >
            Select All
          </Button>
          <Button
            onClick={handleSelect}
            disabled={searching || (activeTab === 'things' ? selectedThingIdsLocal.length === 0 : selectedSpriteIdsLocal.length === 0)}
          >
            Select
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

