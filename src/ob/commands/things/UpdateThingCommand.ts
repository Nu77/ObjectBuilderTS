import { WorkerCommand } from "../../../workers/WorkerCommand";
import { ThingData } from "../../../otlib/things/ThingData";

export class UpdateThingCommand extends WorkerCommand {
    public thingData: ThingData;
    public replaceSprites: boolean;

    constructor(thingData: ThingData, replaceSprites: boolean) {
        super();
        this.thingData = thingData;
        this.replaceSprites = replaceSprites;
    }
}

