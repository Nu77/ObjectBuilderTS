import { WorkerCommand } from "../../../workers/WorkerCommand";
import { ThingListItem } from "../../../otlib/utils/ThingListItem";

export class SetThingListCommand extends WorkerCommand {
    public selectedIds: number[];
    public things: ThingListItem[];

    constructor(selectedIds: number[], things: ThingListItem[]) {
        super();
        this.selectedIds = selectedIds;
        this.things = things;
    }
}

