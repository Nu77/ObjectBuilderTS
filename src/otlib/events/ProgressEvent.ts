import { EventEmitter } from "events";

export class ProgressEvent extends EventEmitter {
    public static readonly PROGRESS: string = "progress";

    public id: string = "";
    public loaded: number = 0;
    public total: number = 0;
    public label: string = "";
    public type: string = ProgressEvent.PROGRESS;

    constructor(type: string = ProgressEvent.PROGRESS,
                id: string = "",
                loaded: number = 0,
                total: number = 0,
                label: string = "") {
        super();
        this.type = type;
        this.id = id;
        this.loaded = loaded;
        this.total = total;
        this.label = label;
    }

    public clone(): ProgressEvent {
        return new ProgressEvent(this.type, this.id, this.loaded, this.total, this.label);
    }
}

