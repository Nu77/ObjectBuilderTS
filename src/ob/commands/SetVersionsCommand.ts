import { WorkerCommand } from "../../workers/WorkerCommand";
import { Version } from "../../otlib/core/Version";

export class SetVersionsCommand extends WorkerCommand {
    public versions: Version[];

    constructor(versions: Version[]) {
        super();
        this.versions = versions;
    }
}

