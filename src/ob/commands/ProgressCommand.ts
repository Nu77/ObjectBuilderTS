import { WorkerCommand } from "../../workers/WorkerCommand";

export class ProgressCommand extends WorkerCommand {
    public id: string;
    public value: number;
    public total: number;
    public label: string;

    constructor(id: string, value: number, total: number, label: string = "") {
        super({ id, value, total, label });
        this.id = id;
        this.value = value;
        this.total = total;
        this.label = label;
    }
}

