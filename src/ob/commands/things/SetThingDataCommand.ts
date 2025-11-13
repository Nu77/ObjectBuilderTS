import { WorkerCommand } from "../../../workers/WorkerCommand";
import { ThingData } from "../../../otlib/things/ThingData";

export class SetThingDataCommand extends WorkerCommand {
    public thingData: ThingData;

    constructor(thingData: ThingData) {
        super();
        this.thingData = thingData;
    }
}

