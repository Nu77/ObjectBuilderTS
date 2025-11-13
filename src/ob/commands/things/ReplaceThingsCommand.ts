import { WorkerCommand } from "../../../workers/WorkerCommand";
import { ThingData } from "../../../otlib/things/ThingData";

export class ReplaceThingsCommand extends WorkerCommand {
    public list: ThingData[];

    constructor(list: ThingData[]) {
        super();
        this.list = list;
    }
}

