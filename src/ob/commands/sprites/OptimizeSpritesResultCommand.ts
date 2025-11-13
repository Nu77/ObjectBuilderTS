import { WorkerCommand } from "../../../workers/WorkerCommand";

export class OptimizeSpritesResultCommand extends WorkerCommand {
    public removed: number;
    public oldCount: number;
    public newCount: number;

    constructor(removed: number, oldCount: number, newCount: number) {
        super();
        this.removed = removed;
        this.oldCount = oldCount;
        this.newCount = newCount;
    }
}

