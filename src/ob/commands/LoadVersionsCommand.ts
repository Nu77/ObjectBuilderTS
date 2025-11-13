import { WorkerCommand } from "../../workers/WorkerCommand";

export class LoadVersionsCommand extends WorkerCommand {
    public path: string;

    constructor(path: string) {
        super(path);
        this.path = path;
    }
}

