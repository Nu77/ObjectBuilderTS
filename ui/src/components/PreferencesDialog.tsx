import React, { useState, useEffect } from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
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
  const [settings, setSettings] = useState({
    objectsListAmount: 100,
    spritesListAmount: 100,
    autosaveThingChanges: false,
  });

  useEffect(() => {
    // TODO: Load settings from backend
    // For now, use defaults
  }, [open]);

  const handleSave = () => {
    if (onSave) {
      onSave(settings);
    }
    onClose();
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
      width={500}
      height={400}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </>
      }
    >
      <div className="preferences-content">
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
      </div>
    </Dialog>
  );
};

