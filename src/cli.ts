/*
*  Object Builder - CLI Interface
*  Simple command-line interface for testing backend functionality
*/

import * as readline from "readline";
import { getApp } from "./main";
import { ObjectBuilderApp } from "./main";
import { CreateNewFilesCommand } from "./ob/commands/files/CreateNewFilesCommand";
import { LoadFilesCommand } from "./ob/commands/files/LoadFilesCommand";
import { CompileCommand } from "./ob/commands/files/CompileCommand";
import { UnloadFilesCommand } from "./ob/commands/files/UnloadFilesCommand";
import { GetThingCommand } from "./ob/commands/things/GetThingCommand";
import { GetThingListCommand } from "./ob/commands/things/GetThingListCommand";
import { ThingCategory } from "./otlib/things/ThingCategory";
import { Version } from "./otlib/core/Version";

export class ObjectBuilderCLI {
    private _app: ObjectBuilderApp;
    private _rl: readline.Interface;

    constructor() {
        this._app = getApp();
        this._rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: "OB> "
        });
    }

    public start(): void {
        console.log("\n========================================");
        console.log("Object Builder - CLI Interface");
        console.log("========================================");
        console.log("Type 'help' for available commands");
        console.log("Type 'exit' to quit\n");

        this._rl.prompt();

        this._rl.on("line", (line: string) => {
            const trimmed = line.trim();
            if (trimmed.length === 0) {
                this._rl.prompt();
                return;
            }

            const parts = trimmed.split(/\s+/);
            const command = parts[0].toLowerCase();
            const args = parts.slice(1);

            this.handleCommand(command, args);
            this._rl.prompt();
        });

        this._rl.on("close", () => {
            console.log("\nGoodbye!");
            this._app.shutdown();
            process.exit(0);
        });
    }

    private handleCommand(command: string, args: string[]): void {
        switch (command) {
            case "help":
                this.showHelp();
                break;
            case "exit":
            case "quit":
                this._rl.close();
                break;
            case "status":
                this.showStatus();
                break;
            case "create":
                this.handleCreate(args);
                break;
            case "load":
                this.handleLoad(args);
                break;
            case "compile":
                this.handleCompile(args);
                break;
            case "unload":
                this.handleUnload();
                break;
            case "getthing":
                this.handleGetThing(args);
                break;
            case "listthings":
                this.handleListThings(args);
                break;
            default:
                console.log(`Unknown command: ${command}. Type 'help' for available commands.`);
        }
    }

    private showHelp(): void {
        console.log("\nAvailable commands:");
        console.log("  status              - Show application status");
        console.log("  create <dat> <spr>  - Create new project files");
        console.log("  load <dat> <spr>    - Load existing project files");
        console.log("  compile             - Compile current project");
        console.log("  unload              - Unload current project");
        console.log("  getthing <id> <cat> - Get thing by ID and category");
        console.log("  listthings <cat>    - List things in category (item/outfit/effect/missile)");
        console.log("  help                - Show this help message");
        console.log("  exit                - Exit the CLI\n");
    }

    private showStatus(): void {
        console.log("\nApplication Status:");
        console.log(`  Initialized: ${this._app.initialized}`);
        console.log(`  Worker: ${this._app.worker ? "Ready" : "Not initialized"}`);
        console.log(`  Communicator: ${this._app.communicator ? "Ready" : "Not initialized"}`);
        console.log(`  Settings: ${this._app.settings ? "Loaded" : "Not loaded"}`);
        if (this._app.settings) {
            console.log(`    Objects List Amount: ${this._app.settings.objectsListAmount}`);
            console.log(`    Sprites List Amount: ${this._app.settings.spritesListAmount}`);
        }
        console.log();
    }

    private handleCreate(args: string[]): void {
        if (args.length < 2) {
            console.log("Usage: create <dat_file> <spr_file>");
            return;
        }

        const datFile = args[0];
        const sprFile = args[1];

        console.log(`Creating new project: ${datFile}, ${sprFile}`);

        if (!this._app.communicator) {
            console.log("Error: Communicator not initialized");
            return;
        }

        // For now, use default signatures (can be enhanced)
        // CreateNewFilesCommand uses signatures, not file paths
        const datSignature = 0x4441541A; // "DAT" signature
        const sprSignature = 0x5350521B; // "SPR" signature
        const command = new CreateNewFilesCommand(datSignature, sprSignature, false, false, false, false);
        this._app.communicator.sendCommand(command);
        console.log("Create command sent to worker");
        console.log("Note: File paths will be set by the worker based on current project");
    }

    private handleLoad(args: string[]): void {
        if (args.length < 2) {
            console.log("Usage: load <dat_file> <spr_file>");
            return;
        }

        const datFile = args[0];
        const sprFile = args[1];

        console.log(`Loading project: ${datFile}, ${sprFile}`);

        if (!this._app.communicator) {
            console.log("Error: Communicator not initialized");
            return;
        }

        // For now, use default version (can be enhanced)
        // TODO: Allow version selection from UI
        const versionStorage = this._app.versionStorage;
        const versions = versionStorage ? versionStorage.getList() : null;
        const version = versions && versions.length > 0 ? versions[0] : null;
        if (!version) {
            console.log("Error: No version available");
            return;
        }
        const command = new LoadFilesCommand(datFile, sprFile, version, false, false, false, false);
        this._app.communicator.sendCommand(command);
        console.log("Load command sent to worker");
    }

    private handleCompile(args: string[]): void {
        console.log("Compiling project...");

        if (!this._app.communicator) {
            console.log("Error: Communicator not initialized");
            return;
        }

        const command = new CompileCommand();
        this._app.communicator.sendCommand(command);
        console.log("Compile command sent to worker");
    }

    private handleUnload(): void {
        console.log("Unloading project...");

        if (!this._app.communicator) {
            console.log("Error: Communicator not initialized");
            return;
        }

        const command = new UnloadFilesCommand();
        this._app.communicator.sendCommand(command);
        console.log("Unload command sent to worker");
    }

    private handleGetThing(args: string[]): void {
        if (args.length < 2) {
            console.log("Usage: getthing <id> <category>");
            console.log("Categories: item, outfit, effect, missile");
            return;
        }

        const id = parseInt(args[0], 10);
        const category = args[1].toLowerCase();

        if (isNaN(id)) {
            console.log("Error: Invalid ID");
            return;
        }

        if (!ThingCategory.getCategory(category)) {
            console.log("Error: Invalid category. Use: item, outfit, effect, or missile");
            return;
        }

        console.log(`Getting thing: ID=${id}, Category=${category}`);

        if (!this._app.communicator) {
            console.log("Error: Communicator not initialized");
            return;
        }

        const command = new GetThingCommand(id, category);
        this._app.communicator.sendCommand(command);
        console.log("GetThing command sent to worker");
    }

    private handleListThings(args: string[]): void {
        if (args.length < 1) {
            console.log("Usage: listthings <category>");
            console.log("Categories: item, outfit, effect, missile");
            return;
        }

        const category = args[0].toLowerCase();

        if (!ThingCategory.getCategory(category)) {
            console.log("Error: Invalid category. Use: item, outfit, effect, or missile");
            return;
        }

        console.log(`Listing things in category: ${category}`);

        if (!this._app.communicator) {
            console.log("Error: Communicator not initialized");
            return;
        }

        // List from ID 100 (default starting point)
        const command = new GetThingListCommand(100, category);
        this._app.communicator.sendCommand(command);
        console.log("GetThingList command sent to worker");
    }
}

// Start CLI if this is the main module
if (require.main === module) {
    // Wait a bit for app to initialize
    setTimeout(() => {
        const cli = new ObjectBuilderCLI();
        cli.start();
    }, 1000);
}

