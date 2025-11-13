import React, { useState } from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import './NewProjectDialog.css';

interface NewProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (options: {
    datSignature: number;
    sprSignature: number;
    extended: boolean;
    transparency: boolean;
    improvedAnimations: boolean;
    frameGroups: boolean;
  }) => void;
}

// Common signatures for different client versions
const COMMON_SIGNATURES = {
  '7.72': { dat: 0x4441541A, spr: 0x5350521B },
  '8.60': { dat: 0x4441541A, spr: 0x5350521B },
  '10.98': { dat: 0x4441541A, spr: 0x5350521B },
  '12.00': { dat: 0x4441541A, spr: 0x5350521B },
};

export const NewProjectDialog: React.FC<NewProjectDialogProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const [datSignature, setDatSignature] = useState<string>('4441541A');
  const [sprSignature, setSprSignature] = useState<string>('5350521B');
  const [options, setOptions] = useState({
    extended: false,
    transparency: false,
    improvedAnimations: false,
    frameGroups: false,
  });

  const handleCreate = () => {
    const datSig = parseInt(datSignature, 16);
    const sprSig = parseInt(sprSignature, 16);
    
    if (isNaN(datSig) || isNaN(sprSig)) {
      alert('Invalid signature format. Please use hexadecimal values.');
      return;
    }

    onCreate({
      datSignature: datSig,
      sprSignature: sprSig,
      ...options,
    });
    onClose();
  };

  const handlePresetChange = (preset: keyof typeof COMMON_SIGNATURES) => {
    const sigs = COMMON_SIGNATURES[preset];
    setDatSignature(sigs.dat.toString(16).toUpperCase());
    setSprSignature(sigs.spr.toString(16).toUpperCase());
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
      title="Create New Project"
      width={550}
      height={500}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create</Button>
        </>
      }
    >
      <div className="new-project-content">
        <div className="new-project-section">
          <h4>File Signatures</h4>
          <div className="signature-presets">
            <label>Quick Presets:</label>
            <div className="preset-buttons">
              {Object.keys(COMMON_SIGNATURES).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className="preset-button"
                  onClick={() => handlePresetChange(preset as keyof typeof COMMON_SIGNATURES)}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
          <div className="signature-fields">
            <div className="signature-field">
              <label>
                DAT Signature (hex):
                <input
                  type="text"
                  value={datSignature}
                  onChange={(e) => setDatSignature(e.target.value.toUpperCase())}
                  placeholder="4441541A"
                  pattern="[0-9A-Fa-f]+"
                />
              </label>
            </div>
            <div className="signature-field">
              <label>
                SPR Signature (hex):
                <input
                  type="text"
                  value={sprSignature}
                  onChange={(e) => setSprSignature(e.target.value.toUpperCase())}
                  placeholder="5350521B"
                  pattern="[0-9A-Fa-f]+"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="new-project-section">
          <h4>Project Options</h4>
          <div className="new-project-options">
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

