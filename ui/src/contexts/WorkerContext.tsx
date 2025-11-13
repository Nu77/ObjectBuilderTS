import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { WorkerService } from '../services/WorkerService';

interface WorkerContextType {
  initialized: boolean;
  connected: boolean;
  sendCommand: (command: any) => Promise<any>;
  onCommand: (callback: (command: any) => void) => void;
}

export const WorkerContext = createContext<WorkerContextType>({
  initialized: false,
  connected: false,
  sendCommand: async () => ({}),
  onCommand: () => {},
});

export const useWorker = () => {
  const context = useContext(WorkerContext);
  if (!context) {
    throw new Error('useWorker must be used within WorkerContext');
  }
  return context;
};

interface WorkerProviderProps {
  children: ReactNode;
}

export const WorkerProvider: React.FC<WorkerProviderProps> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [connected, setConnected] = useState(false);
  const [workerService] = useState(() => WorkerService.getInstance());

  useEffect(() => {
    const init = async () => {
      const success = await workerService.connect();
      setConnected(success);
      setInitialized(true);
    };

    init();

    workerService.on('connected', () => setConnected(true));
    workerService.on('disconnected', () => setConnected(false));

    return () => {
      workerService.disconnect();
    };
  }, [workerService]);

  const sendCommand = async (command: any) => {
    return await workerService.sendCommand(command);
  };

  const onCommand = (callback: (command: any) => void) => {
    workerService.onCommand(callback);
  };

  return (
    <WorkerContext.Provider
      value={{
        initialized,
        connected,
        sendCommand,
        onCommand,
      }}
    >
      {children}
    </WorkerContext.Provider>
  );
};

