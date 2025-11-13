/*
*  Worker Communicator
*  Replaces com.mignari.workers.WorkerCommunicator
*  For Node.js, this will use Worker Threads or EventEmitter
*/

import { EventEmitter } from "events";
import { IWorkerCommunicator } from "./IWorkerCommunicator";
import { WorkerCommand } from "./WorkerCommand";

export class WorkerCommunicator extends EventEmitter implements IWorkerCommunicator {
    private _callbacks: Map<any, (...args: any[]) => void | Promise<any>> = new Map();
    private _registeredClasses: Set<any> = new Set();

    public registerClass(clazz: any): void {
        this._registeredClasses.add(clazz);
    }

    public registerCallback(commandClass: any, callback: (...args: any[]) => void | Promise<any>): void {
        this._callbacks.set(commandClass, callback);
    }

    public sendCommand(command: WorkerCommand): void {
        // In a real implementation, this would send to the main thread
        // For now, we'll emit an event
        this.emit("command", command);
    }

    public start(): void {
        // Start listening for commands
        // In a real implementation, this would set up message passing
    }

    public handleCommand(command: WorkerCommand): void {
        const callback = this._callbacks.get(command.constructor);
        if (callback) {
            // Extract command properties and call callback
            const args = this.extractCommandArgs(command);
            try {
                const result = callback(...args);
                // Handle async callbacks (promises)
                if (result && typeof result === "object" && typeof result.then === "function") {
                    result.catch((error: any) => {
                        console.error("Error in async callback:", error);
                    });
                }
            } catch (error) {
                console.error("Error in callback:", error);
            }
        }
    }

    private extractCommandArgs(command: WorkerCommand): any[] {
        // Extract all properties from the command object
        const args: any[] = [];
        for (const key in command) {
            if (command.hasOwnProperty(key) && key !== "data") {
                args.push((command as any)[key]);
            }
        }
        return args;
    }
}

