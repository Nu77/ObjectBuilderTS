import { getHotkeyManager } from './HotkeyManager';
import { Hotkey } from './Hotkey';

/**
 * Register all default hotkeys for the application
 */
export function registerDefaultHotkeys(): void {
  const manager = getHotkeyManager();

  // File operations
  manager.registerAction('FILE_NEW', 'New Project', 'File', Hotkey.fromKeyCode(78, true, false, false)); // Ctrl+N
  manager.registerAction('FILE_OPEN', 'Open Project', 'File', Hotkey.fromKeyCode(79, true, false, false)); // Ctrl+O
  manager.registerAction('FILE_SAVE', 'Save Project', 'File', Hotkey.fromKeyCode(83, true, false, false)); // Ctrl+S
  manager.registerAction('FILE_COMPILE', 'Compile Project', 'File', Hotkey.fromKeyCode(66, true, false, false)); // Ctrl+B
  manager.registerAction('FILE_COMPILE_AS', 'Compile Project As', 'File', Hotkey.fromKeyCode(83, true, true, false)); // Ctrl+Shift+S
  manager.registerAction('FILE_IMPORT', 'Import', 'File', Hotkey.fromKeyCode(73, true, false, false)); // Ctrl+I
  manager.registerAction('FILE_EXPORT', 'Export', 'File', Hotkey.fromKeyCode(69, true, false, false)); // Ctrl+E
  manager.registerAction('FILE_MERGE', 'Merge Files', 'File', null);
  manager.registerAction('FILE_UNLOAD', 'Unload Project', 'File', null);

  // Edit operations
  manager.registerAction('EDIT_UNDO', 'Undo', 'Edit', Hotkey.fromKeyCode(90, true, false, false)); // Ctrl+Z
  manager.registerAction('EDIT_REDO', 'Redo', 'Edit', Hotkey.fromKeyCode(90, true, true, false)); // Ctrl+Shift+Z
  manager.registerAction('EDIT_CUT', 'Cut', 'Edit', Hotkey.fromKeyCode(88, true, false, false)); // Ctrl+X
  manager.registerAction('EDIT_COPY', 'Copy', 'Edit', Hotkey.fromKeyCode(67, true, false, false)); // Ctrl+C
  manager.registerAction('EDIT_PASTE', 'Paste', 'Edit', Hotkey.fromKeyCode(86, true, false, false)); // Ctrl+V
  manager.registerAction('EDIT_DUPLICATE', 'Duplicate', 'Edit', Hotkey.fromKeyCode(68, true, false, false)); // Ctrl+D
  manager.registerAction('EDIT_DELETE', 'Delete', 'Edit', Hotkey.fromKeyCode(46, false, false, false)); // Delete

  // View operations
  manager.registerAction('VIEW_PREVIEW', 'Toggle Preview Panel', 'View', Hotkey.fromKeyCode(80, false, false, false)); // P
  manager.registerAction('VIEW_OBJECTS', 'Toggle Objects Panel', 'View', Hotkey.fromKeyCode(79, false, false, false)); // O
  manager.registerAction('VIEW_SPRITES', 'Toggle Sprites Panel', 'View', Hotkey.fromKeyCode(83, false, false, false)); // S
  manager.registerAction('VIEW_FILE_INFO', 'Toggle File Info Panel', 'View', Hotkey.fromKeyCode(70, true, false, false)); // Ctrl+F (but this conflicts with Find, so maybe F5)
  manager.registerAction('VIEW_ZOOM_IN', 'Zoom In', 'View', Hotkey.fromKeyCode(187, true, false, false)); // Ctrl+=
  manager.registerAction('VIEW_ZOOM_OUT', 'Zoom Out', 'View', Hotkey.fromKeyCode(189, true, false, false)); // Ctrl+-
  manager.registerAction('VIEW_ZOOM_RESET', 'Reset Zoom', 'View', Hotkey.fromKeyCode(48, true, false, false)); // Ctrl+0

  // Tools
  manager.registerAction('TOOLS_FIND', 'Find', 'Tools', Hotkey.fromKeyCode(70, true, false, false)); // Ctrl+F
  manager.registerAction('TOOLS_ANIMATION_EDITOR', 'Animation Editor', 'Tools', null);
  manager.registerAction('TOOLS_OBJECT_VIEWER', 'Object Viewer', 'Tools', null);
  manager.registerAction('TOOLS_SLICER', 'Slicer', 'Tools', null);
  manager.registerAction('TOOLS_ASSET_STORE', 'Asset Store', 'Tools', null);

  // Thing operations
  manager.registerAction('THING_NEW', 'New Thing', 'Thing', Hotkey.fromKeyCode(78, true, false, false)); // Ctrl+N (conflicts with New Project)
  manager.registerAction('THING_DUPLICATE', 'Duplicate Thing', 'Thing', Hotkey.fromKeyCode(68, true, false, false)); // Ctrl+D
  manager.registerAction('THING_REMOVE', 'Remove Thing', 'Thing', null);

  // Sprite operations
  manager.registerAction('SPRITE_NEW', 'New Sprite', 'Sprite', null);
  manager.registerAction('SPRITE_IMPORT', 'Import Sprite', 'Sprite', null);
  manager.registerAction('SPRITE_EXPORT', 'Export Sprite', 'Sprite', null);
  manager.registerAction('SPRITE_REMOVE', 'Remove Sprite', 'Sprite', null);

  // Window operations
  manager.registerAction('WINDOW_PREFERENCES', 'Preferences', 'Window', null);
  manager.registerAction('WINDOW_LOG', 'Log Window', 'Window', null);
  manager.registerAction('WINDOW_ABOUT', 'About', 'Window', null);
}

