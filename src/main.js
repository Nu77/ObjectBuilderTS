"use strict";
/*
*  Object Builder - Main Application Entry Point
*  TypeScript version
*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectBuilderApp = void 0;
exports.getApp = getApp;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const ObjectBuilderWorker_1 = require("./ob/workers/ObjectBuilderWorker");
const WorkerCommunicator_1 = require("./workers/WorkerCommunicator");
const ObjectBuilderSettings_1 = require("./ob/settings/ObjectBuilderSettings");
const SettingsManager_1 = require("./otlib/settings/SettingsManager");
const VersionStorage_1 = require("./otlib/core/VersionStorage");
const SpriteDimensionStorage_1 = require("./otlib/core/SpriteDimensionStorage");
// import { Resources } from "./otlib/resources/Resources"; // Unused for now
const SettingsCommand_1 = require("./ob/commands/SettingsCommand");
const LoadVersionsCommand_1 = require("./ob/commands/LoadVersionsCommand");
class ObjectBuilderApp {
    constructor() {
        this._worker = null;
        this._communicator = null;
        this._settings = null;
        this._settingsManager = null;
        this._versionStorage = null;
        this._spriteDimensionStorage = null;
        this._initialized = false;
        this.initialize();
    }
    initialize() {
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
        }
        catch (error) {
            console.error("Failed to initialize Object Builder:", error);
            throw error;
        }
    }
    initializeResources() {
        // Set up resources (localization)
        // For now, use default English
        console.log("Initializing resources...");
    }
    initializeStorage() {
        console.log("Initializing storage...");
        this._versionStorage = VersionStorage_1.VersionStorage.getInstance();
        this._spriteDimensionStorage = SpriteDimensionStorage_1.SpriteDimensionStorage.getInstance();
    }
    initializeSettings() {
        console.log("Initializing settings...");
        this._settingsManager = SettingsManager_1.SettingsManager.getInstance();
        this._settings = new ObjectBuilderSettings_1.ObjectBuilderSettings();
        // Try to load settings from file
        if (this._settingsManager && !this._settingsManager.loadSettings(this._settings)) {
            console.log("No existing settings found, using defaults");
        }
        else {
            console.log("Settings loaded successfully");
        }
    }
    createWorker() {
        console.log("Creating worker...");
        if (!this._settings) {
            throw new Error("Settings must be initialized before creating worker");
        }
        this._communicator = new WorkerCommunicator_1.WorkerCommunicator();
        this._worker = new ObjectBuilderWorker_1.ObjectBuilderWorker();
        // Set up command handling
        this._communicator.on("command", (command) => {
            this.handleCommand(command);
        });
        // Start the communicator
        this._communicator.start();
    }
    loadInitialData() {
        console.log("Loading initial data...");
        if (!this._settings || !this._communicator) {
            throw new Error("Settings and communicator must be initialized");
        }
        // Send settings to worker
        this._communicator.sendCommand(new SettingsCommand_1.SettingsCommand(this._settings));
        // Load versions
        const versionsPath = path.join(__dirname, "../firstRun/versions.xml");
        if (fs.existsSync(versionsPath)) {
            if (this._versionStorage) {
                this._versionStorage.load(versionsPath);
                this._communicator.sendCommand(new LoadVersionsCommand_1.LoadVersionsCommand(versionsPath));
            }
        }
        else {
            console.warn("versions.xml not found at:", versionsPath);
        }
        // Load sprite dimensions
        // TODO: Load sprite dimensions if file exists
        // For now, use defaults
    }
    handleCommand(command) {
        // Handle commands from the worker
        // This is where UI updates would happen
        console.log("Received command from worker:", command.constructor.name);
        // TODO: Implement command handling for UI updates
        // For now, just log the command
    }
    get worker() {
        return this._worker;
    }
    get communicator() {
        return this._communicator;
    }
    get settings() {
        return this._settings;
    }
    get initialized() {
        return this._initialized;
    }
    get versionStorage() {
        return this._versionStorage;
    }
    shutdown() {
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
exports.ObjectBuilderApp = ObjectBuilderApp;
// Export singleton instance
let appInstance = null;
function getApp() {
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
        // For CLI/testing, we can exit or keep running
        console.log("\nApplication is ready. Press Ctrl+C to exit.");
        // Handle graceful shutdown
        process.on("SIGINT", () => {
            console.log("\nShutting down...");
            app.shutdown();
            process.exit(0);
        });
        process.on("SIGTERM", () => {
            console.log("\nShutting down...");
            app.shutdown();
            process.exit(0);
        });
    }
    catch (error) {
        console.error("Failed to start application:", error);
        process.exit(1);
    }
}
