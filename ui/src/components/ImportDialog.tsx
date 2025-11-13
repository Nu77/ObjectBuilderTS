import React, { useState } from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { FileDialogService } from '../services/FileDialogService';
import './ImportDialog.css';

type ImportType = 'things' | 'sprites';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (options: {
    type: ImportType;
    files: string[];
  }) => void;
  importType?: ImportType;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
  open,
  onClose,
  onImport,
  importType = 'things',
}) => {
  const [type, setType] = useState<ImportType>(importType);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const handleBrowseFiles = async () => {
    try {
      const fileDialog = FileDialogService.getInstance();
      let result;
      
      if (type === 'things') {
        result = await fileDialog.openOBDFile();
      } else {
        result = await fileDialog.openImageFiles();
      }

      if (!result.canceled && result.filePaths) {
        setSelectedFiles(result.filePaths);
      }
    } catch (error) {
      console.error('Failed to open file dialog:', error);
    }
  };

  const handleImport = () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one file to import.');
      return;
    }

    onImport({
      type,
      files: selectedFiles,
    });
    onClose();
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Import"
      width={600}
      height={500}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={selectedFiles.length === 0}>
            Import
          </Button>
        </>
      }
    >
      <div className="import-content">
        <div className="import-section">
          <h4>Import Type</h4>
          <div className="import-type-options">
            <label className="radio-label">
              <input
                type="radio"
                name="importType"
                value="things"
                checked={type === 'things'}
                onChange={(e) => {
                  setType(e.target.value as ImportType);
                  setSelectedFiles([]);
                }}
              />
              <span>Things (.obd files)</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="importType"
                value="sprites"
                checked={type === 'sprites'}
                onChange={(e) => {
                  setType(e.target.value as ImportType);
                  setSelectedFiles([]);
                }}
              />
              <span>Sprites (Image files)</span>
            </label>
          </div>
        </div>

        <div className="import-section">
          <h4>Files</h4>
          <div className="import-files-controls">
            <Button variant="secondary" onClick={handleBrowseFiles}>
              Browse Files...
            </Button>
            {selectedFiles.length > 0 && (
              <span className="file-count">{selectedFiles.length} file(s) selected</span>
            )}
          </div>
          {selectedFiles.length > 0 && (
            <div className="import-files-list">
              {selectedFiles.map((file, index) => (
                <div key={index} className="import-file-item">
                  <span className="file-name" title={file}>
                    {file.split(/[/\\]/).pop()}
                  </span>
                  <button
                    type="button"
                    className="remove-file-button"
                    onClick={() => handleRemoveFile(index)}
                    aria-label="Remove file"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="import-section">
          <div className="import-info">
            <p>
              {type === 'things' ? (
                <>
                  Select one or more .obd files to import things into the current project.
                  Each file should contain thing data in Object Builder format.
                </>
              ) : (
                <>
                  Select one or more image files (PNG, JPEG, BMP, GIF) to import as sprites.
                  Images will be converted to 32x32 sprites.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

