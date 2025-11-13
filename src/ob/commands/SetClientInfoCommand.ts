import { WorkerCommand } from "../../workers/WorkerCommand";
import { ClientInfo } from "../../otlib/utils/ClientInfo";

export class SetClientInfoCommand extends WorkerCommand {
    public info: ClientInfo;

    constructor(info: ClientInfo) {
        super(info);
        this.info = info;
    }
}

