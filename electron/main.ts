/*
*  Electron Main Process
*  Handles window creation and IPC communication with backend
*/

import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import type { ObjectBuilderApp } from '../src/main';
import { WorkerCommand } from '../src/workers/WorkerCommand';

let mainWindow: BrowserWindow | null = null;
let backendApp: ObjectBuilderApp | null = null;

interface WindowState {
  maximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

const WINDOW_STATE_FILE = path.join(app.getPath('userData'), 'window-state.json');

function loadWindowState(): WindowState {
  const defaultState: WindowState = {
    maximized: false,
    x: 0,
    y: 0,
    width: 1024,
    height: 768,
  };

  try {
    if (fs.existsSync(WINDOW_STATE_FILE)) {
      const data = fs.readFileSync(WINDOW_STATE_FILE, 'utf-8');
      const state = JSON.parse(data);
      return { ...defaultState, ...state };
    }
  } catch (error) {
    console.error('Failed to load window state:', error);
  }

  return defaultState;
}

function saveWindowState(): void {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  try {
    const bounds = mainWindow.getBounds();
    const state: WindowState = {
      maximized: mainWindow.isMaximized(),
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    };

    fs.writeFileSync(WINDOW_STATE_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('Failed to save window state:', error);
  }
}

function createWindow(): void {
  const windowState = loadWindowState();

  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minWidth: 1024,
    minHeight: 768,
    backgroundColor: '#494949',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false, // Don't show until ready
  });

  // Restore maximized state
  if (windowState.maximized) {
    mainWindow.maximize();
  }

  // Load the UI
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // __dirname is dist/electron, so ../ui gets us to dist/ui
    const uiPath = path.join(__dirname, '../../ui/index.html');
    console.log('Loading UI from:', uiPath);
    console.log('__dirname is:', __dirname);
    console.log('UI path exists:', fs.existsSync(uiPath));
    
    if (!fs.existsSync(uiPath)) {
      console.error('UI file not found at:', uiPath);
      console.error('Please run: npm run build');
      return;
    }
    
    mainWindow.loadFile(uiPath).catch((error: Error) => {
      console.error('Failed to load UI file:', error);
    });
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Save window state on move/resize
  mainWindow.on('moved', saveWindowState);
  mainWindow.on('resized', saveWindowState);
  mainWindow.on('maximize', saveWindowState);
  mainWindow.on('unmaximize', saveWindowState);

  mainWindow.on('closed', () => {
    // Save state before clearing reference
    if (mainWindow && !mainWindow.isDestroyed()) {
      saveWindowState();
    }
    mainWindow = null;
  });
}

// Serialize command data for IPC transmission
// Converts ByteArray/Buffer objects to ArrayBuffer for proper serialization
function serializeCommand(command: WorkerCommand): any {
  const commandName = command.constructor.name;
  const serialized: any = {
    type: commandName,
  };

  // Handle different command types
  if (commandName === 'SetThingListCommand') {
    const cmd = command as any;
    serialized.data = {
      selectedIds: cmd.selectedIds || [],
      list: (cmd.things || []).map((item: any) => serializeThingListItem(item)),
    };
  } else if (commandName === 'SetSpriteListCommand') {
    const cmd = command as any;
    serialized.data = {
      selectedIds: cmd.selectedIds || [],
      list: (cmd.sprites || []).map((sprite: any) => serializeSpriteData(sprite)),
    };
  } else if (commandName === 'SetThingDataCommand') {
    const cmd = command as any;
    serialized.data = serializeThingData(cmd.data || cmd.thingData);
  } else {
    // For other commands, serialize all properties
    serialized.data = serializeObject(command);
  }

  return serialized;
}

