/**
 * FileDialogService - Handles file dialogs using Electron API
 */

export interface FileFilter {
  name: string;
  extensions: string[];
}

export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: FileFilter[];
  properties?: ('openFile' | 'openDirectory' | 'multiSelections')[];
}

export interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: FileFilter[];
}

export interface DialogResult {
  canceled: boolean;
  filePaths?: string[];
  filePath?: string;
}

declare global {
  interface Window {
    electronAPI?: {
      showOpenDialog: (options: OpenDialogOptions) => Promise<DialogResult>;
      showSaveDialog: (options: SaveDialogOptions) => Promise<DialogResult>;
      showOpenDirectoryDialog: (options: OpenDialogOptions) => Promise<DialogResult>;
    };
  }
}

export class FileDialogService {
  private static instance: FileDialogService | null = null;

  private constructor() {}

  public static getInstance(): FileDialogService {
    if (!FileDialogService.instance) {
      FileDialogService.instance = new FileDialogService();
    }
    return FileDialogService.instance;
  }

  public async showOpenDialog(options: OpenDialogOptions = {}): Promise<DialogResult> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.showOpenDialog(options);
    } else {
      // Fallback for web mode - use HTML5 file input
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        if (options.filters && options.filters.length > 0) {
          input.accept = options.filters
            .map(f => f.extensions.map(ext => `.${ext}`).join(','))
            .join(',');
        }
        input.onchange = (e: any) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            resolve({
              canceled: false,
              filePaths: Array.from(files).map((f: File) => (f as any).path || f.name),
            });
          } else {
            resolve({ canceled: true });
          }
        };
        input.oncancel = () => resolve({ canceled: true });
        input.click();
      });
    }
  }

  public async showSaveDialog(options: SaveDialogOptions = {}): Promise<DialogResult> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.showSaveDialog(options);
    } else {
      // Fallback for web mode
      return { canceled: true };
    }
  }

  public async showOpenDirectoryDialog(options: OpenDialogOptions = {}): Promise<DialogResult> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.showOpenDirectoryDialog(options);
    } else {
      // Fallback for web mode
      return { canceled: true };
    }
  }

  // Convenience methods for common file types
  public async openDatSprFiles(defaultPath?: string): Promise<DialogResult> {
    return this.showOpenDialog({
      title: 'Open Client Files',
      defaultPath,
      filters: [
        { name: 'DAT Files', extensions: ['dat'] },
        { name: 'SPR Files', extensions: ['spr'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile', 'multiSelections'],
    });
  }

  public async openOBDFile(defaultPath?: string): Promise<DialogResult> {
    return this.showOpenDialog({
      title: 'Open Object Builder Data File',
      defaultPath,
      filters: [
        { name: 'Object Builder Data', extensions: ['obd'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile', 'multiSelections'],
    });
  }

  public async saveOBDFile(defaultPath?: string): Promise<DialogResult> {
    return this.showSaveDialog({
      title: 'Save Object Builder Data File',
      defaultPath,
      filters: [
        { name: 'Object Builder Data', extensions: ['obd'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });
  }

  public async openImageFiles(defaultPath?: string): Promise<DialogResult> {
    return this.showOpenDialog({
      title: 'Open Image Files',
      defaultPath,
      filters: [
        { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'bmp', 'gif'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile', 'multiSelections'],
    });
  }
}

