/*
*  Object Builder - Main Entry Point
*  TypeScript version
*/

import { IObjectBuilder } from "./ob/core/IObjectBuilder";

console.log("Object Builder - TypeScript Version");
console.log("Starting application...");

// Main application entry point
// This will be expanded as the UI framework is integrated

export class ObjectBuilderApp {
    private app: IObjectBuilder | null = null;

    constructor() {
        // Initialize application
        this.initialize();
    }

    private initialize(): void {
        console.log("Initializing Object Builder...");
        // TODO: Initialize UI framework and main application
    }

    public start(): void {
        console.log("Object Builder started");
    }
}

// Start the application if this is the main module
if (require.main === module) {
    // const app = new ObjectBuilderApp(); // Unused - main.ts is the entry point
    // app.start(); // Entry point is main.ts
}

