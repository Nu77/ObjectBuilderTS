import React, { useState, useEffect, useRef } from 'react';
import { Hotkey } from '../services/Hotkey';
import './HotkeyInput.css';

interface HotkeyInputProps {
  value: Hotkey | null;
  onChange: (hotkey: Hotkey | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const HotkeyInput: React.FC<HotkeyInputProps> = ({
  value,
  onChange,
  placeholder = 'Press a key combination...',
  disabled = false,
}) => {
  const [displayValue, setDisplayValue] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      setDisplayValue(value.toString());
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    e.preventDefault();
    e.stopPropagation();

    // Handle delete/backspace to clear
    if ((e.keyCode === 46 || e.keyCode === 8) && !e.ctrlKey && !e.altKey && !e.shiftKey) {
      onChange(null);
      setDisplayValue('');
      return;
    }

    const hotkey = Hotkey.fromKeyboardEvent(e.nativeEvent);
    if (hotkey) {
      onChange(hotkey);
      setDisplayValue(hotkey.toString());
    }
  };

  const handleFocus = () => {
    if (!disabled) {
      setIsCapturing(true);
      setDisplayValue('');
    }
  };

  const handleBlur = () => {
    setIsCapturing(false);
    if (value) {
      setDisplayValue(value.toString());
    } else {
      setDisplayValue('');
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      className={`hotkey-input ${isCapturing ? 'capturing' : ''}`}
      value={isCapturing ? '' : displayValue}
      placeholder={isCapturing ? 'Press keys...' : placeholder}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
      readOnly
    />
  );
};

