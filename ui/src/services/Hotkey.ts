/**
 * Hotkey class representing a keyboard shortcut
 */
export class Hotkey {
  public keyCode: number;
  public ctrl: boolean;
  public shift: boolean;
  public alt: boolean;

  constructor(keyCode: number = 0, ctrl: boolean = false, shift: boolean = false, alt: boolean = false) {
    this.keyCode = keyCode;
    this.ctrl = ctrl;
    this.shift = shift;
    this.alt = alt;
  }

  /**
   * Create a Hotkey from a keyboard event
   */
  static fromKeyboardEvent(event: KeyboardEvent): Hotkey | null {
    if (!event) return null;

    const code = event.keyCode || event.which;

    // Ignore modifier-only presses
    if (Hotkey.isModifierKey(code)) return null;

    const ctrl = event.ctrlKey || event.metaKey; // metaKey for Mac Cmd
    const alt = event.altKey;
    const shift = event.shiftKey;

    return new Hotkey(code, ctrl, shift, alt);
  }

  /**
   * Create a Hotkey from a config string (format: "keyCode:ctrl:shift:alt")
   */
  static fromConfigString(value: string): Hotkey | null {
    if (!value) return null;

    const parts = value.split(':');
    if (parts.length !== 4) return null;

    const code = parseInt(parts[0], 10);
    const ctrl = parts[1] === '1';
    const shift = parts[2] === '1';
    const alt = parts[3] === '1';

    if (code === 0 || isNaN(code)) return null;

    return new Hotkey(code, ctrl, shift, alt);
  }

  /**
   * Create a Hotkey from key code and modifiers
   */
  static fromKeyCode(code: number, ctrl: boolean = false, shift: boolean = false, alt: boolean = false): Hotkey | null {
    if (code === 0) return null;
    return new Hotkey(code, ctrl, shift, alt);
  }

  /**
   * Check if a key code is a modifier key
   */
  static isModifierKey(code: number): boolean {
    // Key codes for modifier keys
    const MODIFIER_KEYS = [
      16, // Shift
      17, // Ctrl
      18, // Alt
      91, // Left Cmd (Mac)
      92, // Right Cmd (Mac)
      93, // Context Menu
      20, // Caps Lock
    ];
    return MODIFIER_KEYS.includes(code);
  }

  /**
   * Get label for a key code
   */
  static keyLabelForCode(code: number): string {
    // Special keys
    const specialKeys: { [key: number]: string } = {
      8: 'Backspace',
      9: 'Tab',
      13: 'Enter',
      27: 'Escape',
      32: 'Space',
      46: 'Delete',
      38: 'Up',
      40: 'Down',
      37: 'Left',
      39: 'Right',
      33: 'PageUp',
      34: 'PageDown',
      36: 'Home',
      35: 'End',
      45: 'Insert',
      96: 'Numpad0',
      97: 'Numpad1',
      98: 'Numpad2',
      99: 'Numpad3',
      100: 'Numpad4',
      101: 'Numpad5',
      102: 'Numpad6',
      103: 'Numpad7',
      104: 'Numpad8',
      105: 'Numpad9',
      107: 'Numpad+',
      109: 'Numpad-',
      106: 'Numpad*',
      111: 'Numpad/',
      110: 'Numpad.',
    };

    // Function keys
    if (code >= 112 && code <= 126) {
      return `F${code - 111}`;
    }

    // Special keys
    if (specialKeys[code]) {
      return specialKeys[code];
    }

    // Printable characters
    if ((code >= 48 && code <= 57) || (code >= 65 && code <= 90)) {
      return String.fromCharCode(code);
    }

    // Fallback
    return `Key${code}`;
  }

  /**
   * Clone this hotkey
   */
  clone(): Hotkey {
    return new Hotkey(this.keyCode, this.ctrl, this.shift, this.alt);
  }

  /**
   * Check if this hotkey equals another
   */
  equals(other: Hotkey | null): boolean {
    if (!other) return false;
    return (
      other.keyCode === this.keyCode &&
      other.ctrl === this.ctrl &&
      other.shift === this.shift &&
      other.alt === this.alt
    );
  }

  /**
   * Check if hotkey is empty
   */
  get isEmpty(): boolean {
    return this.keyCode === 0;
  }

  /**
   * Convert to config string (format: "keyCode:ctrl:shift:alt")
   */
  toConfigString(): string {
    if (this.isEmpty) return '';
    return `${this.keyCode}:${this.ctrl ? '1' : '0'}:${this.shift ? '1' : '0'}:${this.alt ? '1' : '0'}`;
  }

  /**
   * Get signature string for matching
   */
  get signature(): string {
    if (this.isEmpty) return '';
    return `${this.keyCode}|${this.ctrl ? '1' : '0'}|${this.shift ? '1' : '0'}|${this.alt ? '1' : '0'}`;
  }

  /**
   * Get key label
   */
  get keyLabel(): string {
    return Hotkey.keyLabelForCode(this.keyCode);
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    if (this.isEmpty) return '';

    const parts: string[] = [];

    if (this.ctrl) parts.push('Ctrl');
    if (this.alt) parts.push('Alt');
    if (this.shift) parts.push('Shift');

    parts.push(this.keyLabel);

    return parts.join('+');
  }
}

