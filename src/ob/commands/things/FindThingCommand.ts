import { WorkerCommand } from "../../../workers/WorkerCommand";
import { ThingProperty } from "../../../otlib/things/ThingProperty";

export class FindThingCommand extends WorkerCommand {
    public category: string;
    public properties: ThingProperty[];

    constructor(category: string, properties: ThingProperty[]) {
        super();
        this.category = category;
        this.properties = properties;
    }
}

