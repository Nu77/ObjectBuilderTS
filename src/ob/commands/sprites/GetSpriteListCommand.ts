import { WorkerCommand } from "../../../workers/WorkerCommand";

export class GetSpriteListCommand extends WorkerCommand {
    public targetId: number;

    constructor(targetId: number) {
        super();
        this.targetId = targetId;
    }
}

