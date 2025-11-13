import { WorkerCommand } from "../../../workers/WorkerCommand";

export class GetThingCommand extends WorkerCommand {
    public id: number;
    public category: string;

    constructor(id: number, category: string) {
        super();
        this.id = id;
        this.category = category;
    }
}

