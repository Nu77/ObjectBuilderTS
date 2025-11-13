import { WorkerCommand } from "../../../workers/WorkerCommand";
import { PathHelper } from "../../../otlib/loaders/PathHelper";

export class ImportThingsFromFilesCommand extends WorkerCommand {
    public list: PathHelper[];

    constructor(list: PathHelper[]) {
        super();
        this.list = list;
    }
}

