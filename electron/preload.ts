/*
*  Electron Preload Script
*  Provides secure bridge between renderer and main process
*/

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  sendCommand: (command: any) => ipcRenderer.invoke('worker:sendCommand', command),
  onCommand: (callback: (command: any) => void) => {
    ipcRenderer.on('worker:command', (event, data) => callback(data));
  },
  removeCommandListener: () => {
    ipcRenderer.removeAllListeners('worker:command');
  },
  // File dialog methods
  showOpenDialog: (options: any) => ipcRenderer.invoke('dialog:open', options),
  showSaveDialog: (options: any) => ipcRenderer.invoke('dialog:save', options),
  showOpenDirectoryDialog: (options: any) => ipcRenderer.invoke('dialog:openDirectory', options),
  // Menu actions
  onMenuAction: (callback: (action: string) => void) => {
    ipcRenderer.on('menu-action', (event, action) => callback(action));
  },
  removeMenuActionListener: () => {
    ipcRenderer.removeAllListeners('menu-action');
  },
  // Menu action data
  onMenuActionData: (callback: (data: any) => void) => {
    ipcRenderer.on('menu-action-data', (event, data) => callback(data));
  },
  removeMenuActionDataListener: () => {
    ipcRenderer.removeAllListeners('menu-action-data');
  },
  // Load OBD file for viewing
  loadOBDFile: (filePath: string) => ipcRenderer.invoke('loadOBDFile', filePath),
  // Get sprite dimensions list
  getSpriteDimensions: () => ipcRenderer.invoke('getSpriteDimensions'),
  // Write temporary file (for Slicer)
  writeTempFile: (fileName: string, data: ArrayBuffer) => ipcRenderer.invoke('writeTempFile', fileName, data),
  // Update recent files menu
  updateRecentFilesMenu: () => ipcRenderer.invoke('updateRecentFilesMenu'),
  // Find corresponding file (e.g., .dat for .spr)
  findCorrespondingFile: (filePath: string, targetExt: string) => ipcRenderer.invoke('file:findCorresponding', filePath, targetExt),
  // Client Versions
  getVersions: () => ipcRenderer.invoke('getVersions'),
  addVersion: (value: number, datSignature: number, sprSignature: number, otbVersion: number) => ipcRenderer.invoke('addVersion', value, datSignature, sprSignature, otbVersion),
  removeVersion: (valueStr: string) => ipcRenderer.invoke('removeVersion', valueStr),
});

