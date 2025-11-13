import { WorkerCommand } from "../../workers/WorkerCommand";

export class LoadSpriteDimensionsCommand extends WorkerCommand {
    public file: string;

    constructor(file: string) {
        super();
        this.file = file;
    }
}

