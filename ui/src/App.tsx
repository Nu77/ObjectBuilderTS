import React, { useState, useEffect } from 'react';
import { WorkerProvider, useWorker } from './contexts/WorkerContext';
import { MainWindow } from './components/MainWindow';
import { SplashScreen } from './components/SplashScreen';
import { useToast } from './hooks/useToast';
import { ErrorBoundary } from './ErrorBoundary';
import './App.css';

const AppContent: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const worker = useWorker();
  const { ToastContainer } = useToast();

  useEffect(() => {
    console.log('AppContent mounted, worker initialized:', worker.initialized);
    const initialize = async () => {
      try {
        // WorkerContext already connects, just wait for it
        // Wait for worker to be initialized
        let attempts = 0;
        while (!worker.initialized && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        console.log('Worker initialized, connected:', worker.connected);
        // Give a moment for everything to settle
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error('Failed to initialize:', error);
      } finally {
        setLoading(false);
        console.log('Loading complete');
      }
    };

    if (worker.initialized) {
      setLoading(false);
    } else {
      initialize();
    }
  }, [worker.initialized, worker.connected]);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <>
      <MainWindow />
      <ToastContainer />
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <WorkerProvider>
        <AppContent />
      </WorkerProvider>
    </ErrorBoundary>
  );
}

export default App;
