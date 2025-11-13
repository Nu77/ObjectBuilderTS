import { WorkerCommand } from "../../../workers/WorkerCommand";
import { PathHelper } from "../../../otlib/loaders/PathHelper";

export class ReplaceSpritesFromFilesCommand extends WorkerCommand {
    public files: PathHelper[];

    constructor(files: PathHelper[]) {
        super();
        this.files = files;
    }
}

