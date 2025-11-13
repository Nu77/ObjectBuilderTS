/**
 * WorkerService - Communication layer between UI and backend worker
 * Uses Electron IPC for desktop app communication
 */

// Simple EventEmitter implementation for browser compatibility
class EventEmitter {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, listener: Function): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(...args));
      return true;
    }
    return false;
  }

  removeListener(event: string, listener: Function): this {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
    return this;
  }

  removeAllListeners(event?: string): this {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
    return this;
  }
}

export interface CommandResponse {
  success: boolean;
  data?: any;
  error?: string;
}

declare global {
  interface Window {
    electronAPI?: {
      sendCommand: (command: any) => Promise<any>;
      onCommand: (callback: (command: any) => void) => void;
      removeCommandListener: () => void;
      onMenuAction?: (callback: (action: string) => void) => void;
      removeMenuActionListener?: () => void;
    };
  }
}

export class WorkerService extends EventEmitter {
  private static instance: WorkerService | null = null;
  private connected: boolean = false;
  private commandListener: ((command: any) => void) | null = null;

  private constructor() {
    super();
  }

  public static getInstance(): WorkerService {
    if (!WorkerService.instance) {
      WorkerService.instance = new WorkerService();
    }
    return WorkerService.instance;
  }

  public async connect(): Promise<boolean> {
    try {
      // Check if running in Electron
      if (typeof window !== 'undefined' && window.electronAPI) {
        // Set up command listener
        this.commandListener = (command: any) => {
          this.emit('command', command);
        };
        window.electronAPI.onCommand(this.commandListener);
        
        // Set up menu action listener
        if (window.electronAPI.onMenuAction) {
          window.electronAPI.onMenuAction((action: string) => {
            this.emit('menu-action', action);
          });
        }
        
        this.connected = true;
        this.emit('connected');
        return true;
      } else {
        // Fallback for web mode (could use WebSocket)
        console.warn('Not running in Electron, using mock connection');
        await new Promise(resolve => setTimeout(resolve, 100));
        this.connected = true;
        this.emit('connected');
        return true;
      }
    } catch (error) {
      console.error('Failed to connect to worker:', error);
      return false;
    }
  }

  public async sendCommand(command: any): Promise<CommandResponse> {
    if (!this.connected) {
      throw new Error('Worker not connected');
    }

    try {
      // Use Electron IPC if available
      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.sendCommand(command);
        return result;
      } else {
        // Fallback for web mode
        console.log('Sending command (mock):', command.constructor?.name || 'Unknown');
        return {
          success: true,
          data: null,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  public onCommand(callback: (command: any) => void): void {
    this.on('command', callback);
  }

  public disconnect(): void {
    if (typeof window !== 'undefined' && window.electronAPI && this.commandListener) {
      window.electronAPI.removeCommandListener();
      this.commandListener = null;
    }
    this.connected = false;
    this.emit('disconnected');
  }
}
