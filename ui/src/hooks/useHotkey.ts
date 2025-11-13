import { useEffect } from 'react';
import { getHotkeyManager } from '../services/HotkeyManager';

/**
 * Hook to register a hotkey handler
 */
export function useHotkey(actionId: string, handler: () => void, deps: any[] = []): void {
  useEffect(() => {
    const manager = getHotkeyManager();
    manager.addHandler(actionId, handler);

    return () => {
      manager.removeHandler(actionId, handler);
    };
  }, [actionId, ...deps]);
}

