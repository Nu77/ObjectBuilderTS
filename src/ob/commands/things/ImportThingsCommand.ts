import { WorkerCommand } from "../../../workers/WorkerCommand";
import { ThingData } from "../../../otlib/things/ThingData";

export class ImportThingsCommand extends WorkerCommand {
    public list: ThingData[];

    constructor(list: ThingData[]) {
        super();
        this.list = list;
    }
}

