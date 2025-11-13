import React, { useState } from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { FileDialogService } from '../services/FileDialogService';
import './MergeFilesDialog.css';

interface Version {
  value: number;
  valueStr: string;
  datSignature: number;
  sprSignature: number;
  otbVersion: number;
}

interface MergeFilesDialogProps {
  open: boolean;
  onClose: () => void;
  onMerge: (options: {
    datFile: string;
    sprFile: string;
    version: Version | null;
    extended: boolean;
    transparency: boolean;
    improvedAnimations: boolean;
    frameGroups: boolean;
  }) => void;
}

export const MergeFilesDialog: React.FC<MergeFilesDialogProps> = ({
  open,
  onClose,
  onMerge,
}) => {
  const [datFile, setDatFile] = useState<string>('');
  const [sprFile, setSprFile] = useState<string>('');
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [options, setOptions] = useState({
    extended: false,
    transparency: false,
    improvedAnimations: false,
    frameGroups: false,
  });

  const handleBrowseDat = async () => {
    try {
      const fileDialog = FileDialogService.getInstance();
      const result = await fileDialog.showOpenDialog({
        title: 'Select DAT File to Merge',
        filters: [
          { name: 'DAT Files', extensions: ['dat'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
        setDatFile(result.filePaths[0]);
      }
    } catch (error) {
      console.error('Failed to open file dialog:', error);
    }
  };

  const handleBrowseSpr = async () => {
    try {
      const fileDialog = FileDialogService.getInstance();
      const result = await fileDialog.showOpenDialog({
        title: 'Select SPR File to Merge',
        filters: [
          { name: 'SPR Files', extensions: ['spr'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
        setSprFile(result.filePaths[0]);
      }
    } catch (error) {
      console.error('Failed to open file dialog:', error);
    }
  };

  const handleOptionChange = (key: keyof typeof options, value: boolean) => {
    setOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMerge = () => {
    if (!datFile || !sprFile) {
      alert('Please select both DAT and SPR files to merge.');
      return;
    }

    onMerge({
      datFile,
      sprFile,
      version: selectedVersion,
      ...options,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Merge Project Files"
      width={550}
      height={550}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleMerge} disabled={!datFile || !sprFile}>
            Merge
          </Button>
        </>
      }
    >
      <div className="merge-files-content">
        <div className="merge-files-section">
          <h4>Source Files</h4>
          <p className="merge-info">
            Select the DAT and SPR files you want to merge into the current project.
            All things and sprites from the selected files will be added to the current project.
          </p>
        </div>

        <div className="merge-files-section">
          <h4>Files to Merge</h4>
          <div className="merge-file-field">
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
          <div className="merge-file-field">
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

        <div className="merge-files-section">
          <h4>Client Version</h4>
          <div className="version-info">
            <p>Version will be auto-detected from file signatures.</p>
            <p className="version-hint">
              If you need to specify a version, ensure versions.xml is loaded.
            </p>
          </div>
        </div>

        <div className="merge-files-section">
          <h4>Merge Options</h4>
          <div className="merge-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={options.extended}
                onChange={(e) => handleOptionChange('extended', e.target.checked)}
              />
              <span>Extended (8.60+)</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={options.transparency}
                onChange={(e) => handleOptionChange('transparency', e.target.checked)}
              />
              <span>Transparency</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={options.improvedAnimations}
                onChange={(e) => handleOptionChange('improvedAnimations', e.target.checked)}
              />
              <span>Improved Animations</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={options.frameGroups}
                onChange={(e) => handleOptionChange('frameGroups', e.target.checked)}
              />
              <span>Frame Groups</span>
            </label>
          </div>
        </div>

        <div className="merge-files-section">
          <div className="merge-warning">
            <strong>Warning:</strong> Merging files will add all things and sprites from the selected files
            to your current project. Make sure you have saved your current work before merging.
          </div>
        </div>
      </div>
    </Dialog>
  );
};

