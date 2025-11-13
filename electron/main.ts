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

async function initializeBackend(): Promise<void> {
  try {
    // Import and initialize backend
    const { ObjectBuilderApp } = require('../../main');
    backendApp = new ObjectBuilderApp();
    console.log('Backend initialized');
    
    // Set up IPC handlers after backend is ready
    setupIpcHandlers();
  } catch (error) {
    console.error('Failed to initialize backend:', error);
  }
}

// IPC Handlers
function setupIpcHandlers(): void {
  // Send command to backend
  ipcMain.handle('worker:sendCommand', async (event, commandData: any) => {
    if (!backendApp || !backendApp.communicator) {
      return { success: false, error: 'Backend not initialized' };
    }

    try {
      // Create a command object from the data
      // The WorkerCommunicator will handle routing based on command type
      const CommandClass = getCommandClass(commandData.type);
      if (!CommandClass) {
        return { success: false, error: `Unknown command type: ${commandData.type}` };
      }

      // Create command instance from data
      const command = new CommandClass(...Object.values(commandData).filter((_, i) => i !== 0));
      backendApp.communicator.handleCommand(command);
      
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
      const commandsPath = '../../ob/commands';
      const commandMap: { [key: string]: string } = {
        'LoadFilesCommand': 'files/LoadFilesCommand',
        'CreateNewFilesCommand': 'files/CreateNewFilesCommand',
        'CompileCommand': 'files/CompileCommand',
        'GetThingListCommand': 'things/GetThingListCommand',
        'GetThingCommand': 'things/GetThingCommand',
        'UpdateThingCommand': 'things/UpdateThingCommand',
        'FindThingCommand': 'things/FindThingCommand',
        'GetSpriteListCommand': 'sprites/GetSpriteListCommand',
      };

      const path = commandMap[typeName];
      if (path) {
        return require(`${commandsPath}/${path}`)[typeName];
      }
      return null;
    } catch (error) {
      console.error(`Failed to load command class ${typeName}:`, error);
      return null;
    }
  }

  // Listen for commands from backend
  if (backendApp && backendApp.communicator) {
    backendApp.communicator.on('command', (command: WorkerCommand) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        // Send command to renderer process
        mainWindow.webContents.send('worker:command', {
          type: command.constructor.name,
          data: command,
        });
      }
    });
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

app.whenReady().then(async () => {
  await initializeBackend();
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