// Serialize ThingListItem
function serializeThingListItem(item: any): any {
  const serialized: any = {
    id: item.thing?.id || item.id || 0,
  };

  if (item.thing) {
    serialized.thing = {
      id: item.thing.id,
      category: item.thing.category,
    };
  }

  if (item.frameGroup) {
    serialized.frameGroup = item.frameGroup;
  }

  // Convert pixels (ByteArray/Buffer) to ArrayBuffer
  if (item.pixels) {
    serialized.pixels = convertToArrayBuffer(item.pixels);
  }

  return serialized;
}

// Serialize SpriteData
function serializeSpriteData(sprite: any): any {
  const serialized: any = {
    id: sprite.id || 0,
  };

  // Convert pixels (Buffer) to ArrayBuffer
  if (sprite.pixels) {
    serialized.pixels = convertToArrayBuffer(sprite.pixels);
  }

  return serialized;
}

// Serialize ThingData
function serializeThingData(thingData: any): any {
  if (!thingData) return null;

  const serialized: any = {
    id: thingData.id,
    category: thingData.category,
  };

  if (thingData.thing) {
    serialized.thing = thingData.thing;
  }

  // Serialize sprites Map
  if (thingData.sprites) {
    if (thingData.sprites instanceof Map) {
      const spritesMap: any = {};
      thingData.sprites.forEach((sprites: any[], groupType: number) => {
        spritesMap[groupType] = sprites.map((sprite: any) => ({
          id: sprite.id,
          pixels: convertToArrayBuffer(sprite.pixels),
        }));
      });
      serialized.sprites = spritesMap;
    } else {
      serialized.sprites = thingData.sprites;
    }
  }

  return serialized;
}

// Convert ByteArray or Buffer to ArrayBuffer for IPC
function convertToArrayBuffer(data: any): ArrayBuffer | null {
  if (!data) return null;

  try {
    // If it's already an ArrayBuffer (not SharedArrayBuffer)
    if (data instanceof ArrayBuffer) {
      return data;
    }

    // Helper to create a new ArrayBuffer from any buffer-like object
    const createArrayBuffer = (buffer: Buffer | Uint8Array | ArrayBuffer): ArrayBuffer => {
      let uint8Array: Uint8Array;
      if (Buffer.isBuffer(buffer)) {
        uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      } else if (buffer instanceof Uint8Array) {
        uint8Array = buffer;
      } else if (buffer instanceof ArrayBuffer) {
        uint8Array = new Uint8Array(buffer);
      } else {
        throw new Error('Unsupported buffer type');
      }
      
      // Create a new ArrayBuffer by copying
      const newBuffer = new ArrayBuffer(uint8Array.length);
      new Uint8Array(newBuffer).set(uint8Array);
      return newBuffer;
    };

    // If it's a Buffer
    if (Buffer.isBuffer(data)) {
      return createArrayBuffer(data);
    }

    // If it's a ByteArray with toBuffer method
    if (data.toBuffer && typeof data.toBuffer === 'function') {
      const buffer = data.toBuffer();
      if (Buffer.isBuffer(buffer)) {
        return createArrayBuffer(buffer);
      }
    }

    // If it's a Uint8Array or similar
    if (data instanceof Uint8Array || (data.buffer && data.buffer instanceof ArrayBuffer)) {
      return createArrayBuffer(data);
    }

    // Try to convert to Buffer first
    if (typeof data === 'object' && data.length !== undefined) {
      const buffer = Buffer.from(data);
      return createArrayBuffer(buffer);
    }

    return null;
  } catch (error) {
    console.error('Error converting to ArrayBuffer:', error);
    return null;
  }
}

// Serialize any object, converting ByteArray/Buffer to ArrayBuffer
function serializeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => serializeObject(item));
  }

  // Handle objects
  if (typeof obj === 'object') {
    // Check if it's a Buffer or ByteArray
    if (Buffer.isBuffer(obj) || (obj.toBuffer && typeof obj.toBuffer === 'function')) {
      return convertToArrayBuffer(obj);
    }

    // Handle Map
    if (obj instanceof Map) {
      const result: any = {};
      obj.forEach((value, key) => {
        result[key] = serializeObject(value);
      });
      return result;
    }

    // Handle regular objects
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = serializeObject(obj[key]);
      }
    }
    return result;
  }

  // Primitive types
  return obj;
}

