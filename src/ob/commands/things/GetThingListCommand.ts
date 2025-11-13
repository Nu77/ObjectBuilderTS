import { WorkerCommand } from "../../../workers/WorkerCommand";

export class GetThingListCommand extends WorkerCommand {
    public targetId: number;
    public category: string;

    constructor(targetId: number, category: string) {
        super();
        this.targetId = targetId;
        this.category = category;
    }
}

