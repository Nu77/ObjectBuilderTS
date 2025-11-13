import { WorkerCommand } from "../../../workers/WorkerCommand";

export class NewThingCommand extends WorkerCommand {
    public category: string;

    constructor(category: string) {
        super();
        this.category = category;
    }
}