// IPC Handlers - Set up BEFORE backend initialization so they're always available
function setupIpcHandlers(): void {
  // Send command to backend
  ipcMain.handle('worker:sendCommand', async (event, commandData: any) => {
    if (!backendApp || !(backendApp as any).communicator) {
      return { success: false, error: 'Backend not initialized. Please check console for errors.' };
    }

    try {
      // Create a command object from the data
      // The WorkerCommunicator will handle routing based on command type
      const CommandClass = getCommandClass(commandData.type);
      if (!CommandClass) {
        return { success: false, error: `Unknown command type: ${commandData.type}` };
      }

      // Create command instance from data
      // Handle special cases for commands that need PathHelper objects
      let command;
      if (commandData.type === 'ImportSpritesFromFileCommand' || commandData.type === 'ImportThingsFromFilesCommand') {
        // Convert plain objects to PathHelper instances
        const PathHelper = require(path.join(__dirname, '../otlib/loaders/PathHelper')).PathHelper;
        const pathHelpers = (commandData.list || []).map((item: any) => {
          if (item instanceof PathHelper) {
            return item;
          }
          return new PathHelper(item.nativePath || item.path, item.id || 0);
        });
        command = new CommandClass(pathHelpers);
      } else {
        // For other commands, use the original approach
        command = new CommandClass(...Object.values(commandData).filter((_, i) => i !== 0));
      }
      
      (backendApp as any).communicator.handleCommand(command);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error handling command:', error);
      return { success: false, error: error.message };
    }
  });

  // Helper to get command class by type name
  function getCommandClass(typeName: string): any {
    // Dynamic import of command classes
    // This is a simplified version - in production, use a command registry
    try {
      // Use path relative to dist directory
      const commandsPath = path.join(__dirname, '../ob/commands');
      const commandMap: { [key: string]: string } = {
        'LoadFilesCommand': 'files/LoadFilesCommand',
        'CreateNewFilesCommand': 'files/CreateNewFilesCommand',
        'CompileCommand': 'files/CompileCommand',
        'GetThingListCommand': 'things/GetThingListCommand',
        'GetThingCommand': 'things/GetThingCommand',
        'UpdateThingCommand': 'things/UpdateThingCommand',
        'FindThingCommand': 'things/FindThingCommand',
        'GetSpriteListCommand': 'sprites/GetSpriteListCommand',
        'ImportThingsFromFilesCommand': 'things/ImportThingsFromFilesCommand',
        'ImportSpritesFromFileCommand': 'sprites/ImportSpritesFromFileCommand',
        'ExportThingCommand': 'things/ExportThingCommand',
        'ExportSpritesCommand': 'sprites/ExportSpritesCommand',
        'MergeFilesCommand': 'files/MergeFilesCommand',
      };

      const commandPath = commandMap[typeName];
      if (commandPath) {
        const fullPath = path.join(commandsPath, `${commandPath}.js`);
        const commandModule = require(fullPath);
        return commandModule[typeName] || commandModule.default;
      }
      return null;
    } catch (error) {
      console.error(`Failed to load command class ${typeName}:`, error);
      return null;
    }
  }

  // File dialog handlers
  ipcMain.handle('dialog:open', async (event, options: any) => {
    if (!mainWindow) return { canceled: true };
    const result = await dialog.showOpenDialog(mainWindow, {
      title: options.title || 'Open File',
      defaultPath: options.defaultPath,
      filters: options.filters || [
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: options.properties || ['openFile'],
    });
    return result;
  });

  ipcMain.handle('dialog:save', async (event, options: any) => {
    if (!mainWindow) return { canceled: true };
    const result = await dialog.showSaveDialog(mainWindow, {
      title: options.title || 'Save File',
      defaultPath: options.defaultPath,
      filters: options.filters || [
        { name: 'All Files', extensions: ['*'] }
      ],
    });
    return result;
  });

  ipcMain.handle('dialog:openDirectory', async (event, options: any) => {
    if (!mainWindow) return { canceled: true };
    const result = await dialog.showOpenDialog(mainWindow, {
      title: options.title || 'Select Directory',
      defaultPath: options.defaultPath,
      properties: ['openDirectory'],
    });
    return result;
  });
}

async function initializeBackend(): Promise<void> {
  try {
    // Import and initialize backend
    // Use require for CommonJS modules in Electron
    const mainModule = require(path.join(__dirname, '../main.js'));
    const ObjectBuilderApp = mainModule.ObjectBuilderApp || mainModule.default;
    if (ObjectBuilderApp) {
      backendApp = new ObjectBuilderApp();
      console.log('Backend initialized');
      
      // Listen for commands from backend
      if (backendApp && (backendApp as any).communicator) {
        (backendApp as any).communicator.on('command', (command: WorkerCommand) => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            // Serialize command data for IPC (convert ByteArray/Buffer to ArrayBuffer)
            const serializedCommand = serializeCommand(command);
            
            // Send command to renderer process
            mainWindow.webContents.send('worker:command', serializedCommand);
          }
        });
      }
    }
  } catch (error: any) {
    console.error('Failed to initialize backend:', error);
    // If canvas module is missing, provide helpful error message
    if (error.message && error.message.includes('canvas.node')) {
      console.error('\n=== CANVAS MODULE ERROR ===');
      console.error('The canvas module needs to be rebuilt for Electron.');
      console.error('Please run: npm run rebuild');
      console.error('Or: npm install canvas --build-from-source');
      console.error('===========================\n');
    }
    // Continue even if backend fails - UI can still work for some features
  }
}

