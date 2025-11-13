/*
*  WorkerCommand base class
*  Replaces com.mignari.workers.WorkerCommand
*/

export class WorkerCommand {
    public data: any;

    constructor(data?: any) {
        this.data = data;
    }
}

