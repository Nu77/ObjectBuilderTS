import React, { useState } from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { FileDialogService } from '../services/FileDialogService';
import './CompileOptionsDialog.css';

interface CompileOptionsDialogProps {
  open: boolean;
  onClose: () => void;
  onCompile: (options: {
    useCustomLocation: boolean;
    datFile?: string;
    sprFile?: string;
  }) => void;
}

export const CompileOptionsDialog: React.FC<CompileOptionsDialogProps> = ({
  open,
  onClose,
  onCompile,
}) => {
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [datFile, setDatFile] = useState<string>('');
  const [sprFile, setSprFile] = useState<string>('');

  const handleBrowseDat = async () => {
    try {
      const fileDialog = FileDialogService.getInstance();
      const result = await fileDialog.showSaveDialog({
        title: 'Save DAT File',
        defaultPath: datFile || 'Tibia.dat',
        filters: [
          { name: 'DAT Files', extensions: ['dat'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (!result.canceled && result.filePath) {
        setDatFile(result.filePath);
      }
    } catch (error) {
      console.error('Failed to open file dialog:', error);
    }
  };

  const handleBrowseSpr = async () => {
    try {
      const fileDialog = FileDialogService.getInstance();
      const result = await fileDialog.showSaveDialog({
        title: 'Save SPR File',
        defaultPath: sprFile || 'Tibia.spr',
        filters: [
          { name: 'SPR Files', extensions: ['spr'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (!result.canceled && result.filePath) {
        setSprFile(result.filePath);
      }
    } catch (error) {
      console.error('Failed to open file dialog:', error);
    }
  };

  const handleCompile = () => {
    if (useCustomLocation && (!datFile || !sprFile)) {
      alert('Please select both DAT and SPR output files.');
      return;
    }

    onCompile({
      useCustomLocation,
      datFile: useCustomLocation ? datFile : undefined,
      sprFile: useCustomLocation ? sprFile : undefined,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Compile Options"
      width={550}
      height={400}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCompile}>Compile</Button>
        </>
      }
    >
      <div className="compile-options-content">
        <div className="compile-options-section">
          <h4>Output Location</h4>
          <label className="radio-label">
            <input
              type="radio"
              name="outputLocation"
              checked={!useCustomLocation}
              onChange={() => setUseCustomLocation(false)}
            />
            <span>Compile to current project location</span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="outputLocation"
              checked={useCustomLocation}
              onChange={() => setUseCustomLocation(true)}
            />
            <span>Compile to custom location</span>
          </label>
        </div>

        {useCustomLocation && (
          <div className="compile-options-section">
            <h4>Output Files</h4>
            <div className="compile-file-field">
              <label>DAT File:</label>
              <div className="file-input-group">
                <input
                  type="text"
                  value={datFile}
                  onChange={(e) => setDatFile(e.target.value)}
                  placeholder="Select DAT file..."
                  className="file-path-input"
                />
                <Button variant="secondary" onClick={handleBrowseDat}>
                  Browse...
                </Button>
              </div>
            </div>
            <div className="compile-file-field">
              <label>SPR File:</label>
              <div className="file-input-group">
                <input
                  type="text"
                  value={sprFile}
                  onChange={(e) => setSprFile(e.target.value)}
                  placeholder="Select SPR file..."
                  className="file-path-input"
                />
                <Button variant="secondary" onClick={handleBrowseSpr}>
                  Browse...
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

