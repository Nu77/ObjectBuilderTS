import React, { useState, useEffect } from 'react';
import { useWorker } from '../contexts/WorkerContext';
import { Panel } from './Panel';
import './FileInfoPanel.css';

interface FileInfoPanelProps {
  onClose?: () => void;
}

interface ClientInfo {
  loaded: boolean;
  clientVersion?: number;
  clientVersionStr?: string;
  datSignature?: number;
  sprSignature?: number;
  itemsCount?: number;
  outfitsCount?: number;
  effectsCount?: number;
  missilesCount?: number;
  spritesCount?: number;
  extended?: boolean;
  transparency?: boolean;
  improvedAnimations?: boolean;
  frameGroups?: boolean;
  changed?: boolean;
  isTemporary?: boolean;
}

export const FileInfoPanel: React.FC<FileInfoPanelProps> = ({ onClose }) => {
  const worker = useWorker();
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);

  useEffect(() => {
    const handleCommand = (command: any) => {
      if (command.type === 'SetClientInfoCommand' && command.data) {
        setClientInfo(command.data);
      }
    };

    worker.onCommand(handleCommand);
  }, [worker]);

  if (!clientInfo || !clientInfo.loaded) {
    return (
      <Panel
        title="File Information"
        className="file-info-panel"
        onClose={onClose}
        collapsible={true}
      >
        <div className="file-info-empty">
          <p>No files loaded</p>
          <p className="file-info-hint">Load a project to see file information</p>
        </div>
      </Panel>
    );
  }

  const formatSignature = (sig: number | undefined): string => {
    if (sig === undefined) return 'N/A';
    return '0x' + sig.toString(16).toUpperCase().padStart(8, '0');
  };

  const formatCount = (count: number | undefined): string => {
    if (count === undefined) return '0';
    return count.toLocaleString();
  };

  return (
    <Panel
      title="File Information"
      className="file-info-panel"
      onClose={onClose}
      collapsible={true}
    >
      <div className="file-info-content">
        <div className="file-info-section">
          <h4>Client Version</h4>
          <div className="file-info-field">
            <span className="file-info-label">Version:</span>
            <span className="file-info-value">
              {clientInfo.clientVersionStr || clientInfo.clientVersion || 'Unknown'}
            </span>
          </div>
        </div>

        <div className="file-info-section">
          <h4>DAT File</h4>
          <div className="file-info-field">
            <span className="file-info-label">Signature:</span>
            <span className="file-info-value file-info-signature">
              {formatSignature(clientInfo.datSignature)}
            </span>
          </div>
          <div className="file-info-field">
            <span className="file-info-label">Items:</span>
            <span className="file-info-value">{formatCount(clientInfo.itemsCount)}</span>
          </div>
          <div className="file-info-field">
            <span className="file-info-label">Outfits:</span>
            <span className="file-info-value">{formatCount(clientInfo.outfitsCount)}</span>
          </div>
          <div className="file-info-field">
            <span className="file-info-label">Effects:</span>
            <span className="file-info-value">{formatCount(clientInfo.effectsCount)}</span>
          </div>
          <div className="file-info-field">
            <span className="file-info-label">Missiles:</span>
            <span className="file-info-value">{formatCount(clientInfo.missilesCount)}</span>
          </div>
        </div>

        <div className="file-info-section">
          <h4>SPR File</h4>
          <div className="file-info-field">
            <span className="file-info-label">Signature:</span>
            <span className="file-info-value file-info-signature">
              {formatSignature(clientInfo.sprSignature)}
            </span>
          </div>
          <div className="file-info-field">
            <span className="file-info-label">Sprites:</span>
            <span className="file-info-value">{formatCount(clientInfo.spritesCount)}</span>
          </div>
        </div>

        <div className="file-info-section">
          <h4>Features</h4>
          <div className="file-info-features">
            {clientInfo.extended && (
              <span className="file-info-feature">Extended</span>
            )}
            {clientInfo.transparency && (
              <span className="file-info-feature">Transparency</span>
            )}
            {clientInfo.improvedAnimations && (
              <span className="file-info-feature">Improved Animations</span>
            )}
            {clientInfo.frameGroups && (
              <span className="file-info-feature">Frame Groups</span>
            )}
            {!clientInfo.extended && !clientInfo.transparency && 
             !clientInfo.improvedAnimations && !clientInfo.frameGroups && (
              <span className="file-info-feature-none">None</span>
            )}
          </div>
        </div>

        {clientInfo.changed && (
          <div className="file-info-status">
            <span className="file-info-status-indicator changed">●</span>
            <span>Unsaved changes</span>
          </div>
        )}
      </div>
    </Panel>
  );
};

