"use strict";
/*
*  Worker Communicator
*  Replaces com.mignari.workers.WorkerCommunicator
*  For Node.js, this will use Worker Threads or EventEmitter
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerCommunicator = void 0;
const events_1 = require("events");
class WorkerCommunicator extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this._callbacks = new Map();
        this._registeredClasses = new Set();
    }
    registerClass(clazz) {
        this._registeredClasses.add(clazz);
    }
    registerCallback(commandClass, callback) {
        this._callbacks.set(commandClass, callback);
    }
    sendCommand(command) {
        // In a real implementation, this would send to the main thread
        // For now, we'll emit an event
        this.emit("command", command);
    }
    start() {
        // Start listening for commands
        // In a real implementation, this would set up message passing
    }
    handleCommand(command) {
        const callback = this._callbacks.get(command.constructor);
        if (callback) {
            // Extract command properties and call callback
            const args = this.extractCommandArgs(command);
            try {
                const result = callback(...args);
                // Handle async callbacks (promises)
                if (result && typeof result === "object" && typeof result.then === "function") {
                    result.catch((error) => {
                        console.error("Error in async callback:", error);
                    });
                }
            }
            catch (error) {
                console.error("Error in callback:", error);
            }
        }
    }
    extractCommandArgs(command) {
        // Extract all properties from the command object
        const args = [];
        for (const key in command) {
            if (command.hasOwnProperty(key) && key !== "data") {
                args.push(command[key]);
            }
        }
        return args;
    }
}
exports.WorkerCommunicator = WorkerCommunicator;
