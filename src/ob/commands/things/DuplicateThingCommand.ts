import { WorkerCommand } from "../../../workers/WorkerCommand";

export class DuplicateThingCommand extends WorkerCommand {
    public ids: number[];
    public category: string;

    constructor(ids: number[], category: string) {
        super();
        this.ids = ids;
        this.category = category;
    }
}

