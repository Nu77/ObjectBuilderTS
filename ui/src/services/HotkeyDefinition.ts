import { Hotkey } from './Hotkey';

/**
 * HotkeyDefinition represents a registered hotkey action
 */
export class HotkeyDefinition {
  public id: string;
  public label: string;
  public category: string;
  public defaultHotkey: Hotkey | null;
  public hotkey: Hotkey | null;

  constructor(id: string, label: string, category: string, defaultHotkey: Hotkey | null) {
    this.id = id;
    this.label = label;
    this.category = category;
    this.defaultHotkey = defaultHotkey ? defaultHotkey.clone() : null;
    this.hotkey = this.defaultHotkey ? this.defaultHotkey.clone() : null;
  }

  /**
   * Clone this definition
   */
  clone(): HotkeyDefinition {
    const copy = new HotkeyDefinition(this.id, this.label, this.category, this.defaultHotkey);
    copy.hotkey = this.hotkey ? this.hotkey.clone() : null;
    return copy;
  }

  /**
   * Check if current hotkey uses default value
   */
  usesDefault(): boolean {
    if (!this.defaultHotkey && !this.hotkey) return true;
    if (this.defaultHotkey && this.hotkey) {
      return this.defaultHotkey.equals(this.hotkey);
    }
    return false;
  }
}

