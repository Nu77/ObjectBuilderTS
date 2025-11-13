import React, { useState, useEffect } from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { useWorker } from '../contexts/WorkerContext';
import { CommandFactory } from '../services/CommandFactory';
import './LoadFilesDialog.css';

interface Version {
  value: number;
  valueStr: string;
  datSignature: number;
  sprSignature: number;
  otbVersion: number;
}

interface LoadFilesDialogProps {
  open: boolean;
  onClose: () => void;
  onLoad: (options: {
    version: Version | null;
    extended: boolean;
    transparency: boolean;
    improvedAnimations: boolean;
    frameGroups: boolean;
  }) => void;
  datFile?: string;
  sprFile?: string;
}

export const LoadFilesDialog: React.FC<LoadFilesDialogProps> = ({
  open,
  onClose,
  onLoad,
  datFile,
  sprFile,
}) => {
  const worker = useWorker();
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    extended: false,
    transparency: false,
    improvedAnimations: false,
    frameGroups: false,
  });

  useEffect(() => {
    if (open) {
      loadVersions();
    }
  }, [open]);

  // Listen for versions data from backend
  useEffect(() => {
    const handleCommand = (command: any) => {
      // Listen for any command that might contain versions
      // Versions might be sent via a SetVersionsCommand or similar
      if (command.type === 'SetVersionsCommand' && command.data && command.data.versions) {
        setVersions(command.data.versions);
        setLoading(false);
      }
    };

    worker.onCommand(handleCommand);
  }, [worker]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      // Request versions list from backend
      const command = CommandFactory.createGetVersionsListCommand();
      await worker.sendCommand(command);
      // Versions will be received via SetVersionsCommand in the useEffect listener
    } catch (error) {
      console.error('Failed to load versions:', error);
      setLoading(false);
    }
  };

  const handleLoad = () => {
    if (!datFile || !sprFile) {
      return;
    }
    
    onLoad({
      version: selectedVersion,
      ...options,
    });
    onClose();
  };

  const handleOptionChange = (key: keyof typeof options, value: boolean) => {
    setOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Load Project Files"
      width={550}
      height={500}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleLoad} disabled={!datFile || !sprFile}>
            Load
          </Button>
        </>
      }
    >
      <div className="load-files-content">
        <div className="load-files-section">
          <h4>Files</h4>
          <div className="load-files-field">
            <label>DAT File:</label>
            <div className={`file-path ${datFile ? 'file-path-valid' : 'file-path-invalid'}`}>
              {datFile ? (
                <>
                  <span className="file-path-text" title={datFile}>
                    {datFile.split(/[/\\]/).pop() || datFile}
                  </span>
                  <span className="file-path-icon">✓</span>
                </>
              ) : (
                <span className="file-path-placeholder">Not selected</span>
              )}
            </div>
          </div>
          <div className="load-files-field">
            <label>SPR File:</label>
            <div className={`file-path ${sprFile ? 'file-path-valid' : 'file-path-invalid'}`}>
              {sprFile ? (
                <>
                  <span className="file-path-text" title={sprFile}>
                    {sprFile.split(/[/\\]/).pop() || sprFile}
                  </span>
                  <span className="file-path-icon">✓</span>
                </>
              ) : (
                <span className="file-path-placeholder">Not selected</span>
              )}
            </div>
          </div>
        </div>

        <div className="load-files-section">
          <h4>Client Version</h4>
          {loading ? (
            <div className="loading-versions">Loading versions...</div>
          ) : versions.length > 0 ? (
            <select
              className="version-select"
              value={selectedVersion?.valueStr || ''}
              onChange={(e) => {
                const version = versions.find((v) => v.valueStr === e.target.value);
                setSelectedVersion(version || null);
              }}
            >
              <option value="">Auto-detect (recommended)</option>
              {versions.map((version) => (
                <option key={version.valueStr} value={version.valueStr}>
                  {version.valueStr} (Client {version.value})
                </option>
              ))}
            </select>
          ) : (
            <div className="version-info">
              <p>Version will be auto-detected from file signatures.</p>
              <p className="version-hint">
                If you need to specify a version, ensure versions.xml is loaded.
              </p>
            </div>
          )}
        </div>

        <div className="load-files-section">
          <h4>Load Options</h4>
          <div className="load-files-options">
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
      </div>
    </Dialog>
  );
};

