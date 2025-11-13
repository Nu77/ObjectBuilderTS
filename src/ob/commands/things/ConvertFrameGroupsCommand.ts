import { WorkerCommand } from "../../../workers/WorkerCommand";

export class ConvertFrameGroupsCommand extends WorkerCommand {
    public frameGroups: boolean;
    public mounts: boolean;

    constructor(frameGroups: boolean, mounts: boolean) {
        super();
        this.frameGroups = frameGroups;
        this.mounts = mounts;
    }
}

