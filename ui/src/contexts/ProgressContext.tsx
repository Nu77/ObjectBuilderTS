import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProgressIndicator } from '../components/ProgressIndicator';

interface ProgressContextType {
  showProgress: (message?: string, progress?: number) => void;
  hideProgress: () => void;
  updateProgress: (progress: number, message?: string) => void;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('Loading...');
  const [progress, setProgress] = useState<number | undefined>(undefined);

  const showProgress = (msg?: string, prog?: number) => {
    setMessage(msg || 'Loading...');
    setProgress(prog);
    setVisible(true);
  };

  const hideProgress = () => {
    setVisible(false);
    setProgress(undefined);
  };

  const updateProgress = (prog: number, msg?: string) => {
    setProgress(prog);
    if (msg) {
      setMessage(msg);
    }
  };

  return (
    <ProgressContext.Provider value={{ showProgress, hideProgress, updateProgress }}>
      {children}
      <ProgressIndicator visible={visible} message={message} progress={progress} />
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return context;
};

