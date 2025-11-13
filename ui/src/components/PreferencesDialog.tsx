import React, { useState, useEffect } from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { HotkeyInput } from './HotkeyInput';
import { useWorker } from '../contexts/WorkerContext';
import { useToast } from '../hooks/useToast';
import { CommandFactory } from '../services/CommandFactory';
import { getHotkeyManager } from '../services/HotkeyManager';
import { Hotkey } from '../services/Hotkey';
import { HotkeyDefinition } from '../services/HotkeyDefinition';
import './PreferencesDialog.css';

interface PreferencesDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (settings: any) => void;
}

export const PreferencesDialog: React.FC<PreferencesDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const worker = useWorker();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<'general' | 'hotkeys'>('general');
  const [settings, setSettings] = useState({
    objectsListAmount: 100,
    spritesListAmount: 100,
    autosaveThingChanges: false,
  });
  const [hotkeyDefinitions, setHotkeyDefinitions] = useState<HotkeyDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const hotkeyManager = getHotkeyManager();

  useEffect(() => {
    // Listen for settings from backend
    // Settings are sent via SettingsCommand when app initializes
    const handleCommand = (command: any) => {
      if (command.type === 'SettingsCommand' && command.data && command.data.settings) {
        const settingsData = command.data.settings;
        setSettings({
          objectsListAmount: settingsData.objectsListAmount || 100,
          spritesListAmount: settingsData.spritesListAmount || 100,
          autosaveThingChanges: settingsData.autosaveThingChanges || false,
        });
        
        // Load hotkeys from settings
        if (settingsData.hotkeysConfig) {
          hotkeyManager.load({ hotkeysConfig: settingsData.hotkeysConfig });
        }
      }
    };

    worker.onCommand(handleCommand);
    
    // Load hotkey definitions
    setHotkeyDefinitions(hotkeyManager.definitions);
    
    // Listen for hotkey changes
    const handleHotkeyChanged = () => {
      setHotkeyDefinitions([...hotkeyManager.definitions]);
    };
    
    hotkeyManager.on('hotkey_changed', handleHotkeyChanged);
    
    return () => {
      hotkeyManager.off('hotkey_changed', handleHotkeyChanged);
    };
  }, [open, worker]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Persist hotkeys to settings
      const tempSettings: any = {};
      hotkeyManager.persist(tempSettings);
      
      // Create settings object matching ObjectBuilderSettings structure
      const settingsData = {
        objectsListAmount: settings.objectsListAmount,
        spritesListAmount: settings.spritesListAmount,
        autosaveThingChanges: settings.autosaveThingChanges,
        hotkeysConfig: tempSettings.hotkeysConfig || null,
      };

      // Send settings to backend via SettingsCommand
      const command = CommandFactory.createSettingsCommand(settingsData);
      const result = await worker.sendCommand(command);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save settings');
      }
      
      if (onSave) {
        onSave(settingsData);
      }
      
      showSuccess('Preferences saved');
      onClose();
    } catch (error: any) {
      showError(error.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleHotkeyChange = (definition: HotkeyDefinition, hotkey: Hotkey | null) => {
    hotkeyManager.updateHotkey(definition.id, hotkey);
  };

  const handleResetHotkey = (definition: HotkeyDefinition) => {
    hotkeyManager.resetHotkey(definition.id);
  };

  const handleResetAllHotkeys = () => {
    if (confirm('Reset all hotkeys to defaults?')) {
      hotkeyDefinitions.forEach(def => {
        hotkeyManager.resetHotkey(def.id);
      });
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Preferences"
      width={600}
      height={500}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </>
      }
    >
      <div className="preferences-content">
        <div className="preferences-tabs">
          <button
            className={`preferences-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`preferences-tab ${activeTab === 'hotkeys' ? 'active' : ''}`}
            onClick={() => setActiveTab('hotkeys')}
          >
            Hotkeys
          </button>
        </div>

        {activeTab === 'general' && (
          <>
            <div className="preferences-section">
              <h4>List Settings</h4>
              <div className="preferences-field">
                <label>
                  Objects List Amount:
                  <input
                    type="number"
                    value={settings.objectsListAmount}
                    onChange={(e) =>
                      handleChange('objectsListAmount', parseInt(e.target.value) || 100)
                    }
                    min="10"
                    max="1000"
                  />
                </label>
              </div>
              <div className="preferences-field">
                <label>
                  Sprites List Amount:
                  <input
                    type="number"
                    value={settings.spritesListAmount}
                    onChange={(e) =>
                      handleChange('spritesListAmount', parseInt(e.target.value) || 100)
                    }
                    min="10"
                    max="1000"
                  />
                </label>
              </div>
            </div>

            <div className="preferences-section">
              <h4>Editor Settings</h4>
              <div className="preferences-field checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.autosaveThingChanges}
                    onChange={(e) => handleChange('autosaveThingChanges', e.target.checked)}
                  />
                  Auto-save thing changes
                </label>
              </div>
            </div>
          </>
        )}

        {activeTab === 'hotkeys' && (
          <div className="preferences-section">
            <div className="hotkeys-header">
              <h4>Keyboard Shortcuts</h4>
              <Button variant="secondary" onClick={handleResetAllHotkeys} size="small">
                Reset All
              </Button>
            </div>
            <div className="hotkeys-list">
              {hotkeyDefinitions.length === 0 ? (
                <div className="hotkeys-empty">No hotkeys registered. They will appear here when registered.</div>
              ) : (
                hotkeyDefinitions.map((def) => (
                  <div key={def.id} className="hotkey-item">
                    <div className="hotkey-label">
                      <span className="hotkey-name">{def.label}</span>
                      <span className="hotkey-category">{def.category}</span>
                    </div>
                    <div className="hotkey-controls">
                      <HotkeyInput
                        value={def.hotkey}
                        onChange={(hotkey) => handleHotkeyChange(def, hotkey)}
                        placeholder="No shortcut"
                      />
                      {!def.usesDefault() && (
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => handleResetHotkey(def)}
                          title="Reset to default"
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

