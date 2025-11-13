import { WorkerCommand } from "../../../workers/WorkerCommand";

export class RemoveSpritesCommand extends WorkerCommand {
    public list: number[];

    constructor(list: number[]) {
        super();
        this.list = list;
    }
}

