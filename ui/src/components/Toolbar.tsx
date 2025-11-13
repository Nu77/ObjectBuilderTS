import React, { useEffect, useState } from 'react';
import { useWorker } from '../contexts/WorkerContext';
import { useAppStateContext } from '../contexts/AppStateContext';
import { useProgress } from '../contexts/ProgressContext';
import { useToast } from '../hooks/useToast';
import { CommandFactory } from '../services/CommandFactory';
import { FileDialogService } from '../services/FileDialogService';
import { LoadFilesDialog } from './LoadFilesDialog';
import { NewProjectDialog } from './NewProjectDialog';
import { CompileOptionsDialog } from './CompileOptionsDialog';
import { ConfirmDialog } from './ConfirmDialog';
import './Toolbar.css';

// Category constants (matching backend)
const ThingCategory = {
  ITEM: 'item',
  OUTFIT: 'outfit',
  EFFECT: 'effect',
  MISSILE: 'missile',
};

export const Toolbar: React.FC = () => {
  const worker = useWorker();
  const { currentCategory, setCategory } = useAppStateContext();
  const { showProgress, hideProgress } = useProgress();
  const { showSuccess, showError } = useToast();
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [compileDialogOpen, setCompileDialogOpen] = useState(false);
  const [unloadConfirmOpen, setUnloadConfirmOpen] = useState(false);
  const [selectedDatFile, setSelectedDatFile] = useState<string | undefined>();
  const [selectedSprFile, setSelectedSprFile] = useState<string | undefined>();
  const [clientChanged, setClientChanged] = useState(false);
  const [clientLoaded, setClientLoaded] = useState(false);
  const [clientInfo, setClientInfo] = useState<any>(null);

  // Listen for client info changes
  useEffect(() => {
    const handleCommand = (command: any) => {
      if (command.type === 'SetClientInfoCommand' && command.data) {
        setClientLoaded(command.data.loaded || false);
        setClientChanged(command.data.changed || false);
        setClientInfo(command.data);
      }
    };

    worker.onCommand(handleCommand);
  }, [worker]);

  // Listen for menu actions
  useEffect(() => {
    const handleMenuAction = (action: string) => {
      switch (action) {
        case 'file-new':
          handleNew();
          break;
        case 'file-open':
          handleOpen();
          break;
        case 'file-compile':
          handleCompile();
          break;
        default:
          break;
      }
    };

    // Listen for menu actions via window.electronAPI
    if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.onMenuAction) {
      window.electronAPI.onMenuAction(handleMenuAction);
      return () => {
        if (window.electronAPI && window.electronAPI.removeMenuActionListener) {
          window.electronAPI.removeMenuActionListener();
        }
      };
    }
  }, []);

  const handleNew = () => {
    setNewProjectDialogOpen(true);
  };

  const handleCreateNewProject = async (options: {
    datSignature: number;
    sprSignature: number;
    extended: boolean;
    transparency: boolean;
    improvedAnimations: boolean;
    frameGroups: boolean;
  }) => {
    try {
      showProgress('Creating new project...');
      const command = CommandFactory.createCreateNewFilesCommand(
        options.datSignature,
        options.sprSignature,
        options.extended,
        options.transparency,
        options.improvedAnimations,
        options.frameGroups
      );
      const result = await worker.sendCommand(command);
      hideProgress();
      if (result.success) {
        showSuccess('New project created successfully');
        setNewProjectDialogOpen(false);
      } else {
        showError(result.error || 'Failed to create new project');
      }
    } catch (error: any) {
      hideProgress();
      showError(error.message || 'Failed to create new project');
      console.error('Failed to create new project:', error);
    }
  };

  const handleOpen = async () => {
    try {
      const fileDialog = FileDialogService.getInstance();
      const result = await fileDialog.openDatSprFiles();
      
      if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
        // Find DAT and SPR files
        const datFile = result.filePaths.find(p => p.toLowerCase().endsWith('.dat'));
        const sprFile = result.filePaths.find(p => p.toLowerCase().endsWith('.spr'));
        
        if (!datFile) {
          showError('Please select a DAT file (.dat)');
          return;
        }
        
        if (!sprFile) {
          showError('Please select a SPR file (.spr)');
          return;
        }
        
        // Validate file extensions
        if (!datFile.toLowerCase().endsWith('.dat')) {
          showError('Invalid DAT file. Please select a file with .dat extension');
          return;
        }
        
        if (!sprFile.toLowerCase().endsWith('.spr')) {
          showError('Invalid SPR file. Please select a file with .spr extension');
          return;
        }
        
        setSelectedDatFile(datFile);
        setSelectedSprFile(sprFile);
        setLoadDialogOpen(true);
      }
    } catch (error: any) {
      showError(error.message || 'Failed to open project');
      console.error('Failed to open project:', error);
    }
  };

  const handleLoadFiles = async (options: {
    version: any;
    extended: boolean;
    transparency: boolean;
    improvedAnimations: boolean;
    frameGroups: boolean;
  }) => {
    if (!selectedDatFile || !selectedSprFile) {
      showError('Please select both DAT and SPR files');
      return;
    }

    try {
      showProgress('Loading project files...');
      const command = CommandFactory.createLoadFilesCommand(
        selectedDatFile,
        selectedSprFile,
        options.version,
        options.extended,
        options.transparency,
        options.improvedAnimations,
        options.frameGroups
      );
      const loadResult = await worker.sendCommand(command);
      hideProgress();
      if (loadResult.success) {
        // Get client info for success message (may not be available immediately)
        const info = clientInfo || loadResult.data?.clientInfo;
        const spriteCount = info?.spritesCount || info?.maxSpriteId || 0;
        const thingCount = (info?.itemsCount || info?.maxItemId || 0) + 
                          (info?.outfitsCount || info?.maxOutfitId || 0) + 
                          (info?.effectsCount || info?.maxEffectId || 0) + 
                          (info?.missilesCount || info?.maxMissileId || 0);
        const successMsg = thingCount > 0 || spriteCount > 0
          ? `Project loaded successfully - ${spriteCount} sprites, ${thingCount} things`
          : 'Project loaded successfully';
        showSuccess(successMsg);
        setLoadDialogOpen(false);
        setSelectedDatFile(undefined);
        setSelectedSprFile(undefined);
      } else {
        const errorMsg = loadResult.error || 'Failed to load project';
        // Provide more specific error messages
        let detailedError = errorMsg;
        if (errorMsg.includes('SPR') || errorMsg.includes('spr')) {
          detailedError = `SPR file error: ${errorMsg}. Please check if the SPR file is valid and not corrupted.`;
        } else if (errorMsg.includes('DAT') || errorMsg.includes('dat')) {
          detailedError = `DAT file error: ${errorMsg}. Please check if the DAT file is valid and not corrupted.`;
        }
        showError(detailedError);
      }
    } catch (error: any) {
      hideProgress();
      const errorMessage = error.message || 'Failed to load project';
      
      // Provide helpful error messages
      let detailedError = errorMessage;
      if (errorMessage.includes('ENOENT') || errorMessage.includes('not found')) {
        detailedError = 'File not found. Please check if the DAT and SPR files exist and are accessible.';
      } else if (errorMessage.includes('permission')) {
        detailedError = 'Permission denied. Please check file permissions.';
      } else if (errorMessage.includes('corrupt') || errorMessage.includes('invalid')) {
        detailedError = 'File appears to be corrupted or invalid. Please verify the files are valid Tibia client files.';
      } else if (errorMessage.includes('SPR') || errorMessage.includes('spr')) {
        detailedError = `SPR file error: ${errorMessage}. Please check if the SPR file is valid and not corrupted.`;
      } else if (errorMessage.includes('DAT') || errorMessage.includes('dat')) {
        detailedError = `DAT file error: ${errorMessage}. Please check if the DAT file is valid and not corrupted.`;
      }
      
      showError(detailedError);
      console.error('Failed to load project:', error);
    }
  };

  const handleCompile = () => {
    setCompileDialogOpen(true);
  };

  const handleCompileWithOptions = async (options: {
    useCustomLocation: boolean;
    datFile?: string;
    sprFile?: string;
  }) => {
    try {
      showProgress('Compiling project...');
      
      if (options.useCustomLocation && options.datFile && options.sprFile && clientInfo) {
        // Use CompileAsCommand for custom location
        const command = CommandFactory.createCompileAsCommand(
          options.datFile,
          options.sprFile,
          clientInfo.version || { id: 0, name: 'Unknown' },
          clientInfo.extended || false,
          clientInfo.transparency || false,
          clientInfo.improvedAnimations || false,
          clientInfo.frameGroups || false
        );
        const result = await worker.sendCommand(command);
        hideProgress();
        if (result.success) {
          showSuccess('Project compiled successfully');
          setCompileDialogOpen(false);
        } else {
          showError(result.error || 'Failed to compile project');
        }
      } else {
        // Use regular CompileCommand for default location
        const command = CommandFactory.createCompileCommand();
        const result = await worker.sendCommand(command);
        hideProgress();
        if (result.success) {
          showSuccess('Project compiled successfully');
          setCompileDialogOpen(false);
        } else {
          showError(result.error || 'Failed to compile project');
        }
      }
    } catch (error: any) {
      hideProgress();
      showError(error.message || 'Failed to compile project');
      console.error('Failed to compile:', error);
    }
  };

  const handleUnload = () => {
    if (!clientLoaded) return;
    
    if (clientChanged) {
      // Show confirmation dialog
      setUnloadConfirmOpen(true);
    } else {
      // No changes, unload directly
      performUnload();
    }
  };

  const performUnload = async () => {
    try {
      showProgress('Unloading project...');
      const command = CommandFactory.createUnloadFilesCommand();
      const result = await worker.sendCommand(command);
      hideProgress();
      if (result.success) {
        showSuccess('Project unloaded successfully');
        setUnloadConfirmOpen(false);
      } else {
        showError(result.error || 'Failed to unload project');
      }
    } catch (error: any) {
      hideProgress();
      showError(error.message || 'Failed to unload project');
      console.error('Failed to unload:', error);
    }
  };

  const handleUnloadConfirm = () => {
    // User confirmed, unload without saving
    performUnload();
  };

  const handleUnloadCancel = () => {
    setUnloadConfirmOpen(false);
  };

  const handleCategoryChange = (category: string) => {
    setCategory(category);
    // ThingList component will automatically reload when category changes
    // via its useEffect hook that watches currentCategory
  };

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-section">
          <button className="toolbar-button" title="New Project" onClick={handleNew}>
            <span>New</span>
          </button>
          <button className="toolbar-button" title="Open Project" onClick={handleOpen}>
            <span>Open</span>
          </button>
          <button className="toolbar-button" title="Save Project" disabled>
            <span>Save</span>
          </button>
          <button 
            className="toolbar-button" 
            title="Unload Project" 
            onClick={handleUnload}
            disabled={!clientLoaded}
          >
            <span>Unload</span>
          </button>
          <div className="toolbar-separator" />
          <button className="toolbar-button" title="Compile" onClick={handleCompile}>
            <span>Compile</span>
          </button>
        </div>
        <div className="toolbar-section">
          <button
            className={`toolbar-button ${currentCategory === ThingCategory.ITEM ? 'active' : ''}`}
            title="Items"
            onClick={() => handleCategoryChange(ThingCategory.ITEM)}
          >
            <span>Items</span>
          </button>
          <button
            className={`toolbar-button ${currentCategory === ThingCategory.OUTFIT ? 'active' : ''}`}
            title="Outfits"
            onClick={() => handleCategoryChange(ThingCategory.OUTFIT)}
          >
            <span>Outfits</span>
          </button>
          <button
            className={`toolbar-button ${currentCategory === ThingCategory.EFFECT ? 'active' : ''}`}
            title="Effects"
            onClick={() => handleCategoryChange(ThingCategory.EFFECT)}
          >
            <span>Effects</span>
          </button>
          <button
            className={`toolbar-button ${currentCategory === ThingCategory.MISSILE ? 'active' : ''}`}
            title="Missiles"
            onClick={() => handleCategoryChange(ThingCategory.MISSILE)}
          >
            <span>Missiles</span>
          </button>
        </div>
      </div>
      <LoadFilesDialog
        open={loadDialogOpen}
        onClose={() => {
          setLoadDialogOpen(false);
          setSelectedDatFile(undefined);
          setSelectedSprFile(undefined);
        }}
        onLoad={handleLoadFiles}
        datFile={selectedDatFile}
        sprFile={selectedSprFile}
      />
      <NewProjectDialog
        open={newProjectDialogOpen}
        onClose={() => setNewProjectDialogOpen(false)}
        onCreate={handleCreateNewProject}
      />
      <CompileOptionsDialog
        open={compileDialogOpen}
        onClose={() => setCompileDialogOpen(false)}
        onCompile={handleCompileWithOptions}
      />
      <ConfirmDialog
        open={unloadConfirmOpen}
        title="Unload Project"
        message="You have unsaved changes. Are you sure you want to unload the project? All unsaved changes will be lost."
        confirmLabel="Unload"
        cancelLabel="Cancel"
        variant="warning"
        onConfirm={handleUnloadConfirm}
        onCancel={handleUnloadCancel}
      />
    </>
  );
};
