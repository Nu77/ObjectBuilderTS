/*
*  Worker Communicator Interface
*  Replaces com.mignari.workers.IWorkerCommunicator
*/

import { WorkerCommand } from "./WorkerCommand";

export interface IWorkerCommunicator {
    registerClass(clazz: any): void;
    registerCallback(commandClass: any, callback: (...args: any[]) => void): void;
    sendCommand(command: WorkerCommand): void;
    start(): void;
}

