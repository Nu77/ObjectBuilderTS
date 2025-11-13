import { WorkerCommand } from "../../workers/WorkerCommand";

export class SetSpriteDimensionCommand extends WorkerCommand {
    public value: string;
    public size: number;
    public dataSize: number;

    constructor(value: string, size: number, dataSize: number) {
        super();
        this.value = value;
        this.size = size;
        this.dataSize = dataSize;
    }
}

