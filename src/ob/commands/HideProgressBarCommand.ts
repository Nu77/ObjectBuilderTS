import { WorkerCommand } from "../../workers/WorkerCommand";

export class HideProgressBarCommand extends WorkerCommand {
    public id: string;

    constructor(id: string) {
        super(id);
        this.id = id;
    }
}

