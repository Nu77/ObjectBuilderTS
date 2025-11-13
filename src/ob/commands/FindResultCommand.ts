import { WorkerCommand } from "../../workers/WorkerCommand";

export class FindResultCommand extends WorkerCommand {
    public static readonly THINGS: number = 1;
    public static readonly SPRITES: number = 2;

    public type: number;
    public list: any[];

    constructor(type: number, list: any[]) {
        super();
        this.type = type;
        this.list = list;
    }
}

