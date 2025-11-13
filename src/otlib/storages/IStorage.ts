import { EventEmitter } from "events";

export interface IStorage extends EventEmitter {
    readonly isTemporary: boolean;
    readonly changed: boolean;
    readonly loaded: boolean;

    invalidate(): void;
}

