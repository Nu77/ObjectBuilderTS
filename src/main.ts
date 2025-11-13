/*
*  Object Builder - Main Application Entry Point
*  TypeScript version
*/

import * as path from "path";
import * as fs from "fs";
import { ObjectBuilderWorker } from "./ob/workers/ObjectBuilderWorker";
import { WorkerCommunicator } from "./workers/WorkerCommunicator";
import { ObjectBuilderSettings } from "./ob/settings/ObjectBuilderSettings";
import { SettingsManager } from "./otlib/settings/SettingsManager";
import { VersionStorage } from "./otlib/core/VersionStorage";
import { SpriteDimensionStorage } from "./otlib/core/SpriteDimensionStorage";
// import { Resources } from "./otlib/resources/Resources"; // Unused for now
import { SettingsCommand } from "./ob/commands/SettingsCommand";
import { LoadVersionsCommand } from "./ob/commands/LoadVersionsCommand";
import { LoadSpriteDimensionsCommand } from "./ob/commands/LoadSpriteDimensionsCommand";
import { WorkerCommand } from "./workers/WorkerCommand";

export class ObjectBuilderApp {
    private _worker: ObjectBuilderWorker | null = null;
    private _communicator: WorkerCommunicator | null = null;
    private _settings: ObjectBuilderSettings | null = null;
    private _settingsManager: SettingsManager | null = null;
    private _versionStorage: VersionStorage | null = null;
    private _spriteDimensionStorage: SpriteDimensionStorage | null = null;
    private _initialized: boolean = false;

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        console.log("Initializing Object Builder...");

        try {
            // Initialize resources
            this.initializeResources();

            // Initialize storage
            this.initializeStorage();

            // Initialize settings
            this.initializeSettings();

            // Create worker
            this.createWorker();

            // Load initial data
            this.loadInitialData();

            this._initialized = true;
            console.log("Object Builder initialized successfully");
        } catch (error: any) {
            console.error("Failed to initialize Object Builder:", error);
            throw error;
        }
    }

    private initializeResources(): void {
        // Set up resources (localization)
        // For now, use default English
        console.log("Initializing resources...");
    }

    private initializeStorage(): void {
        console.log("Initializing storage...");
        this._versionStorage = VersionStorage.getInstance() as VersionStorage;
        this._spriteDimensionStorage = SpriteDimensionStorage.getInstance() as SpriteDimensionStorage;
    }

    private initializeSettings(): void {
        console.log("Initializing settings...");
        this._settingsManager = SettingsManager.getInstance() as SettingsManager;
        this._settings = new ObjectBuilderSettings();
        
        // Try to load settings from file
        if (this._settingsManager && !this._settingsManager.loadSettings(this._settings)) {
            console.log("No existing settings found, using defaults");
        } else {
            console.log("Settings loaded successfully");
        }
    }

    private createWorker(): void {
        console.log("Creating worker...");
        
        if (!this._settings) {
            throw new Error("Settings must be initialized before creating worker");
        }

        this._communicator = new WorkerCommunicator();
        this._worker = new ObjectBuilderWorker();
        
        // Set up command handling
        this._communicator.on("command", (command: WorkerCommand) => {
            this.handleCommand(command);
        });

        // Start the communicator
        this._communicator.start();
    }

    private loadInitialData(): void {
        console.log("Loading initial data...");

        if (!this._settings || !this._communicator) {
            throw new Error("Settings and communicator must be initialized");
        }

        // Send settings to worker
        this._communicator.sendCommand(new SettingsCommand(this._settings));

        // Load versions
        const versionsPath = path.join(__dirname, "../firstRun/versions.xml");
        if (fs.existsSync(versionsPath)) {
            if (this._versionStorage) {
                this._versionStorage.load(versionsPath);
                this._communicator.sendCommand(new LoadVersionsCommand(versionsPath));
            }
        } else {
            console.warn("versions.xml not found at:", versionsPath);
        }

        // Load sprite dimensions
        // TODO: Load sprite dimensions if file exists
        // For now, use defaults
    }

    private handleCommand(command: WorkerCommand): void {
        // Handle commands from the worker
        // This is where UI updates would happen
        console.log("Received command from worker:", command.constructor.name);
        
        // TODO: Implement command handling for UI updates
        // For now, just log the command
    }

    public get worker(): ObjectBuilderWorker | null {
        return this._worker;
    }

    public get communicator(): WorkerCommunicator | null {
        return this._communicator;
    }

    public get settings(): ObjectBuilderSettings | null {
        return this._settings;
    }

    public get initialized(): boolean {
        return this._initialized;
    }

    public get versionStorage(): VersionStorage | null {
        return this._versionStorage;
    }

    public shutdown(): void {
        console.log("Shutting down Object Builder...");
        
        // Save settings
        if (this._settings && this._settingsManager) {
            this._settingsManager.saveSettings(this._settings);
            console.log("Settings saved");
        }
        
        // TODO: Cleanup other resources
        
        if (this._worker) {
            // Cleanup worker if needed
        }
        
        console.log("Object Builder shut down");
    }
}

// Export singleton instance
let appInstance: ObjectBuilderApp | null = null;

export function getApp(): ObjectBuilderApp {
    if (!appInstance) {
        appInstance = new ObjectBuilderApp();
    }
    return appInstance;
}

// Start the application if this is the main module
if (require.main === module) {
    console.log("========================================");
    console.log("Object Builder - TypeScript Version");
    console.log("========================================");
    
    try {
        const app = getApp();
        console.log("Application started successfully");
        console.log("Worker initialized:", app.worker !== null);
        console.log("Communicator initialized:", app.communicator !== null);
        console.log("Settings initialized:", app.settings !== null);
        
        // Keep the process alive (in a real UI app, this would be handled by the UI framework)
        // For CLI/testing, we keep running until explicitly stopped
        console.log("\nApplication is ready. Press Ctrl+C to exit.");
        
        // Keep the process alive by setting up an interval
        // This prevents the process from exiting when there are no active handles
        const keepAliveInterval = setInterval(() => {
            // Just keep the event loop alive
        }, 1000);
        
        // Handle graceful shutdown
        const shutdown = () => {
            console.log("\nShutting down...");
            clearInterval(keepAliveInterval);
            app.shutdown();
            process.exit(0);
        };
        
        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);
    } catch (error: any) {
        console.error("Failed to start application:", error);
        process.exit(1);
    }
}

