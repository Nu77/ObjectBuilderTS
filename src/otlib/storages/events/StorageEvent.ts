import { EventEmitter } from "events";

export class StorageEvent extends EventEmitter {
    public static readonly LOAD: string = "load";
    public static readonly CHANGE: string = "change";
    public static readonly COMPILE: string = "compile";
    public static readonly UNLOADING: string = "unloading";
    public static readonly UNLOAD: string = "unload";

    public changedIds: number[] | null = null;
    public category: string | null = null;
    public type: string;
    public bubbles: boolean = false;
    public cancelable: boolean = false;
    public target: any = null;

    constructor(type: string,
                bubbles: boolean = false,
                cancelable: boolean = false,
                changedIds: number[] | null = null,
                category: string | null = null) {
        super();
        this.type = type;
        this.bubbles = bubbles;
        this.cancelable = cancelable;
        this.changedIds = changedIds;
        this.category = category;
    }

    public clone(): StorageEvent {
        return new StorageEvent(this.type, this.bubbles, this.cancelable, this.changedIds, this.category);
    }
}

