import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import './LogWindow.css';

interface LogWindowProps {
  open: boolean;
  onClose: () => void;
}

interface LogEntry {
  id: number;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

export const LogWindow: React.FC<LogWindowProps> = ({ open, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error' | 'debug'>('all');
  const logContainerRef = useRef<HTMLDivElement>(null);
  const logIdRef = useRef(0);

  // Listen for log commands from backend
  useEffect(() => {
    if (!open) return;

    const handleCommand = (command: any) => {
      if (command.type === 'LogCommand' || command.type === 'log') {
        const logEntry: LogEntry = {
          id: logIdRef.current++,
          timestamp: new Date(),
          level: command.data?.level || 'info',
          message: command.data?.message || command.message || JSON.stringify(command),
        };
        setLogs(prev => [...prev, logEntry]);
      }
    };

    // Listen via window.electronAPI if available
    if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.onCommand) {
      window.electronAPI.onCommand(handleCommand);
      return () => {
        // Cleanup handled by removeCommandListener if needed
      };
    }
  }, [open]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.level === filter);

  const handleClear = () => {
    setLogs([]);
  };

  const handleExport = () => {
    const logText = filteredLogs
      .map(log => `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.message}`)
      .join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `objectbuilder-log-${new Date().toISOString().replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLogLevelClass = (level: string) => {
    return `log-entry log-entry-${level}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Log Window"
      width={800}
      height={600}
      footer={
        <>
          <Button variant="secondary" onClick={handleClear}>
            Clear
          </Button>
          <Button variant="secondary" onClick={handleExport}>
            Export
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      <div className="log-window">
        <div className="log-toolbar">
          <div className="log-filters">
            <label>Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
              <option value="debug">Debug</option>
            </select>
          </div>
          <div className="log-count">
            {filteredLogs.length} / {logs.length} entries
          </div>
        </div>
        <div className="log-container" ref={logContainerRef}>
          {filteredLogs.length === 0 ? (
            <div className="log-empty">
              <p>No log entries</p>
            </div>
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className={getLogLevelClass(log.level)}>
                <span className="log-timestamp">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                <span className="log-level">{log.level.toUpperCase()}</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </Dialog>
  );
};