app.whenReady().then(async () => {
  // Set up IPC handlers FIRST, before backend initialization
  // This ensures handlers are always available even if backend fails
  setupIpcHandlers();
  
  // Then initialize backend
  await initializeBackend();
  
  // Create window and menu
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'file-new');
            }
          },
        },
        {
          label: 'Open Project',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'file-open');
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Compile',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'file-compile');
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Import...',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'file-import');
            }
          },
        },
        {
          label: 'Export...',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'file-export');
            }
          },
        },
        {
          label: 'Merge Files...',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'file-merge');
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Preferences',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'file-preferences');
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo', label: 'Undo' },
        { role: 'redo', label: 'Redo' },
        { type: 'separator' },
        { role: 'cut', label: 'Cut' },
        { role: 'copy', label: 'Copy' },
        { role: 'paste', label: 'Paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Preview Panel',
          accelerator: 'F2',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'view-preview');
            }
          },
        },
        {
          label: 'Toggle Objects Panel',
          accelerator: 'F3',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'view-objects');
            }
          },
        },
        {
          label: 'Toggle Sprites Panel',
          accelerator: 'F4',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'view-sprites');
            }
          },
        },
        { type: 'separator' },
        { role: 'reload', label: 'Reload' },
        { role: 'forceReload', label: 'Force Reload' },
        { role: 'toggleDevTools', label: 'Toggle Developer Tools' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Actual Size' },
        { role: 'zoomIn', label: 'Zoom In' },
        { role: 'zoomOut', label: 'Zoom Out' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Toggle Full Screen' },
      ],
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Find',
          accelerator: 'CmdOrCtrl+F',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'tools-find');
            }
          },
        },
      ],
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Log Window',
          accelerator: 'CmdOrCtrl+L',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'window-log');
            }
          },
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'help-about');
            }
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (backendApp) {
      backendApp.shutdown();
    }
    saveWindowState();
    app.quit();
  }
});

app.on('before-quit', () => {
  saveWindowState();
  if (backendApp) {
    backendApp.shutdown();
  }
});

