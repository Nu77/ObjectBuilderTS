import { WorkerCommand } from "../../../workers/WorkerCommand";

export class RemoveThingCommand extends WorkerCommand {
    public list: number[];
    public category: string;
    public removeSprites: boolean;

    constructor(list: number[], category: string, removeSprites: boolean) {
        super();
        this.list = list;
        this.category = category;
        this.removeSprites = removeSprites;
    }
}

